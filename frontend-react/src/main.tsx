import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./estilos.css";
import { inicializarDatos } from "./data/seed";
import App from "./App.tsx";
inicializarDatos();
createRoot(document.getElementById("root")!).render(
<StrictMode>
<App />
</StrictMode>,
);
