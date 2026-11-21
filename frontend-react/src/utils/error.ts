/** Extrae un mensaje legible de un error sin asumir su tipo. */
export function mensajeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
