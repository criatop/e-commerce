import { type CSSProperties } from "react";
import { rutaImagen } from "../../utils/imagenes";

const PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#fff0f7"/>
      <text x="150" y="158" font-family="Poppins, sans-serif" font-size="26" fill="#f0568f" text-anchor="middle">Pink &amp; Pink</text>
    </svg>`,
  );

interface Props {
  imagen: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

export default function ImagenProducto({ imagen, alt, className, style }: Props) {
  return (
    <img
      src={rutaImagen(imagen)}
      alt={alt}
      className={className}
      style={style}
      onError={(evento) => {
        evento.currentTarget.onerror = null;
        evento.currentTarget.src = PLACEHOLDER;
      }}
    />
  );
}
