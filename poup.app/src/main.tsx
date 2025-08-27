// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Importa o componente principal
import './index.css'; // Importa os estilos globais (Tailwind)

// Encontra o elemento 'root' no seu arquivo public/index.html
const rootElement = document.getElementById('root');

// Garante que o elemento root exista antes de renderizar
if (rootElement) {
  // Cria a raiz da aplicação React e renderiza o componente principal 'App'
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Falha ao encontrar o elemento root. Verifique se seu public/index.html possui um elemento com id='root'");
}
