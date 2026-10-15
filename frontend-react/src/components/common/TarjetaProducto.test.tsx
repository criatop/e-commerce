import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { inicializarDatos } from '../../data/seed';
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

beforeEach(() => { localStorage.clear(); inicializarDatos(); });

function envolver(ui: React.ReactNode) {
  return (<MemoryRouter><AuthProvider><CartProvider>{ui}</CartProvider></AuthProvider></MemoryRouter>);
}

const fake: Producto = {
  codigo: 'CH-001', nombre: 'Aros Dorados', descripcion: 'test',
  precio: 11500, stock: 15, stockCritico: 4,
  categoriaId: 3, imagen: 'x.jpg', estado: 'Activo'
};

describe('TarjetaProducto props', () => {
  test('muestra nombre y boton', () => {
    render(envolver(<TarjetaProducto producto={fake} />));
    expect(screen.getByText('Aros Dorados')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adir al carrito/i })).toBeInTheDocument();
  });
  test('clic agrega al carrito', async () => {
  const user = userEvent.setup();
  render(envolver(<TarjetaProducto producto={fake} />));
  await user.click(screen.getByRole('button', { name: /adir al carrito/i }));
  expect(JSON.parse(localStorage.getItem('chic_carrito')!)).toHaveLength(1);
  ///Lo que grabo sea realmente aros para comprobar 
});
});