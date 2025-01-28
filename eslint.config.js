import js from "@eslint/js";

export default [
    js.configs.recommended, // Recommended config applied to all files
    // File-pattern specific overrides
    {
        files: ["lib/**/*", "test/**/*"],
        rules: {
            semi: ["warn", "always"],
            "no-undef": "off",
            "no-unused-vars": "off"
        }
    },
    {
        files:["test/**/*"],
        rules: {
            "no-console": "off",
            "no-undef": "off"
        }
    }
];