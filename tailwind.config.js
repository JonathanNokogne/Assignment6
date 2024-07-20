module.exports = {
  content: [`./views/**/*.ejs`],
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ['fantasy'],
  },
};


