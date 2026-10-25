
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configuración principal de Vite y Vitest para la aplicación React
export default defineConfig({
  // Plugins para soportar JSX/TSX y características de React
  plugins: [react()],

 // Configuración del entorno y comportamiento de los Test Unitarios
  test: {
    // 1. ENTORNO DE EJECUCIÓN (DOM Simulado):
    // Usa 'jsdom' para emular el comportamiento de las APIs de un navegador web 
    // (window, document, eventos de HTML y componentes de React) directamente 
    // dentro de Node.js, sin necesidad de abrir una ventana física del navegador.
    environment: 'jsdom',

    // 2. FUNCIONES GLOBALES DE PRUEBA:
    // Al estar en 'true', permite usar funciones como describe(), it(), test() y expect() 
    // de forma global en todos los archivos de prueba sin necesidad de importarlas individualmente.
    globals: true,
    
    // 3. ARCHIVO DE CONFIGURACIÓN INICIAL:
    // Define el script que se ejecuta antes de cada archivo de prueba (.spec/.test).
    // Aquí se extienden las aserciones con matchers como '@testing-library/jest-dom'
    // para validar elementos del DOM (ej. toBeInTheDocument(), toBeVisible()).
    setupFiles: ['./src/setupTests.ts']
  }
});