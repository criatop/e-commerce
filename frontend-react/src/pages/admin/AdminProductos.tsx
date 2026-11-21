import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { catalogApi } from "../../api/catalog";
import { mapProducto } from "../../api/mappers";
import DataTable, { type Columna } from "../../components/common/DataTable";
import ImagenProducto from "../../components/common/ImagenProducto";
import { useTablasMaestras } from "../../hooks/useTablasMaestras";
import { alertas } from "../../utils/alerta";
import { formatearPrecio } from "../../utils/formato";
import { mensajeError } from "../../utils/error";
import type { Producto } from "../../types";

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { nombreCategoria } = useTablasMaestras();

  const cargar = useCallback(async () => {
    try {
      const lista = await catalogApi.listProducts();
      setProductos(lista.map(mapProducto));
    } catch (e: unknown) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError("");
    await cargar();
  }, [cargar]);

  useEffect(() => {
    void (async () => {
      await cargar();
    })();
  }, [cargar]);

  async function eliminar(producto: Producto) {
    if (!producto.id) {
      void alertas.aviso("No se puede eliminar", "El producto no tiene un identificador de API.");
      return;
    }

    const ok = await alertas.confirmar(
      "Eliminar producto",
      `¿Seguro que quieres eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      "Sí, eliminar",
    );
    if (!ok) return;

    try {
      await catalogApi.deleteProduct(producto.id);
      void alertas.exito("Producto eliminado", `${producto.nombre} ya no está en el catálogo.`);
      await recargar();
    } catch (e: unknown) {
      void alertas.error("No se pudo eliminar", mensajeError(e));
    }
  }

  const columnas: Columna<Producto>[] = [
    {
      clave: "codigo",
      titulo: "Código",
      claseCelda: "ps-3 fw-bold text-muted",
      orden: (p) => p.codigo,
      render: (p) => `#${p.codigo}`,
    },
    {
      clave: "imagen",
      titulo: "Imagen",
      render: (p) => (
        <div
          className="thumb-producto-admin"
          style={{
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ImagenProducto
            imagen={p.imagen}
            alt={p.nombre}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      ),
    },
    {
      clave: "nombre",
      titulo: "Nombre",
      claseCelda: "fw-bold",
      orden: (p) => p.nombre,
      render: (p) => p.nombre,
    },
    {
      clave: "categoria",
      titulo: "Categoría",
      orden: (p) => nombreCategoria(p.categoriaId),
      render: (p) => (
        <span className="badge badge-categoria">{nombreCategoria(p.categoriaId)}</span>
      ),
    },
    {
      clave: "precio",
      titulo: "Precio",
      orden: (p) => p.precio,
      render: (p) => formatearPrecio(p.precio),
    },
    {
      clave: "stock",
      titulo: "Stock",
      orden: (p) => p.stock,
      render: (p) => (
        <span className={"badge " + (p.stock <= p.stockCritico ? "bg-danger" : "bg-success")}>
          {p.stock} un.
        </span>
      ),
    },
    {
      clave: "acciones",
      titulo: "Acciones",
      claseCelda: "text-end pe-3",
      render: (p) => (
        <>
          <Link
            to={`/admin/productos/form?id=${encodeURIComponent(p.id ?? "")}`}
            className="btn btn-sm btn-outline-primary me-1"
            title="Editar"
          >
            <i className="bi bi-pencil" />
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            title="Eliminar"
            onClick={() => void eliminar(p)}
          >
            <i className="bi bi-trash" />
          </button>
        </>
      ),
    },
  ];

  return (
    <main className="container my-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom gap-3">
        <div>
          <h1 className="fw-bold h2 titulo-admin">Gestión de Productos</h1>
          <p className="text-muted mb-0">Administra el inventario y catálogo de la tienda.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-outline-secondary btn-sm align-self-center">
            <i className="bi bi-arrow-left me-1" /> Volver al Panel
          </Link>
          <Link to="/admin/productos/form" className="btn btn-admin btn-sm align-self-center">
            <i className="bi bi-plus-lg me-1" /> Nuevo Producto
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">No se pudieron cargar los productos: {error}</div>}

      <div className="card border-0 caja-admin-tabla">
        <div className="card-body p-0">
          <DataTable
            filas={productos}
            columnas={columnas}
            claveFila={(p) => p.id ?? p.codigo}
            coincide={(p, texto) => p.nombre.toLowerCase().includes(texto)}
            placeholderBusqueda="Buscar producto por nombre..."
            porPagina={5}
            textoVacio={cargando ? "Cargando productos..." : "No se encontraron productos."}
          />
        </div>
      </div>
    </main>
  );
}
