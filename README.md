# SofIA — Asistente conversacional accesible para personas con discapacidad intelectual

**SofIA** es una aplicación web desarrollada como Trabajo de Fin de Grado (TFG) en la Facultad de Informática de la Universidad Complutense de Madrid. Su objetivo es eliminar las barreras que las personas con discapacidad intelectual encuentran al utilizar asistentes basados en grandes modelos de lenguaje (LLM): interfaces complejas, lenguaje técnico y la exigencia de formular preguntas bien estructuradas.

SofIA aplica los **patrones de diseño cognitivo de Moreno et al. (2023)**, las pautas **COGA** (Cognitive Accessibility) del W3C y los criterios de **Lectura Fácil**, tanto en la interfaz como en las respuestas que genera la IA.

---

## Contexto y motivación

Este proyecto continúa la línea de trabajo iniciada por **OlivIA 1.0** y **OlivIA 2.0**, que sentaron las bases de un asistente accesible pero dejaron pendientes aspectos clave. SofIA aborda esas carencias de forma sistemática:

| Carencia previa | Solución en SofIA |
|---|---|
| Interfaz solo parcialmente accesible | Rediseño completo aplicando criterios reales de accesibilidad cognitiva: contraste y paleta de colores adecuados, alineación y jerarquía visual consistentes, elementos pensados para mantener la atención del usuario y reducir la carga cognitiva |
| Faltaban textos en Lectura Fácil en interfaz y respuestas | Lectura Fácil aplicada en UI y como formato seleccionable de respuesta |
| Sin interacción directa con el contenido de la respuesta | Tooltip contextual sobre texto seleccionado (reformular, definir, sinónimos) |
| Sin estudio comparativo de modelos | Enrutador dinámico real basado en estudio empírico de prompting |

---

## Características principales

### Personalización desde el inicio
- **Cuestionario inicial de cinco pasos** que recoge nombre, perfil cognitivo (discapacidad intelectual, grado), dificultades principales (leer, entender, escribir) y formatos de salida preferidos.
- **Perfil cognitivo centralizado**: toda la información se consolida en un perfil que se traduce automáticamente en un *prompt* estructurado mediante el framework **CO-STAR**, adaptando estilo, complejidad y tono de cada respuesta a las necesidades reales del usuario.
- **Edición del perfil** en cualquier momento desde el botón *Perfil*.

### Acompañante personalizable
- **Profesor** — Explica como un experto, paso a paso.
- **Familiar** — Ayuda con cercanía y cariño, como lo haría un familiar.
- El rol elegido condiciona el tono del sistema y el avatar que aparece junto a las respuestas.

### Formatos de respuesta adaptables
El usuario puede combinar varios formatos (también modificables desde el panel de configuración en cualquier momento):
- **Lectura Fácil** — Palabras sencillas, frases cortas.
- **Con ejemplos** — Explicaciones usando comparaciones cotidianas.
- **Con listas** — Información organizada punto por punto.
- **Respuestas cortas** — Explicaciones breves y directas.
- **Frases cortas** — Cada idea en una frase separada.

### Interacción directa con el contenido
- **Menú contextual** al seleccionar cualquier fragmento de texto de una respuesta: *reformular*, *definir* o *sinónimos*, directamente sobre el punto de interés, sin necesidad de enviar nuevas consultas.
- **Botones de interacción** para pedir más detalles, ejemplos, simplificar o repetir.
- **Lectura en voz alta** (Web Speech API).

### Diccionario personal
- Todas las consultas léxicas realizadas (definiciones, sinónimos) se guardan en un **glosario personal** del usuario.
- Buscador y paginación dentro del panel de glosario.

### Gestión de conversaciones
- **Historial** de conversaciones guardadas.
- **Favoritos** para recordar respuestas concretas.
- Posibilidad de **retomar** conversaciones anteriores.
- Confirmación al salir si hay cambios sin guardar.

### Arquitectura multi-modelo con enrutador dinámico (aportación técnica diferencial)
SofIA da el paso que sus predecesoras no completaron: en lugar de depender de un único proveedor de IA, integra un **enrutador dinámico real** ([`src/services/apiFunctions.js`](src/services/apiFunctions.js)) basado en un **estudio comparativo de cinco técnicas de prompting** —*zero-shot*, *one-shot*, *few-shot*, *chain-of-thought* y *role-prompting*— evaluadas sobre **cuatro modelos de lenguaje**.

