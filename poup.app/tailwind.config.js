export default {
  // A parte mais importante é a propriedade 'content'.
  // Ela diz ao Tailwind para escanear todos esses arquivos em busca de classes.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Garante que ele olhe dentro de toda a pasta 'src'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
