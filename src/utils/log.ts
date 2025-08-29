/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Registra un mensaje en la consola con el nivel indicado.
 *
 * Si \`includeTimestamp\` es verdadero, antepone una marca de tiempo ISO-8601 al mensaje.
 *
 * @param {"debug" | "info" | "warn" | "error"} type - Nivel/severidad del log que determina el método de consola a utilizar.
 * @param {any} message - Mensaje a registrar.
 * @param {boolean} [includeTimestamp] - Si es verdadero, incluye un timestamp ISO antes del mensaje.
 * @returns {void}
 * @example
 * // Log informativo sin timestamp
 * log("info", "Servidor iniciado");
 *
 * @example
 * // Log de advertencia con timestamp
 * log("warn", "Uso de memoria elevado", true);
 */
export const log = (
    type: "debug" | "info" | "warn" | "error",
    message: any,
    includeTimestamp?: boolean,
): void => {
    const timestamp = includeTimestamp ? new Date().toISOString() : '';
    console[type](`[${timestamp}] ${message}`);
};
