/**
 * InterfazPrincipal.jsx
 *
 * Este componente es el centro de la experiencia conversacional con SofIA.
 * Administra la lógica y estados globales: chat, historial, configuración,
 * generación de preguntas y respuestas, interacción con la IA, y personalización
 * basada en el cuestionario inicial (`summary`).
 *
 * Contiene la lógica para:
 * - Mostrar preguntas predefinidas o personalizadas
 * - Procesar y mostrar respuestas generadas por IA
 * - Controlar botones de ayuda, resumen, ejemplos, sinónimos y simplificación
 * - Gestionar historial de conversaciones y configuración del perfil del usuario
 */

import { useState, useEffect, useRef } from "react";

import usePromptFunctions from "../hooks/usePrompts";
import useChatHistoryController from "../hooks/useChatHistoryController";
import useChatInputController from "../hooks/useChatInputController";
import useSpeechController from "../hooks/useSpeechController";
import useHelpOptionsController from "../hooks/useHelpOptionsController";
import useTooltipController from "../hooks/useTooltipController";
import HistoryModal from "../components/HistoryModal";
import QuestionPromptPanel from "../components/QuestionPromptPanel";
import ChatActivePanel from "../components/ChatActivePanel";
import ResponseConfigPanel from "../components/ResponseConfigPanel";
import PanelGlosario from "../components/PanelGlosario";

