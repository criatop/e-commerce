export function limpiarRun(run: string): string {
  return run.replace(/[.\-\s]/g, "").toUpperCase();
}

export function validarRun(run: string): boolean {
  const limpio = limpiarRun(run);
  if (!/^[0-9]{7,8}[0-9K]$/.test(limpio)) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

  return dv === dvEsperado;
}

export function formatearRun(run: string): string {
  const limpio = limpiarRun(run);
  if (limpio.length < 3) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  const conPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${conPuntos}-${dv}`;
}
