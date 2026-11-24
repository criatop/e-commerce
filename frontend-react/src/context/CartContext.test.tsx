import { describe, test, expect } from 'vitest';
import { METODOS_PAGO } from './CartContext';

// Valores del enum cl.ecommerce.payment.model.PaymentMethod en ms-payment.
const METODOS_ACEPTADOS = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'TRANSFER'];

describe('METODOS_PAGO', () => {
  test('envía al checkout solo métodos de pago que ms-payment puede procesar', () => {
    for (const metodo of METODOS_PAGO) {
      expect(METODOS_ACEPTADOS, `método inválido: ${metodo.valor}`).toContain(metodo.valor);
    }
  });
});
