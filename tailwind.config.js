import fluid, { extract, fontSize } from "fluid-tailwind";

module.exports = {
    corePlugins: {
        container: false,
        preflight: false,
    },
    content: {
        extract,
    },
    theme: {
        fontSize,
        screens: {
            "sm": "23.4375rem",
            "md": "48rem",
            "lg": "62rem",
            "xl": "75rem",
            "1xl": "81.25rem",
            "2xl": "90rem",
        },
        extend: {
            fontFamily: {
                'sohne': ['Sohne', 'Arial', 'sans-serif'],
            }
        },
    },
    plugins: [
        fluid
    ],
};