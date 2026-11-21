import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { CHIC_KEYS } from '../../storage/claves';
import TarjetaProducto from './TarjetaProducto';
import type { Producto } from '../../types';

vi.mock('../../utils/alerta', () => ({
  alertas: {
    exito: vi.fn(),
    exitoHtml: vi.fn(),
    error: vi.fn(),
    aviso: vi.fn(),
    accesoRestringido: vi.fn(),
    confirmar: vi.fn().mockResolvedValue(true),
  }
}));

vi.mock('../../api/catalog', () => ({
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

const producto: Producto = {
  codigo: 'P1',
  nombre: 'Collar Rosa',
  descripcion: '',
  precio: 12000,
  stock: 5,
  stockCritico: 1,
  categoriaId: 1,
  imagen: 'collar.png',
  estado: 'Activo',
};

describe('TarjetaProducto', () => {
  test('agrega el producto al carrito pendiente', async () => {
    const user = userEvent.setup();
    render(envolver(<TarjetaProducto producto={producto} />));

    await user.click(screen.getByRole('button', { name: /añadir al carrito/i }));

    await waitFor(() => {
      expect(localStorage.getItem(CHIC_KEYS.carritoPendiente)).toContain('P1');
    });
  });
});
