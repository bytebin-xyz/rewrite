module.exports = {
  extends: ["@nuxtjs/eslint-config-typescript"],
  rules: {
    "arrow-parens": "off",
    camelcase: "off",
    curly: "off",
    "comma-dangle": ["warn", "never"],
    "no-useless-constructor": "off",
    quotes: ["warn", "double"],
    "require-await": "off",
    semi: ["warn", "always"],
    "space-before-function-paren": "off",
    "vue/attribute-hyphenation": "off",
    "vue/html-self-closing": "off" // conflicts with prettier
  }
};
