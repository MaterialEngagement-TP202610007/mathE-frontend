# Math.E Design System

> Plataforma educativa de identificación de estilos de aprendizaje con respaldo institucional, claridad pedagógica y una identidad visual centrada en el azul Math.E (`#0056D2`). La interfaz combina confianza académica, estructura clara y orientación al resultado del estudiante, con superficies blancas y azul suave como base.

---

## 1. Visual Theme & Atmosphere

### Overall Aesthetic
Math.E se siente como una **plataforma educativa institucional presentada a través de una interfaz estructurada y confiable**. Combina credibilidad académica, claridad de flujo y orientación al diagnóstico del estilo de aprendizaje en un sistema ordenado y accesible.

### Mood & Feeling
- Educativo y confiable
- Orientado al diagnóstico y resultado pedagógico
- Accesible, claro y estructurado
- Institucional sin ser frío
- De apoyo y centrado en la progresión del estudiante

### Design Density
**Densidad media.** La plataforma Math.E presenta flujos enfocados por rol (estudiante, profesor), con secciones modulares claras y señales azules que mantienen la experiencia navegable sin sobrecarga visual.

### Visual Character
- Base blanca con señales de confianza en azul
- Tarjetas de resultados y cuestionarios como elemento principal de exploración
- Estructura clara de panel por rol (estudiante / profesor)
- Tono académico amigable, no lúdico
- Jerarquía educativa limpia orientada al diagnóstico VAK

---

## 2. Color Palette & Roles

### Core Foundation

| Token | Hex | Role |
|-------|-----|------|
| `--mathe-blue` | `#0056D2` | Color primario de marca, CTA y enlaces |
| `--mathe-blue-deep` | `#003E9A` | Acento fuerte para encabezados e interacciones |
| `--mathe-white` | `#FFFFFF` | Superficie principal y tarjetas |
| `--mathe-surface` | `#F5F8FF` | Fondo de soporte suave |
| `--mathe-ink` | `#1F1F1F` | Texto primario |

### Support and Utility

| Token | Hex | Role |
|-------|-----|------|
| `--mathe-muted` | `#6B7280` | Texto secundario y metadatos |
| `--mathe-border` | `#D9E3F5` | Bordes de tarjetas y divisores |
| `--mathe-success` | `#16825D` | Estado positivo de progreso o resultado |
| `--mathe-warm` | `#FFF0D9` | Superficie de soporte para notificaciones o destacados |

---

## 3. Typography Rules

### Font Stack

```css
--font-display: "Source Sans 3", "Helvetica Neue", Arial, sans-serif;
--font-sans:    "Source Sans 3", "Helvetica Neue", Arial, sans-serif;
--font-mono:    "SF Mono", Menlo, monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Color |
|---------|------|--------|-------------|----------------|-------|
| Hero Display | 54px | 700 | 1.06 | -0.02em | `#1F1F1F` |
| Page Title | 40px | 700 | 1.1 | -0.02em | `#1F1F1F` |
| Section Title | 30px | 700 | 1.14 | -0.01em | `#1F1F1F` |
| Card Title | 22px | 600 | 1.22 | -0.01em | `#1F1F1F` |
| Body Large | 18px | 400 | 1.6 | 0 | `#1F1F1F` |
| Body | 16px | 400 | 1.6 | 0 | `#1F1F1F` |
| Small Body | 14px | 400 | 1.5 | 0 | `#6B7280` |
| Label | 12px | 700 | 1.35 | 0.04em | `#6B7280` |

### Typography Philosophy
La tipografía de Math.E debe sentirse **académica, accesible y orientada al diagnóstico**. Debe soportar la exploración del cuestionario, la confianza institucional y la progresión pedagógica del estudiante.

---

## 4. Component Stylings

### Buttons

```css
.button-primary {
  background: #0056d2;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 600;
}

.button-primary:hover {
  background: #0045ab;
}

.button-secondary {
  background: #ffffff;
  color: #1f1f1f;
  border: 1px solid #d9e3f5;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 20px;
}
```

### Result and Question Cards

