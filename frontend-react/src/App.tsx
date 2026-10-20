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
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Cuenta from "./pages/Cuenta";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import BlogDetalle from "./pages/BlogDetalle";
import Contacto from "./pages/Contacto";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProductos from "./components/admin/AdminProductos";
import AdminProductoForm from "./components/admin/AdminProductoForm";
import AdminUsuarios from "./components/admin/AdminUsuarios";
import AdminUsuarioForm from "./components/admin/AdminUsuarioForm";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/producto-detalle" element={<ProductoDetalle />} />
              <Route path="/carrito" element={<Carrito />} />
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

              {/* Panel de administración: una sola protección para las 5 páginas */}
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
                <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                <Route path="/admin/usuarios/form" element={<AdminUsuarioForm />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}