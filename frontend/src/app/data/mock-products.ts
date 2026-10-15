/**
 * Tipos e interfaces de productos de Districol
 * Los datos se obtienen exclusivamente en tiempo real desde la API central:
 * https://catalogoplaxtilineas.sembradoresdevida.org/api/productos/categoria/Districol
 */

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  imagen: string;
  imagenes?: string[];
  categoria: string;
  subcategoria: string;
  categoriaId: number;
  subcategoriaId: number;
  tag?: string;
  badgePromo?: string;
  badgeType?: string;
  slug?: string;
  material?: string;
}

// Arrays vacíos de compatibilidad (los productos ahora se cargan dinámicamente desde la API)
export const MOCK_PRODUCTOS: Producto[] = [];
export const PRODUCTOS_COLCHONES: any[] = [];
export const PRODUCTOS_AMBIENTES: any[] = [];
export const PRODUCTOS_COMPLEMENTOS: any[] = [];
export const PRODUCTOS_ALMOHADAS: any[] = [];
export const PRODUCTOS_SABANAS: any[] = [];
export const TODOS_LOS_PRODUCTOS: any[] = [];
