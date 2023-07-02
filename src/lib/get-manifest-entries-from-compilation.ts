/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

import { Compilation } from '@rspack/core';
import { transformManifest } from 'workbox-build/build/lib/transform-manifest';

import {
  WebpackGenerateSWOptions,
  WebpackInjectManifestOptions,
  ManifestEntry,
  FileDetails,
} from 'workbox-build';
import { getAssetHash } from './get-asset-hash';
import { resolveWebpackURL } from './resolve-webpack-url';

export async function getManifestEntriesFromCompilation(
  compilation: Compilation,
  config: WebpackGenerateSWOptions | WebpackInjectManifestOptions,
): Promise<{ size: number; sortedEntries: ManifestEntry[] }> {
  const filteredAssets = compilation.getAssets();

  const { publicPath } = compilation.options.output;

  const fileDetails = filteredAssets.map(
    (asset) => ({
      file: resolveWebpackURL(publicPath as string, asset.name),
      hash: getAssetHash(asset),
      size: asset.source?.size() || 0,
    } as FileDetails),
  );

  const { manifestEntries, size, warnings } = await transformManifest({
    fileDetails,
    additionalManifestEntries: config.additionalManifestEntries,
    dontCacheBustURLsMatching: config.dontCacheBustURLsMatching,
    manifestTransforms: config.manifestTransforms,
    maximumFileSizeToCacheInBytes: config.maximumFileSizeToCacheInBytes,
    modifyURLPrefix: config.modifyURLPrefix,
    transformParam: compilation,
  });

  // See https://github.com/GoogleChrome/workbox/issues/2790
  for (const warning of warnings) {
    compilation.warnings.push(new Error(warning));
  }

  // Ensure that the entries are properly sorted by URL.
  const sortedEntries = manifestEntries.sort((a, b) => {
    if (a.url === b.url) {
      return 0;
    }

    return a.url > b.url ? 1 : -1;
  });

  return { size, sortedEntries };
}
