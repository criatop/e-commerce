export function formatearPrecio(valor: number): string {
return "$" + Number(valor).toLocaleString("es-CL");
}