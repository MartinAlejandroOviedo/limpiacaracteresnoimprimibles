# 🧠 Invisible Character Cleaner — Modo Tomografía Web

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
- 📋 **Síntomas Detectados**: El popup te muestra la lista de síntomas con su gravedad y puntaje.
- 🔄 **Opciones para el Usuario**:
  - Revertir el tratamiento (recargar página)
  - Ignorar el tratamiento y continuar de todos modos
- 🧽 **Limpieza de Caracteres Invisibles**:
  - Elimina automáticamente caracteres como `\u200B`, `\uFEFF`, `\u2060`, etc.
- 🧼 **Modo Manual**:
  - Botón para limpiar manualmente cualquier página
- 🔐 **Anti-Tracking y Protección Avanzada**:
  - Eliminación de scripts de tracking
  - Desactivación de `navigator.sendBeacon`
  - Prevención de fingerprinting
  - Eliminación de atributos `data-*`
  - Bloqueo de metatags sospechosos
- 🌐 **Información del Sitio**:
  - Favicon y dominio visibles en el popup
- 📊 **Registro de Actividad**:
  - Diagnóstico guardado en `chrome.storage`
  - Conteo total de limpiezas
  - URLs donde se aplicaron tratamientos

---

## 🧩 Instalación (modo desarrollador)

1. Descargá o cloná este repositorio en tu computadora.
2. Abrí Chrome y andá a `chrome://extensions/`.
3. Activá el **Modo desarrollador** (arriba a la derecha).
4. Hacé clic en **"Cargar descomprimida"**.
5. Seleccioná la carpeta del proyecto (`cleaner-extension`).
6. ¡Listo! Vas a ver el ícono en tu barra de extensiones.

💡 También podés comprimir la carpeta como `.zip` y arrastrarla a la página de extensiones con modo desarrollador activado.

---

## 🚀 Cómo usar

1. Visitá cualquier página.
2. La extensión hará un escaneo en segundo plano.
3. Hacé clic en el ícono para ver:
   - Diagnóstico completo (estado y síntomas)
   - Tratamiento aplicado automáticamente
   - Opciones para revertir o ignorar el tratamiento

Podés desactivar manualmente los tratamientos si querés meterte en el barro. 😉

---

## 🗂️ Estructura de Archivos

