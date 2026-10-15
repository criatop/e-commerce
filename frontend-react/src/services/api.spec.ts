import { AxiosError } from "axios";
import MockAdapter from "axios-mock-adapter";
import api, {
  API_BASE_URL,
  crearProducto,
  mensajeDeError,
  obtenerProducto,
  obtenerProductos,
} from "./api";

describe("servicio api (axios simulando la conexión a la API)", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  it("configura la URL base del servidor", () => {
    expect(api.defaults.baseURL).toBe(API_BASE_URL);
  });

  it("obtenerProductos hace GET /productos y devuelve la lista", async () => {
    mock.onGet("/productos").reply(200, [
      { codigo: "P1", nombre: "Collar", precio: 9990, stock: 5, categoriaId: 1 },
      { codigo: "P2", nombre: "Aros", precio: 5990, stock: 3, categoriaId: 3 },
    ]);

    const productos = await obtenerProductos();

    expect(productos.length).toBe(2);
    expect(productos[0].nombre).toBe("Collar");
  });

  it("obtenerProducto hace GET /productos/:codigo", async () => {
    mock.onGet("/productos/P1").reply(200, {
      codigo: "P1",
      nombre: "Collar",
      precio: 9990,
      stock: 5,
      categoriaId: 1,
    });

    const producto = await obtenerProducto("P1");

    expect(producto.codigo).toBe("P1");
    expect(producto.precio).toBe(9990);
  });

  it("crearProducto hace POST /productos y devuelve lo creado", async () => {
    mock.onPost("/productos").reply((config) => {
      const nuevo = JSON.parse(config.data as string) as Record<string, unknown>;
      return [201, { codigo: "P9", ...nuevo }];
    });

    const creado = await crearProducto({
      nombre: "Pulsera",
      precio: 4990,
      stock: 2,
      categoriaId: 2,
    });

    expect(creado.codigo).toBe("P9");
    expect(creado.nombre).toBe("Pulsera");
  });

  it("propaga el error cuando el servidor responde 500", async () => {
    mock.onGet("/productos").reply(500);

    await expectAsync(obtenerProductos()).toBeRejected();
  });

  it("simula la latencia de la red antes de responder", async () => {
    mock.onGet("/productos").reply(async () => {
      await new Promise((resolver) => setTimeout(resolver, 30));
      return [200, []];
    });

    const inicio = Date.now();
    const productos = await obtenerProductos();
    const duracion = Date.now() - inicio;

    expect(productos).toEqual([]);
    expect(duracion).toBeGreaterThanOrEqual(25);
  });

  it("mensajeDeError interpreta error de servidor, de red y desconocido", () => {
    const errorServidor = new AxiosError(
      "Servidor",
      "ERR_BAD_RESPONSE",
      undefined,
      undefined,
      { status: 404 } as never,
    );
    const errorRed = new AxiosError("Red", "ERR_NETWORK", undefined, {});

    expect(mensajeDeError(errorServidor)).toBe("Error 404 del servidor");
    expect(mensajeDeError(errorRed)).toBe("No se pudo conectar con el servidor");
    expect(mensajeDeError(new Error("desconocido"))).toBe("Error inesperado");
  });
});
