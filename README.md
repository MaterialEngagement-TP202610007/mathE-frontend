# Math.E — Plataforma de Detección de Estilos de Aprendizaje

## Proyecto de Tesis

Este proyecto es desarrollado como parte de una tesis universitaria en la **Universidad Peruana de Ciencias Aplicadas (UPC)**, en colaboración con el **Colegio Claretiano**.

---

## ¿Qué es Math.E?

**Math.E** es una plataforma web educativa que ayuda a identificar cómo aprende mejor cada estudiante. Utilizando tecnologías de **Inteligencia Artificial Generativa** y **Machine Learning**, el sistema determina si un estudiante tiene un perfil de aprendizaje **Visual**, **Auditivo** o **Kinestésico** (modelo VAK).

La idea surge de una necesidad real: cada persona aprende de manera diferente, y conocer el estilo de aprendizaje predominante permite a los docentes adaptar sus métodos de enseñanza para obtener mejores resultados educativos.

---

## ¿Por qué es importante?

En el ámbito educativo, es común aplicar cuestionarios para detectar estilos de aprendizaje. Sin embargo, estos cuestionarios suelen tener problemas:

- **Las preguntas se repiten** y los estudiantes terminan memorizando las respuestas.
- **No hay variedad**, lo que genera monotonía y resultados menos precisos con el tiempo.
- **El proceso de crear nuevas preguntas es manual** y consume mucho tiempo a los docentes.

**Math.E** resuelve estos problemas mediante:

1. **Generación automática de preguntas** usando Inteligencia Artificial, garantizando variedad y evitando la repetición.
2. **Validación por expertos pedagógicos** antes de que las preguntas lleguen a los estudiantes.
3. **Clasificación inteligente** del estilo de aprendizaje usando algoritmos de Machine Learning entrenados específicamente para esta tarea.

---

## ¿Cómo funciona?

El flujo del sistema es sencillo:

1. **La IA genera preguntas nuevas** — El sistema utiliza modelos de Inteligencia Artificial para crear preguntas variadas (texto, imágenes y audio) relacionadas con situaciones de aprendizaje.

2. **Un pedagogo las valida** — Antes de que cualquier pregunta sea utilizada, un experto pedagógico la revisa y aprueba (o rechaza), asegurando la calidad educativa.

3. **El estudiante responde el cuestionario** — Se presentan 10 preguntas validadas. El sistema garantiza que no se repitan preguntas en evaluaciones futuras.

4. **El modelo de Machine Learning clasifica** — Con base en las respuestas, el algoritmo determina el estilo de aprendizaje predominante del estudiante.

5. **Se entrega un informe personalizado** — El estudiante recibe información clara sobre su perfil de aprendizaje.

---

## El Modelo VAK

El proyecto se basa en el modelo **VAK**, una teoría ampliamente utilizada en pedagogía que clasifica los estilos de aprendizaje en tres categorías:

| Estilo | ¿Cómo aprende mejor? |
|--------|----------------------|
| **Visual** | A través de imágenes, diagramas, videos, mapas mentales y representaciones gráficas. |
| **Auditivo** | Escuchando explicaciones, participando en debates, con música o grabaciones. |
| **Kinestésico** | Mediante la práctica, el movimiento, la experimentación y las actividades manuales. |

Conocer el estilo predominante de un estudiante permite personalizar las estrategias de enseñanza y mejorar su rendimiento académico.

---

## Tecnologías Utilizadas

El proyecto combina dos grandes áreas de la Inteligencia Artificial:

### Inteligencia Artificial Generativa (IAGen)

Se utiliza para **crear contenido automáticamente**:

- **Generación de preguntas en texto** — El sistema crea preguntas variadas y contextualizadas para el cuestionario, evitando la repetición y asegurando que haya variedad a lo largo del tiempo.

- **Generación de imágenes** — Para las preguntas orientadas al estilo Visual, se generan ilustraciones que complementan el contenido.

- **Generación de audio** — Para las preguntas orientadas al estilo Auditivo, se produce narración de voz realista en español.

- **Control anti-redundancia** — Mediante análisis semántico, el sistema detecta si una pregunta nueva es muy similar a las existentes y la descarta, garantizando variedad real.

### Machine Learning (ML)

Se utiliza para **clasificar a los estudiantes**:

- Un modelo entrenado analiza las respuestas del cuestionario.
- Determina el estilo de aprendizaje predominante (Visual, Auditivo o Kinestésico).
- El modelo aprende de datos reales y mejora su precisión con el tiempo.

---

## Objetivo General

Desarrollar una plataforma web que utilice Inteligencia Artificial Generativa y Machine Learning para automatizar la generación de cuestionarios pedagógicos y clasificar de manera precisa el estilo de aprendizaje predominante de los estudiantes, contribuyendo a la personalización de la educación.

---

## Objetivos Específicos

- Automatizar la generación de contenido educativo (preguntas, imágenes, audio) mediante modelos de IA Generativa.
- Implementar un sistema de validación de preguntas a través del juicio de expertos pedagógicos.
- Evitar la redundancia y monotonía en el banco de preguntas, garantizando resultados precisos en evaluaciones periódicas.
- Entrenar un modelo de Machine Learning capaz de clasificar estilos de aprendizaje con alta precisión.
- Proporcionar informes claros y útiles a estudiantes y docentes sobre los perfiles de aprendizaje.

---

## Usuarios del Sistema

- **Estudiantes** — Responden el cuestionario y reciben su perfil de aprendizaje.
- **Pedagogos** — Validan las preguntas generadas por la IA antes de que sean utilizadas.
- **Administradores** — Gestionan la plataforma, usuarios y supervisan el funcionamiento general.

---

## Institución Colaboradora

**Colegio Claretiano** — El proyecto se desarrolla en colaboración con esta institución educativa, donde se realizarán las pruebas con estudiantes reales.

---

## Estado del Proyecto

> 🟡 **En desarrollo** — El proyecto se encuentra actualmente en fase de planificación y desarrollo inicial.

---

## Licencia

Este proyecto es desarrollado con fines académicos como parte de un trabajo de tesis universitaria.
