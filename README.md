# SofIA – Tu compañera digital de Inteligencia Artificial

**SofIA** es una aplicación web diseñada con enfoque en la accesibilidad cognitiva (COGA) para que las personas con discapacidad intelectual puedan interactuar con inteligencias artificiales de forma sencilla y cómoda.

## Características principales

### Personalización desde el inicio
- Cuestionario inicial que recoge las necesidades y preferencias del usuario
- Elección de acompañante: **Profesor** (explica paso a paso) o **Familiar** (ayuda con cariño)
- Las respuestas de la IA se adaptan automáticamente al perfil del usuario

### Formatos de respuesta adaptables
- **Lectura Fácil**: Respuestas con palabras sencillas y frases cortas
- **Con ejemplos**: Explicaciones usando comparaciones cotidianas
- **Con listas**: Información organizada punto por punto
- **Respuestas cortas**: Explicaciones breves y directas
- **Frases cortas**: Cada idea en una frase separada

### Herramientas de ayuda
- Botones para pedir más detalles, ejemplos o simplificar respuestas
- Lectura en voz alta de las respuestas
- Tooltip de ayuda al seleccionar texto
- Panel de glosario con términos explicados

### Gestión de conversaciones
- Historial de todas las conversaciones guardadas
- Posibilidad de recordar respuestas favoritas
- Títulos automáticos generados por IA para cada conversación
- Retomar conversaciones anteriores

## Tecnologías utilizadas

- **React 19** con Vite
- **Chakra UI** para componentes accesibles
- **APIs de IA**: Groq, Google Gemini, Ollama

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/NILGroup/TFG-IAGen-25-26.git

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

### Configuración del backend
El frontend no necesita `.env` propio para hablar con el backend. La única configuración sensible vive en `backend/.env`.

## Estructura del proyecto

```
/src
├── App.jsx                  # Orquestador principal
├── /pages                   # Pantallas principales
│   ├── Questionario.jsx     # Cuestionario inicial
│   ├── PantallaRol.jsx      # Selección de rol
│   └── InterfazPrincipal.jsx# Chat principal
├── /components              # Componentes reutilizables
├── /hooks                   # Lógica reutilizable
├── /services                # Conexión con APIs
└── /styles                  # Estilos CSS
```

## Accesibilidad

SofIA está diseñada siguiendo las pautas COGA (Cognitive Accessibility) y WCAG:

- Navegación lineal y predecible
- Lenguaje claro en toda la interfaz
- Adaptación automática a Lectura Fácil
- Roles WAI-ARIA para tecnologías de asistencia
- Avisos de cambios sin guardar
- Contraste adecuado y diseño limpio

## Licencia

Proyecto desarrollado como Trabajo de Fin de Grado.
