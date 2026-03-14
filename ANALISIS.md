# Análisis de Escalabilidad y Refactorización del Proyecto Calculadora GTC

## 1. Estado Actual de la Aplicación

El proyecto actualmente es un sistema de calculadora y cotizador de flotas de vehículos desarrollado en React con Vite. Tras un análisis de la estructura del código, principalmente del archivo `src/App.jsx`, se identificaron las siguientes características:

- **Monolítico:** El archivo `src/App.jsx` concentra casi la totalidad de la aplicación y contiene más de 1,300 líneas de código.
- **Mezcla de Responsabilidades:** En un solo archivo coexisten:
  - Estilos CSS incrustados en un componente `<Styles>`.
  - Subcomponentes de interfaz de usuario (`Input`, `SectionCard`, `MargenBadge`, `MetricCard`, `LogoGTC`, `LogoNissan`).
  - Funciones matemáticas y de lógica de negocio pura (`calcularISAN`, `precioBaseDesdeFinal`, `getBonificacion`, `obtenerTiieHaceUnMes`, `calcular`).
  - Funciones de utilidad y formateo (`mxn`, `pct`).
  - El componente principal `App` que contiene un volumen considerable de estado (useState), efectos (useEffect), y renderizado condicional.
- **Funcionalidades de Impresión:** La aplicación utiliza estilos y modales específicos para la generación de reportes vía la función de impresión del navegador, todo embebido en la misma vista.

## 2. Problemas de Escalabilidad y Mantenimiento

Mantener el código en su estado actual presenta varios riesgos e inconvenientes:

- **Difícil Mantenibilidad:** Encontrar, modificar y depurar errores en un archivo tan extenso se vuelve tedioso y propenso a introducir nuevos errores de regresión, especialmente si trabajan múltiples desarrolladores.
- **Acoplamiento Fuerte:** La lógica de negocio (cálculos financieros y de impuestos) está fuertemente acoplada a la vista. Esto impide testear los cálculos matemáticos de manera aislada usando herramientas como Jest o Vitest.
- **Baja Reusabilidad:** Los componentes de la interfaz (`Input`, tarjetas de métricas, etc.) no pueden ser fácilmente reutilizados en otras partes de una potencial ampliación de la aplicación.
- **Legibilidad:** El tamaño del componente `App` reduce la legibilidad del flujo de datos, haciendo más difícil seguir la pista de qué estado afecta a qué parte de la vista.

## 3. Recomendaciones de Refactorización

Para que el proyecto sea verdaderamente escalable y esté preparado para nuevas funcionalidades o cambios (como los que se pretenden añadir), es altamente recomendable realizar una refactorización dividiendo el proyecto en responsabilidades claras.

### Propuesta de Estructura de Directorios

La estructura recomendada sigue un patrón estándar de React, orientada a separar responsabilidades:

```text
src/
├── assets/                 # Imágenes, iconos y otros archivos estáticos.
├── components/             # Componentes de UI reusables (aislados y tontos).
│   ├── ui/                 # Componentes base: Input, Card, Badge, Table, etc.
│   ├── layout/             # Componentes estructurales (Header, Footer, modales).
│   └── icons/              # Componentes de logos e íconos (LogoGTC, LogoNissan).
├── styles/                 # Archivos de estilos globales y utilidades.
│   ├── globals.css         # Migrar el contenido del componente <Styles>.
│   └── print.css           # Estilos específicos para la generación del PDF.
├── utils/                  # Funciones utilitarias (formateo, fechas, etc.).
│   └── formatters.js       # Funciones `mxn`, `pct`.
├── core/                   # (o 'domain', 'business') Lógica de negocio pura.
│   ├── calculations.js     # Funciones `calcular`, `calcularISAN`, `precioBaseDesdeFinal`.
│   └── mappings.js         # Funciones de mapeo como `mapJSONToModel`.
├── hooks/                  # Custom hooks de React para extraer lógica compleja del componente principal.
│   ├── useCalculator.js    # Manejo del estado principal y conexión con la lógica de negocio.
│   └── usePrint.js         # Lógica para controlar la previsualización y el proceso de impresión.
├── data/                   # Archivos JSON y datos estáticos de origen.
│   ├── nissan_precios.json
│   └── tiie.json
├── App.jsx                 # Componente principal simplificado, actuando como orquestador.
└── main.jsx                # Punto de entrada de la aplicación.
```

## 4. Beneficios de la Refactorización Sugerida

1. **Separación de Responsabilidades (SoC):** La UI se encargará solo de mostrar información, mientras que la lógica matemática y de impuestos vivirá en archivos separados (`core/calculations.js`).
2. **Testabilidad:** Se podrán escribir pruebas unitarias directamente sobre los cálculos (por ejemplo, comprobar si el cálculo del ISAN es correcto para diversos precios base) sin necesidad de renderizar toda la aplicación en React.
3. **Mantenibilidad:** Archivos más pequeños, centrados en una única tarea, facilitarán encontrar código específico para futuras modificaciones o solución de bugs.
4. **Escalabilidad Horizontal:** Si la aplicación crece para incluir otra marca (por ejemplo, además de Nissan), se pueden añadir configuraciones o lógicas sin necesidad de afectar o inflar más la vista principal, ya que los componentes base (`components/ui`) podrán ser reutilizados sin modificaciones.

## Conclusión

La configuración actual del proyecto **no es escalable** a largo plazo debido a la concentración de todas las responsabilidades en el archivo `App.jsx`. Antes de introducir "nuevas cosillas" o cambios importantes a la lógica, **es imperativo realizar la refactorización propuesta**. Dividir el archivo mejorará significativamente el flujo de trabajo, reducirá la deuda técnica y facilitará la adición segura de nuevas funcionalidades.
