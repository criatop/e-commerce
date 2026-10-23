import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { CartProvider, useCart, type DatosEntrega } from "./CartContext";
import { CHIC_KEYS } from "../storage/claves";
import { alertas } from "../utils/alerta";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

function producto(overrides: Record<string, unknown> = {}) {
  return {
    codigo: "P1",
    nombre: "Collar",
    descripcion: "",
    precio: 10000,
    stock: 3,
    stockCritico: 1,
    categoriaId: 1,
    imagen: "collar.png",
    estado: "Activo",
    ...overrides,
  };
}

const entrega: DatosEntrega = {
  nombre: "Ana",
  direccion: "Calle 1",
  region: "RM",
  comuna: "Santiago",
  telefono: "912345678",
};

function leerOrdenes(): Array<Record<string, never>> {
  return JSON.parse(localStorage.getItem(CHIC_KEYS.ordenes) ?? "[]") as never;
}

describe("CartContext", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(CHIC_KEYS.productos, JSON.stringify([producto()]));
    spyOn(alertas, "exito").and.returnValue(Promise.resolve() as never);
    spyOn(alertas, "aviso").and.returnValue(Promise.resolve() as never);
    spyOn(alertas, "exitoHtml").and.returnValue(Promise.resolve() as never);
    spyOn(alertas, "confirmar").and.returnValue(Promise.resolve(true) as never);
  });

  it("agregar mete un producto nuevo", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    expect(result.current.carrito).toEqual([{ codigo: "P1", cantidad: 1 }]);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.total).toBe(10000);
  });

  it("agregar incrementa la cantidad si ya existe", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    act(() => {
      result.current.agregar("P1");
    });
    expect(result.current.carrito[0].cantidad).toBe(2);
  });

  it("agregar respeta el stock máximo", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1", 3);
    });
    act(() => {
      result.current.agregar("P1", 1);
    });
    expect(result.current.carrito[0].cantidad).toBe(3);
    expect(alertas.aviso).toHaveBeenCalled();
  });

  it("agregar ignora códigos inexistentes", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("NOPE");
    });
    expect(result.current.carrito).toEqual([]);
  });

  it("cambiarCantidad suma, resta y elimina al bajar de 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    act(() => {
      result.current.cambiarCantidad("P1", 1);
    });
    expect(result.current.carrito[0].cantidad).toBe(2);
    act(() => {
      result.current.cambiarCantidad("P1", -1);
    });
    expect(result.current.carrito[0].cantidad).toBe(1);
    act(() => {
      result.current.cambiarCantidad("P1", -1);
    });
    expect(result.current.carrito).toEqual([]);
  });

  it("cambiarCantidad no supera el stock", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1", 2);
    });
    act(() => {
      result.current.cambiarCantidad("P1", 5);
    });
    expect(result.current.carrito[0].cantidad).toBe(3);
  });

  it("eliminar quita el producto del carrito", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    act(() => {
      result.current.eliminar("P1");
    });
    expect(result.current.carrito).toEqual([]);
  });

  it("costoEnvio devuelve el costo según el método", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.costoEnvio("retiro")).toBe(0);
    expect(result.current.costoEnvio("estandar")).toBe(2990);
    expect(result.current.costoEnvio("express")).toBe(4990);
    expect(result.current.costoEnvio("desconocido")).toBe(0);
  });

  it("vaciar limpia el carrito cuando se confirma", async () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    await act(async () => {
      await result.current.vaciar();
    });
    expect(result.current.carrito).toEqual([]);
  });

  it("vaciar conserva el carrito cuando se cancela", async () => {
    (alertas.confirmar as jasmine.Spy).and.returnValue(Promise.resolve(false));
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    await act(async () => {
      await result.current.vaciar();
    });
    expect(result.current.carrito.length).toBe(1);
  });

  it("confirmarPedido sin carrito devuelve null", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    let folio: string | null = "x";
    act(() => {
      folio = result.current.confirmarPedido(entrega, "estandar", "webpay");
    });
    expect(folio).toBeNull();
  });

  it("confirmarPedido valida los datos de entrega", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    let folio: string | null = "x";
    act(() => {
      folio = result.current.confirmarPedido({ ...entrega, nombre: "" }, "estandar", "webpay");
    });
    expect(folio).toBeNull();
    expect(alertas.aviso).toHaveBeenCalled();
  });

  it("confirmarPedido crea la orden con folio PP-0001 y vacía el carrito", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1", 2);
    });
    let folio: string | null = null;
    act(() => {
      folio = result.current.confirmarPedido(entrega, "estandar", "webpay");
    });
    expect(folio).toBe("PP-0001");
    const ordenes = leerOrdenes();
    expect(ordenes.length).toBe(1);
    expect((ordenes[0] as Record<string, number>).total).toBe(10000 * 2 + 2990);
    expect(result.current.carrito).toEqual([]);
  });

  it("confirmarPedido con retiro usa valores por defecto", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.agregar("P1");
    });
    let folio: string | null = null;
    act(() => {
      folio = result.current.confirmarPedido(
        { ...entrega, direccion: "", region: "", comuna: "" },
        "retiro",
        "webpay",
      );
    });
    expect(folio).toBe("PP-0001");
    const orden = leerOrdenes()[0] as {
      entrega: { direccion: string };
      envio: { costo: number };
    };
    expect(orden.entrega.direccion).toBe("Retiro en tienda");
    expect(orden.envio.costo).toBe(0);
  });

  it("useCart lanza si se usa fuera del provider", () => {
    expect(() => renderHook(() => useCart())).toThrowError();
  });
});
