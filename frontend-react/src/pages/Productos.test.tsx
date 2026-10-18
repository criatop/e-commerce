import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { inicializarDatos } from '../data/seed';
import Productos from './Productos';

beforeEach(() => { 
  localStorage.clear(); 
  inicializarDatos(); 
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
  // 1. Prueba de Renderizado Lista Completa
  test('renderiza todas las tarjetas', () => {
    render(envolver(<Productos />));
    expect(screen.getAllByText(/añadir al carrito/i)).toHaveLength(17);
  });

  // 2. Prueba de Propiedades de Tarjeta de Producto
  test('prueba de propiedades: verifica que las tarjetas contengan sus componentes y botones', () => {
    render(envolver(<Productos />));
    const botones = screen.getAllByRole('button', { name: /añadir al carrito/i });
    expect(botones.length).toBe(17);
    expect(botones[0]).toBeInTheDocument();
  });

  // 3. Prueba de Evento (onChange) con escribir/filtrar
  test('escribir filtra mediante evento onChange', async () => {
    const user = userEvent.setup();
    render(envolver(<Productos />));
    const input = screen.getByPlaceholderText(/Buscar accesorio/i);
    
    await user.type(input, 'aros');
    expect(input).toHaveValue('aros');
  });

  // 4. Prueba de Estado (useState): verifica que la lista cambie al modificar el filtro
  test('cambia de estado al filtrar y actualiza la cantidad de productos visibles', () => {
    render(envolver(<Productos />));
    const input = screen.getByPlaceholderText(/Buscar accesorio/i);

    // Disparamos el cambio de estado con el evento onChange
    fireEvent.change(input, { target: { value: 'aros' } });

    // Comprobamos que el estado reactivo actualizó la lista visible de 17 a un número menor
    const tarjetasFiltradas = screen.getAllByText(/añadir al carrito/i);
    expect(tarjetasFiltradas.length).toBeLessThan(17);
  });
});


