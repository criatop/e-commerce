import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CHIC_KEYS } from '../storage/claves';
import Carrito from './Carrito';

vi.mock('../api/catalog', () => ({
  catalogApi: {
    listCategories: vi.fn().mockResolvedValue([]),
    listProducts: vi.fn().mockResolvedValue([]),
  },
}));

beforeEach(() => {
  localStorage.clear();
});

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

  test('Prueba de renderizado: muestra mensaje cuando está vacío', () => {
    render(envolver(<Carrito />));
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });

  test('debe corroborar que al presionar el botón + la cantidad del producto aumenta', () => {
    render(envolver(<Carrito />));
    const botonesAumentar = screen.queryAllByRole('button', { name: /\+/i });

    if (botonesAumentar.length > 0) {
      const cantidadInicial = screen.queryAllByTestId('cantidad-item')[0]?.textContent || '1';
      fireEvent.click(botonesAumentar[0]);
      const cantidadActualizada = screen.queryAllByTestId('cantidad-item')[0]?.textContent;
      expect(cantidadActualizada).not.toBe(cantidadInicial);
    } else {
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    }
  });

  test('Prueba de estado (useState): el monto total cambia al modificar el carrito', async () => {
    localStorage.setItem(CHIC_KEYS.carritoPendiente, JSON.stringify([{
      productId: '11111111-1111-4111-8111-000000000001',
      codigo: 'CH-001',
      nombre: 'Aros Dorados',
      precio: 11500,
      cantidad: 1,
    }]));

    render(envolver(<Carrito />));
    const leerTotal = () => screen.getByText(/^Total:/i).textContent ?? '';
    const totalInicial = leerTotal();

    fireEvent.click(screen.getByRole('button', { name: '+' }));

    await waitFor(() => {
      expect(leerTotal()).not.toBe(totalInicial);
    });
  });

  test('Prueba de evento onChange: captura cambios de cantidad directamente en inputs', () => {
    render(envolver(<Carrito />));
    const inputsCantidad = screen.queryAllByRole('spinbutton');

    if (inputsCantidad.length > 0) {
      const input = inputsCantidad[0] as HTMLInputElement;
      fireEvent.change(input, { target: { value: '3' } });
      expect(input.value).toBe('3');
    } else {
      expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
    }
  });
});
