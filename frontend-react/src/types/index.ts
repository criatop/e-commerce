export type Estado = "Activo" | "Inactivo";

export interface Rol {
  id: number;
  nombre: string;
}

export interface Categoria {
  id: number | string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
}

export interface Region {
  id: number;
  nombre: string;
}

export interface Comuna {
  id: number;
  regionId: number;
  nombre: string;
}

export interface Producto {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockCritico: number;
  categoriaId: number | string;
  imagen: string;
  estado: Estado;
}

export interface Usuario {
  id?: number | string;
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  email?: string;
  password?: string;
  fechaNacimiento?: string;
  rolId: number;
  rol?: string;
  regionId?: number | null;
  comunaId?: number | null;
  direccion?: string;
  estado?: Estado;
  activo?: boolean;
}

export interface Sesion {
  id?: number | string;
  run: string;
  nombre: string;
  apellidos: string;
  correo: string;
  fechaNacimiento?: string;
  rolId: number;
  rol?: string;
  regionId?: number | null;
  comunaId?: number | null;
  direccion?: string;
  estado?: Estado;
}

export interface ItemCarrito {
  codigo: string;
  productId?: string;
  cantidad: number;
  nombre?: string;
  precio?: number;
  stock?: number;
  imagen?: string;
}

export interface Noticia {
  id: number | string;
  titulo: string;
  resumen: string;
  imagen: string;
  fecha: string;
  slug: string;
  categoria: string;
  autor: string;
  parrafos: string[];
}

export interface Mensaje {
  nombre: string;
  apellido: string;
  email: string;
  mensaje: string;
}

export interface ItemOrden {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface Orden {
  folio: string;
  fecha: string;
  items: ItemOrden[];
  subtotal: number;
  envio: { metodo: string; costo: number };
  pago: { metodo: string };
  entrega: {
    nombre: string;
    direccion: string;
    region: string;
    comuna: string;
    telefono: string;
  };
  total: number;
  estado: string;
  usuario?: {
    run: string;
    correo: string;
    nombre: string;
    apellidos?: string;
  };
}

export interface ApiResponse<T> {
  exitoso: boolean;
  datos: T;
  mensaje?: string;
  timestamp?: string;
}
