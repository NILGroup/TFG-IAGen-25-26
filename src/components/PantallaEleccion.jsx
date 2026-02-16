/**
 * PantallaEleccion.jsx
 *
 * Pantalla que aparece después del cuestionario inicial.
 * Muestra dos opciones al usuario:
 * 1. "Con ayuda" - Le guía con un formulario para crear un buen prompt
 * 2. "Directa" - Le permite escribir libremente sin ayuda
 */

import { useState } from "react";
import "../styles/PantallaEleccion.css";

export default function PantallaEleccion({ onSelectOption }) {
  const [showHistory, setShowHistory] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  return (
    <>
      {/* Header con botones */}
      <div className="header-bar">
        OlivIA
        <button
          className={`history-btn ${showHistory ? "open" : "closed"}`}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? <><span aria-hidden="true">📁 </span>Cerrar Historial</> : <><span aria-hidden="true">📂 </span>Abrir Historial</>}
        </button>
        <button
         
         className={`config-btn ${showConfig ? "open" : "closed"}`}
          onClick={() => setShowConfig(!showConfig)}
        >
          {showConfig ? <><span aria-hidden="true">⚙️ </span>Cerrar Configuración</> : <><span aria-hidden="true">⚙️ </span>Configuración</>}
        </button>

        {/* Panel de historial */}
        <div className={`chat-history-sidebar ${showHistory ? "show" : "hide"}`}>
          <h3><span aria-hidden="true">📚 </span>Historial de chats</h3>
          <p className="no-chats-message">Aún no hay conversaciones guardadas</p>
        </div>
      </div>

      {/* Panel de configuración */}
      {showConfig && (
        <div className="config-panel">
          <h2><span aria-hidden="true">⚙️ </span>Configuración</h2>
          <p>La configuración completa estará disponible en el chat.</p>
          <button
            className="back-btn"
            onClick={() => setShowConfig(false)}
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="eleccion-container">
      <div className="eleccion-content">
        {/* Título principal */}
        <h1 className="eleccion-title">¿Cómo quieres empezar?</h1>

        <p className="eleccion-subtitle">
          Elige la forma que prefieras para hablar con OlivIA
        </p>

        {/* Contenedor de las dos opciones */}
        <div className="eleccion-options">
          {/* OPCIÓN 1: Con ayuda (Formulario) */}
          <button
            className="eleccion-card card-blue"
            onClick={() => onSelectOption("formulario")}
            aria-label="Empezar con ayuda"
          >
            <span className="card-icon" aria-hidden="true">🧩</span>
            <span className="card-title card-title-blue">Con ayuda</span>
            <span className="card-description">
              Te haré unas preguntas sencillas para ayudarte a preparar tu mensaje
            </span>
            <span className="card-button button-blue">
              Empezar con ayuda →
            </span>
          </button>

          {/* OPCIÓN 2: Directa (Texto libre) */}
          <button
            className="eleccion-card card-green"
            onClick={() => onSelectOption("directa")}
            aria-label="Empezar directamente"
          >
            <span className="card-icon" aria-hidden="true">✏️</span>
            <span className="card-title card-title-green">Directa</span>
            <span className="card-description">
              Escribe directamente lo que quieras preguntarle a OlivIA
            </span>
            <span className="card-button button-green">
              Empezar directamente →
            </span>
          </button>
        </div>

        {/* Texto de ayuda adicional */}
        <p className="eleccion-hint">
          <span aria-hidden="true">💡 </span>Puedes cambiar de opción cuando quieras
        </p>
      </div>
    </div>
    </>
  );
}
