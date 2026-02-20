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

export const MOCK_CATEGORIAS: Categoria[] = [
    {
        id: 1,
        nombre: 'Colchones',
        expanded: false,
        subcategorias: [
            { id: 101, nombre: 'Colchones Premium', cantidad: 4 },
            { id: 102, nombre: 'Colchones Pocket', cantidad: 3 },
            { id: 103, nombre: 'Colchones Memory Foam', cantidad: 2 },
            { id: 104, nombre: 'Colchones Ortopédicos', cantidad: 3 },
            { id: 105, nombre: 'Colchones Doble Pillow', cantidad: 2 }
        ]
    },
    {
        id: 2,
        nombre: 'Almohadas',
        expanded: false,
        subcategorias: [
            { id: 201, nombre: 'Almohadas Fibra', cantidad: 3 },
            { id: 202, nombre: 'Almohadas Memory Foam', cantidad: 2 },
            { id: 203, nombre: 'Almohadas Gel Fresh', cantidad: 2 }
        ]
    },
    {
        id: 3,
        nombre: 'Sábanas',
        expanded: false,
        subcategorias: [
            { id: 301, nombre: 'Sábanas 400 Hilos', cantidad: 2 },
            { id: 302, nombre: 'Sábanas Luxury', cantidad: 2 },
            { id: 303, nombre: 'Sábanas Orgánicas', cantidad: 1 },
            { id: 304, nombre: 'Sábanas Silky Touch', cantidad: 1 }
        ]
    },
    {
        id: 4,
        nombre: 'Complementos',
        expanded: false,
        subcategorias: [
            { id: 401, nombre: 'Protectores', cantidad: 2 },
            { id: 402, nombre: 'Bases Box Spring', cantidad: 2 },
            { id: 403, nombre: 'Sets Completos', cantidad: 1 }
        ]
    },
    {
        id: 5,
        nombre: 'Ambientes',
        expanded: false,
        subcategorias: [
            { id: 501, nombre: 'Ambientaciones Premium', cantidad: 3 },
            { id: 502, nombre: 'Colecciones Exclusivas', cantidad: 2 }
        ]
    }
];
