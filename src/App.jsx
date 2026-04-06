/**
 * App.jsx
 *
 * Punto de entrada de la aplicación SofIA, es decir, arranca todo lo visual
 * Controla la navegación entre el cuestionario inicial (`Questionario`)
 * y la interfaz principal conversacional (`InterfazPrincipal`).
 *
 * - Usa un estado `completed` para saber si el cuestionario ya se completó.
 * - Recoge y guarda el resumen del usuario (`summary`) para personalizar la experiencia.
 * - Muestra el cuestionario al inicio y, tras completarlo, la interfaz principal.
 */

import { useState } from "react";
import Questionario from "./pages/Questionario";
import PantallaRol from "./pages/PantallaRol";
import PantallaEleccion from "./pages/PantallaEleccion";
import FormularioPrompt from "./pages/FormularioPrompt";
import InterfazPrincipal from "./pages/InterfazPrincipal";
import PaginaPerfil from "./pages/PaginaPerfil";
import HistoryModal from "./components/HistoryModal";
import "./App.css";

export default function App() {
  // Estados para controlar la navegación
  const [paso, setPaso] = useState("cuestionario"); // cuestionario, modo, eleccion, formulario, chat, perfil
  const [summary, setSummary] = useState(null); // Resumen del cuestionario inicial
  const [modoSeleccionado, setModoSeleccionado] = useState(null); // "profesor" | "familiar"
  const [promptGenerado, setPromptGenerado] = useState(null); // Prompt del formulario
  const [flujoElegido, setFlujoElegido] = useState(null); // "formulario" | "directa"
  const [pasoAnterior, setPasoAnterior] = useState(null); // Para volver desde el perfil

  // Estado del historial (elevado desde InterfazPrincipal para acceso global)
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [chatToResume, setChatToResume] = useState(null); // Chat seleccionado del historial

  // 1. Cuando termina el cuestionario inicial
  const handleQuestionnaireComplete = (data) => {
    setSummary(data);
    setPaso("modo"); // Ir a la pantalla de selección de modo
  };

  // 2. Cuando el usuario elige modo (Profesor / Familia)
  const handleModoComplete = (modo) => {
    setModoSeleccionado(modo);
    setPaso("eleccion"); // Ir a la pantalla de elección
  };

  // 3. Cuando el usuario elige en la pantalla de elección
  const handleSelectOption = (opcion) => {
    setFlujoElegido(opcion); // Guardar el flujo elegido
    if (opcion === "formulario") {
      setPaso("formulario"); // Ir al formulario guiado
    } else if (opcion === "directa") {
      setPaso("chat"); // Ir directamente al chat
    }
  };

  // 4. Cuando completa el formulario guiado
  const handleFormularioComplete = (prompt) => {
    setPromptGenerado(prompt); // Guardar el prompt generado
    setPaso("chat"); // Ir al chat con el prompt listo
  };

  // 5. Para volver a la pantalla de elección
  const handleVolverAEleccion = () => {
    setPromptGenerado(null); // Limpiar el prompt generado
    setChatToResume(null); // Limpiar chat a retomar
    setPaso("eleccion");
  };

  // 5b. Cuando se finaliza una conversación desde el chat
  const handleFinalizarConversacion = (chatEntry, originalChat = null) => {
    if (chatEntry) {
      if (originalChat) {
        // Actualizar el chat existente en lugar de crear uno nuevo
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
    setPromptGenerado(null);
    setChatToResume(null);
    setPaso("eleccion"); // Volver a la pantalla de elección
  };

  // 5c. Para seleccionar un chat del historial y retomarlo
  const handleSelectChatFromHistory = (entry) => {
    setChatToResume(entry);
    setShowHistoryModal(false);
    setFlujoElegido("directa"); // Retomar siempre en modo directo
    setPaso("chat");
  };

  // 5d. Para eliminar una conversación del historial
  const handleDeleteChat = (entryToDelete) => {
    setChatHistory(prev => prev.filter(entry => entry !== entryToDelete));
    // Si el chat eliminado era el que se iba a retomar, limpiar
    if (chatToResume === entryToDelete) {
      setChatToResume(null);
    }
  };

  // 6. Para volver a la pantalla de rol
  const handleVolverARol = () => {
    setPaso("modo");
  };

  // 7. Para ir a la página de perfil
  const handleIrAPerfil = () => {
    setPasoAnterior(paso); // Guardar el paso actual para poder volver
    setPaso("perfil");
  };

  // 8. Para volver desde la página de perfil
  const handleVolverDesdePerfil = () => {
    setPaso(pasoAnterior || "eleccion"); // Volver al paso anterior
  };

  // 9. Para guardar cambios en el perfil
  const handleSaveProfile = (updatedSummary) => {
    setSummary(updatedSummary);
  };

  // Las páginas formulario, chat y perfil tienen su propio header con botones
  const paginasConHeaderPropio = paso === "formulario" || paso === "chat" || paso === "perfil";

  return (
    <div className="app-wrapper">
      {/* Barra superior - solo para páginas sin header propio */}
      {!paginasConHeaderPropio && (
        <div className="header-bar">
          <div className="header-bar-container">
            <h1 className="header-bar-title">
              SofIA
            </h1>

            {/* Botón Perfil - solo si ya existe un perfil */}
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

      {/* Renderizado condicional según el paso */} 
      {paso === "cuestionario" && (
        <Questionario onComplete={handleQuestionnaireComplete} />
      )}

      {paso === "modo" && (
        <PantallaRol onSelectMode={handleModoComplete} />
      )}

      {paso === "eleccion" && (
        <PantallaEleccion
          onSelectOption={handleSelectOption}
          onBack={handleVolverARol}
          historialCount={chatHistory.length}
          onOpenHistorial={() => setShowHistoryModal(true)}
        />
      )}

      {paso === "formulario" && (
        <FormularioPrompt
          onComplete={handleFormularioComplete}
          onBack={handleVolverAEleccion}
          summary={summary}
        />
      )}

      {paso === "chat" && (
        <InterfazPrincipal
          summary={summary}
          modoSeleccionado={modoSeleccionado}
          promptInicial={promptGenerado}
          flujoElegido={flujoElegido}
          onBack={handleVolverAEleccion}
          onIrAPerfil={handleIrAPerfil}
          chatHistoryGlobal={chatHistory}
          setChatHistoryGlobal={setChatHistory}
          chatToResume={chatToResume}
          onFinalizarConversacion={handleFinalizarConversacion}
        />
      )}

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
