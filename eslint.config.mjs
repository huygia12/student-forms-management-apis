import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

export default [
    {
        ignores: ["node_modules/", "dist/"], // Ignored directories
    },
    js.configs.recommended,
    {
        files: ["src/**/*.{js,ts}"],
        languageOptions: {
            parser: typescriptParser, // Use TypeScript parser
            parserOptions: {
                project: "./tsconfig.json", // Path to your tsconfig.json file
                ecmaVersion: 2020,
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": typescriptPlugin,
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "no-undef": "off",
        },
    },
];
