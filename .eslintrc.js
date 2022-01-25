module.exports = {
  root: true,
  extends: ["plugin:react-hooks/recommended"],
  plugins: ["react", "import", "react-hooks"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    parser: "@babel/eslint-parser",
    requireConfigFile: false,
    babelOptions: {
      presets: ["@babel/preset-react"],
    },
  },
  rules: {
    semi: [2, "always"],
  },
  settings: {
    /**
     * import 别名配置
     * 别名跟着项目走，所以就在使用的项目中具体去配置 */
    "import/resolver": {
      alias: {
        map: [["@", "./src"]],
        extensions: [".js", ".ts", ".tsx", ".jsx", ".json"],
      },
    },
  },
};
