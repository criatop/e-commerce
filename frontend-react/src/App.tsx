import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Layout from "./components/layout/Layout";
import AdminLayout from "./components/admin/AdminLayout";
import RutaProtegida from "./components/common/RutaProtegida";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import CompraExitosa from "./pages/CompraExitosa";
import MisCompras from "./pages/MisCompras";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Cuenta from "./pages/Cuenta";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import BlogDetalle from "./pages/BlogDetalle";
import Contacto from "./pages/Contacto";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminProductoForm from "./pages/admin/AdminProductoForm";
import AdminCategorias from "./components/admin/AdminCategorias";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminUsuarioForm from "./pages/admin/AdminUsuarioForm";
import AdminOrdenes from "./components/admin/AdminOrdenes";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/producto-detalle" element={<ProductoDetalle />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/compra-exitosa" element={<CompraExitosa />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetalle />} />
              <Route path="/contacto" element={<Contacto />} />

              <Route
                path="/cuenta"
                element={
                  <RutaProtegida roles={[1, 2, 3]}>
                    <Cuenta />
                  </RutaProtegida>
                }
              />
              <Route
                path="/mis-compras"
                element={
                  <RutaProtegida roles={[1, 2, 3]}>
                    <MisCompras />
                  </RutaProtegida>
                }
              />

              {/* Panel de administración */}
              <Route
                element={
                  <RutaProtegida roles={[1, 2]}>
                    <AdminLayout />
                  </RutaProtegida>
                }
              >
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/productos" element={<AdminProductos />} />
                <Route path="/admin/productos/form" element={<AdminProductoForm />} />
                <Route path="/admin/categorias" element={<AdminCategorias />} />
                <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                <Route path="/admin/usuarios/form" element={<AdminUsuarioForm />} />
                <Route path="/admin/ordenes" element={<AdminOrdenes />} />
              </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
