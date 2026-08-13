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
            },
            transitionTimingFunction: {
                'power2-out': 'cubic-bezier(0.25, 1, 0.5, 1)',
                'power3-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
                'reveal': 'cubic-bezier(0.77, 0, 0.175, 1)',
            }
        },
    },
    plugins: [
        fluid
    ],
};