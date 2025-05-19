# Invisible Character Cleaner

Una extensión de Chrome que mejora tu experiencia de navegación eliminando caracteres invisibles y aplicando medidas anti-tracking para un entorno web más limpio y privado.

## Características

*   **Limpieza de Caracteres Invisibles:** Elimina automáticamente caracteres invisibles (como `\u200B`, `\uFEFF`, etc.) de las páginas web que visitas.
*   **Limpieza Manual:** Un botón en el popup te permite limpiar la página actual en cualquier momento.
*   **Limpieza Automática:** Opción para activar la limpieza de caracteres invisibles al cargar cada página.
*   **Limpieza Avanzada (Anti-tracking):** Una opción configurable que aplica medidas adicionales como:
    *   Eliminación de iframes y scripts de tracking sospechosos.
    *   Limpieza de meta y link tags relacionados con tracking.
    *   Desactivación de `navigator.sendBeacon`.
    *   Eliminación de atributos `data-*`.
    *   Prevención de secuestro del portapapeles.
    *   Spoofing de APIs de Fingerprinting.
*   **Puntaje de Limpieza Web:** El popup muestra un puntaje (0-10) que indica cuán "limpia" o "contaminada" está la página actual, con indicadores visuales (🟢 Limpia, 🟡 Dudosa, 🔴 Contaminada).
*   **Información del Sitio:** El popup muestra el favicon y el dominio de la página actual.
*   **Registro de Actividad:** Lleva un conteo total de limpiezas y registra las URLs de las páginas donde se realizó la limpieza automática.

## Instalación

Puedes instalar la extensión de forma local siguiendo estos pasos:

1.  Descarga o clona este repositorio en tu computadora.
2.  Abre Google Chrome y ve a `chrome://extensions/`.
3.  Activa el **Modo de desarrollador** (generalmente en la esquina superior derecha).
4.  Haz clic en el botón **"Cargar descomprimida"**.
5.  Selecciona la carpeta donde descargaste los archivos de la extensión (`cleaner-extension`).
6.  ¡Listo! La extensión aparecerá en tu lista de extensiones y su ícono en la barra del navegador.

Alternativamente, puedes comprimir la carpeta de la extensión en un archivo `.zip` y arrastrarlo a la página `chrome://extensions/` con el Modo de desarrollador activado.

## Uso

Una vez instalada y activada, la extensión puede funcionar automáticamente en segundo plano si activas la opción de limpieza automática.

Para interactuar con la extensión:

1.  Haz clic en el ícono de la extensión en la barra del navegador.
2.  Se abrirá un pequeño popup mostrando:
    *   El favicon y dominio de la página actual.
    *   El puntaje de limpieza de la página.
    *   Estadísticas de limpieza (páginas únicas y total de veces).
    *   Opciones para activar/desactivar la limpieza automática y avanzada.
    *   Un botón para limpiar manualmente la página actual.

## Estructura de Archivos

(Mantén o actualiza esta sección según la estructura actual de tu proyecto)
