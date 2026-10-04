export function rutaImagen(imagen: string): string {
  return imagen.startsWith("/") ? imagen : "/img/" + imagen;
}
