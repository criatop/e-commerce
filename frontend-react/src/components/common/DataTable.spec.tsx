import { fireEvent, render, screen } from "@testing-library/react";
import DataTable, { type Columna } from "./DataTable";

interface Fila {
  id: number;
  nombre: string;
  precio: number;
}

const filas: Fila[] = [
  { id: 1, nombre: "Collar", precio: 300 },
  { id: 2, nombre: "Aros", precio: 100 },
  { id: 3, nombre: "Pulsera", precio: 200 },
];

const columnas: Columna<Fila>[] = [
  { clave: "nombre", titulo: "Nombre", render: (f) => f.nombre, orden: (f) => f.nombre },
  { clave: "precio", titulo: "Precio", render: (f) => f.precio, orden: (f) => f.precio },
];

const coincide = (fila: Fila, texto: string) =>
  fila.nombre.toLowerCase().includes(texto);

function nombreDeFilas(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map(
      (fila) =>
        (fila.querySelector("td") as HTMLTableCellElement | null)?.textContent ?? "",
    );
}

function renderTabla(props: { porPagina?: number; textoVacio?: string } = {}) {
  return render(
    <DataTable<Fila>
      filas={filas}
      columnas={columnas}
      claveFila={(f) => f.id}
      coincide={coincide}
      porPagina={10}
      {...props}
    />,
  );
}

describe("DataTable", () => {
  it("renderiza todas las filas recibidas", () => {
    renderTabla();
    expect(nombreDeFilas()).toEqual(["Collar", "Aros", "Pulsera"]);
  });

  it("filtra las filas según el texto de búsqueda", () => {
    renderTabla();
    fireEvent.change(screen.getByPlaceholderText("Buscar..."), {
      target: { value: "col" },
    });
    expect(nombreDeFilas()).toEqual(["Collar"]);
  });

  it("ordena ascendente, descendente y vuelve al orden original", () => {
    renderTabla();
    const botonPrecio = screen.getByRole("button", { name: /Precio/ });

    fireEvent.click(botonPrecio);
    expect(nombreDeFilas()).toEqual(["Aros", "Pulsera", "Collar"]);

    fireEvent.click(botonPrecio);
    expect(nombreDeFilas()).toEqual(["Collar", "Pulsera", "Aros"]);

    fireEvent.click(botonPrecio);
    expect(nombreDeFilas()).toEqual(["Collar", "Aros", "Pulsera"]);
  });

  it("muestra el texto vacío cuando no hay coincidencias", () => {
    renderTabla({ textoVacio: "Sin resultados" });
    fireEvent.change(screen.getByPlaceholderText("Buscar..."), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("Sin resultados")).toBeTruthy();
  });

  it("pagina los resultados de a porPagina", () => {
    renderTabla({ porPagina: 2 });
    expect(nombreDeFilas()).toEqual(["Collar", "Aros"]);
    expect(screen.getByText(/de 3/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(nombreDeFilas()).toEqual(["Pulsera"]);
  });
});
