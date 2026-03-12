# Análisis de Viabilidad: Integración de Backend en Python para Envío de PDF por Correo

El proyecto **Calculadora GTC** actualmente funciona como una aplicación **Single Page Application (SPA)** puramente *frontend* desarrollada en React y Vite. Toda la lógica de cálculo y la generación del PDF se ejecutan del lado del cliente (en el navegador del usuario). La "generación" del PDF se logra mediante la funcionalidad nativa de impresión del navegador (`window.print()`) combinada con estilos CSS (`@media print`) y clases exclusivas de impresión (`.print-only`).

El requerimiento de evaluar la integración de un backend en Python para automatizar el envío de este documento por correo electrónico implica un cambio significativo en la arquitectura del proyecto.

A continuación, se detalla el análisis de esta propuesta, abordando la viabilidad técnica, pros, contras, posibles enfoques y una recomendación final.

---

## 1. Viabilidad Técnica

Técnicamente, es completamente **viable**.

Un backend en Python (por ejemplo, usando frameworks ligeros como **FastAPI** o **Flask**) es una excelente herramienta para manejar tareas de envío de correos (usando SMTP, SendGrid, Amazon SES, etc.) y manipular archivos.

Sin embargo, dado que la aplicación actual no genera un archivo `.pdf` físico en código (sino que le delega esa tarea a la interfaz de impresión del navegador), existen dos posibles enfoques técnicos principales para lograrlo:

### Enfoque A: Generación de PDF en el Frontend (Client-Side)
1. Modificar la aplicación React para utilizar una librería como `jspdf` y `html2canvas` (o `@react-pdf/renderer`).
2. El usuario presiona el botón, la librería captura la vista de impresión y genera un Blob de tipo PDF en la memoria del navegador.
3. El frontend envía este Blob/Archivo en una petición HTTP (POST) al nuevo backend en Python.
4. El backend en Python recibe el archivo y lo envía por correo electrónico al destinatario.

### Enfoque B: Generación de PDF en el Backend (Server-Side)
1. El usuario presiona el botón, y el frontend envía un JSON (POST) al backend en Python con todos los datos calculados (variables financieras, tabla desglosada, cliente, modelo, etc.).
2. El backend en Python recibe el JSON y genera el PDF utilizando librerías como `ReportLab`, `WeasyPrint` o `pdfkit` (HTML a PDF).
3. El backend toma el PDF recién generado y lo envía por correo.

---

## 2. Ventajas y Desventajas de Agregar un Backend (Python)

### Pros (Ventajas) ✅
1. **Automatización:** Se elimina el paso manual de que el usuario descargue el PDF, abra su cliente de correo y adjunte el archivo. Un botón de "Enviar a Dirección Comercial" mandaría el correo instantáneamente.
2. **Estandarización:** Al enviar el correo desde un servidor centralizado (backend), garantizas que todos los correos tengan el mismo formato, cuerpo del mensaje, remitente institucional y firmas.
3. **Control y Auditoría:** Puedes almacenar un registro (log o base de datos en el backend) de cada propuesta enviada (quién la envió, cuándo y para qué cliente).
4. **Seguridad:** Las credenciales de correo (SMTP, API Keys) estarán protegidas en el servidor. Nunca debes exponer claves de APIs de correo en el frontend (React/Vite).

### Contras (Desventajas y Retos) ❌
1. **Cambio de Arquitectura:** El proyecto deja de ser una página estática (que se puede hospedar gratis en GitHub Pages, Vercel o S3) y se convierte en una aplicación Full-Stack.
2. **Costos y Despliegue (Hosting):** Ahora necesitas un servidor (VPS, Heroku, Render, AWS EC2, etc.) que corra el backend de Python 24/7. Esto añade un costo mensual y mayor complejidad en el despliegue (CI/CD).
3. **Mantenimiento Adicional:** Los desarrolladores tendrán que mantener dos repositorios (o un monorepo complejo) y manejar la seguridad del servidor backend.
4. **Reconstrucción del PDF (Si se usa el Enfoque B):** Tendrías que volver a programar todo el diseño visual del PDF (que actualmente se hace muy bien con CSS y media queries en React) dentro de Python.

---

## 3. Recomendaciones y Conclusión

### ¿Es una buena o mala idea?
**Es una buena idea si el valor de negocio de automatizar y auditar el envío de correos justifica el costo y esfuerzo de mantener un servidor backend.**

Si la prioridad actual es que la aplicación sea fácil de mantener, económica (alojamiento gratuito estático) y los vendedores no tienen problema en guardar y adjuntar el PDF manualmente por el momento, entonces **es una mala idea a corto plazo** porque añade complejidad técnica innecesaria a un proyecto que acaba de nacer.

### El Mejor Enfoque si se decide Implementar:
Si decides seguir adelante con el backend en Python, **la recomendación es usar el Enfoque A (Generación en el Cliente).**

1. **¿Por qué?** Ya tienes el diseño del PDF perfecto en React (`.print-only`). Duplicar ese diseño en Python (WeasyPrint/ReportLab) será un dolor de cabeza a la hora de hacer cambios.
2. **Implementación:**
   - Añade una librería de generación de PDFs en React (`html2pdf.js` o similar).
   - Genera el PDF en memoria.
   - Envía ese archivo binario a un endpoint sencillo de un backend hecho en **FastAPI** (`POST /api/enviar-cotizacion`).
   - El backend en Python (que puede ser muy ligero) toma el archivo, utiliza `smtplib` o una API como Resend/SendGrid y lo envía.

### Alternativa "Serverless" sin backend propio (Recomendada para la etapa actual)
Si el único objetivo es evitar que el vendedor abra su correo y adjunte el archivo, pero no quieres lidiar con el mantenimiento de un servidor Python, puedes explorar:

1. **Email APIs (Forma directa, menos segura):** Usar un servicio como EmailJS, que permite enviar correos directamente desde React. *(Ojo: No suele soportar adjuntos pesados y expone cierta lógica al cliente).*
2. **Serverless Functions:** Si alojas tu frontend en Vercel o Netlify, puedes crear una "Serverless Function" (usualmente en Node.js, pero a veces se puede en Python) en el mismo repositorio para recibir el PDF generado y enviarlo vía SendGrid/Resend. Te evitas crear y hospedar un backend completo por separado.