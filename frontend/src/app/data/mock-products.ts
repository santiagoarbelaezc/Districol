import { ProductoCarrusel } from '../components/carrusel-home/carrusel-home.component';

export const PRODUCTOS_COLCHONES: ProductoCarrusel[] = [
  {
    imagen: 'assets/img/alcoba1.jpg',
    nombre: 'Colchón Intelli Sleep',
    descripcion: 'Tejido de punto de alta calidad con acolchado de poliéster para una frescura natural. Sistema pocket de 5 zonas que se adapta a cada movimiento.'
  },
  {
    imagen: 'assets/img/alcoba2.jpg',
    nombre: 'Colchón Sleep Well',
    descripcion: 'Espuma troquelada de alta densidad que se adapta a tu forma. Espuma látex con fibras de bambú para un descanso premium.'
  },
  {
    imagen: 'assets/img/alcoba3.jpg',
    nombre: 'Colchón Tech Confort',
    descripcion: 'Tecnología avanzada con espuma dura de alta densidad y sistema pocket con foam case. Relleno de algodón natural para máximo confort.'
  },
  {
    imagen: 'assets/img/alcoba4.jpg',
    nombre: 'Colchón Pocket Bliss',
    descripcion: 'Sistema pocket de 5 zonas con soporte individual. Espuma suave combinada con capas de alta densidad para un equilibrio perfecto.'
  },
  {
    imagen: 'assets/img/alcoba5.jpg',
    nombre: 'Colchón Royal Dream',
    descripcion: 'Diseño exclusivo con múltiples capas de espuma. Tejido premium transpirable y acolchado de 7cm para noches de ensueño.'
  },
  {
    imagen: 'assets/img/colchon1.png',
    nombre: 'Colchón Ágata Premium',
    descripcion: 'Colección exclusiva con espuma viscoelástica de última generación. Adaptación perfecta a la anatomía corporal.'
  },
  {
    imagen: 'assets/img/colchon2.png',
    nombre: 'Colchón Essence',
    descripcion: 'Capas de confort superior con núcleo de alta resistencia. Sistema de ventilación integrado para noches frescas.'
  },
  {
    imagen: 'assets/img/colchon3.png',
    nombre: 'Colchón Cloud Nine',
    descripcion: 'Sensación de flotar en las nubes con su sistema de micro resortes independientes. Terminaciones de lujo en cada detalle.'
  }
];

export const PRODUCTOS_AMBIENTES: ProductoCarrusel[] = [
  {
    imagen: 'assets/img/distri1.jpg',
    nombre: 'Ambiente Sereno',
    descripcion: 'Diseño de interiores inspirado en la calma. Colores neutros y texturas suaves para un espacio de descanso ideal.'
  },
  {
    imagen: 'assets/img/distri3.jpg',
    nombre: 'Suite Elegance',
    descripcion: 'Ambientación premium para habitaciones principales. Combinación perfecta de estilo contemporáneo y confort clásico.'
  },
  {
    imagen: 'assets/img/distri4.jpg',
    nombre: 'Espacio Zen',
    descripcion: 'Minimalismo y armonía en cada rincón. Creado para quienes buscan la máxima relajación en su dormitorio.'
  },
  {
    imagen: 'assets/img/distri5.jpg',
    nombre: 'Habitación Luxury',
    descripcion: 'El máximo exponente del lujo en descanso. Acabados de alta gama y diseño exclusivo para clientes exigentes.'
  },
  {
    imagen: 'assets/img/agata.jpg',
    nombre: 'Colección Ágata',
    descripcion: 'Inspirada en la piedra preciosa, esta línea combina elegancia atemporal con la más alta tecnología en descanso.'
  }
];

export const PRODUCTOS_COMPLEMENTOS: ProductoCarrusel[] = [
  {
    imagen: 'assets/img/almohadas.jpg',
    nombre: 'Almohadas Premium',
    descripcion: 'Relleno de fibra siliconada con funda de algodón egipcio. Altura ajustable para cada tipo de durmiente.'
  },
  {
    imagen: 'assets/img/sabanas.jpg',
    nombre: 'Sábanas Luxury',
    descripcion: 'Algodón de 400 hilos con acabado satinado. Suavidad incomparable y durabilidad garantizada lavado tras lavado.'
  },
  {
    imagen: 'assets/img/colchon-prueba1.jpg',
    nombre: 'Protector Imperial',
    descripcion: 'Protección total contra ácaros y humedad. Tejido hipoalergénico con barrera impermeable invisible.'
  },
  {
    imagen: 'assets/img/colchon-prueba2.jpg',
    nombre: 'Base Box Spring',
    descripcion: 'Sistema de soporte con resortes internos. Extiende la vida útil del colchón y mejora la firmeza del conjunto.'
  },
  {
    imagen: 'assets/img/colchon-districol.jpeg',
    nombre: 'Set Completo Districol',
    descripcion: 'Conjunto premium que incluye colchón, base y almohadas. Todo lo necesario para transformar tu descanso.'
  }
];

// Todos los productos combinados
export const TODOS_LOS_PRODUCTOS: ProductoCarrusel[] = [
  ...PRODUCTOS_COLCHONES,
  ...PRODUCTOS_AMBIENTES,
  ...PRODUCTOS_COMPLEMENTOS
];
