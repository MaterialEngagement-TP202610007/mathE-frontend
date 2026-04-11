# Math.E — Plataforma de Detección de Estilos de Aprendizaje

> Aplicación Web con Machine Learning e IA Generativa para la clasificación de estilos de aprendizaje basada en el modelo VAK (Visual, Auditivo, Kinestésico) — Colegio Claretiano.

---

## 📌 Descripción General

**Math.E** es una aplicación web que integra Inteligencia Artificial Generativa y Machine Learning para identificar el estilo de aprendizaje predominante de un estudiante mediante un cuestionario validado por expertos pedagógicos.

El sistema genera preguntas automáticamente usando modelos de IA Generativa (texto e imagen), las cuales pasan por un proceso de **juicio de expertos** antes de ser incorporadas al banco de preguntas oficial. Posteriormente, los estudiantes responden el cuestionario y el modelo de ML clasifica su estilo de aprendizaje según el modelo **VAK**.

---

## 🎯 Objetivos del Proyecto

- Automatizar la generación de contenido para cuestionarios pedagógicos mediante IA Generativa.
- Implementar un flujo de validación de preguntas a través del juicio de expertos (pedagogo).
- **Evitar contenido redundante y mitigar la monotonía de preguntas**, garantizando variedad en el banco de preguntas para asegurar resultados precisos a lo largo del tiempo (períodos de 3 meses, 1 año, etc.).
- Clasificar el estilo de aprendizaje predominante de los estudiantes (Visual, Auditivo o Kinestésico) usando un modelo de Machine Learning entrenado.
- Proveer un informe claro al estudiante sobre su perfil de aprendizaje.

---

## 👥 Roles del Sistema

### 1. 🛡️ Administrador
- Gestión general de la plataforma.
- Mantenimiento, soporte técnico y supervisión del sistema.
- Administración de usuarios (pedagogos y estudiantes).
- Acceso a métricas y logs del sistema.

### 2. 🧑‍🏫 Pedagogo (Experto)
- Recibe las preguntas generadas por los modelos de IA Generativa.
- Evalúa, aprueba o rechaza cada pregunta según criterios pedagógicos (juicio de expertos).
- Las preguntas aprobadas se almacenan en la base de datos con su metadata correspondiente.
- Las preguntas rechazadas quedan registradas con el motivo de rechazo.

### 3. 🧑‍🎓 Estudiante
- Inicia sesión en la plataforma.
- Responde el cuestionario de 10 preguntas obtenidas desde la base de datos (validadas previamente).
- Recibe un informe con su estilo de aprendizaje predominante según el modelo VAK.

---

## 🔄 Flujo de la Aplicación *(por refinar)*

