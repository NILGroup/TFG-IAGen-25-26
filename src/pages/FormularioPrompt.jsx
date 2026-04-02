/**
 * FormularioPrompt.jsx
 *
 * Formulario guiado con 2 preguntas simples para ayudar al usuario
 * a construir su pregunta de forma sencilla.
 * Diseñado para usuarios con discapacidad cognitiva.
 */

import "../styles/Pantallas.css";
import { useState } from "react";
import ConfigPanel from "../components/ConfigPanel";
import ChatHistory from "../components/ChatHistory";

export default function FormularioPrompt({ onComplete, onBack, summary }) {
  // Estados para las 2 preguntas
  const [tema, setTema] = useState("");
  const [objetivo, setObjetivo] = useState("");

  // Estados para configuración
  const [showConfig, setShowConfig] = useState(false);
  const [savedEffect, setSavedEffect] = useState(false);
  const [tempSummary, setTempSummary] = useState({ ...summary });
  const [editingField, setEditingField] = useState(null);

  // Estados para historial
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatFlow, setChatFlow] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showHelpOptions, setShowHelpOptions] = useState(false);

  const toggleHistory = () => setShowHistory(!showHistory);

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
        SofIA

        <button
          className={`history-btn ${showHistory ? "open" : "closed"}`}
          onClick={toggleHistory}
        >
          {showHistory ? "Cerrar Historial" : "Abrir Historial"}
        </button>

        <button
          className={`config-btn ${showConfig ? "open" : "closed"}`}
          onClick={() => setShowConfig(!showConfig)}
        >
          {showConfig ? "Cerrar Configuración" : "Configuración"}
        </button>

        {/* Panel de historial */}
        <ChatHistory
          showHistory={showHistory}
          chatHistory={chatHistory}
          activeChat={activeChat}
          chatFlow={chatFlow}
          setActiveChat={setActiveChat}
          setChatFlow={setChatFlow}
          setShowChat={setShowChat}
          setShowHelpOptions={setShowHelpOptions}
          setChatHistory={setChatHistory}
        />
      </div>

      {/* Panel de configuración */}
      {showConfig && (
        <ConfigPanel
          summary={summary}
          tempSummary={tempSummary}
          setTempSummary={setTempSummary}
          savedEffect={savedEffect}
          setSavedEffect={setSavedEffect}
          setEditingField={setEditingField}
        />
      )}

      <div className="formulario-container">
        <div className="formulario-content">
        {/* Botón volver */}
        <button className="pantalla-back-btn" onClick={onBack}>
          Volver
        </button>

        {/* Título */}
        <h1 className="formulario-title">Prepara tu pregunta</h1>
        <p className="formulario-subtitle">
          Responde estas preguntas para que SofIA te entienda mejor
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
            2. ¿Qué quieres que haga SofIA por ti?
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
