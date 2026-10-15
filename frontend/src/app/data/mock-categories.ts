/**
 * Interfaces para Categorías y Subcategorías
 * Los datos se construyen dinámicamente desde los productos de la API central
 */

export interface Subcategoria {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  expanded: boolean;
  subcategorias: Subcategoria[];
}

// Array vacío de compatibilidad
export const MOCK_CATEGORIAS: Categoria[] = [];
