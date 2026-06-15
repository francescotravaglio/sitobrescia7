/** Config Tailwind per build statica (sostituisce il CDN).
 *  Rigenerare il CSS dopo modifiche alle classi nelle pagine:
 *  npx tailwindcss -i tw-input.css -o assets/tailwind.css --minify
 */
module.exports = {
  content: ["./*.html", "./assets/*.js"],
  theme: {
    extend: {
      colors: {
        'scout': '#003366',
        'scout-dark': '#001a3d',
        'scout-mid': '#1a5276',
        'gold': '#fcc400',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        scout: ['Patrick Hand', 'cursive'],
      },
      opacity: { '8': '0.08', '15': '0.15' },
    },
  },
  plugins: [],
};
