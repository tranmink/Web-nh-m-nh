/** Dark mode dựa trên class `dark` gắn vào thẻ <html> */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
