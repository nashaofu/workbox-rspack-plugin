module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "../tsconfig.json",
  },
  env: {
    es6: true,
    browser: true
  },
  extends: ["airbnb-base", "airbnb-typescript/base"],
  rules: {
    "import/prefer-default-export": "off",
    "no-restricted-syntax": "off",
    "no-continue": "off",
  },
};
