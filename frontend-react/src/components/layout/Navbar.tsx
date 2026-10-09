import { useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
export default function Navbar() {
const [texto, setTexto] = useState("");
const navegar = useNavigate();
function buscar(evento: KeyboardEvent<HTMLInputElement>) {
if (evento.key === "Enter" && texto.trim()) {
navegar("/productos?q=" + encodeURIComponent(texto.trim()));
}
}
return (
<>
<header className="site-header">
<div className="search-box">
<input
type="text"
placeholder="Buscar accesorios ..."
autoComplete="off"
value={texto}
onChange={(e) => setTexto(e.target.value)}
onKeyDown={buscar}
/>
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
<circle cx="11" cy="11" r="7" />
<line x1="21" y1="21" x2="16.65" y2="16.65" />
</svg>
</div>
<div className="brand-mark">
<p className="name">PINK&amp;PINK</p>
<span className="by">BY JHAIMAR ALTUVE</span>
</div>
<div className="header-icons">
<Link to="/cuenta" aria-label="Cuenta">
<svg viewBox="0 0 24 24">
<circle cx="12" cy="8" r="4" />
<path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />

</svg>
</Link>
<Link to="/carrito" aria-label="Carrito">
<svg viewBox="0 0 24 24">
<path d="M4 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6" />
<circle cx="10" cy="21" r="1" />
<circle cx="17" cy="21" r="1" />
</svg>
<span className="cart-count">0</span>
</Link>
</div>
</header>
<nav className="main-nav">
<Link to="/">INICIO</Link>
<Link to="/productos?categoria=1">COLLARES</Link>
<Link to="/productos?categoria=2">PULSERAS</Link>
<Link to="/productos?categoria=3">AROS</Link>
<Link to="/productos?categoria=5">ACCESORIOS</Link>
<Link to="/productos">TODOS</Link>
<Link to="/nosotros">NOSOTROS</Link>
<Link to="/contacto">CONTACTO</Link>
</nav>
</>
);
}