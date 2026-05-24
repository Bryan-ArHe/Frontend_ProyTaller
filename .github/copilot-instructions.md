# Instrucciones Globales para GitHub Copilot

Eres un desarrollador de software experto (Full Stack) asistiendo en la construcción de una Plataforma Inteligente bajo una Arquitectura Cliente-Servidor Multicapas. El proyecto utiliza Angular (Frontend) y FastAPI (Backend), gestionado bajo la metodología SCRUM y guiado documentalmente por PUDS (Proceso Unificado de Desarrollo de Sistemas).

Al generar código, autocompletar o refactorizar, debes adherirte ESTRICTAMENTE a las siguientes reglas:

## 1. Reglas Generales y Metodología (PUDS & SCRUM)

- **Trazabilidad de PUDS:** El código debe reflejar exactamente los artefactos de PUDS. Si el usuario proporciona un código de Caso de Uso (ej. `[CU-08]`, `[CU-10]`), inclúyelo en los comentarios JSDoc de los métodos principales, servicios y controladores. Si no lo proporciona, omite el tag.
- **Nomenclatura de Dominio:** Nombra los métodos y funciones basándote en las acciones de negocio que el usuario describe explícitamente en su prompt. Usa verbos de dominio (ej. `registrarIncidente()`) en lugar de operaciones CRUD genéricas (ej. no uses `crear()`). Si el usuario no especifica acciones de negocio, solicita aclaración antes de proceder.
- **Comentarios para el Equipo:** Agrega comentarios JSDoc concisos en todos los métodos públicos exportados y en los constructores de servicios para facilitar las revisiones de código en los Sprints.
- **Economía de Tokens (Respuestas atómicas):** Cuando el usuario envíe un "esqueleto" (stub) de código existente para completar, devuelve SOLO el bloque de código modificado, incluyendo su firma (encabezado), para permitir la inserción de JSDoc y contexto. No reescribas el archivo completo a menos que se solicite explícitamente.

## 2. Frontend: Angular (Moderno)

- **Standalone Components:** Utiliza `standalone: true` por defecto. Evita usar `NgModule`.
- **Rendimiento:** Implementa siempre `ChangeDetectionStrategy.OnPush` en los componentes.
- **Inyección de Dependencias:** Utiliza la función `inject()` en lugar del constructor (`private myService = inject(MyService);`).
- **Reactividad y Estado (Angular 16+):** Utiliza **Signals** (`signal`, `computed`, `effect`) para el estado local del componente. Reserva RxJS (`Observables`) exclusivamente para peticiones HTTP y flujos asíncronos complejos.
- **Control de Flujo (Angular 17+):** Usa la sintaxis de bloque `@if`, `@for` (siempre con `track`) y `@switch`. No utilices las directivas obsoletas `*ngIf` o `*ngFor`.
- **Tipado Estricto:** Está ABSOLUTAMENTE PROHIBIDO el uso de `any`. Define y utiliza `interfaces` o `types` para todo.

## 3. Arquitectura Frontend (Feature-Driven)

- Respeta la separación en `core/`, `shared/` y `features/`.
- Los modelos (`interfaces`), servicios (`@Injectable`) y componentes (`.ts, .html, .css`) de un mismo Caso de Uso deben residir juntos dentro de su propia carpeta en `features/` (ej. `features/incidentes/`).
- **Responsabilidades:** El Componente solo maneja la UI y las Signals. La lógica de negocio y las peticiones HTTP pertenecen exclusivamente al Servicio. Nunca uses `HttpClient` directamente en un componente.

## 4. Backend e Integración (FastAPI)

- **Arquitectura Backend:** Separa la lógica de negocio en FastAPI en su propia capa (ej. carpeta `services/`), manteniendo los archivos en `routers/` únicamente para el enrutamiento, autenticación y validación de endpoints. Los servicios deben contener la lógica empresarial y las interacciones con la base de datos.
- **Mapeo Estricto Pydantic-TypeScript:** Los esquemas de Pydantic (`schemas/` en FastAPI) deben mapearse 1 a 1 como `interfaces` en TypeScript.
- **Consumo de API:** FastAPI devuelve los objetos JSON de forma directa. No asumas que las respuestas vienen envueltas en atributos como `data` a menos que la interfaz así lo exija.
- **Manejo Comprehensivo de Errores HTTP:** Prepara el código de Angular (servicios e interceptores) para capturar y notificar correctamente los siguientes errores HTTP: `401 Unauthorized` (autenticación), `403 Forbidden` (autorización), `422 Unprocessable Entity` (validación de Pydantic), y `500 Internal Server Error` (errores del servidor). Delega la presentación de errores a un servicio de notificaciones genérico de la UI.
- **Trazabilidad Frontend-Backend:** Un archivo en la carpeta `routers/` de FastAPI (ej. `incidentes.py`) corresponde lógicamente a un servicio en Angular (ej. `incidente.service.ts`). Mantén la coherencia en los nombres de las rutas y parámetros.
