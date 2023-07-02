/*
  Copyright 2018 Google LLC

  Use of this source code is governed by an MIT-style
  license that can be found in the LICENSE file or at
  https://opensource.org/licenses/MIT.
*/

import { GenerateSW, GenerateSWConfig } from './generate-sw';

/**
 * @module workbox-webpack-plugin
 */
export { GenerateSW, GenerateSWConfig };

// TODO: remove this in v7.
// See https://github.com/GoogleChrome/workbox/issues/3033
export default { GenerateSW };