```css
.mathe-card {
  background: #ffffff;
  border: 1px solid #d9e3f5;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(0, 86, 210, 0.05);
}
```

### Inputs

```css
.input {
  background: #ffffff;
  color: #1f1f1f;
  border: 1px solid #d9e3f5;
  border-radius: 999px;
  min-height: 44px;
  padding: 0 16px;
}
```

### Component Notes
- Los indicadores de credibilidad institucional (Colegio Claretiano) deben mantenerse prominentes
- Las tarjetas de resultado VAK y cuestionario necesitan un encuadre modular fuerte
- El azul es el color principal de orientación, confianza y acción

---

## 5. Layout Principles

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2` | `4px` | Alineación densa de metadatos |
| `--space-3` | `8px` | Separaciones pequeñas |
| `--space-4` | `12px` | Espaciado compacto |
| `--space-5` | `16px` | Espaciado por defecto |
| `--space-6` | `24px` | Espaciado de tarjetas |
| `--space-7` | `32px` | Separación de categorías |
| `--space-8` | `48px` | Espaciado de secciones |
| `--space-9` | `64px` | Ritmo de hero y paneles principales |

### Layout Behavior
- Organizar por rol: estudiante, profesor
- Usar la identidad institucional como elemento de confianza y orientación
- Mantener los flujos del cuestionario y resultados claros y familiares
- Distinguir visualmente el panel de diagnóstico del panel de gestión de contenido

### Whitespace Philosophy
El espacio en blanco debe sentirse **estructurado y pedagógico**, ayudando a que una plataforma de diagnóstico educativo se mantenga accesible y enfocada.

---

## 6. Depth & Elevation

### Elevation Strategy
Math.E utiliza **elevación suave de plataforma educativa** con tarjetas de resultado claras y bandas de soporte azul suave.

```css
--shadow-soft: 0 8px 18px rgba(0, 86, 210, 0.04);
--shadow-card: 0 14px 28px rgba(0, 86, 210, 0.08);
```

### Surface Hierarchy
- Base blanca
- Fondos de soporte azul suave
- Tarjetas de resultado y cuestionario
- Azul para confianza, navegación y acción

---

## 7. Do's and Don'ts

### Do
- Mantener el sistema claro, educativo y confiable
- Usar el azul para organizar la acción y la navegación
- Preservar las señales de credibilidad institucional del Colegio Claretiano
- Hacer que los flujos del cuestionario y resultados sean fáciles de seguir

### Don't
- No convertir Math.E en una aplicación educativa lúdica o infantil
- No ocultar las señales de confianza institucional bajo promociones agresivas
- No sobrecomplicar la jerarquía de navegación entre roles
- No reducir la claridad de las tarjetas de resultado con decoración innecesaria

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | `< 768px` | Flujo del cuestionario apilado y navegación simplificada por rol |
| Tablet | `768px - 1023px` | Tarjetas de resultado más amplias y secciones de panel compactas |
| Desktop | `1024px+` | Vista completa de panel por rol con navegación lateral y tarjetas en grilla |

### Responsive Rules
- Mantener el flujo principal del cuestionario obvio en móvil
- Preservar tarjetas de resultado y progreso legibles en todos los tamaños
- Apilar secciones del panel antes de reducirlas demasiado
- Mantener separación visual clara entre el panel del estudiante y el del profesor

---

## 9. Agent Prompt Guide

### Quick Reference
- Base de plataforma educativa blanca y azul suave
- Azul Math.E para confianza, CTAs y navegación
- Tarjetas de resultado VAK, flujo de cuestionario y jerarquía educativa clara
- Confianza académica con claridad orientada al diagnóstico pedagógico

### Prompt Template
```text
Diseña esto siguiendo el estilo del sitio web público actual de Coursera:
- una base de mercado de aprendizaje en línea en tonos blancos y azul claro
- un sistema de navegación y llamadas a la acción (CTA) en el característico azul de Coursera
- fichas de programas, logotipos de socios y navegación por categorías con una jerarquía educativa clara
- confianza académica y elementos de conversión orientados a la carrera profesional
- una experiencia de usuario (UX) de la plataforma de aprendizaje estructurada, convencional y muy legible
```