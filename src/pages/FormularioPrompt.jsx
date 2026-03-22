/**
 * FormularioPrompt.jsx
 *
 * Formulario guiado con 2 preguntas simples para ayudar al usuario
 * a construir su pregunta de forma sencilla.
 * Diseñado para usuarios con discapacidad cognitiva.
 */

import "../styles/Pantallas.css";
import { useState } from "react";

export default function FormularioPrompt({ onComplete, onBack, summary, onOpenGlossary, onOpenConfig }) {
  // Estados para las 2 preguntas
  const [tema, setTema] = useState("");
  const [objetivo, setObjetivo] = useState("");

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
      {/* Header con logo y botones de paneles */}
      <div className="header-bar">
        <button
          className="header-panel-btn header-panel-btn-left"
          onClick={onOpenGlossary}
          aria-label="Abrir diccionario"
        >
          Diccionario
        </button>
        <span className="header-title">OlivIA</span>
        <button
          className="header-panel-btn header-panel-btn-right"
          onClick={onOpenConfig}
          aria-label="Abrir configuración"
        >
          Configuración
        </button>
      </div>

      <div className="formulario-container">
        <div className="formulario-content">
        {/* Botón volver a elegir modo */}
        <button className="back-to-choice-btn" onClick={onBack}>
          Volver a elegir modo
        </button>

        {/* Título */}
        <h1 className="formulario-title">Prepara tu pregunta</h1>
        <p className="formulario-subtitle">
          Responde estas preguntas para que OlivIA te entienda mejor
        </p>

        {/* PREGUNTA 1: Tema */}
        <div className="formulario-card">
          <label className="formulario-label">
            1. ¿Sobre qué tema quieres hablar?
          </label>
          <p className="formulario-helper">
            Por ejemplo: Animales, Cocina, Historia, Deportes...
          </p>
          <input
            type="text"
            className="formulario-input"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Escribe el tema aquí..."
          />
        </div>

        {/* PREGUNTA 2: Objetivo */}
        <div className="formulario-card">
          <label className="formulario-label">
            2. ¿Qué quieres que haga OlivIA por ti?
          </label>
          <p className="formulario-helper">
            Por ejemplo: Explícame, Ayúdame a entender, Cuéntame, Dame ejemplos de...
          </p>
          <textarea
            className="formulario-textarea"
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Escribe aquí lo que necesitas..."
            rows={3}
          />
        </div>

        {/* Botón de continuar */}
        <button
          className={`formulario-submit-btn ${!esFormularioValido ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!esFormularioValido}
        >
          Continuar al chat
        </button>

        {!esFormularioValido && (
          <p className="formulario-validation">
            Completa las dos preguntas para continuar
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