```
┌─────────────────────────────────────────────────────────┐
│                  IA GENERATIVA                          │
│  Generación automática de preguntas (texto + imágenes)  │
│  (con control de redundancia y variedad de contenido)   │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  PEDAGOGO                               │
│        Juicio de Expertos: Aprueba / Rechaza            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│               BASE DE DATOS (PostgreSQL)                │
│   Preguntas validadas almacenadas con su metadata       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                 ESTUDIANTE                              │
│   Inicia sesión → Responde cuestionario (10 preguntas)  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│            MODELO DE MACHINE LEARNING                   │
│     Clasificación VAK → Informe de estilo de            │
│                aprendizaje predominante                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 Modelo VAK

El modelo **VAK** (Visual, Auditivo, Kinestésico) es una teoría de estilos de aprendizaje que clasifica a los estudiantes según su canal sensorial predominante:

| Estilo | Descripción |
|--------|-------------|
| **Visual (V)** | Aprende mejor mediante imágenes, diagramas, videos y representaciones visuales. |
| **Auditivo (A)** | Aprende mejor escuchando, en debates, explicaciones orales y música. |
| **Kinestésico (K)** | Aprende mejor a través de la práctica, el movimiento y la experiencia directa. |

El cuestionario consta de **10 preguntas validadas** por el pedagogo. Para garantizar la precisión del resultado a lo largo del tiempo, el sistema gestiona activamente la **variedad y no repetición de preguntas**, permitiendo reevaluaciones confiables en distintos períodos (3 meses, 1 año, etc.).

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                  React / Next.js                                 │
│   Panel Pedagogo | Panel Estudiante | Panel Administrador        │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTP / REST
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│                   Python (FastAPI / Flask)                       │
│                        REST API                                  │
│                                                                  │
│  /auth          → Autenticación y gestión de roles              │
│  /preguntas     → CRUD de preguntas (GET, POST, PUT, DELETE)    │
│  /cuestionario  → GET 10 preguntas validadas (sin repetición)   │
│  /respuestas    → POST respuestas del estudiante                │
│  /clasificacion → POST → Modelo ML → Resultado VAK             │
└──────────┬────────────────────────────┬────────────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐     ┌──────────────────────────────────┐
│  BASE DE DATOS      │     │       MODELOS DE IA              │
│  PostgreSQL         │     │  - IA Generativa de Texto        │
│  (Preguntas,        │     │  - IA Generativa de Imágenes     │
│   Usuarios,         │     │  - Modelo ML (VAK Classifier)    │
│   Resultados)       │     │    scikit-learn / TensorFlow /   │
└─────────────────────┘     │         PyTorch                  │
                            └──────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| React / Next.js | Interfaz de usuario — paneles de pedagogo, estudiante y administrador |

### Backend
| Tecnología | Uso |
|------------|-----|
| Python (FastAPI o Flask) | REST API — lógica de negocio, endpoints |

### Machine Learning & IA
| Tecnología | Uso |
|------------|-----|
| scikit-learn / TensorFlow / PyTorch | Entrenamiento y clasificación del modelo VAK |
| GPT-4o (OpenAI API) | Generación automática de preguntas tipo texto |
| DALL-E 3 (OpenAI API) | Generación de imágenes ilustrativas por estilo VAK |
| ElevenLabs API | Generación de audio/voz realista para preguntas del estilo Auditivo |
| Whisper (OpenAI API) | Transcripción de audio — procesamiento de respuestas orales |
| `text-embedding-3-small` (OpenAI) | Control anti-redundancia mediante similitud semántica |

### Base de Datos
| Tecnología | Uso |
|------------|-----|
| PostgreSQL | Almacenamiento de preguntas, usuarios y resultados |

---

## 🤖 Modelos de IA Generativa

### 📝 Generación de Preguntas (Texto)

**Modelo:** `GPT-4o` — OpenAI API (pago por token)
**Biblioteca:** `openai` (Python)

```bash
pip install openai
```

Genera preguntas estructuradas por estilo VAK (opción múltiple, likert, situacional) con respuesta en JSON limpio, ideal para integración directa con FastAPI. El prompt incluye el estilo objetivo y la lista de temas ya usados para garantizar variedad y evitar redundancia.

```python
from openai import OpenAI
client = OpenAI(api_key="TU_API_KEY")

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Eres un experto pedagógico. Genera preguntas VAK tipo opción múltiple en formato JSON."},
        {"role": "user", "content": "Genera 3 preguntas para el estilo Visual, sin repetir temas: [lista_temas_usados]"}
    ]
)
```

> 💡 Alternativa open-source futura: `Mistral 7B` o `LLaMA 3` vía HuggingFace.

---

### 🖼️ Generación de Imágenes

**Modelo:** `DALL-E 3` — OpenAI API (pago por imagen)
**Biblioteca:** `openai` (Python) — misma API key que GPT-4o

Genera imágenes ilustrativas de alta calidad para acompañar preguntas del estilo **Visual (V)**. Permite descripciones detalladas en lenguaje natural y produce resultados coherentes con el contexto educativo. Comparte el mismo SDK que GPT-4o, simplificando la integración.

```python
response = client.images.generate(
    model="dall-e-3",
    prompt="Una escena de aula donde un estudiante aprende mediante un mapa mental colorido y visual",
    size="1024x1024",
    quality="standard",
    n=1
)
image_url = response.data[0].url
```

> 💡 Alternativa open-source futura: `Stable Diffusion XL (SDXL)` vía HuggingFace Diffusers.

---

### 🔊 Generación de Audio / Voz

**Modelo:** `ElevenLabs API` — (pago, tier gratuito disponible)
**Biblioteca:** `elevenlabs` (Python)

```bash
pip install elevenlabs
```

Genera narración de voz ultra-realista en español para las preguntas del estilo **Auditivo (A)**. ElevenLabs ofrece voces con entonación natural y control de emociones, lo cual es clave para preguntas auditivas en un contexto educativo. Permite seleccionar o clonar voces específicas.

```python
from elevenlabs.client import ElevenLabs

client_el = ElevenLabs(api_key="TU_ELEVENLABS_KEY")

audio = client_el.text_to_speech.convert(
    voice_id="pNInz6obpgDQGcFmaJgB",  # voz en español
    text="¿Cuál de las siguientes situaciones describe mejor cómo aprendes?",
    model_id="eleven_multilingual_v2"
)
```

> 💡 Alternativa si se prefiere mantener todo en OpenAI: `OpenAI TTS (tts-1-hd)` con voces `nova` o `shimmer`.

---

### 🎙️ Transcripción de Audio (Respuestas Orales)

**Modelo:** `Whisper` (`whisper-1`) — OpenAI API
**Biblioteca:** `openai` (Python)

Permite que los estudiantes respondan preguntas de forma oral, especialmente útil para el estilo **Kinestésico (K)** en actividades de expresión. Whisper transcribe el audio a texto con alta precisión en español, el cual luego es procesado por el modelo de clasificación VAK.

```python
audio_file = open("respuesta_estudiante.mp3", "rb")
transcription = client.audio.transcriptions.create(
    model="whisper-1",
    file=audio_file,
    language="es"
)
print(transcription.text)
```

---

### 🔄 Control Anti-Redundancia (Embeddings Semánticos)

**Modelo:** `text-embedding-3-small` — OpenAI API (costo mínimo)
**Biblioteca:** `openai` + `numpy`

```bash
pip install openai numpy
```

Antes de guardar una pregunta nueva en PostgreSQL, se genera su embedding vectorial y se compara contra el banco existente usando **similitud coseno**. Si la similitud supera el umbral definido (ej. `0.85`), la pregunta se descarta como redundante. Garantiza variedad real entre períodos de reevaluación (3 meses, 1 año, etc.).

```python
import numpy as np

