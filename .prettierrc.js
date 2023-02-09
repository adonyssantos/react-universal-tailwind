module.exports = {
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 95,
  "tabWidth": 2,
  "jsxSingleQuote": true,
  "bracketSpacing": true,
  importOrder: [
    'intl-pluralrules',
    'react-native-gesture-handler',
    "^(react|react-native)$",
    "<THIRD_PARTY_MODULES>",
    "^[./]",
  ],
  plugins: [require("./merged-prettier-plugin")],
};