export default function InterfazPrincipal({ summary, modoSeleccionado, promptInicial, flujoElegido, onBack, onIrAPerfil }) {
    const {
        selectedOption,
        setSelectedOption,
        prompt,
        setPrompt,
        setLoading,
        showChat,
        setShowChat,
        chatFlow,
        setChatFlow,
    } = useChatInputController();

    const {
        setShowHelpOptions,
        setShowUsefulQuestion,
        setShowSimplificationOptions,
        setShowTextInput,
        resetHelpOptions,
    } = useHelpOptionsController();

    const {
        speechState,
        activeSpeechId,
        setSpeechState,
        setActiveSpeechId,
        toggleSpeech,
    } = useSpeechController();

    const [expandedResponses, setExpandedResponses] = useState({});

    const toggleExpanded = (index) => {
        setExpandedResponses((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Estados para el panel de configuración de respuestas
    const [showResponseConfig, setShowResponseConfig] = useState(false);
    const [responseConfig, setResponseConfig] = useState(["lectura-facil", "ejemplos"]);

    // Estado para el panel de glosario
    const [showGlosario, setShowGlosario] = useState(false);

    const handleApplyResponseConfig = (newConfig) => {
        setResponseConfig(newConfig);
        console.log("Nueva configuración de respuestas:", newConfig);
    };
    /** ================================
    *  ESTADOS PARA CARGAR A LOS PROMPTS
    *  ================================
    */

    const {
        sendPrompt,
        sendCustomPrompt,
        generateTitleFromChat,
    } = usePromptFunctions({
        summary: summary,
        chatFlow,
        setChatFlow,
        setPrompt,
        setLoading,
        setShowChat,
        setShowHelpOptions,
        setShowSimplificationOptions,
        setShowTextInput,
        resetHelpOptions,
        setActiveSpeechId,
        setSpeechState
    });

    const {
        tooltipInfo,
        handleTextSelection,
        handleButtonClick,
        handleReplaceText,
    } = useTooltipController({
        chatFlow,
        setChatFlow,
    });


    const {
        chatHistory,
        setChatHistory,
        showHistory,
        activeChat,
        setActiveChat,
        toggleHistory,
        saveChatToHistory,
    } = useChatHistoryController({
        chatFlow,
        setChatFlow,
        setShowChat,
        setShowHelpOptions,
        setPrompt,
        setSelectedOption,
        setShowUsefulQuestion,
        generateTitleFromChat,
    });

    /** =============================================
     *  EFECTO PARA CARGAR PROMPT INICIAL
     *  =============================================
     */
    const promptInicialEnviado = useRef(false);

    useEffect(() => {
        // Si hay un promptInicial y no se ha enviado todavía
        if (promptInicial && !promptInicialEnviado.current) {
            promptInicialEnviado.current = true;
            setShowChat(true);
            // Enviar el prompt automáticamente como pregunta personalizada
            sendCustomPrompt(promptInicial);
            // Dejar el input vacío para la siguiente pregunta
            setPrompt("");
        }
    }, [promptInicial]); // Solo se ejecuta cuando cambia promptInicial

    /** ================================
     *     RETORNO DE LA INTERFAZ
     *  ================================
     */

    // Calcular posición de la conversación actual en el historial
    const currentChatIndex = activeChat ? chatHistory.findIndex(entry => entry === activeChat) : -1;
    const currentNumber = currentChatIndex !== -1 ? currentChatIndex + 1 : 0;
    const totalChats = chatHistory.length;

    return (

        <div className="app-wrapper">
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

                    <div className="header-bar-right">
                        <button
                            className="boton-perfil"
                            onClick={onIrAPerfil}
                            aria-label="Ir a mi perfil"
                        >
                            Perfil
                        </button>
                    </div>

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

            {/* Botón de Historial tipo dropdown - centrado debajo de SofIA */}
            {chatHistory.length > 0 && (
                <div className="historial-dropdown-container">
                    <button
                        className="historial-dropdown-btn"
                        onClick={toggleHistory}
                        aria-label={`Abrir historial de conversaciones. Chat ${currentNumber} de ${totalChats}`}
                        aria-expanded={showHistory}
                    >
                        <span className="historial-dropdown-contador">
                            {currentNumber}/{totalChats}
                        </span>
                        <span className="historial-dropdown-separador">|</span>
                        <span className="historial-dropdown-texto">Historial</span>
                        <span className="historial-dropdown-icono">▼</span>
                    </button>
                </div>
            )}

            {/* Botón de Configuración de Ayuda - derecha debajo de Perfil */}
            {flujoElegido === "formulario" && (
                <div className="config-ayuda-dropdown-container">
                    <button
                        className="config-ayuda-dropdown-btn"
                        onClick={() => setShowResponseConfig(!showResponseConfig)}
                        aria-label="Configurar cómo quieres que aparezcan las respuestas"
                        aria-expanded={showResponseConfig}
                    >
                        <span className="config-ayuda-dropdown-texto">Cómo quieres que aparezcan las respuestas</span>
                        <span className="config-ayuda-dropdown-icono">▼</span>
                    </button>
                </div>
            )}
            {activeChat && (
                <div className="chat-wrapper">
                    <div className="chat-container">
                        <div className="chat-message user-message">
                            {activeChat.prompt}
                        </div>
                        <div className="chat-message ai-message">
                            {activeChat.response}
                        </div>
                    </div>
                </div>
            )}

            {/*GENERADOR/SELECCIONADOR DE PREGUNTA*/}
            {!showChat ? (
                <QuestionPromptPanel
                    onBack={onBack}
                    userName={summary?.nombre}
                    selectedOption={selectedOption}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    sendPrompt={sendPrompt}
                />
            ) : (
                <ChatActivePanel
                    chatFlow={chatFlow}
                    expandedResponses={expandedResponses}
                    toggleExpanded={toggleExpanded}
                    toggleSpeech={toggleSpeech}
                    activeSpeechId={activeSpeechId}
                    speechState={speechState}
                    avatarMode={modoSeleccionado}
                    tooltipInfo={tooltipInfo}
                    handleTextSelection={handleTextSelection}
                    handleButtonClick={handleButtonClick}
                    handleReplaceText={handleReplaceText}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    sendCustomPrompt={sendCustomPrompt}
                    saveChatToHistory={saveChatToHistory}
                />
            )}

            {/* Panel de configuración de respuestas - Solo en flujo "con ayuda" */}
            {flujoElegido === "formulario" && (
                <ResponseConfigPanel
                    isOpen={showResponseConfig}
                    onClose={() => setShowResponseConfig(false)}
                    currentConfig={responseConfig}
                    onApply={handleApplyResponseConfig}
                />
            )}

            <PanelGlosario
                isOpen={showGlosario}
                onClose={() => setShowGlosario(false)}
            />

            {/* Modal de Historial */}
            <HistoryModal
                isOpen={showHistory}
                onClose={toggleHistory}
                chatHistory={chatHistory}
                activeChat={activeChat}
                onSelectChat={(entry) => {
                    setActiveChat(entry);
                    setChatFlow([...entry.flow]);
                    setShowChat(true);
                    setShowHelpOptions(true);
                }}
            />

        </div>
    );
}
