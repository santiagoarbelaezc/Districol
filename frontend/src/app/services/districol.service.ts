import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Producto } from '../data/mock-products';
import { ProductoCarrusel } from '../components/carrusel-home/carrusel-home.component';
import { Categoria, Subcategoria } from '../data/mock-categories';
import { parseProductIdFromParam, getProductSlug } from '../utils/seo-slug.util';

@Injectable({
  providedIn: 'root'
})
export class DistricolService {
  private readonly apiUrl = `${environment.apiCatalogoUrl}/productos/categoria/Districol`;
  private productsCache$?: Observable<Producto[]>;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los productos crudos directamente de la API de Catálogo
   */
  getDistricolProducts(): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(this.apiUrl).pipe(
      map(res => res.data || []),
      catchError(err => {
        console.error('Error al conectar con la API de Catálogo:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene todos los productos de Districol adaptados y tipados con cache en memoria
   */
  getAdaptedProducts(forceRefresh = false): Observable<Producto[]> {
    if (!this.productsCache$ || forceRefresh) {
      this.productsCache$ = this.getDistricolProducts().pipe(
        map(rawList => rawList.map(raw => this.adaptProduct(raw))),
        shareReplay(1)
      );
    }
    return this.productsCache$;
  }

  /**
   * Obtiene un producto por ID o slug desde la API
   */
  getProductById(idOrSlug: string | number): Observable<Producto | undefined> {
    const numericId = parseProductIdFromParam(idOrSlug);

    return this.getAdaptedProducts().pipe(
      map(products => {
        if (numericId > 0) {
          const found = products.find(p => p.id === numericId);
          if (found) return found;
        }
        const strVal = String(idOrSlug).toLowerCase();
        return products.find(p => {
          const slug = (p as any).slug || getProductSlug(p.id, p.nombre);
          return slug === strVal || p.nombre.toLowerCase().includes(strVal);
        });
      })
    );
  }

  /**
   * Colchones para carrusel / catálogo
   */
  getColchones(): Observable<ProductoCarrusel[]> {
    return this.getAdaptedProducts().pipe(
      map(prods => prods.filter(p => p.categoriaId === 1).map(p => this.toCarrusel(p)))
    );
  }

  /**
   * Almohadas para carrusel / catálogo
   */
  getAlmohadas(): Observable<ProductoCarrusel[]> {
    return this.getAdaptedProducts().pipe(
      map(prods => prods.filter(p => p.categoriaId === 2).map(p => this.toCarrusel(p)))
    );
  }

  /**
   * Sábanas para carrusel / catálogo
   */
  getSabanas(): Observable<ProductoCarrusel[]> {
    return this.getAdaptedProducts().pipe(
      map(prods => prods.filter(p => p.categoriaId === 3).map(p => this.toCarrusel(p)))
    );
  }

  /**
   * Complementos (protectores, bases, etc.)
   */
  getComplementos(): Observable<ProductoCarrusel[]> {
    return this.getAdaptedProducts().pipe(
      map(prods => prods.filter(p => p.categoriaId === 4).map(p => this.toCarrusel(p)))
    );
  }

  /**
   * Ambientes de descanso
   */
  getAmbientes(): Observable<ProductoCarrusel[]> {
    return this.getAdaptedProducts().pipe(
      map(prods => prods.filter(p => p.categoriaId === 5).map(p => this.toCarrusel(p)))
    );
  }

  /**
   * Obtiene categorías y subcategorías estructuradas dinámicamente con conteos reales
   */
  getCategoriasDinamicas(): Observable<Categoria[]> {
    return this.getAdaptedProducts().pipe(
      map(prods => {
        const catMap: { [key: number]: { nombre: string; subMap: { [subId: number]: { nombre: string; count: number } } } } = {
          1: { nombre: 'Colchones', subMap: {} },
          2: { nombre: 'Almohadas', subMap: {} },
          3: { nombre: 'Sábanas', subMap: {} },
          4: { nombre: 'Complementos', subMap: {} },
          5: { nombre: 'Ambientes', subMap: {} },
        };

        for (const p of prods) {
          const cId = p.categoriaId || 1;
          const sId = p.subcategoriaId || 101;
          const subName = p.subcategoria || 'General';

          if (!catMap[cId]) {
            catMap[cId] = { nombre: p.categoria || 'Varios', subMap: {} };
          }
          if (!catMap[cId].subMap[sId]) {
            catMap[cId].subMap[sId] = { nombre: subName, count: 0 };
          }
          catMap[cId].subMap[sId].count++;
        }

        const result: Categoria[] = [];
        for (const cIdStr of Object.keys(catMap)) {
          const cId = Number(cIdStr);
          const cData = catMap[cId];
          const subcategorias: Subcategoria[] = Object.keys(cData.subMap).map(sIdStr => {
            const sId = Number(sIdStr);
            return {
              id: sId,
              nombre: cData.subMap[sId].nombre,
              cantidad: cData.subMap[sId].count
            };
          });

          if (subcategorias.length > 0) {
            result.push({
              id: cId,
              nombre: cData.nombre,
              expanded: false,
              subcategorias
            });
          }
        }

        return result;
      })
    );
  }

  /**
   * Obtiene estadísticas de productos desde el backend PHP (/api/estadisticas)
   * Con fallback automático al cálculo local para alta resiliencia
   */
  getEstadisticas(): Observable<any> {
    const token = localStorage.getItem('districol_token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${environment.baseUrl}/estadisticas`, { headers }).pipe(
      map(res => res.data || res),
      catchError(err => {
        console.warn('Backend /api/estadisticas no respondió o token expirado, calculando desde catálogo central:', err);
        return this.generarEstadisticasLocales();
      })
    );
  }

  private generarEstadisticasLocales(): Observable<any> {
    return this.getAdaptedProducts().pipe(
      map(prods => {
        const total = prods.length;
        const stockTotal = prods.reduce((acc, p) => acc + (p.cantidad || 0), 0);
        const precios = prods.map(p => p.precio).filter(p => p > 0);
        const precioPromedio = precios.length > 0 ? Math.round(precios.reduce((a, b) => a + b, 0) / precios.length) : 0;
        const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
        const precioMaximo = precios.length > 0 ? Math.max(...precios) : 0;

        const catMap: { [cat: string]: { cantidad: number; stock: number; suma: number } } = {};
        for (const p of prods) {
          const c = p.categoria || 'Colchones';
          if (!catMap[c]) catMap[c] = { cantidad: 0, stock: 0, suma: 0 };
          catMap[c].cantidad++;
          catMap[c].stock += (p.cantidad || 0);
          catMap[c].suma += (p.precio || 0);
        }

        const categorias = Object.keys(catMap).map(c => ({
          nombre: c,
          cantidad: catMap[c].cantidad,
          porcentaje: total > 0 ? Number(((catMap[c].cantidad / total) * 100).toFixed(1)) : 0,
          stock_total: catMap[c].stock,
          precio_promedio: catMap[c].cantidad > 0 ? Math.round(catMap[c].suma / catMap[c].cantidad) : 0
        })).sort((a, b) => b.cantidad - a.cantidad);

        return {
          resumen: {
            total_productos: total,
            stock_total: stockTotal,
            precio_promedio: precioPromedio,
            precio_minimo: precioMinimo,
            precio_maximo: precioMaximo,
            total_categorias: categorias.length,
            destacados: prods.filter(p => p.badgeType === 'promo').length,
            nuevos: prods.filter(p => p.badgePromo === 'NUEVO').length,
            con_imagenes: prods.filter(p => p.imagenes && p.imagenes.length > 0).length,
            stock_bajo: prods.filter(p => p.cantidad > 0 && p.cantidad <= 5).length,
            en_stock: prods.filter(p => p.cantidad > 0).length,
            agotados: prods.filter(p => !p.cantidad || p.cantidad === 0).length,
          },
          categorias,
          rangos_precio: {
            economico: prods.filter(p => p.precio < 500000).length,
            medio: prods.filter(p => p.precio >= 500000 && p.precio <= 1500000).length,
            premium: prods.filter(p => p.precio > 1500000 && p.precio <= 3000000).length,
            lujo: prods.filter(p => p.precio > 3000000).length,
          },
          productos: prods.map(p => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            categoria: p.categoria,
            subcategoria: p.subcategoria,
            precio: p.precio,
            stock: p.cantidad,
            imagen: p.imagen,
            imagenes: p.imagenes || [p.imagen],
            tag: p.tag,
            badgePromo: p.badgePromo,
            badgeType: p.badgeType,
            sku: 'DIST-' + p.id,
            slug: p.slug
          }))
        };
      })
    );
  }

  /**
   * Adaptador: Mapea la estructura cruda de la API al contrato tipado del frontend
   */
  adaptProduct(raw: any): Producto {
    // Resolver Subcategoría
    let subcategoria = 'General';
    if (raw.options && typeof raw.options === 'string' && raw.options.includes('Subcategoría:')) {
      subcategoria = raw.options.replace('Subcategoría:', '').trim();
    } else if (raw.subcategory_name) {
      subcategoria = raw.subcategory_name;
    }

    // Resolver Categoría principal e ID
    let categoria = 'Colchones';
    let categoriaId = 1;

    const lowerInfo = `${raw.name || ''} ${subcategoria}`.toLowerCase();
    if (lowerInfo.includes('almohada')) {
      categoria = 'Almohadas';
      categoriaId = 2;
    } else if (lowerInfo.includes('sabana') || lowerInfo.includes('sábana')) {
      categoria = 'Sábanas';
      categoriaId = 3;
    } else if (lowerInfo.includes('protector') || lowerInfo.includes('base') || lowerInfo.includes('complemento')) {
      categoria = 'Complementos';
      categoriaId = 4;
    } else if (lowerInfo.includes('ambiente')) {
      categoria = 'Ambientes';
      categoriaId = 5;
    }

    // Resolver subcategoriaId coherente
    const subcategoriaId = this.resolverSubcategoriaId(categoriaId, subcategoria);

    // Resolver Imágenes
    let imagenes: string[] = [];
    if (Array.isArray(raw.images) && raw.images.length > 0) {
      imagenes = raw.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
    }
    const imagenPrincipal = imagenes[0] || 'assets/img/placeholder.png';

    // Resolver Precio de variantes
    let precio = 0;
    if (Array.isArray(raw.variants) && raw.variants.length > 0) {
      const varWithPrice = raw.variants.find((v: any) => v.price && Number(v.price) > 0) || raw.variants[0];
      if (varWithPrice?.price) {
        precio = Number(varWithPrice.price);
      }
    }

    // Resolver Tag y Badge promocional
    const { tag, badgePromo, badgeType } = this.resolverTagsYBadges(raw, lowerInfo);

    return {
      id: Number(raw.id),
      nombre: raw.name || 'Producto Districol',
      descripcion: raw.description || '',
      precio,
      cantidad: raw.stock !== undefined ? Number(raw.stock) : 15,
      imagen: imagenPrincipal,
      imagenes: imagenes.length > 0 ? imagenes : [imagenPrincipal],
      categoria,
      subcategoria,
      categoriaId,
      subcategoriaId,
      tag,
      badgePromo,
      badgeType
    };
  }

  private toCarrusel(p: Producto): ProductoCarrusel {
    return {
      id: p.id,
      imagen: p.imagen,
      nombre: p.nombre,
      descripcion: p.descripcion,
      tag: p.tag,
      badgePromo: p.badgePromo,
      badgeType: (p.badgeType as any) || 'discount',
      precio: p.precio,
      slug: (p as any).slug
    };
  }

  private resolverSubcategoriaId(categoriaId: number, subcatName: string): number {
    const subLower = subcatName.toLowerCase();
    switch (categoriaId) {
      case 1: // Colchones
        if (subLower.includes('pocket')) return 102;
        if (subLower.includes('memory') || subLower.includes('visco')) return 103;
        if (subLower.includes('ortopédico')) return 104;
        if (subLower.includes('doble pillow')) return 105;
        return 101; // Colchones Premium por defecto
      case 2: // Almohadas
        if (subLower.includes('memory')) return 202;
        if (subLower.includes('gel')) return 203;
        return 201; // Fibra / Ergonómicas
      case 3: // Sábanas
        if (subLower.includes('luxury')) return 302;
        if (subLower.includes('orgánica') || subLower.includes('cotton')) return 303;
        return 301; // 400 hilos
      case 4: // Complementos
        if (subLower.includes('base') || subLower.includes('box')) return 402;
        return 401; // Protectores
      case 5: // Ambientes
        return 501;
      default:
        return categoriaId * 100 + 1;
    }
  }

  private resolverTagsYBadges(raw: any, lowerInfo: string): { tag: string; badgePromo: string; badgeType: 'promo' | 'discount' | 'warning' } {
    // Determinar Tag tecnológico
    let tag = 'DISTRICOL';
    if (lowerInfo.includes('memory') || (raw.material && raw.material.toLowerCase().includes('memory'))) {
      tag = 'MEMORY FOAM';
    } else if (lowerInfo.includes('pocket')) {
      tag = 'POCKET 5 ZONAS';
    } else if (lowerInfo.includes('gel')) {
      tag = 'GEL FRESH';
    } else if (lowerInfo.includes('400')) {
      tag = '400 HILOS';
    } else if (lowerInfo.includes('organic') || lowerInfo.includes('orgánica')) {
      tag = '100% ORGÁNICO';
    } else if (lowerInfo.includes('protector')) {
      tag = 'IMPERMEABLE';
    } else if (lowerInfo.includes('base') || lowerInfo.includes('box spring')) {
      tag = 'BOX SPRING';
    } else if (lowerInfo.includes('premium')) {
      tag = 'CALIDAD PREMIUM';
    } else if (lowerInfo.includes('medellín') || lowerInfo.includes('santa fe') || lowerInfo.includes('ortopédico')) {
      tag = 'ORTOPÉDICO';
    }

    // Determinar Badge y Tipo
    let badgePromo = 'DESCUENTO EXCLUSIVO';
    let badgeType: 'promo' | 'discount' | 'warning' = 'discount';

    if (raw.isFeatured) {
      badgePromo = 'PROMO DEL DÍA';
      badgeType = 'promo';
    } else if (raw.isNew) {
      badgePromo = 'NUEVO';
      badgeType = 'promo';
    } else if (raw.stock && Number(raw.stock) <= 5) {
      badgePromo = 'ÚLTIMAS UNIDADES';
      badgeType = 'warning';
    } else if (lowerInfo.includes('luxury') || lowerInfo.includes('royal')) {
      badgePromo = 'EDICIÓN LUXURY';
      badgeType = 'discount';
    }

    return { tag, badgePromo, badgeType };
  }
}
