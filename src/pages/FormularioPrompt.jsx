/**
 * FormularioPrompt.jsx
 *
 * Formulario guiado con 2 preguntas simples para ayudar al usuario
 * a construir su pregunta de forma sencilla.
 * Diseñado para usuarios con discapacidad cognitiva.
 */

import "../styles/Pantallas.css";
import { useState } from "react";
import PanelGlosario from "../components/PanelGlosario";

export default function FormularioPrompt({ onComplete, onBack, summary }) {
  // Estados para las 2 preguntas
  const [tema, setTema] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [objetivoPersonalizado, setObjetivoPersonalizado] = useState(false);

  const opcionesObjetivo = [
    { id: "explicame", texto: "Explícame", descripcion: "Quiero entender algo" },
    { id: "ayudame", texto: "Ayúdame con...", descripcion: "Necesito hacer algo" },
    { id: "busca", texto: "Busca información", descripcion: "Quiero saber más" },
    { id: "ejemplos", texto: "Dame ejemplos", descripcion: "Quiero ver casos" },
  ];

  // Seleccionar una opción predefinida
  const seleccionarObjetivo = (texto) => {
    setObjetivo(texto);
    setObjetivoPersonalizado(false);
  };

  // Activar modo personalizado
  const activarPersonalizado = () => {
    setObjetivoPersonalizado(true);
    setObjetivo("");
  };

  // Estado para glosario
  const [showGlosario, setShowGlosario] = useState(false);

  // Función para generar el prompt
  const generarPrompt = () => {
    let promptGenerado = "";

    // Añadir el objetivo
    if (objetivo) {
      promptGenerado += `${objetivo}`;
    }

    // Añadir el tema
    if (tema) {
      promptGenerado += ` sobre ${tema}`;
    }

    return promptGenerado.trim();
  };

  // Función al enviar el formulario
  const handleSubmit = () => {
    const promptFinal = generarPrompt();
    onComplete(promptFinal);
  };

  // Validar que ambas preguntas estén respondidas
  const esFormularioValido = tema.trim() !== "" && objetivo.trim() !== "";

  return (
    <div className="app-wrapper">
      {/* Header con logo y botones */}
      <div className="header-bar">
        <div className="header-bar-container">
          <h1
            className="header-bar-title"
            onClick={onBack}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onBack();
              }
            }}
          >
            SofIA
          </h1>
        </div>
      </div>

      {/* Botón de Diccionario tipo dropdown - izquierda */}
      <div className="diccionario-dropdown-container">
        <button
          className="diccionario-dropdown-btn"
          onClick={() => setShowGlosario(!showGlosario)}
          aria-label="Abrir diccionario"
          aria-expanded={showGlosario}
        >
          <span className="diccionario-dropdown-texto">Diccionario</span>
          <span className="diccionario-dropdown-icono">▼</span>
        </button>
      </div>

      <div className="formulario-container">
        <div className="formulario-content">
        {/* Botón volver */}
        <button className="pantalla-back-btn" onClick={onBack}>
          Volver
        </button>

        {/* Título */}
        <h1 className="formulario-title">Vamos a crear tu pregunta</h1>
        <p className="formulario-subtitle">
          Contesta estas dos preguntas
        </p>

        {/* PREGUNTA 1: Objetivo (PRIMERO) */}
        <div className="formulario-card">
          <label className="formulario-label">
            1. ¿Qué quieres saber?
          </label>
          <p className="formulario-helper">
            Elige una opción o escribe tú
          </p>

          {/* Botones predefinidos */}
          <div className="formulario-opciones-grid">
            {opcionesObjetivo.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={`formulario-opcion-btn ${objetivo === opcion.texto && !objetivoPersonalizado ? 'selected' : ''}`}
                onClick={() => seleccionarObjetivo(opcion.texto)}
              >
                <span className="formulario-opcion-texto">{opcion.texto}</span>
                <span className="formulario-opcion-desc">{opcion.descripcion}</span>
              </button>
            ))}
          </div>

          {/* Opción de escribir personalizado */}
          <button
            type="button"
            className={`formulario-personalizado-btn ${objetivoPersonalizado ? 'active' : ''}`}
            onClick={activarPersonalizado}
          >
            Otra cosa (escribir yo)
          </button>

          {objetivoPersonalizado && (
            <textarea
              className="formulario-textarea"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Escribe aquí lo que quieres saber..."
              rows={2}
            />
          )}
        </div>

        {/* PREGUNTA 2: Tema (SEGUNDO) */}
        {/* Ejemplos basados en: PMC9543174, Plena Inclusión Murcia, Opportunity Village */}
        <div className="formulario-card">
          <label className="formulario-label">
            2. ¿Sobre qué tema?
          </label>
          <p className="formulario-helper">
            Por ejemplo: animales, música, deportes, cocina, películas, videojuegos
          </p>
          <input
            type="text"
            className="formulario-input"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Escribe el tema aquí..."
          />
        </div>

        {/* Botón de enviar */}
        <button
          className={`formulario-submit-btn ${!esFormularioValido ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!esFormularioValido}
        >
          Enviar pregunta
        </button>

        {!esFormularioValido && (
          <p className="formulario-validation">
            Escribe en las dos cajas para continuar
          </p>
        )}
        </div>
      </div>

      {/* Panel de Glosario */}
      <PanelGlosario
        isOpen={showGlosario}
        onClose={() => setShowGlosario(false)}
      />
    </div>
  );
}
