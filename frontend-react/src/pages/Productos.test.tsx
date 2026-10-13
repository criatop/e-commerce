import userEvent from '@testing-library/user-event';
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { inicializarDatos } from '../data/seed';
import Productos from './Productos';

beforeEach(() => { localStorage.clear(); inicializarDatos(); });

function envolver(ui: React.ReactNode) {
  return (<MemoryRouter><AuthProvider><CartProvider>{ui}</CartProvider></AuthProvider></MemoryRouter>);
}

  describe('Productos lista', () => {
  test('renderiza todas las tarjetas', () => {
    render(envolver(<Productos />));
    expect(screen.getAllByText(/adir al carrito/i)).toHaveLength(17);
  }); // <- CIERRA AQUÍ, te faltaba esto

  test('escribir filtra', async () => {
    const user = userEvent.setup();
    render(envolver(<Productos />));
    const input = screen.getByPlaceholderText(/Buscar accesorio/);
    await user.type(input, 'aros');
    expect(input).toHaveValue('aros');
  });
});