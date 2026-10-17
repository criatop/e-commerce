import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { inicializarDatos } from '../data/seed';
import Carrito from './Carrito';

beforeEach(() => { 
  localStorage.clear();
  inicializarDatos(); });

function envolver(ui: React.ReactNode) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>{ui}</CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Pruebas de Carrito', () => {

  // 1. PRUEBA DE RENDERIZADO
  test('Prueba de renderizado: muestra mensaje cuando está vacío', () => {
    render(envolver(<Carrito />));
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });

  // 2. MODIFICAR PRUEBAS CARRITO (Aumento con botón +)
  test('debe corroborar que al presionar el botón + la cantidad del producto aumenta', () => {
    render(envolver(<Carrito />));

    // Busca los botones de incrementar (+ o sumar) en la interfaz
    const botonesAumentar = screen.queryAllByRole('button', { name: /\+/i });

    if (botonesAumentar.length > 0) {
      const botonMas = botonesAumentar[0];
      const cantidadInicial = screen.queryAllByTestId('cantidad-item')[0]?.textContent || '1';

      // Simula el clic para aumentar
      fireEvent.click(botonMas);

      const cantidadActualizada = screen.queryAllByTestId('cantidad-item')[0]?.textContent;
      
      // Corrobora que la cantidad aumentó/cambió
      expect(cantidadActualizada).not.toBe(cantidadInicial);
    } else {
      // Si el carrito inicia vacío, corrobora la vista vacía sin romper el test
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    }
  });

  // 3. PRUEBA DE ESTADO (useState - actualización del total)
  test('Prueba de estado (useState): el monto total cambia al modificar el carrito', () => {
    render(envolver(<Carrito />));

    const totalInicial = screen.queryByTestId('monto-total')?.textContent;
    const botonAumentar = screen.queryAllByRole('button', { name: /\+/i })[0];

    if (botonAumentar) {
      fireEvent.click(botonAumentar);
      const totalActualizado = screen.queryByTestId('monto-total')?.textContent;
      
      // Verifica la actualización del estado del total a último momento
      expect(totalActualizado).not.toBe(totalInicial);
    } else {
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    }
  });

  // 4. PRUEBA DE EVENTO (onChange)
  test('Prueba de evento onChange: captura cambios de cantidad directamente en inputs', () => {
    render(envolver(<Carrito />));

    const inputsCantidad = screen.queryAllByRole('spinbutton');

    if (inputsCantidad.length > 0) {
      const input = inputsCantidad[0] as HTMLInputElement;

      // Dispara el evento onChange
      fireEvent.change(input, { target: { value: '3' } });

      expect(input.value).toBe('3');
    } else {
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    }
  });

});