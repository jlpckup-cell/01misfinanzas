# Bolsillo

Aplicación de finanzas personales en español. Sin dependencias ni proceso de compilación.

## Funciones

- Saldo inicial independiente por mes; ingresos y gastos con importes en céntimos.
- Navegación mensual, edición y eliminación de movimientos.
- Diez categorías de gasto y una meta de ahorro y límites mensuales editables, porcentajes iniciales automáticos y copia del mes anterior.
- Resumen y distribución real de gastos por categoría.
- Copias JSON con validación y restauración explícita.
- PWA con manifest, iconos y caché sin conexión tras la primera carga compatible.

## GitHub Pages

La carpeta `dist` contiene toda la aplicación. Copia su contenido en una carpeta de tu repositorio (por ejemplo `bolsillo/`) o en la raíz de un repositorio nuevo. En Settings → Pages, publica desde la rama y carpeta que contienen la aplicación. Si está en `bolsillo/`, añade `/bolsillo/` a la URL de Pages. Todos los recursos usan rutas relativas; no requiere claves ni servidor de datos.

Para servirla localmente: `python3 -m http.server 8080 --directory dist` y abre `http://localhost:8080`. El service worker necesita localhost o HTTPS.

## Datos

Los datos se almacenan en localStorage con la clave `bolsillo.personal.v1`, separados de otras aplicaciones. Cada mes conserva su saldo inicial, presupuestos y movimientos. No hay arrastre automático del saldo: introduce el saldo real al comenzar cada mes. Los presupuestos no son gastos y no descuentan saldo. La propuesta distribuye el 95 % del saldo inicial para gastos y el 5 % como objetivo de ahorro, sin descontarlo del saldo; es una plantilla editable, no asesoramiento financiero.

Los datos no se sincronizan entre dispositivos, navegadores ni dominios. Exporta una copia antes de cambiar de dirección web o borrar los datos del navegador. Restaurar reemplaza todos los meses, tras confirmación. No se envían datos financieros a GitHub ni al alojamiento. No hay conexión bancaria ni contraseña propia.

## Instalación

Android: Chrome → menú → Instalar aplicación / Añadir a pantalla de inicio. iPhone: Safari → Compartir → Añadir a pantalla de inicio. La disponibilidad depende del navegador. Si se sirve tras un acceso privado, puede ser necesario iniciar sesión para acceder en línea.

## Actualizaciones

Al cambiar los recursos, incrementa la versión `CACHE` en `sw.js`. La aplicación utiliza red primero y caché como respaldo. No almacena datos financieros en la caché de archivos.

## Presupuestos mixtos

Cada categoría, incluido el ahorro, permite elegir porcentaje del saldo inicial o cantidad fija en euros. Los porcentajes se recalculan al modificar el saldo inicial; las cantidades fijas se mantienen. Copiar el mes anterior conserva el modo de cada categoría. Las copias antiguas siguen siendo compatibles: los porcentajes existentes conservan su modo y los importes sin porcentaje se tratan como fijos.

Al fijar una categoría en 0 €, se reparte el saldo inicial restante después de las cantidades fijas entre las categorías porcentuales, proporcionalmente a sus pesos. Se ajustan los céntimos por restos mayores. Si no quedan porcentajes positivos, el dinero queda sin asignar. Si los fijos superan el saldo, los porcentajes reciben cero y se mantiene el aviso. Cada mes nuevo parte de la propuesta por defecto; los ajustes de otros meses no se arrastran automáticamente.
