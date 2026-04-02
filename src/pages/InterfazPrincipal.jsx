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

export default function InterfazPrincipal({ summary, modoSeleccionado, promptInicial, onBack }) {
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

    return (

        <div className="app-wrapper">
            <div className="header-bar">
                SofIA

                <button
                    className={`history-btn ${showHistory ? "open" : "closed"}`}
                    onClick={toggleHistory}
                >
                    {showHistory ? "📁 Cerrar Historial" : "📂 Abrir Historial"}
                </button>

                <button
                    className={`config-btn ${showConfig ? "open" : "closed"}`}
                    onClick={() => setShowConfig(!showConfig)}
                >
                    {showConfig ? "⚙️ Cerrar Configuración" : "⚙️  Configuración"}
                </button>

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

        </div>
    );
}