def similitud_coseno(vec_a, vec_b):
    return np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b))

embedding_nuevo = client.embeddings.create(
    model="text-embedding-3-small",
    input="nueva pregunta generada"
).data[0].embedding

# Comparar contra embeddings existentes en PostgreSQL
# Si similitud > 0.85 → descartar como redundante
```

---

### 📦 Resumen de Modelos IA

| Función | Modelo | Biblioteca | Costo |
|---|---|---|---|
| Generación de preguntas (texto) | `GPT-4o` | `openai` | Pago (por token) |
| Generación de imágenes | `DALL-E 3` | `openai` | Pago (por imagen) |
| Generación de audio / voz | `ElevenLabs` (`eleven_multilingual_v2`) | `elevenlabs` | Freemium |
| Transcripción de audio | `Whisper` (`whisper-1`) | `openai` | Pago (muy bajo) |
| Control anti-redundancia | `text-embedding-3-small` | `openai` + `numpy` | Pago (mínimo) |
| Clasificación VAK | Modelo propio entrenado | `scikit-learn` / `PyTorch` | Gratuito |

> ⚠️ **Seguridad:** Todas las llamadas a APIs externas deben realizarse **exclusivamente desde el backend (FastAPI)**. Nunca exponer API keys en el frontend. Usar variables de entorno con `python-dotenv`.

> 💡 **Escalabilidad futura:** `Mistral 7B` / `LLaMA 3` (texto), `Stable Diffusion XL` (imágenes) y `Coqui TTS` (audio) como alternativas open-source si se requiere migrar.

---

## 📡 Endpoints REST API (Planificados)

| Método | Endpoint | Descripción | Rol |
|--------|----------|-------------|-----|
| `POST` | `/auth/login` | Inicio de sesión | Todos |
| `GET` | `/preguntas` | Listar preguntas validadas | Pedagogo, Admin |
| `POST` | `/preguntas` | Registrar pregunta generada por IA | Pedagogo |
| `PUT` | `/preguntas/{id}/validar` | Aprobar o rechazar una pregunta | Pedagogo |
| `GET` | `/cuestionario` | Obtener 10 preguntas para el cuestionario | Estudiante |
| `POST` | `/respuestas` | Enviar respuestas del estudiante | Estudiante |
| `GET` | `/resultado/{id}` | Obtener informe VAK del estudiante | Estudiante |
| `GET` | `/admin/usuarios` | Gestión de usuarios | Admin |

---

## 🗺️ Roadmap del Proyecto

### Fase 1 — Planificación ✅ *(Etapa actual)*
- [x] Definición del flujo de la aplicación
- [x] Identificación de roles y responsabilidades
- [x] Selección del stack tecnológico
- [ ] Diseño de la base de datos (PostgreSQL)
- [ ] Diagramas C4 (Contexto, Contenedores, Componentes, Código)
- [ ] Diseño de mockups / wireframes

### Fase 2 — Desarrollo Backend
- [ ] Configuración del entorno y estructura del proyecto
- [ ] Implementación de autenticación y roles (JWT)
- [ ] Endpoints de gestión de preguntas
- [ ] Endpoint de cuestionario (GET 10 preguntas, sin repetición por período)
- [ ] Endpoint de recepción de respuestas

### Fase 3 — Desarrollo Frontend
- [ ] Panel de inicio de sesión
- [ ] Panel del pedagogo (validación de preguntas)
- [ ] Panel del estudiante (cuestionario + resultado)
- [ ] Panel del administrador (gestión de usuarios)

### Fase 4 — IA Generativa
- [ ] Integración del modelo generador de preguntas (texto)
- [ ] Integración del modelo generador de imágenes (VAK)
- [ ] Mecanismo anti-redundancia en la generación de preguntas
- [ ] Flujo automático de envío al pedagogo para revisión

### Fase 5 — Machine Learning
- [ ] Recolección y preparación del dataset
- [ ] Entrenamiento del modelo clasificador VAK
- [ ] Evaluación y ajuste del modelo
- [ ] Integración del modelo con el backend

### Fase 6 — Pruebas y Despliegue
- [ ] Pruebas unitarias e integración
- [ ] Pruebas con usuarios (pedagogo y estudiante)
- [ ] Despliegue en producción
- [ ] Documentación final

---

## ⚠️ Estado del Proyecto

> 🟡 **En Planificación Inicial** — El proyecto se encuentra en fase de diseño y definición de arquitectura.

---

## 📝 Notas

- El nombre **Math.E** es provisional y puede actualizarse.
- Los modelos de IA Generativa han sido definidos (ver sección **🤖 Modelos de IA Generativa**).
- El flujo de la aplicación está **por refinar**.

---

## 🏫 Institución

**Colegio Claretiano**