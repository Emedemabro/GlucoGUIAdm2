FarmaDM2 — prototipo académico v0.1

CONTENIDO
index.html: interfaz
style.css: estilos
app.js: navegación, búsqueda y fichas
medicamentos.json: seis entradas de demostración
manifest.webmanifest: instalación PWA
sw.js: almacenamiento local básico para consulta sin conexión
icon.svg: icono

ADVERTENCIA
Los contenidos son demostrativos y requieren validación bibliográfica antes de cualquier uso clínico. No hay cálculo de dosis, manejo de pacientes ni prescripción.

CÓMO PROBAR LOCALMENTE
Extraer ZIP, abrir una terminal en la carpeta y ejecutar:
python -m http.server 8000
Visitar http://localhost:8000

CÓMO PUBLICAR GRATIS EN GITHUB PAGES
1. Crear una cuenta GitHub y repositorio público (sin datos personales).
2. Subir los siete archivos a la raíz del repositorio.
3. Settings > Pages > Deploy from a branch > main / (root) > Save.
4. Abrir la dirección HTTPS proporcionada por GitHub Pages.
5. En un navegador compatible, usar "Instalar" o "Agregar a pantalla de inicio".

El service worker requiere HTTPS o localhost. La primera visita necesita internet; el modo sin conexión debe probarse en cada navegador/dispositivo. La estrategia actual cache-first requiere publicar una nueva versión del nombre CACHE en sw.js al actualizar contenidos.

SIGUIENTE ETAPA
Separar hojas Medicamentos, Seguridad, Alertas, Insulinas y Fuentes; crear un proceso de exportación validada desde Google Sheets a JSON; añadir enlaces y fechas de revisión; auditar contenidos con documentos ISP/MINSAL/ADA; probar accesibilidad y comportamiento offline.

No almacenar datos identificables de pacientes en GitHub Pages ni en archivos JSON públicos.
