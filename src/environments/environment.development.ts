/**
 * DESARROLLO
 * Configuración para el ambiente de desarrollo local
 */
export const environment = {
  production: false,
  apiUrl: process.env['NG_APP_API_URL'] || 'http://localhost:8000',
  apiTimeout: parseInt(process.env['NG_APP_API_TIMEOUT'] || '30000'),
};
