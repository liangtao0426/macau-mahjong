/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgApp: '#F8F3EB', // 浅米白底色
        brand: {
          DEFAULT: '#0E5C4E', // 墨绿色主调
          dark: '#0A473C',
          light: '#E6F0EE',
          border: '#D0E2DF',
        },
        zhuji: {
          DEFAULT: '#C86328', // 诸暨麻将暖橙棕色
          bg: '#FAF0E6',
          border: '#F2D7C4',
        },
        hangzhou: {
          DEFAULT: '#0E5C4E',
          bg: '#EBF4F2',
          border: '#BFDAD5',
        },
        textMain: '#2C3531',
        textMuted: '#8C857B',
        textSub: '#5A5248',
      },
      fontFamily: {
        sans: [
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Noto Sans SC',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 2px 10px rgba(0, 0, 0, 0.03)',
        tab: '0 -2px 12px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
