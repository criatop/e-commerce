import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useColeccion } from "../../storage/useColeccion";
import { CHIC_KEYS } from "../../storage/claves";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alertas";
import type { Producto } from "../../types";

const VACIO = {
  codigo: "",
  nombre: "",
  categoriaId: "",
  precio: "",
  stock: "",
  stockCritico: "5",
  imagen: "",
  descripcion: "",
  estado: "Activo" as const,
};

const MENSAJES = {
  codigo: "Ingresa un código SKU.",
  nombre: "Ingresa el nombre del producto.",
  categoriaId: "Selecciona una categoría.",
  precio: "Ingresa un precio mayor a 0.",
  stock: "Ingresa un stock mayor o igual a 0.",
  imagen: "Ingresa la ruta de la imagen.",
  descripcion: "Escribe una descripción.",
};

export default function AdminProductoForm() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const codigoEditar = parametros.get("codigo");
  const { datos: productos, guardar } = useColeccion<Producto>(CHIC_KEYS.productos);
  const { categorias } = useTablasMaestras();

  const existente = productos.find((p) => p.codigo === codigoEditar);

  const [form, setForm] = useState(() =>
    existente
      ? {
          codigo: existente.codigo,
          nombre: existente.nombre,
          categoriaId: String(existente.categoriaId),
          precio: String(existente.precio),
          stock: String(existente.stock),
          stockCritico: String(existente.stockCritico),
          imagen: existente.imagen,
          descripcion: existente.descripcion,
          estado: existente.estado,
        }
      : VACIO,
  );

  const [errores, setErrores] = useState<Partial<Record<keyof typeof VACIO, boolean>>>({});

  function escribir(campo: keyof typeof VACIO, valor: string) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: false }));
  }

  function validar(): boolean {
    const nuevos: Partial<Record<keyof typeof VACIO, boolean>> = {};

    if (!form.codigo.trim()) nuevos.codigo = true;
    if (!form.nombre.trim()) nuevos.nombre = true;
    if (!form.categoriaId) nuevos.categoriaId = true;
    if (Number(form.precio) <= 0) nuevos.precio = true;
    if (Number(form.stock) < 0) nuevos.stock = true;
    if (!form.imagen.trim()) nuevos.imagen = true;
    if (!form.descripcion.trim()) nuevos.descripcion = true;

    const codigoRepetido = productos.some(
      (p) => p.codigo.toLowerCase() === form.codigo.trim().toLowerCase() && p.codigo !== codigoEditar,
    );
    if (codigoRepetido) nuevos.codigo = true;

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!validar()) {
      void alertas.aviso("Revisa el formulario", "Hay campos incompletos o con datos inválidos.");
      return;
    }

    const registro: Producto = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      stockCritico: Number(form.stockCritico),
      categoriaId: Number(form.categoriaId),
      imagen: form.imagen.trim(),
      estado: form.estado,
    };

    if (existente) {
      guardar(productos.map((p) => (p.codigo === existente.codigo ? registro : p)));
      void alertas.exito("Producto actualizado", `${registro.nombre} fue guardado.`);
    } else {
      guardar([...productos, registro]);
      void alertas.exito("Producto creado", `${registro.nombre} se agregó al catálogo.`);
    }

    navegar("/admin/productos");
  }

  return (
    <main className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h1 className="fw-bold h2 titulo-admin">
            {existente ? "Editar Producto" : "Formulario de Producto"}
          </h1>
          <p className="text-muted mb-0">
            Ingresa los datos para registrar o modificar un producto en el catálogo.
          </p>
        </div>
        <Link to="/admin/productos" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" /> Volver a Productos
        </Link>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 p-4 caja-contacto">
            <form id="formProductoAdmin" noValidate onSubmit={enviar}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="codigoProducto" className="form-label fw-bold">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.codigo ? " is-invalid" : "")}
                    id="codigoProducto"
                    placeholder="Ej: CH-018"
                    value={form.codigo}
                    onChange={(e) => escribir("codigo", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {errores.codigo ? "Ingresa un código SKU único." : ""}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="nombreProducto" className="form-label fw-bold">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.nombre ? " is-invalid" : "")}
                    id="nombreProducto"
                    placeholder="Ej: Collar Rose Gold"
                    value={form.nombre}
                    onChange={(e) => escribir("nombre", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {errores.nombre ? MENSAJES.nombre : ""}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="categoriaProducto" className="form-label fw-bold">
                    Categoría
                  </label>
                  <select
                    className={"form-select" + (errores.categoriaId ? " is-invalid" : "")}
                    id="categoriaProducto"
                    value={form.categoriaId}
                    onChange={(e) => escribir("categoriaId", e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.datos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="invalid-feedback">
                    {errores.categoriaId ? MENSAJES.categoriaId : ""}
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <label htmlFor="precioProducto" className="form-label fw-bold">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    className={"form-control" + (errores.precio ? " is-invalid" : "")}
                    id="precioProducto"
                    placeholder="24990"
                    min={0}
                    value={form.precio}
                    onChange={(e) => escribir("precio", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {errores.precio ? MENSAJES.precio : ""}
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <label htmlFor="stockProducto" className="form-label fw-bold">
                    Stock
                  </label>
                  <input
                    type="number"
                    className={"form-control" + (errores.stock ? " is-invalid" : "")}
                    id="stockProducto"
                    placeholder="10"
                    min={0}
                    value={form.stock}
                    onChange={(e) => escribir("stock", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {errores.stock ? MENSAJES.stock : ""}
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="stockCriticoProducto" className="form-label fw-bold">
                    Umbral de stock crítico
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="stockCriticoProducto"
                    min={0}
                    value={form.stockCritico}
                    onChange={(e) => escribir("stockCritico", e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="imagenProducto" className="form-label fw-bold">
                    Ruta de imagen
                  </label>
                  <input
                    type="text"
                    className={"form-control" + (errores.imagen ? " is-invalid" : "")}
                    id="imagenProducto"
                    placeholder="productos/collar-rose.jpg"
                    value={form.imagen}
                    onChange={(e) => escribir("imagen", e.target.value)}
                  />
                  <div className="invalid-feedback">{errores.imagen ? MENSAJES.imagen : ""}</div>
                  <div className="form-text">
                    Debe coincidir con un archivo de <code>public/img/</code>, por ejemplo{" "}
                    <code>productos/aros1.jpg</code>.
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="descripcionProducto" className="form-label fw-bold">
                    Descripción
                  </label>
                  <textarea
                    className={"form-control" + (errores.descripcion ? " is-invalid" : "")}
                    id="descripcionProducto"
                    rows={4}
                    placeholder="Escribe las características y detalles del producto..."
                    value={form.descripcion}
                    onChange={(e) => escribir("descripcion", e.target.value)}
                  />
                  <div className="invalid-feedback">
                    {errores.descripcion ? MENSAJES.descripcion : ""}
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 mt-4">
                  <Link to="/admin/productos" className="btn btn-outline-secondary">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-contacto">
                    Guardar Producto
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
