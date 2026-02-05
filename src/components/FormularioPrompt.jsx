/**
 * FormularioPrompt.jsx
 *
 * Formulario guiado con 5 preguntas para ayudar al usuario a construir
 * un prompt efectivo sin usar terminología técnica.
 */

import { useState } from "react";
import "../styles/FormularioPrompt.css";

export default function FormularioPrompt({ onComplete, onBack, summary }) {
  // Estados para cada pregunta
  const [pregunta1, setPregunta1] = useState(""); // Qué quieres que haga
  const [pregunta2, setPregunta2] = useState(""); // Tema
  const [pregunta3, setPregunta3] = useState(""); // Estilo de habla (rol)
  const [pregunta4, setPregunta4] = useState(""); // Tipo de respuesta
  const [pregunta5, setPregunta5] = useState(""); // Restricciones (opcional)

  // Estados para header
  const [showHistory, setShowHistory] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Función para generar el prompt optimizado
  const generarPrompt = () => {
    let promptGenerado = "";

    // Añadir el rol/estilo
    if (pregunta3 === "profesor") {
      promptGenerado += "Actúa como un profesor paciente y educativo. ";
    } else if (pregunta3 === "amigo") {
      promptGenerado += "Habla de forma amigable y cercana. ";
    } else if (pregunta3 === "creativo") {
      promptGenerado += "Sé creativo y usa ejemplos e historias para explicar. ";
    }

    // Añadir el objetivo principal
    promptGenerado += `${pregunta1}. `;

    // Añadir el tema/contexto
    if (pregunta2) {
      promptGenerado += `El tema es: ${pregunta2}. `;
    }

    // Añadir el formato de respuesta
    if (pregunta4 === "corta") {
      promptGenerado += "Dame una respuesta corta y sencilla. ";
    } else if (pregunta4 === "detallada") {
      promptGenerado += "Dame una respuesta con más detalles y explicaciones. ";
    } else if (pregunta4 === "listas") {
      promptGenerado += "Organiza tu respuesta en pasos o listas. ";
    }

    // Añadir restricciones si las hay
    if (pregunta5) {
      promptGenerado += `Por favor, evita: ${pregunta5}. `;
    }

    return promptGenerado;
  };

  // Función al enviar el formulario
  const handleSubmit = () => {
    const promptFinal = generarPrompt();
    onComplete(promptFinal);
  };

  // Validar que al menos las preguntas obligatorias estén respondidas
  const esFormularioValido = pregunta1 && pregunta3 && pregunta4;

  return (
    <>
      {/* Header con botones */}
      <div className="header-bar">
        OlivIA
        <button
          className={`history-btn ${showHistory ? "open" : "closed"}`}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
        </button>
        <button
          className={`config-btn ${showConfig ? "open" : "closed"}`}
          onClick={() => setShowConfig(!showConfig)}
        >
          {showConfig ? "⚙️ Cerrar Configuración" : "⚙️ Configuración"}
        </button>

        {/* Panel de historial */}
        <div className={`chat-history-sidebar ${showHistory ? "show" : "hide"}`}>
          <h3>📚 Historial de chats</h3>
          <p className="no-chats-message">Aún no hay conversaciones guardadas</p>
        </div>
      </div>

      {/* Panel de configuración */}
      {showConfig && (
        <div className="config-panel">
          <h2>⚙️ Configuración</h2>
          <p>La configuración completa estará disponible en el chat.</p>
          <button
            className="back-btn"
            onClick={() => setShowConfig(false)}
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="formulario-container">
      <div className="formulario-content">
        {/* Botón volver */}
        <button className="back-button" onClick={onBack}>
          ← Volver a elegir
        </button>

        {/* Título */}
        <h1 className="formulario-title">✨ Ayúdame a preparar mi pregunta</h1>
        <p className="formulario-subtitle">
          Responde estas preguntas para que OlivIA te entienda mejor
        </p>

        {/* PREGUNTA 1: Objetivo */}
        <div className="form-card card-purple">
          <label className="form-label label-purple">
            1. ¿Qué quieres que haga OlivIA por ti? *
          </label>
          <p className="form-helper">
            Por ejemplo: "Explícame algo", "Ayúdame con mis deberes", "Cuéntame sobre un tema"...
          </p>
          <textarea
            className="form-textarea"
            value={pregunta1}
            onChange={(e) => setPregunta1(e.target.value)}
            placeholder="Escribe aquí lo que necesitas..."
            rows={4}
          />
        </div>

        {/* PREGUNTA 2: Tema/Contexto */}
        <div className="form-card card-blue">
          <label className="form-label label-blue">
            2. ¿Sobre qué tema quieres hablar?
          </label>
          <p className="form-helper">
            Por ejemplo: "Animales", "Cocina", "Historia", "Deportes"...
          </p>
          <input
            type="text"
            className="form-input"
            value={pregunta2}
            onChange={(e) => setPregunta2(e.target.value)}
            placeholder="Escribe el tema aquí..."
          />
        </div>

        {/* PREGUNTA 3: Estilo/Rol */}
        <div className="form-card card-green">
          <label className="form-label label-green">
            3. ¿Cómo te gustaría que OlivIA te hablara? *
          </label>
          <p className="form-helper">Elige un estilo</p>
          <div className="button-group">
            <button
              type="button"
              className={`style-button ${pregunta3 === "profesor" ? "selected-green" : ""}`}
              onClick={() => setPregunta3("profesor")}
            >
              <span className="button-icon">👨‍🏫</span>
              Como un profesor
            </button>
            <button
              type="button"
              className={`style-button ${pregunta3 === "amigo" ? "selected-green" : ""}`}
              onClick={() => setPregunta3("amigo")}
            >
              <span className="button-icon">🥳</span>
              Como un amigo
            </button>
            <button
              type="button"
              className={`style-button ${pregunta3 === "creativo" ? "selected-green" : ""}`}
              onClick={() => setPregunta3("creativo")}
            >
              <span className="button-icon">🎨</span>
              De forma creativa
            </button>
          </div>
        </div>

        {/* PREGUNTA 4: Formato de respuesta */}
        <div className="form-card card-orange">
          <label className="form-label label-orange">
            4. ¿Cómo prefieres las respuestas? *
          </label>
          <p className="form-helper">Elige el tipo de respuesta que te gusta</p>
          <div className="button-group">
            <button
              type="button"
              className={`style-button ${pregunta4 === "corta" ? "selected-orange" : ""}`}
              onClick={() => setPregunta4("corta")}
            >
              <span className="button-icon">📝</span>
              Cortas y simples
            </button>
            <button
              type="button"
              className={`style-button ${pregunta4 === "detallada" ? "selected-orange" : ""}`}
              onClick={() => setPregunta4("detallada")}
            >
              <span className="button-icon">📚</span>
              Con más detalles
            </button>
            <button
              type="button"
              className={`style-button ${pregunta4 === "listas" ? "selected-orange" : ""}`}
              onClick={() => setPregunta4("listas")}
            >
              <span className="button-icon">📋</span>
              Con listas y pasos
            </button>
          </div>
        </div>

        {/* PREGUNTA 5: Restricciones (opcional) */}
        <div className="form-card card-red">
          <label className="form-label label-red">
            5. ¿Hay algo que NO quieres que mencione OlivIA? (opcional)
          </label>
          <p className="form-helper">
            Por ejemplo: "Palabras muy difíciles", "Temas complicados"...
          </p>
          <input
            type="text"
            className="form-input"
            value={pregunta5}
            onChange={(e) => setPregunta5(e.target.value)}
            placeholder="Déjalo vacío si no hay restricciones..."
          />
        </div>

        {/* Botón de continuar */}
        <button
          className={`submit-button ${!esFormularioValido ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!esFormularioValido}
        >
          Continuar al chat →
        </button>

        {!esFormularioValido && (
          <p className="validation-message">
            * Por favor, completa las preguntas marcadas con asterisco (*)
          </p>
        )}
      </div>
    </div>
    </>
  );
}
