# Invisible Character Cleaner

Una extensión de Chrome que elimina automáticamente los caracteres invisibles (como `\u200B`, `\uFEFF`, etc.) de las páginas web que visitas.

## Características

*   **Limpieza Automática:** Elimina caracteres invisibles al cargar cada página.
*   **Registro de Actividad:** Lleva un conteo total de limpiezas y registra las URLs de las páginas donde se realizó la limpieza.
*   **Popup Informativo:** Un popup accesible desde el ícono de la extensión muestra el registro de limpiezas.

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

Una vez instalada y activada, la extensión funciona automáticamente en segundo plano. Cada vez que visites una página web, limpiará los caracteres invisibles.

Para ver el registro de limpiezas:

1.  Haz clic en el ícono de la extensión en la barra del navegador.
2.  Se abrirá un pequeño popup mostrando el número total de limpiezas realizadas y una lista de las páginas que han sido limpiadas.

## Estructura de Archivos
