import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import type { CategoriaApi } from '../../api/types';

const mocks = vi.hoisted(() => ({
  listCategories: vi.fn(),
}));

vi.mock('../../api/catalog', () => ({
  catalogApi: { listCategories: mocks.listCategories },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ sesion: null, iniciales: '', esPersonal: false, logout: vi.fn() }),
}));

vi.mock('../../context/CartContext', () => ({
  useCart: () => ({ totalItems: 0 }),
}));

const CATEGORIAS: CategoriaApi[] = [
  { id: '08ad1e2f-a16e-4ffc-af8f-f6c84970471d', name: 'Collares', description: '', activa: true },
  { id: '587bd340-ecf7-4afe-8219-9f2698093ce3', name: 'Aros', description: '', activa: true },
  { id: 'ae5cc015-c20b-4d71-8e05-38fc867fd7db', name: 'Pulseras', description: '', activa: true },
  { id: 'cc75d755-682d-484b-b70e-72931a751d2e', name: 'Anillos', description: '', activa: true },
  { id: '35d815a4-e8f6-4d3b-a3a5-ae37cd74427c', name: 'Tobilleras', description: '', activa: true },
  { id: 'b89abdd1-5b8c-48d8-a985-c718cea16c1e', name: 'Broches', description: '', activa: true },
];

describe('Navbar', () => {
  test('los enlaces de categoría usan los ids reales devueltos por el API', async () => {
    mocks.listCategories.mockResolvedValue(CATEGORIAS);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    for (const categoria of CATEGORIAS) {
      const enlace = await screen.findByRole('link', { name: categoria.name.toUpperCase() });
      expect(enlace.getAttribute('href')).toBe(
        `/productos?categoria=${encodeURIComponent(categoria.id)}`,
      );
    }
  });
});
