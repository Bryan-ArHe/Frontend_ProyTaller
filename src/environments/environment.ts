/**
 * PRODUCCIÓN
 * Configuración para el ambiente de producción
 * Las variables de entorno NG_APP_* se reemplazan en buildtime
 */
export const environment = {
  production: true,
  apiUrl: process.env['NG_APP_API_URL'] || 'https://backend-proy-taller.vercel.app',
  apiTimeout: parseInt(process.env['NG_APP_API_TIMEOUT'] || '30000'),
};
