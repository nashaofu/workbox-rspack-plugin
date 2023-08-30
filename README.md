# workbox-rspack-plugin

workbox for rspack plugin

## Usage

```js
const path = require("path");
const { GenerateSW } = require("workbox-rspack-plugin");

/**
 * @type {import('@rspack/cli').Configuration}
 */
module.exports = {
  context: __dirname,
  entry: {
    main: "./index.js",
  },
  devtool: false,
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  builtins: {
    html: [{ template: "./index.html" }],
    copy: {
      patterns: [
        {
          from: "public",
        },
      ],
    },
  },
  plugins: [
    // options is workbox-build WebpackGenerateSWOptions
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
};
```
