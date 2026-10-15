// 1. Arriba: imports + beforeEach + envolver (igual que en Productos)
import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { inicializarDatos } from '../data/seed';
import Carrito from './Carrito';

beforeEach(() => { localStorage.clear(); inicializarDatos(); });

function envolver(ui: React.ReactNode) {
  return (<MemoryRouter><AuthProvider><CartProvider>{ui}</CartProvider></AuthProvider></MemoryRouter>);
}

// 2. Abajo: lo que pegaste, pero con tilde
//probar cuando se acepte el signo + aumenta 
describe('Carrito vacio', () => {
  test('muestra mensaje cuando esta vacio', () => {
    render(envolver(<Carrito />));
    expect(screen.getByText(/Tu carrito está vacío/)).toBeInTheDocument();
  });
});