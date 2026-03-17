# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OlivIA is an accessible web application designed for people with cognitive disabilities to interact with generative AI. The app adapts responses based on user preferences collected through an initial questionnaire, offering features like text-to-speech, simplified language, examples, and summaries.

## Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
npm run deploy   # Deploy to GitHub Pages (gh-pages -d dist)
```

## Tech Stack

- **React 19** with Vite
- **Chakra UI v3** for component library
- **Framer Motion** for animations
- **Tailwind CSS** (configured but currently commented out in vite.config.js)
- **Groq API** (LLaMA 3.3 70B) for AI responses

## Architecture

### Application Flow (src/App.jsx)

The app follows a step-based navigation controlled by `paso` state:
1. `cuestionario` - Initial questionnaire (Questionario.jsx)
2. `modo` - Mode selection: "profesor" or "familiar" (PantallaModo.jsx)
3. `eleccion` - Choice between guided form or direct chat (PantallaEleccion.jsx)
4. `formulario` - Guided prompt builder (FormularioPrompt.jsx)
5. `chat` - Main conversational interface (InterfazPrincipal.jsx)

### Key Data Flow

- `summary` object stores user preferences from questionnaire (nombre, discapacidad[], retos[], herramientas[])
- This summary is passed to InterfazPrincipal and used in `usePrompts.jsx` to build CO-STAR formatted prompts
- The hook builds personalized prompts with Context, Objective, Style, Tone, Audience, and Response sections

### Directory Structure

```
src/
  pages/           # Main page components (InterfazPrincipal, Questionario)
  components/      # Reusable components (Chat, ConfigPanel, etc.)
  components/ui/   # Chakra UI wrapper components
  hooks/           # Custom hooks (usePrompts.jsx - AI interaction logic)
  services/        # API functions (apiFunctions.js)
  styles/          # Component-specific CSS files
```

### API Integration (src/services/apiFunctions.js)

Uses a generic `fetchIA` function that can be extended for multiple providers. Currently configured for Groq API with LLaMA model. API key is read from `VITE_GROQ_LLAMA_API_KEY1` environment variable.

### Accessibility Features

- Speech synthesis for reading responses aloud (Web Speech API)
- Progress stepper with ARIA labels in questionnaire
- High contrast colors and large touch targets
- Options to simplify responses, request examples, or get synonyms

## Environment Variables

Required in `.env`:
```
VITE_GROQ_LLAMA_API_KEY1=your_groq_api_key
```

## Path Aliases

The project uses `@/` as an alias for `src/` (configured via vite-tsconfig-paths).
