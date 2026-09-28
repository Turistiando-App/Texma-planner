export type Unidad = 'u' | 'mts' | 'pack';

export type Producto = {
  id: number;
  slug: string;
  titulo: string;
  categoria: string;
  subcategoria: string;
  unidad: Unidad;
  precio: number;
  color: string | null;
  stock: number;
  destacado: boolean;
  activo: boolean;
  descripcion: string;
  imagen_url: string | null;
};
