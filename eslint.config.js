export default [
  {
    files: ["**/*.js"],
    ignores: ["src/assets/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-undef": "warn",
      "no-console": "off",
    },
  },
];


