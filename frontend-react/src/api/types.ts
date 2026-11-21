// Tipos de los DTOs que expone el backend bajo /api/v1.
// Se mapean desde el sobre ApiResponse<T> en client.ts.

export interface ProductoApi {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  active: boolean;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  available: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriaApi {
  id: string;
  name: string;
  description: string;
  activa: boolean;
}

/** UserResponse de ms-auth, consumido solo por el panel de administración. */
export interface UsuarioApi {
  id: number | string;
  run: string;
  nombre: string;
  apellidos?: string | null;
  email: string;
  fechaNacimiento?: string | null;
  roleId: number;
  roleName?: string | null;
  regionId?: number | null;
  comunaId?: number | null;
  direccion?: string | null;
  activo?: boolean | null;
}

export interface CartItemApi {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartApi {
  id: string;
  userId: string;
  items: CartItemApi[];
  totalAmount: number;
}

export interface OrdenItemApi {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

/** OrderStatus de ms-order: valores del enum del backend (en inglés). */
export type OrdenEstadoApi =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrdenApi {
  id: string;
  folio: string;
  userId: string;
  status: OrdenEstadoApi;
  items: OrdenItemApi[];
  totalAmount: number;
  subtotalAmount: number;
  shippingAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  recipientName: string;
  recipientEmail: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopProductoApi {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
}

export interface OrderStatsApi {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  ordersByStatus: Record<string, number>;
  topProducts: TopProductoApi[];
}

export interface PaginaApi<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

export interface NoticiaApi {
  id: string;
  titulo: string;
  resumen: string;
  imagen: string;
  fecha: string;
  slug: string;
  categoria: string;
  autor: string;
  parrafos: string[];
}

export interface ContactMessageApi {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  mensaje: string;
}
