export type Estado = "Activo" | "Inactivo";
export interface Rol { id: number; nombre: string }
export interface Categoria { id: number; nombre: string; descripcion: string }
export interface Region { id: number; nombre: string }
export interface Comuna { id: number; regionId: number; nombre: string }
export interface Producto {
codigo: string; nombre: string; descripcion: string;
precio: number; stock: number; stockCritico: number;
categoriaId: number; imagen: string; estado: Estado;
}
export interface Usuario {
run: string; nombre: string; apellidos: string; correo: string;
password: string; fechaNacimiento: string;
rolId: number; regionId: number; comunaId: number;
direccion: string; estado: Estado;
}
export interface Sesion { run: string; nombre: string; apellidos: string;
correo: string; fechaNacimiento: string; rolId: number; regionId: number; comunaId: number; 
direccion: string; estado: Estado;}
export interface ItemCarrito { codigo: string; cantidad: number }

export interface Noticia { id: number; titulo: string; resumen: string;
imagen: string; fecha: string; slug: string; categoria: string;
autor: string; parrafos: string[];
}

export interface Mensaje {
nombre: string; apellido: string; email: string; mensaje: string;
}
export interface ItemOrden {
codigo: string; nombre: string; precio: number;
cantidad: number; subtotal: number;
}

export interface Orden {
folio: string;
fecha: string;
items: ItemOrden[];
subtotal: number;
envio: { metodo: string; costo: number };
pago: { metodo: string };
entrega: { nombre: string; direccion: string; region: string; comuna: string; telefono: string };
total: number;
estado: string;
}