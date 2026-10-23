import { Link } from "react-router-dom";
export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-col">
                    <div className="brand-mark small">
                        <p className="name">PINK&amp;PINK</p>
                        <span className="by">BY JHAIMAR ALTUVE</span>
                    </div>
                    <p className="footer-desc">
                        Accesorios delicados y únicos, hechos para brillar en cada momento. Envíos a todo Chile ♥
                    </p>
                </div>
                <div className="footer-col">
                    <h6>Explora</h6>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/productos">Catálogo</Link></li>
                        <li><Link to="/blog">Blog</Link></li>
                        <li><Link to="/nosotros">Nosotros</Link></li>
                        <li><Link to="/contacto">Contacto</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h6>Ayuda</h6>
                    <ul>
                        <li><Link to="/carrito">Mi carrito</Link></li>
                        <li><Link to="/cuenta">Mi cuenta</Link></li>
                        <li><Link to="/login">Iniciar sesión</Link></li>
                        <li><Link to="/registro">Registrarme</Link></li>
                    </ul>
                </div>
                <div className="footer-col">
                    <h6>Contáctanos</h6>
                    <p>contacto@pinkypink.cl</p>
                    <p>+56 9 1234 5678</p>

                    <div className="footer-socials">
                        <a href="https://www.instagram.com/pinkandpink16/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="bi bi-instagram" /></a>
                        <a href="#" aria-label="Facebook"><i className="bi bi-facebook" /></a>
                        <a href="#" aria-label="TikTok"><i className="bi bi-tiktok" /></a>
                        <a href="#" aria-label="WhatsApp"><i className="bi bi-whatsapp" /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 Pink &amp; Pink · Accesorios Chic. Proyecto académico - Control 1.</p>
            </div>
        </footer>
    );
}