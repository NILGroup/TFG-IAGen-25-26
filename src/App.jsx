/**
 * App.jsx
 *
 * Punto de entrada de la aplicación SofIA.
 * Controla la navegación entre el cuestionario inicial (`Questionario`)
 * y la interfaz principal conversacional (`InterfazPrincipal`).
 *
 * Flujo simplificado para accesibilidad cognitiva (COGA):
 * Cuestionario → Elegir Rol → Pregunta Directa → Chat
 *
 * Características de accesibilidad:
 * - Navegación lineal y predecible (COGA 3.3.2)
 * - Reducción de pasos intermedios (COGA 2.4.1)
 * - Lenguaje claro en cada pantalla (COGA 4.2.1)
 * - Consistencia en botones de navegación (WCAG 3.2.3)
 */

import { useState } from "react";
import Questionario from "./pages/Questionario";
import PantallaRol from "./pages/PantallaRol";
import QuestionPromptPanel from "./components/QuestionPromptPanel";
import InterfazPrincipal from "./pages/InterfazPrincipal";
import PaginaPerfil from "./pages/PaginaPerfil";
import HistoryModal from "./components/HistoryModal";
import "./App.css";

export default function App() {
  // ========================================
  // ESTADOS DE NAVEGACIÓN
  // ========================================
  
  // Paso actual: "cuestionario", "modo", "questionPrompt", "chat", "perfil"
  const [paso, setPaso] = useState("cuestionario");
  
  // Datos del perfil del usuario (del cuestionario)
  const [summary, setSummary] = useState(null);
  
  // Modo seleccionado: "profesor" o "familiar"
  const [modoSeleccionado, setModoSeleccionado] = useState(null);
  
  // Texto de la pregunta que el usuario escribe en QuestionPromptPanel
  const [preguntaInicial, setPreguntaInicial] = useState("");
  
  // Estado de carga mientras se envía la primera pregunta
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Paso anterior (para volver desde el perfil)
  const [pasoAnterior, setPasoAnterior] = useState(null);

  // ========================================
  // ESTADOS DEL HISTORIAL
  // ========================================
  
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [chatToResume, setChatToResume] = useState(null);

  // ========================================
  // FUNCIONES DE NAVEGACIÓN
  // ========================================

  /**
   * 1. Cuando termina el cuestionario inicial
   * Guarda los datos del usuario y avanza a elegir rol.
   */
  const handleQuestionnaireComplete = (data) => {
    setSummary(data);
    setPaso("modo");
  };

  /**
   * 2. Cuando el usuario elige modo (Profesor / Familia)
   * Guarda el modo y avanza directamente a escribir la primera pregunta.
   */
  const handleModoComplete = (modo) => {
    setModoSeleccionado(modo);
    setPaso("questionPrompt");
  };

  /**
   * 3. Cuando el usuario envía su primera pregunta
   * Guarda la pregunta y navega al chat.
   */
  const handleSendFirstPrompt = (pregunta) => {
    setIsSubmitting(true);
    
    // Guardar la pregunta y navegar al chat
    setPreguntaInicial(pregunta);
    setPaso("chat");
    
    // Limpiar el estado de carga después de la navegación
    setTimeout(() => setIsSubmitting(false), 100);
  };

  /**
   * 4. Para volver a la pantalla de rol desde QuestionPromptPanel
   */
  const handleVolverARol = () => {
    setPreguntaInicial("");
    setPaso("modo");
  };

  /**
   * 5. Cuando se finaliza una conversación desde el chat
   * Guarda la conversación en el historial y vuelve a pregunta inicial.
   */
  const handleFinalizarConversacion = (chatEntry, originalChat = null) => {
    if (chatEntry) {
      if (originalChat) {
        // Actualizar chat existente
        setChatHistory(prev =>
          prev.map(entry =>
            entry === originalChat
              ? { ...chatEntry, isNew: false }
              : { ...entry, isNew: false }
          )
        );
      } else {
        // Añadir nuevo chat al historial
        setChatHistory(prev => [
          ...prev.map(entry => ({ ...entry, isNew: false })),
          { ...chatEntry, isNew: true }
        ]);
      }
    }
    
    // Limpiar y volver a la pantalla de pregunta
    setPreguntaInicial("");
    setChatToResume(null);
    setPaso("questionPrompt");
  };

  /**
   * 6. Para iniciar una nueva conversación desde el chat
   * Vuelve a QuestionPromptPanel para escribir una nueva pregunta.
   */
  const handleNuevaConversacion = () => {
    setPreguntaInicial("");
    setChatToResume(null);
    setPaso("questionPrompt");
  };

  /**
   * 7. Para seleccionar un chat del historial y retomarlo
   */
  const handleSelectChatFromHistory = (entry) => {
    setChatToResume(entry);
    setShowHistoryModal(false);
    setPaso("chat");
  };

  /**
   * 8. Para eliminar una conversación del historial
   */
  const handleDeleteChat = (entryToDelete) => {
    setChatHistory(prev => prev.filter(entry => entry !== entryToDelete));
    
    if (chatToResume === entryToDelete) {
      setChatToResume(null);
    }
  };

  /**
   * 9. Para ir a la página de perfil
   */
  const handleIrAPerfil = () => {
    setPasoAnterior(paso);
    setPaso("perfil");
  };

  /**
   * 10. Para volver desde la página de perfil
   */
  const handleVolverDesdePerfil = () => {
    setPaso(pasoAnterior || "questionPrompt");
  };

  /**
   * 11. Para guardar cambios en el perfil
   */
  const handleSaveProfile = (updatedSummary) => {
    setSummary(updatedSummary);
  };

  // ========================================
  // RENDERIZADO CONDICIONAL
  // ========================================
  
  // Las páginas chat y perfil tienen su propio header
  const paginasConHeaderPropio = paso === "chat" || paso === "perfil";

  return (
    <div className="app-wrapper">
      {/* Barra superior - solo para páginas sin header propio */}
      {!paginasConHeaderPropio && (
        <div className="header-bar">
          <div className="header-bar-container">
            {/* Izquierda: botón Historial */}
            {chatHistory.length > 0 && (
              <div className="header-bar-left">
                <button
                  className="header-historial-btn"
                  onClick={() => setShowHistoryModal(true)}
                  aria-label={`Abrir historial. ${chatHistory.length} conversaciones guardadas`}
                >
                  <span className="header-historial-texto">Historial</span>
                </button>
              </div>
            )}

            {/* Título central - clickeable para ir a QuestionPromptPanel */}
            <h1
              className="header-bar-title"
              onClick={() => {
                // Solo navegar si ya ha completado el cuestionario y elegido rol
                if (summary && modoSeleccionado) {
                  setPreguntaInicial("");
                  setChatToResume(null);
                  setPaso("questionPrompt");
                }
              }}
              role={summary && modoSeleccionado ? "button" : undefined}
              tabIndex={summary && modoSeleccionado ? 0 : undefined}
              onKeyPress={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && summary && modoSeleccionado) {
                  e.preventDefault();
                  setPreguntaInicial("");
                  setChatToResume(null);
                  setPaso("questionPrompt");
                }
              }}
              style={{ cursor: summary && modoSeleccionado ? 'pointer' : 'default' }}
              aria-label={summary && modoSeleccionado ? "Ir a nueva conversación" : "SofIA"}
            >
              SofIA
            </h1>

            {/* Derecha: botón Perfil */}
            {summary && (
              <div className="header-bar-right">
                <button
                  className="boton-perfil"
                  onClick={handleIrAPerfil}
                  aria-label="Ir a mi perfil"
                >
                  Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================
          PANTALLAS DE LA APLICACIÓN
          Flujo lineal simplificado:
          Cuestionario → Elegir Rol → Pregunta → Chat
          ======================================== */}

      {/* Paso 1: Cuestionario inicial */}
      {paso === "cuestionario" && (
        <Questionario onComplete={handleQuestionnaireComplete} />
      )}

      {/* Paso 2: Elegir entre Profesor o Familiar */}
      {paso === "modo" && (
        <PantallaRol onSelectMode={handleModoComplete} />
      )}

      {/* Paso 3: Escribir la primera pregunta */}
      {paso === "questionPrompt" && (
        <QuestionPromptPanel
          onBack={handleVolverARol}
          userName={summary?.nombre}
          prompt={preguntaInicial}
          setPrompt={setPreguntaInicial}
          sendPrompt={handleSendFirstPrompt}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Paso 4: Chat conversacional */}
      {paso === "chat" && (
        <InterfazPrincipal
          summary={summary}
          modoSeleccionado={modoSeleccionado}
          promptInicial={preguntaInicial}
          onBack={handleNuevaConversacion}
          onIrAPerfil={handleIrAPerfil}
          chatHistoryGlobal={chatHistory}
          setChatHistoryGlobal={setChatHistory}
          chatToResume={chatToResume}
          onFinalizarConversacion={handleFinalizarConversacion}
        />
      )}

      {/* Paso 5: Página de perfil (accesible desde cualquier pantalla) */}
      {paso === "perfil" && (
        <PaginaPerfil
          summary={summary}
          onSave={handleSaveProfile}
          onBack={handleVolverDesdePerfil}
        />
      )}

      {/* Modal de Historial - Accesible desde cualquier pantalla */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        chatHistory={chatHistory}
        activeChat={chatToResume}
        onSelectChat={handleSelectChatFromHistory}
        onDeleteChat={handleDeleteChat}
      />
    </div>
  );
}