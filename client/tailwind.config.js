/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        upper: '#6c6c6c',     // فضي - الدور العلوي
        ground1: '#d4Af37',   // ذهبي - القسم الأول
        ground2: '#999999',   // بلاتنم - القسم الثاني
        selected: '#15803d',   // أخضر- المحدد
        booked: '#ef4444',     // أحمر - المحجوز
      },
    },
  },
  plugins: [],
}
