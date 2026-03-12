# Calculadora GTC - Rentabilidad de Flotillas

Aplicación para determinar la rentabilidad de una venta de flotilla (Nissan) con base en impuestos, comisiones, gastos operativos y costos extra.

## Descripción

Esta herramienta está diseñada para analizar qué tan rentable resulta una operación de venta de flotillas. Permite al usuario introducir los diferentes variables que afectan el margen de ganancia, tales como:
- Costos del vehículo.
- Impuestos aplicables.
- Comisiones de ventas.
- Gastos y costos adicionales.

Al calcular estos elementos, la aplicación ayuda a determinar la viabilidad y rentabilidad de la operación para la agencia.

## Audiencia

- **Personal de ventas de la agencia**: Usuarios principales de la calculadora para evaluar la rentabilidad en la venta de flotillas.
- **Desarrolladores**: Encargados de dar mantenimiento a la aplicación, actualizar los datos de precios o realizar mejoras en el código.

## Tecnologías Utilizadas

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- JavaScript / HTML / CSS

## Estructura de Datos

La aplicación utiliza fuentes de datos locales en formato JSON para realizar los cálculos, los cuales se encuentran dentro de `src/`:
- `Nissan_Lista_Precios_Calculadora_Distribuidor_Nissan_Marzo_2026.json`: Lista de precios base de los vehículos.
- `tiie.json`: Datos relacionados con la Tasa de Interés Interbancaria de Equilibrio (TIIE) para cálculos financieros aplicables.

*(Nota para desarrolladores: Para actualizar los precios o tasas, basta con modificar estos archivos JSON respetando su estructura actual).*

## Instrucciones de Instalación y Ejecución Local

Para ejecutar este proyecto en tu entorno local, asegúrate de tener [Node.js](https://nodejs.org/) instalado.

1. **Clonar o descargar el repositorio**.
2. **Instalar dependencias**:
   Abre una terminal en la raíz del proyecto y ejecuta:
   ```bash
   npm install
   ```
3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
4. **Abrir en el navegador**:
   Por defecto, Vite iniciará el servidor en `http://localhost:5173/` (o un puerto similar indicado en la terminal).

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación lista para producción en la carpeta `dist`.
- `npm run preview`: Sirve localmente la versión construida para previsualizar antes de desplegar.
- `npm run lint`: Ejecuta ESLint para analizar el código en busca de errores o problemas de formato.
