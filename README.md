# Calculadora GTC - Rentabilidad de Flotillas

Aplicación Single Page Application (SPA) para determinar la rentabilidad de una venta de flotilla (Nissan) con base en impuestos, comisiones, gastos operativos y costos extra.

## Descripción del Sistema

Esta herramienta analiza la viabilidad financiera de una venta de flotillas. Calcula márgenes de ganancia deduciendo de los ingresos brutos variables complejas como el ISAN (Impuesto Sobre Automóviles Nuevos), el costo de Plan Piso (financiamiento del distribuidor basado en la TIIE), comisiones porcentuales o fijas, incentivos de Nissan Mexicana (NMEX) y cuotas institucionales.

## Arquitectura y Estructura del Proyecto (Contexto de Desarrollo)

El proyecto fue refactorizado siguiendo estrictos principios de Separación de Responsabilidades (SoC) para asegurar escalabilidad y testabilidad aislada. Todo el código fuente reside en `src/`:

- **`src/components/`**: Exclusivamente componentes de la vista (UI pura). No deben contener cálculos financieros.
  - `ui/`: Componentes base (Inputs, Cards, Badges).
  - `layout/`: Estructura principal (`Header.jsx`, `Footer.jsx`) y la vista de impresión (`PrintView.jsx`).
  - `icons/`: SVGs convertidos a componentes React.
- **`src/core/`**: El dominio del negocio.
  - `calculations.js`: Contiene TODA la matemática pura del proyecto. Aquí se exporta `calcularISAN()`, `precioBaseDesdeFinal()`, y el orquestador principal `calcular()` que retorna el desglose financiero (`uB`, `pp`, `isanInfo`, `mg`, etc.). Las funciones aquí deben permanecer puras y no depender del DOM o React.
  - `mappings.js`: Transformadores de datos. Convierte la data en crudo del JSON (`mapJSONToModel`) a un modelo estándar usado por el core.
- **`src/hooks/`**: Orquestación del estado de React.
  - `useCalculator.js`: El único "cerebro" stateful de la aplicación. Mantiene todas las variables del usuario, importa la data inicial, inyecta los cálculos del `core` y memoriza (`useMemo`) los resultados complejos (como `r` y `rBase`) para evitar re-renders costosos.
- **`src/utils/`**: Utilidades genéricas.
  - `formatters.js`: Helpers de formateo (`mxn` para moneda, `pct` para porcentajes).
  - `theme.js`: Contiene el objeto `T` que devuelve los colores dinámicos para los temas claro (`dark: false`) y oscuro (`dark: true`).
- **`src/data/`**: Base de datos estática en JSON (Lista de precios y TIIE).
- **`src/styles/`**: Hojas de estilo globales (`globals.css`) y de impresión (`print.css`).
- **`src/App.jsx`**: Actúa únicamente como pegamento (orquestador visual). Llama a `useCalculator` e inyecta el estado y las acciones en la vista, construyendo también dinámicamente las filas de las tablas (`webTableRows`).

## Convenciones y Guías de Implementación

Al contribuir o modificar el código, por favor adhiérete a las siguientes reglas del proyecto:

1. **Cálculos Financieros (No propagar `NaN`):**
   - Siempre utiliza comprobaciones explícitas como `Number.isNaN()` tras cada `parseFloat` o `parseInt`.
   - Proporciona siempre valores de respaldo (fallback) como `0`, `undefined` o defaults para evitar que un `NaN` rompa las cadenas de cálculo en `core/calculations.js`.

2. **Complejidad y Rendimiento Visual:**
   - La aplicación memoiza grandes estructuras de datos para UI (`webTableRows` y `printTableRows`) usando `useMemo`. Esto evita el costo de rendimiento por múltiples llamadas a `Intl.NumberFormat` (vía `mxn`) durante escrituras rápidas en los inputs. Manten esta práctica.

3. **Legibilidad del Core (Matemáticas):**
   - En funciones como `calcularISAN`, privilegia la lógica procedural con variables intermedias claramente nombradas (`isanBruto`, `reduccionLujo`) sobre cálculos en línea anidados o patrones complejos como IIFEs, aun si se usan en un solo scope.

4. **Estilos de Interfaz (Tailwind vs CSS Puro):**
   - La aplicación utiliza una combinación de `style={{}}` (inline CSS) dictado por el objeto de variables `T` en `theme.js` y estilos globales en `.css`.
   - **NO instales frameworks externos** como Tailwind CSS. Si integras nuevos mockups diseñados en Tailwind, debes traducir sus clases a CSS puro/inline para mantener la coherencia del proyecto.

5. **Infraestructura y Base de Datos:**
   - **No existe Backend.** Esta es una aplicación puramente frontend.
   - Las funcionalidades de "Generar PDF" o "Enviar a Comercial" delegan el trabajo a la función nativa del navegador `window.print()`, orquestado por reglas CSS específicas en `@media print` (ver `src/styles/print.css` y `src/components/layout/PrintView.jsx`).

6. **Verificación y Pruebas (Test Suite):**
   - Actualmente, **no existe una suite de testing automatizada** (e.g. Jest o Vitest configurados).
   - Para verificar cambios de UI o regresiones en los cálculos, arranca el servidor local y utiliza scripts de Playwright/Puppeteer para capturar pantallas interactivas antes de solicitar una revisión de código.

## Entorno de Desarrollo y Comandos

Asegúrate de ejecutar la instalación de paquetes primero:

- Instalar dependencias esenciales (Vite, React, etc.)
  - npm install

- Iniciar el servidor local en http://localhost:5173/
  - npm run dev

- Compilar para producción en /dist
  - npm run build

*(Nota: Modificar el catálogo de vehículos o el histórico TIIE únicamente requiere actualizar los archivos ubicados en `src/data/` manteniendo estrictamente las llaves actuales del JSON).*
