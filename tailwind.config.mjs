/*
Suppress "Cannot resolve default tailwindcss config path. Please manually set the config option." during lint by specifying the path to this config file.
See eslint.config.mjs for more information. Future versions of eslint-plugin-tailwindcss may resolve this automatically in which case this config file
can be removed.
*/

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}

export default tailwindConfig
