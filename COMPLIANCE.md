# Compliance: sitio web de AZZ (azz.com.ar)

Revisión: 12/10/2026. Alcance: sitio estático que reemplaza el WordPress (home, Comunidad, Privacidad, Botón de arrepentimiento).

> Este análisis no reemplaza el asesoramiento de un abogado matriculado. Las normas cambian: verificá la vigencia en InfoLEG, el Boletín Oficial y argentina.gob.ar/aaip antes de publicar.

## Resumen

**Se puede publicar, con condiciones.** El sitio no recolecta datos de manera directa: no tiene formularios, login ni analytics, y YouTube se carga recién cuando la persona toca play. El riesgo está en la página Comunidad, que vende suscripciones y recibe aportes. Eso la convierte en comercio electrónico, alcanzado por la Ley 24.240 y sus resoluciones.

## Normas aplicables

| Norma | Por qué aplica | Qué exige |
|---|---|---|
| Ley 25.326 y Dto. 1558/2001 | Pagos (nombre y correo de los socios que comparte Mercado Pago), correos de contacto, cookies de YouTube | Deber de informar (art. 6), seguridad (art. 9), derechos de acceso, rectificación y supresión, leyenda de la Disp. 10/2008 |
| Art. 12 y Disp. 60/2016 | YouTube (Google) y el hosting pueden estar fuera de Argentina | Transferencia internacional informada en la política de privacidad |
| Ley 27.699 (Convenio 108+) | Marco general de protección de datos | Mismos principios, con más énfasis en la transparencia |
| Ley 24.240 (art. 4, 7, 10 bis, 34) | Venta de suscripciones online | Información clara, precio final, revocación en 10 días |
| Res. 424/2020 | Contratación a distancia | Botón de arrepentimiento con link visible y código de trámite en 24 h |
| Res. 316/2018 | Suscripciones con débito recurrente | Baja por el mismo medio en que se contrató, sin trabas |
| Res. 270/2020 | Comercio electrónico | Datos del proveedor visibles (razón social, CUIT, domicilio) |
| CCyC art. 53 | Fotos de los conductores en los banners | Consentimiento de las personas que aparecen |
| Ley 11.723 y Ley 22.362 | Banners, logos de programas y de sponsors | Titularidad o licencia de las piezas y marcas |
| ARCA | Cobro de cuotas y aportes | Facturación de lo que se cobra |

## Requisitos

| # | Requisito | Estado | Acción |
|---|---|---|---|
| 1 | Política de privacidad enlazada en el footer | Cumplido | Fecha de actualización: 12/10/2026 |
| 2 | Leyenda de la Disp. 10/2008 | Cumplido | En `privacidad/` |
| 3 | Identificación del responsable (razón social, CUIT, domicilio) | **Falta** | Por pedido, Privacidad muestra solo el correo de contacto (12/10/2026). Para el sitio definitivo, sumar los datos del titular en Privacidad y en el footer |
| 4 | Botón de arrepentimiento | Cumplido en parte | Hay página y link en el footer. Funciona por correo; confirmar quién envía el código de trámite en 24 h |
| 5 | Link al botón en la primera pantalla | **A verificar** | Hoy está en el footer. Revisar si la Res. 424/2020 exige que sea visible sin scroll y, si es así, sumarlo al header |
| 6 | Baja de la suscripción (Res. 316/2018) | Cumplido en parte | Se explica cómo cancelar en Mercado Pago. Conviene un link directo de baja |
| 7 | Precio final con impuestos | **A verificar** | Confirmar si $4.000 / $8.000 y los aportes son finales y aclararlo |
| 8 | Bases y condiciones de los sorteos (plateas, camisetas) | **Falta** | Si se sortean premios entre socios, hacen falta bases públicas |
| 9 | Consentimiento de imagen de los conductores | **A verificar** | Confirmar que los contratos o acuerdos lo cubren |
| 10 | Inscripción de la base de socios ante la AAIP | **A verificar** | Si AZZ guarda una lista de socios, evaluar inscribir la base |
| 11 | Sin trackers ni cookies propias | Cumplido | Si después agregan analytics o píxeles, sumar aviso y consentimiento |
| 12 | YouTube solo después del click | Cumplido | `assets/js/main.js` |
| 13 | Facturación de cuotas y aportes | **A verificar** | Lo resuelve el contador del cliente |

## Riesgos

| Riesgo | Gravedad | Mitigación |
|---|---|---|
| Vender suscripciones sin identificar al proveedor | Media | Completar los datos del punto 3 |
| Sorteos sin bases y condiciones | Media | Redactar las bases o dejar de anunciar sorteos |
| Botón de arrepentimiento que no cumple el formato exigido | Media | Revisar los puntos 4 y 5 |
| Precios que no son finales | Baja | Aclarar "precio final" |
| Uso de imagen sin consentimiento | Baja | Revisar los contratos |

## Próximos pasos

1. Pedirle al cliente razón social, CUIT, domicilio y la fecha de publicación de la política.
2. Confirmar si los precios son finales y si hay bases para los sorteos.
3. Decidir si el link de arrepentimiento también va en el header.
4. Que un abogado revise Comunidad antes de publicar.