Los resultados demostraron que ningún modelo ofrece un rendimiento óptimo para todas las técnicas, lo que motivó la adopción de una arquitectura multi-modelo que asigna cada petición al modelo más adecuado según la tarea concreta:

| Técnica de prompting | Disparador | Modelo seleccionado |
|---|---|---|
| **Chain of Thought (CoT)** | Formato *paso a paso* | `openai/gpt-oss-120b` (Groq) |
| **Few-shot** | Solo *ejemplos* | `llama-3.3-70b-versatile` (Groq) |
| **One-shot** | Salidas estructuradas múltiples | `openai/gpt-oss-120b` (Groq) |
| **Zero-shot** | Respuesta directa por defecto | `llama-3.3-70b-versatile` (Groq) |

Incluye **fallback automático** a Llama 3.3 si el modelo principal falla.

### Adaptación automática a Lectura Fácil
Tras analizar las herramientas existentes de traducción a Lectura Fácil y constatar sus limitaciones en disponibilidad, latencia y calidad de reescritura, se realizó un estudio comparativo sobre la capacidad de distintos modelos de lenguaje para adaptar textos a la **norma AENOR (2018)**. A partir de esos resultados se definió un flujo de adaptación propio que opera de forma transparente para el usuario, sin interrumpir el ritmo de la conversación.

---

## Tecnologías utilizadas

- **React 19** + **Vite 6**
- **Chakra UI 3** + **Emotion** + **Framer Motion** — componentes accesibles y animaciones
- **react-markdown** + **remark-gfm** + **rehype-raw** — renderizado enriquecido de respuestas
- **Tailwind CSS 4** (parcial)
- **APIs de IA**: Groq (Llama 3.3, GPT-oss-120b), Google Gemini
- **Web Speech API** — lectura en voz alta
- **gh-pages** — despliegue

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/NILGroup/TFG-IAGen-25-26.git
cd TFG-IAGen-25-26

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

Antes de arrancar, crear un archivo `.env` en la raíz del proyecto con las claves necesarias:

```env
# Para el frontend (Vite) si usas llamadas directas desde el cliente:
# (estos prefijos 'VITE_' expondrán variables al cliente)
VITE_GROQ_LLAMA_API_KEY1=tu_api_key_de_groq
VITE_GEMINI_API_KEY=tu_api_key_de_gemini

# Variables usadas por el servidor backend (proxy de APIs):
# Estas se usan en `backend/server.js` y no se exponen al cliente.
GROQ_API_KEY=tu_api_key_de_groq
GEMINI_API_KEY=tu_api_key_de_gemini
```

- **Groq**: https://console.groq.com/keys
- **Gemini**: https://aistudio.google.com/app/apikey
- **Ollama** (opcional, local): se conecta a `http://localhost:11434` y no requiere clave.


## Notas sobre el backend y las rutas de la API

- El backend (carpeta `backend/`) actúa como proxy para mantener las claves en servidor. Las rutas actuales del servidor son rutas POST en:
	- `/groq` — manejar peticiones hacia Groq
	- `/gemini` — manejar peticiones hacia Gemini

- Si tu frontend envía peticiones a `/api/groq` o `/api/*`, ten en cuenta que en esta versión las rutas no llevan el prefijo `/api/`. Ajusta la configuración del proxy de desarrollo (o el código del cliente) para apuntar a `/groq` y `/gemini`, o añade una regla de reescritura en tu servidor/proxy.

- El servidor se enlaza a `0.0.0.0` para permitir accesos desde contenedores Docker.

---

## Accesibilidad

SofIA está diseñada siguiendo las pautas **COGA** del W3C, los principios **WCAG**, los criterios de **Lectura Fácil** y los **patrones de diseño cognitivo de Moreno et al. (2023)**:

- Navegación lineal, predecible y con barra de progreso en el cuestionario.
- Lenguaje claro y consistente en toda la interfaz.
- Adaptación automática a Lectura Fácil en las respuestas.
- Roles WAI-ARIA y `aria-label` para tecnologías de asistencia.
- Avisos antes de perder cambios sin guardar.
- Contraste y tipografía pensados para legibilidad.
- Avatares y refuerzo visual del rol de acompañamiento.
