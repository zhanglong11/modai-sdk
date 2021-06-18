module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  "plugins": ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  parserOptions: {
    parser: "babel-eslint",
    sourceType: "module",
    ecmaVersion:2018
  }
}
