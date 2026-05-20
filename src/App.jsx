/**
 * App.jsx
 *
 * Punto de entrada de la aplicación SofIA.
 * Controla la navegación entre el cuestionario inicial (`Questionario`)
 * y la interfaz principal conversacional (`InterfazPrincipal`).
 *
 * Flujo simplificado para accesibilidad cognitiva (COGA):
 * Cuestionario → Elegir Rol → Pregunta Directa → Chat
 */

import { Suspense, lazy, useState } from "react";
import Questionario from "./pages/Questionario";
import "./App.css";

const PantallaRol = lazy(() => import("./pages/PantallaRol"));
const QuestionPromptPanel = lazy(() => import("./components/QuestionPromptPanel"));
const InterfazPrincipal = lazy(() => import("./pages/InterfazPrincipal"));
const HistoryModal = lazy(() => import("./components/HistoryModal"));
const FavoritosModal = lazy(() => import("./components/FavoritosModal"));
const ProfileModal = lazy(() => import("./components/ProfileModal"));
const BASE = import.meta.env.BASE_URL;
const robotLogo = `${BASE}AventurIA_robot_sinfondo.png`;

export default function App() {
  // ========================================
  // ESTADOS DE NAVEGACIÓN
  // ========================================
  
  // Paso actual: "cuestionario", "modo", "questionPrompt", "chat"
  const [paso, setPaso] = useState("cuestionario");

  // Datos del perfil del usuario (del cuestionario)
  const [summary, setSummary] = useState(null);

  // Modo seleccionado: "profesor" o "familiar"
  const [modoSeleccionado, setModoSeleccionado] = useState(null);

  // Texto de la pregunta que el usuario escribe en QuestionPromptPanel
  const [preguntaInicial, setPreguntaInicial] = useState("");

  // Estado de carga mientras se envía la primera pregunta
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del modal de perfil
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ========================================
  // ESTADOS DEL HISTORIAL
  // ========================================

  const [chatHistory, setChatHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [chatToResume, setChatToResume] = useState(null);

  // ========================================
  // ESTADOS DE FAVORITOS
  // ========================================

  const [favorites, setFavorites] = useState([]);
  const [showFavoritosModal, setShowFavoritosModal] = useState(false);

  // ========================================
  // FUNCIONES DE NAVEGACIÓN
  // ========================================

  /**
   * 1. Cuando termina el cuestionario inicial
   * Guarda los datos del usuario y avanza a elegir rol.
   */
  const handleQuestionnaireComplete = (data) => {
    setSummary({
      ...data,
      responseConfig: data.responseConfig || data.herramientas || [],
      routingPreference: data.routingPreference || "automatic",
    });
    setPaso("modo");
  };

  /**
   * 2. Cuando el usuario elige modo (Profesor / Familia)
   * Guarda el modo y avanza directamente a escribir la primera pregunta.
   * También sincroniza el rol en el perfil del usuario.
   */
  const handleModoComplete = (modo) => {
    setModoSeleccionado(modo);
    // Sincronizar el rol en el perfil
    if (summary) {
      setSummary(prev => ({
        ...prev,
        rol: modo,
        routingPreference: prev.routingPreference || "automatic",
      }));
    }
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
   * Sincroniza el rol cuando cambia desde InterfazPrincipal (panel de configuración)
   */
  const handleRoleChange = (newRole) => {
    setModoSeleccionado(newRole);
    if (summary) {
      setSummary(prev => ({
        ...prev,
        rol: newRole,
        routingPreference: prev.routingPreference || "automatic",
      }));
    }
  };

  /**
   * 11. Para guardar la preferencia de enrutamiento
   */
  const handleRoutingPreferenceChange = (routingPreference) => {
    if (summary) {
      setSummary(prev => ({
        ...prev,
        routingPreference,
      }));
    }
  };

  /**
   * 12. Para guardar la configuración de formato de respuestas
   */
  const handleResponseConfigChange = (responseConfig) => {
    if (summary) {
      setSummary(prev => ({
        ...prev,
        responseConfig,
        herramientas: responseConfig,
      }));
    }
  };

  /**
   * 5. Cuando se finaliza una conversación desde el chat
   * Guarda o actualiza la conversación en el historial.
   */
  const handleFinalizarConversacion = (chatEntry, chatOriginal = null) => {
    if (!chatEntry) return;
    
    if (chatOriginal) {
      // Actualizar chat existente (retomado del historial)
      setChatHistory(prev =>
        prev.map(entry =>
          entry.id === chatOriginal.id
            ? { ...chatEntry, id: chatOriginal.id }
            : entry
        )
      );
    } else {
      // Añadir nuevo chat al historial con ID único
      const newChat = {
        ...chatEntry,
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      setChatHistory(prev => [...prev, newChat]);
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
    setChatHistory(prev => prev.filter(entry => entry.id !== entryToDelete.id));
    
    if (chatToResume?.id === entryToDelete.id) {
      setChatToResume(null);
    }
  };

  /**
   * 9. Para abrir el modal de perfil
   */
  const handleIrAPerfil = () => {
    setShowProfileModal(true);
  };

  /**
   * 10. Para guardar cambios en el perfil
   */
  const handleSaveProfile = (updatedSummary) => {
    setSummary({
      ...updatedSummary,
      responseConfig: updatedSummary.responseConfig || updatedSummary.herramientas || [],
      routingPreference: updatedSummary.routingPreference || summary?.routingPreference || "automatic",
    });
    setModoSeleccionado(updatedSummary?.rol || null);
  };

  // ========================================
  // RENDERIZADO CONDICIONAL
  // ========================================
  
  // La página chat tiene su propio header
  const paginasConHeaderPropio = paso === "chat";

  return (
    <div className="app-wrapper">
      {/* Barra superior - solo para páginas sin header propio */}
      {!paginasConHeaderPropio && (
        <div className="header-bar">
          <div className="header-bar-container">
            {/* Izquierda: botón Historial */}
            {summary &&
              <div className="header-bar-left">
                <button
                  className="header-historial-btn"
                  onClick={() => setShowHistoryModal(true)}
                  aria-label={`Abrir historial. ${chatHistory.length} conversaciones guardadas`}
                >
                  <span className="header-historial-texto">Historial</span>
                </button>
              </div>
            }

            {/* Título central - clickeable para ir a QuestionPromptPanel */}
            <h1
              className="header-bar-title"
              onClick={() => {
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
              <img src={robotLogo} alt="Robot SofIA" className="header-robot-logo" fetchPriority="high" />
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
        <PantallaRol onSelectMode={handleModoComplete} selectedMode={modoSeleccionado || summary?.rol || "profesor"} />
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
            favorites={favorites}
            avatarMode={modoSeleccionado || summary?.rol || "profesor"}
            onOpenFavoritos={() => setShowFavoritosModal(true)}
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
            favoritesGlobal={favorites}
            setFavoritesGlobal={setFavorites}
            onRoleChange={handleRoleChange}
            onRoutingPreferenceChange={handleRoutingPreferenceChange}
            onResponseConfigChange={handleResponseConfigChange}
          />
      )}

      {/* Modal de Perfil - Accesible desde cualquier pantalla */}
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          summary={summary}
          onSave={handleSaveProfile}
        />

      {/* Modal de Historial - Accesible desde cualquier pantalla */}
        <HistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          chatHistory={chatHistory}
          activeChat={chatToResume}
          onSelectChat={handleSelectChatFromHistory}
          onDeleteChat={handleDeleteChat}
        />

      {/* Modal de Favoritos - Accesible desde cualquier pantalla */}
        <FavoritosModal
          isOpen={showFavoritosModal}
          onClose={() => setShowFavoritosModal(false)}
          favorites={favorites}
          onDelete={(id) => setFavorites(prev => prev.filter(f => f.id !== id))}
        />
    </div>
  );
}