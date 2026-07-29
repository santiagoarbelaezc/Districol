/**
 * Utilidades para generación y parseo de URLs SEO-friendly en productos Districol.
 * Ejemplo: ID 2, Nombre "Colchón Sleep Well" -> "2-colchon-sleep-well"
 */

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .trim()
    .replace(/\s+/g, '-')           // Reemplazar espacios por guiones
    .replace(/[^\w\-]+/g, '')       // Eliminar caracteres especiales
    .replace(/\-\-+/g, '-');        // Guiones múltiples a uno solo
}

/**
 * Genera el slug SEO de un producto (ej. "2-colchon-sleep-well")
 */
export function getProductSlug(id: number | string, nombre?: string): string {
  if (!id) return '';
  if (!nombre) return String(id);
  const slug = slugify(nombre);
  return `${id}-${slug}`;
}

/**
 * Extrae el ID numérico a partir del parámetro de ruta (ej. "2-colchon-sleep-well" -> 2)
 */
export function parseProductIdFromParam(param: string | number): number {
  if (!param) return 0;
  const str = String(param).trim();
  const match = str.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}
