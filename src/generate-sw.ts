/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

import { validateWebpackGenerateSWOptions } from 'workbox-build/build/lib/validate-options';
import { bundle } from 'workbox-build/build/lib/bundle';
import { populateSWTemplate } from 'workbox-build/build/lib/populate-sw-template';
import { Compilation, Compiler } from '@rspack/core';
import { ManifestEntry, WebpackGenerateSWOptions } from 'workbox-build';
import { RawSource } from 'webpack-sources';
import prettyBytes from 'pretty-bytes';
import { getManifestEntriesFromCompilation } from './lib/get-manifest-entries-from-compilation';
import { relativeToOutputPath } from './lib/relative-to-output-path';

export interface GenerateSWConfig extends WebpackGenerateSWOptions {
  manifestEntries?: Array<ManifestEntry>;
}

class GenerateSW {
  protected config: GenerateSWConfig;

  /**
   * Creates an instance of GenerateSW.
   */
  constructor(config: GenerateSWConfig = {}) {
    this.config = config;
  }

  /**
   * @param {Object} [compiler] default compiler object passed from webpack
   *
   * @private
   */
  propagateWebpackConfig(compiler: Compiler): void {
    // Because this.config is listed last, properties that are already set
    // there take precedence over derived properties from the compiler.
    this.config = {
      mode: compiler.options.mode,
      sourcemap: Boolean(compiler.options.devtool),
      ...this.config,
    };
  }

  /**
   * @param {Object} [compiler] default compiler object passed from webpack
   *
   * @private
   */
  apply(compiler: Compiler): void {
    this.propagateWebpackConfig(compiler);
    compiler.hooks.emit.tapPromise(
      this.constructor.name,
      async (compilation) => {
        await this.addAssets(compilation);
      },
    );
  }

  /**
   * @param {Object} compilation The webpack compilation.
   *
   * @private
   */
  async addAssets(compilation: Compilation): Promise<void> {
    let config: GenerateSWConfig = {};
    try {
      config = validateWebpackGenerateSWOptions(this.config);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Please check your ${this.constructor.name} plugin `
            + `configuration:\n${error.message}`,
        );
      }
    }

    const { size, sortedEntries } = await getManifestEntriesFromCompilation(
      compilation,
      config,
    );
    config.manifestEntries = sortedEntries;

    const unbundledCode = populateSWTemplate(config);

    const files = await bundle({
      babelPresetEnvTargets: config.babelPresetEnvTargets,
      inlineWorkboxRuntime: config.inlineWorkboxRuntime,
      mode: config.mode,
      sourcemap: config.sourcemap,
      swDest: relativeToOutputPath(compilation, config.swDest!),
      unbundledCode,
    });

    for (const file of files) {
      compilation.emitAsset(
        file.name,
        new RawSource(file.contents.toString()),
        {
          // See https://github.com/webpack-contrib/compression-webpack-plugin/issues/218#issuecomment-726196160
          minimized: config.mode === 'production',
        },
      );
    }

    if (compilation.getLogger) {
      const logger = compilation.getLogger(this.constructor.name);
      logger.info(`The service worker at ${config.swDest ?? ''} will precache
        ${config.manifestEntries.length} URLs, totaling ${prettyBytes(size)}.`);
    }
  }
}

export { GenerateSW };
