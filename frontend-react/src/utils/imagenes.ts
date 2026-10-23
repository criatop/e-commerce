export function rutaImagen(imagen: string): string {
if (!imagen) return "/img/productos/placeholder.jpg";
if (imagen.startsWith("data:")) return imagen;
if (imagen.startsWith("blob:")) return imagen;
if (imagen.startsWith("http://") || imagen.startsWith("https://")) return imagen;
if (imagen.startsWith("/")) return imagen;
return "/img/" + imagen;
}