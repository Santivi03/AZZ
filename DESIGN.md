---
name: AZZ
description: Sitio oficial de AZZ, canal de streaming deportivo. Transmisión de fútbol en clave oscura con el verde menta y el azul del logo.
colors:
  primary: "#00FF99"
  on-primary: "#04140D"
  secondary: "#003461"
  on-secondary: "#F2F5F7"
  on-secondary-muted: "#C6D6E8"
  background: "#05080D"
  surface: "#0B1320"
  surface-raised: "#111C2D"
  on-surface: "#F2F5F7"
  muted: "#A3AFBC"
  line: "#1C2738"
  live: "#FF4D4D"
  on-live: "#05080D"
typography:
  display:
    fontFamily: Big Shoulders Display
    fontSize: 96px
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: -0.01em
  headline:
    fontFamily: Big Shoulders Display
    fontSize: 56px
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: 0em
  title:
    fontFamily: Big Shoulders Display
    fontSize: 28px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: 0.01em
  body:
    fontFamily: Archivo
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: Archivo
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
rounded:
  sm: 6px
  md: 12px
  lg: 16px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  xxl: 96px
  gutter: 16px
  max-width: 1240px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: 14px 24px
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: 14px 24px
  live-badge:
    backgroundColor: "{colors.live}"
    textColor: "{colors.on-live}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  program-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
  plan:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 32px
  plan-featured:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.lg}"
    padding: 32px
  link-muted:
    textColor: "{colors.muted}"
  club-band-text:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary-muted}"
  divider:
    backgroundColor: "{colors.line}"
    height: 1px
---

## Overview

AZZ se mira de noche, desde el celular, con el partido de fondo. El sitio funciona como la previa de una transmisión: fondo casi negro, imágenes de los programas a todo color y un único acento verde menta que marca lo que se puede tocar. La voz es de tribuna, directa y en rioplatense. El hashtag del canal, #DecimosLoQueSentimos, es el titular de la home.

## Colors

- **Primary (#00FF99):** el verde menta del logo. Solo para acciones (botones, links activos, foco) y para el logo. Nunca como fondo de grandes superficies.
- **Secondary (#003461):** el azul del contorno del logo. Fondo del plan destacado y de bandas puntuales.
- **Background (#05080D) y Surface (#0B1320):** negros con un tinte azul que viene del logo, para que las fotos de los programas resalten.
- **Muted (#A3AFBC):** texto secundario, con contraste mayor a 4.5:1 sobre el fondo.
- **Live (#FF4D4D):** exclusivo para la señal "En vivo".

## Typography

Big Shoulders Display (condensada, pesada, de estadio) para títulos, en mayúsculas. Archivo para el texto corrido y las etiquetas. Las dos se sirven desde el propio sitio en woff2. Los títulos grandes van con interlineado apretado; el cuerpo, a 17px con 1.6.

## Layout

Contenedor máximo de 1240px con un margen lateral de 16px en celular. La grilla de programas pasa de una columna en celular a dos en escritorio. Las secciones se separan con 96px en escritorio y 64px en celular. Mobile first: todo se prueba primero a 375px.

## Elevation & Depth

Casi plano. La profundidad la dan las fotos y el contraste entre background y surface. Una sola sombra suave (desplazada y difuminada) para los elementos que flotan, como el header fijo al hacer scroll.

## Shapes

Radios de 16px para las imágenes de programas y los planes, 12px para piezas medianas y pastilla completa para los botones. Nada de bordes de color gruesos.

## Components

- **Botón primario:** pastilla verde menta con texto oscuro, mínimo 48px de alto.
- **Botón secundario:** pastilla en surface-raised con texto claro.
- **Badge en vivo:** rojo. Solo se muestra si hay una forma real de saber que el canal está transmitiendo; nunca fijo en la página.
- **Tile de programa:** la imagen oficial del programa, entera, con el nombre en texto debajo y la flecha de salida. Todo el tile es el link a la playlist de YouTube.
- **Plan de socio:** bloque con precio grande, lista de beneficios y botón a Mercado Pago. El plan Premium va sobre el azul secondary.
- **Sponsors:** afiches 3:4 del mismo tamaño en una fila con scroll horizontal.

## Do's and Don'ts

- Do: usar el verde solo para lo que se toca.
- Do: escribir el nombre de cada programa en HTML aunque la imagen ya lo tenga.
- Do: abrir YouTube, Mercado Pago y los sponsors en una pestaña nueva.
- Don't: degradados de texto, glassmorphism ni brillos de neón alrededor de las tarjetas.
- Don't: emojis como iconos; los iconos son SVG.
- Don't: inventar horarios, conductores o cifras de audiencia.
