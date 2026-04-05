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
import useConfigController from "../hooks/useConfigController";
import useChatInputController from "../hooks/useChatInputController";
import useSpeechController from "../hooks/useSpeechController";
import useHelpOptionsController from "../hooks/useHelpOptionsController";
import useTooltipController from "../hooks/useTooltipController";
import ConfigPanel from "../components/ConfigPanel";
import ChatHistory from "../components/ChatHistory";
import QuestionPromptPanel from "../components/QuestionPromptPanel";
import ChatActivePanel from "../components/ChatActivePanel";
import ResponseConfigPanel from "../components/ResponseConfigPanel";
import PanelGlosario from "../components/PanelGlosario";

export default function InterfazPrincipal({ summary, modoSeleccionado, promptInicial, flujoElegido, onBack }) {
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

    const {
        showConfig,
        setShowConfig,
        savedEffect,
        setSavedEffect,
        setEditingField,
        userSummary,
        tempSummary,
        setTempSummary,
        handleSaveSummary,
    } = useConfigController(summary);

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
        summary: userSummary,
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
            setPrompt(promptInicial);
            setShowChat(true);
            // Enviar el prompt automáticamente como pregunta personalizada
            sendCustomPrompt(promptInicial);
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
                    {!showGlosario && !showConfig && !showResponseConfig && (
                        <button
                            className="boton-diccionario"
                            onClick={() => setShowGlosario(true)}
                            aria-label="Abrir diccionario"
                            aria-expanded={showGlosario}
                        >
                            Diccionario
                        </button>
                    )}

                    <h1 className="header-bar-title">
                        SofIA
                    </h1>

                    {!showGlosario && !showConfig && !showResponseConfig && (
                        <div className="header-bar-right">
                            <button
                                className="boton-perfil"
                                onClick={() => setShowConfig(true)}
                                aria-label="Abrir perfil"
                                aria-expanded={showConfig}
                            >
                                Perfil
                            </button>
                        </div>
                    )}

                    {/*LÓGICA HISTORIAL*/}
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
            </div>
            {/*LÓGICA CONFIGURACIÓN*/}
            {showConfig && (
                <ConfigPanel
                    summary={userSummary}
                    onSaveSummary={handleSaveSummary}
                    tempSummary={tempSummary}
                    setTempSummary={setTempSummary}
                    savedEffect={savedEffect}
                    setSavedEffect={setSavedEffect}
                    setEditingField={setEditingField}
                />
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
                    userName={userSummary?.nombre}
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

        </div>
    );
}
