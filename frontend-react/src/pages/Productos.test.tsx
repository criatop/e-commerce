import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Productos from './Productos';
import type { CategoriaApi, ProductoApi } from '../api/types';

const mocks = vi.hoisted(() => ({
  listProducts: vi.fn(),
  listCategories: vi.fn(),
}));

vi.mock('../api/catalog', () => ({
  catalogApi: { listProducts: mocks.listProducts, listCategories: mocks.listCategories },
}));

const PRODUCTOS: ProductoApi[] = Array.from({ length: 17 }, (_, i) => ({
  id: `11111111-1111-4111-8111-${String(i + 1).padStart(12, '0')}`,
  sku: `P${String(i + 1).padStart(3, '0')}`,
  name: i < 4 ? `Aros dorados ${i + 1}` : `Collar modelo ${i + 1}`,
  description: 'Producto de prueba',
  price: 10000 + i,
  category: i % 2 === 0 ? 'cat-1' : 'cat-2',
  imageUrl: '/img/prueba.png',
  active: true,
  stockQuantity: 20,
  reservedQuantity: 0,
  lowStockThreshold: 2,
  available: 20,
}));

const CATEGORIAS: CategoriaApi[] = [
  { id: 'cat-1', name: 'Aros', description: '', activa: true },
  { id: 'cat-2', name: 'Collares', description: '', activa: true },
];

beforeEach(() => {
  localStorage.clear();
  mocks.listCategories.mockResolvedValue(CATEGORIAS);
  mocks.listProducts.mockImplementation((q: { search?: string } = {}) => {
    const searched = q.search?.toLowerCase() ?? '';
    return Promise.resolve(
      searched
        ? PRODUCTOS.filter((p) => p.name.toLowerCase().includes(searched))
        : PRODUCTOS,
    );
  });
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

describe('Productos lista', () => {
  test('renderiza todas las tarjetas', async () => {
    render(envolver(<Productos />));
    const botones = await screen.findAllByRole('button', { name: /añadir al carrito/i });
    expect(botones).toHaveLength(17);
  });

  test('prueba de propiedades: verifica que las tarjetas contengan sus componentes y botones', async () => {
    render(envolver(<Productos />));
    const botones = await screen.findAllByRole('button', { name: /añadir al carrito/i });
    expect(botones.length).toBe(17);
    expect(botones[0]).toBeInTheDocument();
  });

  test('escribir filtra mediante evento onChange', async () => {
    const user = userEvent.setup();
    render(envolver(<Productos />));
    const input = screen.getByPlaceholderText(/Buscar accesorio/i);

    await user.type(input, 'aros');
    expect(input).toHaveValue('aros');
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /añadir al carrito/i })).toHaveLength(4);
    });
  });

  test('cambia de estado al filtrar y actualiza la cantidad de productos visibles', async () => {
    render(envolver(<Productos />));
    const input = screen.getByPlaceholderText(/Buscar accesorio/i);
    await screen.findAllByRole('button', { name: /añadir al carrito/i });

    fireEvent.change(input, { target: { value: 'aros' } });

    await waitFor(() => {
      const tarjetasFiltradas = screen.getAllByRole('button', { name: /añadir al carrito/i });
      expect(tarjetasFiltradas.length).toBeLessThan(17);
    });
  });
});
