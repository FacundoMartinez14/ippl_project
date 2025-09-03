/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Evita el warning "nested ternary" de ESLint
 * 
 * Esta función te permite anidar múltiples condiciones de una manera más 
 * profesional y legible, evitando el warning de ESLint sobre ternarios anidados.
 * 
 * @template T - El tipo de dato que quieres que devuelva
 * @param {any} condition - La condición que quieres evaluar
 * @param {T} ok - El valor si la condición es VERDADERA
 * @param {T} err - El valor si la condición es FALSA
 * @returns {T} - El valor correspondiente según la condición
 * 
 * @example
 * // ❌ ESTO GENERA WARNING DE ESLINT (nested ternary):
 * const mensaje = usuario.activo 
 *   ? usuario.rol === 'admin' 
 *     ? 'Administrador activo' 
 *     : 'Usuario activo'
 *   : 'Usuario inactivo';
 * 
 * @example
 * // ✅ ESTO NO GENERA WARNING (usando iif):
 * const mensaje = iif(
 *   usuario.activo,
 *   iif(usuario.rol === 'admin', 'Administrador activo', 'Usuario activo'),
 *   'Usuario inactivo'
 * );
 */
export function iif<T = string | number | boolean>(
  condition: any,
  ok: T,
  err: T,
): T {
  if (condition) {
    return ok;
  }

  return err;
}
