import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { alertas } from "../utils/alertas";
import "../estilosAuth.css";

export default function Login() {
  const { login, destinoTrasLogin } = useAuth();
  const navegar = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const fallo = login(correo, password);

    if (fallo === "credenciales") {
      void alertas.error("Credenciales incorrectas", "Revisa tu correo y contraseña.");
      return;
    }
    if (fallo === "inactivo") {
      void alertas.aviso("Cuenta inactiva", "Tu cuenta está desactivada. Contacta al administrador.");
      return;
    }

    navegar(destinoTrasLogin());
  }

  return (
    <div className="page">
      <aside className="brand-panel">
        <div className="brand-mark">
          <p className="name">PINK&amp;PINK</p>
          <span className="by">BY JHAIMAR ALTUVE</span>
        </div>

        <div className="brand-copy">
          <h1>
            Bienvenida de
            <br />
            vuelta
          </h1>
          <span className="script">te extrañábamos ♡</span>
          <p>
            Inicia sesión para ver tu lista de deseos, seguir tus pedidos y descubrir las
            nuevas colecciones antes que nadie.
          </p>
        </div>

        <div className="brand-footer">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 2.5 5 6 5c2 0 3.5 1 4 2.5C10.5 6 12 5 14 5c3.5 0 5.5 3.5 3.5 7.5C15 16.65 12 21 12 21z" />
            </svg>
            Hechos con amor
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h13l3 5-9.5 11L1 9z" />
              <path d="M1 9h19M9.5 20 8 4M14.5 20 16 4" />
            </svg>
            Calidad garantizada
          </span>
        </div>
      </aside>

      <div className="form-panel">
        <p className="eyebrow">Mi cuenta</p>
        <h2>Iniciar sesión</h2>
        <p className="sub">
          ¿Aún no tienes cuenta? <Link to="/registro">Crea una aquí</Link>
        </p>

        <form id="formLogin" onSubmit={enviar}>
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="row-between">
            <label className="remember">
              <input type="checkbox" id="remember" name="remember" />
              Recordarme
            </label>
            <a className="forgot" href="#">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="btn-primary">
            Iniciar sesión
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20s-7-4.35-9.5-8.5C.5 7.5 2.5 4 6 4c2 0 3.5 1 4 2.5C10.5 5 12 4 14 4c3.5 0 5.5 3.5 3.5 7.5C15 15.65 12 20 12 20z" />
            </svg>
          </button>
        </form>

        <div className="divider">o continúa con</div>

        <button type="button" className="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.3-4.8 9.3-7.3 0-.5 0-.9-.1-1.3H12z"
            />
          </svg>
          Continuar con Google
        </button>

        <p className="signup-note">
          Al continuar, aceptas nuestros <a href="#">Términos</a> y{" "}
          <a href="#">Política de privacidad</a>.
        </p>
      </div>
    </div>
  );
}
