
# 🧠 Invisible Character Cleaner — Modo Tomografía Web + Identidad Digital

Una extensión de Chrome que mejora tu experiencia de navegación eliminando caracteres invisibles, bloqueando rastreadores ocultos y aplicando medicina preventiva digital para protegerte de sitios web contaminados.

---

## ✨ Características principales

- 🔬 **Tomografía Web**: Cada página que visitás es analizada automáticamente para detectar síntomas de contaminación (tracking, iframes ocultos, fingerprinting, etc.).
- 🩺 **Diagnóstico en Tiempo Real**: El análisis se realiza al cargar la página y los resultados están listos al abrir el popup.
- 💉 **Tratamiento Automático**: Según el nivel de contaminación, se aplican distintos niveles de limpieza:
  - Ligero: elimina caracteres invisibles
  - Medio: elimina iframes y scripts sospechosos
  - Fuerte: bloquea funciones peligrosas
  - Grave: **bloquea el acceso a la página**
- 👀 **Identidades Digitales (Función Oculta)**:
  - Modo **Normal**: tu configuración real.
  - Modo **Croto**: simula un dispositivo móvil barato para activar versiones “lite” o ver precios bajos.
  - Modo **Billonario**: simula un dispositivo de lujo con alto poder de cómputo, ideal para acceder a features ocultas.
  - 🕵️ Se desbloquea haciendo **3 clics sobre el título “Invisible Cleaner”** en el popup.
- 📋 **Síntomas Detectados**: El popup te muestra la lista de síntomas con su gravedad y puntaje.
- 🔄 **Opciones para el Usuario**:
  - Revertir el tratamiento (recargar página)
  - Ignorar el tratamiento y continuar de todos modos
- 🧽 **Limpieza de Caracteres Invisibles**
- 🧼 **Modo Manual y Limpieza Anti-Tracking**
- 🌐 **Información del Sitio**
- 📊 **Registro de Actividad**

---

## 🧩 Instalación (modo desarrollador)

1. Descargá o cloná este repositorio.
2. Abrí Chrome y andá a `chrome://extensions/`.
3. Activá el **Modo desarrollador**.
4. Cargá la carpeta descomprimida `cleaner-extension`.

---

## 🕹️ Cómo usar

1. Visitá cualquier sitio.
2. Al cargarse, se realiza una tomografía y se aplica tratamiento.
3. Abrí el popup para ver el diagnóstico, puntaje y síntomas.
4. Hacé clic 3 veces sobre el título para desbloquear el selector de identidad.

---

## 🗂️ Estructura de Archivos

```text
cleaner-extension/
├── background.js
├── content.js
├── icon.png
├── manifest.json
├── popup.html
├── popup.js
├── README.md
```

---

## 👨‍⚕️ Filosofía del Proyecto

> *“Somos médicos digitales, no dioses. Diagnosticamos, tratamos y protegemos — pero siempre dejamos que el usuario decida.”*
> — Dr. Martín Oviedo, Fundación Web Limpia

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

