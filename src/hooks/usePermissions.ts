import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

export type UserRole = 'ADMINISTRADOR' | 'VENDEDOR' | 'CLIENTE' | 'ALMACENERO' | 'CONTADOR';

export type Resource = 
  | 'productos' 
  | 'ventas' 
  | 'compras' 
  | 'clientes' 
  | 'proveedores' 
  | 'reportes' 
  | 'kardex'
  | 'usuarios'
  | 'configuracion'
  | 'pedidos'
  | 'catalogo';

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve';

// Matriz de permisos (debe coincidir con el backend)
const permissionsMatrix: Record<UserRole, Record<Resource, Action[]>> = {
  ADMINISTRADOR: {
    productos: ['create', 'read', 'update', 'delete'],
    ventas: ['create', 'read', 'update', 'delete'],
    compras: ['create', 'read', 'update', 'delete'],
    clientes: ['create', 'read', 'update', 'delete'],
    proveedores: ['create', 'read', 'update', 'delete'],
    reportes: ['read'],
    kardex: ['read'],
    usuarios: ['create', 'read', 'update', 'delete'],
    configuracion: ['read', 'update'],
    pedidos: ['read', 'approve', 'delete'],
    catalogo: ['read']
  },
  VENDEDOR: {
    productos: ['read'],
    ventas: ['create', 'read'], // Solo sus propias ventas
    compras: [],
    clientes: ['read'],
    proveedores: [],
    reportes: ['read'], // Solo sus propios reportes
    kardex: [],
    usuarios: [],
    configuracion: [],
    pedidos: ['read', 'approve'],
    catalogo: ['read']
  },
  CLIENTE: {
    productos: [],
    ventas: [],
    compras: [],
    clientes: [],
    proveedores: [],
    reportes: [],
    kardex: [],
    usuarios: [],
    configuracion: [],
    pedidos: ['create', 'read'], // Sus propios pedidos
    catalogo: ['read']
  },
  // Roles legacy
  ALMACENERO: {
    productos: ['read'],
    ventas: [],
    compras: ['read'],
    clientes: [],
    proveedores: [],
    reportes: [],
    kardex: ['read'],
    usuarios: [],
    configuracion: [],
    pedidos: [],
    catalogo: []
  },
  CONTADOR: {
    productos: ['read'],
    ventas: ['read'],
    compras: ['read'],
    clientes: ['read'],
    proveedores: ['read'],
    reportes: ['read'],
    kardex: ['read'],
    usuarios: [],
    configuracion: [],
    pedidos: ['read'],
    catalogo: []
  }
};

/**
 * Hook para manejar permisos del usuario
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  const permissions = useMemo(() => {
    if (!user || !user.rol) {
      return {} as Record<Resource, Action[]>;
    }
    return permissionsMatrix[user.rol as UserRole] || {};
  }, [user]);

  const can = (resource: Resource, action: Action): boolean => {
    if (!user || !user.rol) return false;
    const resourcePermissions = permissions[resource];
    return resourcePermissions ? resourcePermissions.includes(action) : false;
  };

  const canCreate = (resource: Resource): boolean => can(resource, 'create');
  const canRead = (resource: Resource): boolean => can(resource, 'read');
  const canUpdate = (resource: Resource): boolean => can(resource, 'update');
  const canDelete = (resource: Resource): boolean => can(resource, 'delete');
  const canApprove = (resource: Resource): boolean => can(resource, 'approve');

  const isAdmin = (): boolean => user?.rol === 'ADMINISTRADOR';
  const isVendedor = (): boolean => user?.rol === 'VENDEDOR';
  const isCliente = (): boolean => user?.rol === 'CLIENTE';

  return {
    permissions,
    can,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canApprove,
    isAdmin,
    isVendedor,
    isCliente,
    role: user?.rol as UserRole | undefined
  };
};

export default usePermissions;

