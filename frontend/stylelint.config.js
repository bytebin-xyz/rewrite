// https://stylelint.io/user-guide/configuration

module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-prettier"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["apply", "include", "responsive", "screen", "tailwind", "variants"]
      }
    ],
    "block-no-empty": null,
    "declaration-block-trailing-semicolon": null,
    "no-descending-specificity": null
  }
};
