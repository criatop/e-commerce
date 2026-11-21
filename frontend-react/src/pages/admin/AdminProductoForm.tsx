import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { catalogApi, type ProductPayload } from "../../api/catalog";
import { mapProducto } from "../../api/mappers";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alerta";
import { mensajeError } from "../../utils/error";
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

function desdeProducto(producto: Producto) {
  return {
    codigo: producto.codigo,
    nombre: producto.nombre,
    categoriaId: String(producto.categoriaId),
    precio: String(producto.precio),
    stock: String(producto.stock),
    stockCritico: String(producto.stockCritico),
    imagen: producto.imagen,
    descripcion: producto.descripcion,
  };
}

export default function AdminProductoForm() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const idEditar = parametros.get("id");
  const codigoEditar = parametros.get("codigo");

  const { categorias } = useTablasMaestras();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [existente, setExistente] = useState<Producto | null>(null);
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState<Partial<Record<keyof typeof VACIO, boolean>>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    void (async () => {
      setCargando(true);
      setError("");
      try {
        const lista = (await catalogApi.listProducts()).map(mapProducto);
        if (!activo) return;
        setProductos(lista);

        if (idEditar) {
          const producto = mapProducto(await catalogApi.getProduct(idEditar));
          if (activo) {
            setExistente(producto);
            setForm(desdeProducto(producto));
          }
        } else if (codigoEditar) {
          const producto = lista.find((p) => p.codigo === codigoEditar) ?? null;
          if (activo) {
            setExistente(producto);
            setForm(producto ? desdeProducto(producto) : VACIO);
          }
        } else if (activo) {
          setExistente(null);
          setForm(VACIO);
        }
      } catch (e: unknown) {
        if (activo) setError(mensajeError(e));
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [idEditar, codigoEditar]);

  function escribir(campo: keyof typeof VACIO, valor: string) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: false }));
  }

  function subirImagen(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        escribir("imagen", reader.result);
      }
    };
    reader.readAsDataURL(file);
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
      (p) =>
        p.codigo.toLowerCase() === form.codigo.trim().toLowerCase() &&
        p.id !== existente?.id,
    );
    if (codigoRepetido) nuevos.codigo = true;

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!validar()) {
      void alertas.aviso("Revisa el formulario", "Hay campos incompletos o con datos inválidos.");
      return;
    }

    const cuerpo: ProductPayload = {
      name: form.nombre.trim(),
      description: form.descripcion.trim(),
      price: Number(form.precio),
      category: form.categoriaId,
      sku: form.codigo.trim(),
      imageUrl: form.imagen.trim(),
      // El backend guarda stock total; las unidades reservadas no se editan aquí.
      stockQuantity: Number(form.stock) + (existente?.reservado ?? 0),
      lowStockThreshold: Number(form.stockCritico),
    };

    setGuardando(true);
    setError("");
    try {
      if (existente?.id) {
        await catalogApi.updateProduct(existente.id, cuerpo);
        void alertas.exito("Producto actualizado", `${cuerpo.name} fue guardado.`);
      } else {
        await catalogApi.createProduct(cuerpo);
        void alertas.exito("Producto creado", `${cuerpo.name} se agregó al catálogo.`);
      }
      navegar("/admin/productos");
    } catch (e: unknown) {
      const mensaje = mensajeError(e);
      setError(mensaje);
      void alertas.error("No se pudo guardar", mensaje);
    } finally {
      setGuardando(false);
    }
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

      {error && <div className="alert alert-danger">No se pudo completar la operación: {error}</div>}

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card border-0 p-4 caja-contacto">
            <form id="formProductoAdmin" noValidate onSubmit={(evento) => void enviar(evento)}>
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
                    Stock disponible
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
                    Imagen del producto
                  </label>
                  <input
                    type="text"
                    className={"form-control mb-2" + (errores.imagen ? " is-invalid" : "")}
                    id="imagenProducto"
                    placeholder="productos/collar-rose.jpg o data:image/..."
                    value={form.imagen}
                    onChange={(e) => escribir("imagen", e.target.value)}
                  />
                  <input type="file" className="form-control" accept="image/*" onChange={subirImagen} />
                  <div className="invalid-feedback">{errores.imagen ? MENSAJES.imagen : ""}</div>
                  <div className="form-text">
                    Puedes escribir la ruta (ej. <code>productos/aros1.jpg</code>) o <b>subir una imagen desde tu escritorio</b> (se guarda en el producto).
                  </div>
                  {form.imagen && (
                    <div className="mt-2 text-center">
                      <img src={form.imagen} alt="Vista previa" style={{ maxHeight: "150px", maxWidth: "100%", objectFit: "contain" }} />
                    </div>
                  )}
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
                  <button type="submit" className="btn btn-contacto" disabled={cargando || guardando}>
                    {guardando ? "Guardando..." : "Guardar Producto"}
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
