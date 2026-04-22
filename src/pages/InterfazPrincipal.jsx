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
import FavoritosModal from "../components/FavoritosModal";
import QuestionPromptPanel from "../components/QuestionPromptPanel";
import ChatActivePanel from "../components/ChatActivePanel";
import ResponseConfigPanel from "../components/ResponseConfigPanel";
import PanelGlosario from "../components/PanelGlosario";

export default function InterfazPrincipal({
    summary,
    modoSeleccionado,
    promptInicial,
    onBack,
    onIrAPerfil,
    chatHistoryGlobal = [],
    setChatHistoryGlobal,
    chatToResume = null,
    onFinalizarConversacion,
    favoritesGlobal = [],
    setFavoritesGlobal,
}) {
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
        glossary,
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
        initialHistory: chatHistoryGlobal, // Usar historial global
    });

    // Favoritos (usando estado global desde App.jsx)
    const favorites = favoritesGlobal;
    const setFavorites = setFavoritesGlobal;
    const [showFavoritos, setShowFavoritos] = useState(false);

    /**
     * Guarda un par pregunta-respuesta específico en favoritos.
     * @param {number} aiIndex - Índice de la respuesta de IA en chatFlow
     */
    const handleGuardarFavorito = (aiIndex) => {
        // Obtener la respuesta de IA por su índice
        const aiMessage = chatFlow[aiIndex];
        if (!aiMessage || aiMessage.type !== "ai") return;

        // Buscar la pregunta del usuario justo antes de esta respuesta
        let userMessage = null;
        for (let i = aiIndex - 1; i >= 0; i--) {
            if (chatFlow[i].type === "user") {
                userMessage = chatFlow[i];
                break;
            }
        }

        if (!userMessage) return;

        // Comprobar si ya está guardado
        const yaGuardado = favorites.some(
            f => f.question === userMessage.content && f.answer === aiMessage.content
        );

        if (yaGuardado) return; // Ya está guardado, no hacer nada

        setFavorites(prev => [...prev, {
            id: Date.now(),
            question: userMessage.content,
            answer: aiMessage.content,
            timestamp: new Date().toLocaleString(),
        }]);
    };

    /**
     * Verifica si una respuesta ya está guardada en favoritos.
     * @param {number} aiIndex - Índice de la respuesta de IA en chatFlow
     * @returns {boolean}
     */
    const isResponseSaved = (aiIndex) => {
        const aiMessage = chatFlow[aiIndex];
        if (!aiMessage || aiMessage.type !== "ai") return false;

        // Buscar la pregunta del usuario justo antes
        let userMessage = null;
        for (let i = aiIndex - 1; i >= 0; i--) {
            if (chatFlow[i].type === "user") {
                userMessage = chatFlow[i];
                break;
            }
        }

        if (!userMessage) return false;

        return favorites.some(
            f => f.question === userMessage.content && f.answer === aiMessage.content
        );
    };

    // Función personalizada para finalizar y volver a elección
    const handleFinalizarYVolver = async () => {
        if (chatFlow.length === 0) {
            onFinalizarConversacion(null, null);
            return;
        }

        // Generar título para el chat (solo si es nuevo, no al retomar)
        const aiGeneratedTitle = chatToResume
            ? chatToResume.title
            : await generateTitleFromChat();

        // Crear entrada del historial
        const chatEntry = {
            title: aiGeneratedTitle,
            flow: [...chatFlow],
            timestamp: new Date().toLocaleString(),
            isNew: !chatToResume, // Solo es nuevo si no estamos retomando
        };

        // Llamar a la función de App.jsx para guardar y volver a elección
        // Pasamos el chat original si estamos retomando para poder actualizarlo
        onFinalizarConversacion(chatEntry, chatToResume);
    };

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

    /** =============================================
     *  EFECTO PARA RETOMAR CONVERSACIÓN DEL HISTORIAL
     *  =============================================
     */
    const lastResumedChat = useRef(null);

    useEffect(() => {
        // Si hay un chat a retomar y es diferente al último procesado
        if (chatToResume && chatToResume !== lastResumedChat.current) {
            lastResumedChat.current = chatToResume;
            setChatFlow([...chatToResume.flow]);
            setActiveChat(chatToResume);
            setShowChat(true);
            setShowHelpOptions(true);
        }
    }, [chatToResume, setChatFlow, setActiveChat, setShowChat, setShowHelpOptions]);

    /** ================================
     *     RETORNO DE LA INTERFAZ
     *  ================================
     */

    // Calcular posición de la conversación actual en el historial
    const currentChatIndex = activeChat ? chatHistory.findIndex(entry => entry === activeChat) : -1;
    const currentNumber = currentChatIndex !== -1 ? currentChatIndex + 1 : 0;
    const totalChats = chatHistory.length;

    return (

        <div className={`app-wrapper${showGlosario ? " glosario-abierto" : ""}${showResponseConfig ? " config-abierto" : ""}`}>
            <div className="header-bar">
                <div className="header-bar-container">

                    {/* Izquierda: botón Historial */}
                    <div className="header-bar-left">
                        {chatHistory.length > 0 && (
                            <button
                                className="header-historial-btn"
                                onClick={toggleHistory}
                                aria-label={`Abrir historial de conversaciones. Chat ${currentNumber} de ${totalChats}`}
                                aria-expanded={showHistory}
                            >
                                <span className="header-historial-texto">Historial</span>
                            </button>
                        )}
                    </div>

                    {/* Centro: título SofIA */}
                    <h1
                        className="header-bar-title"
                        onClick={async () => {
                            // Si hay conversación, guardar automáticamente antes de volver
                            if (chatFlow.length > 0) {
                                await handleFinalizarYVolver();
                            }
                            onBack();
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyPress={async (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (chatFlow.length > 0) {
                                    await handleFinalizarYVolver();
                                }
                                onBack();
                            }
                        }}
                        aria-label="SofIA. Haz clic para empezar una nueva conversación"
                        title="Volver al inicio"
                    >
                        SofIA
                    </h1>

                    {/* Derecha: botón Perfil */}
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

            {/* Botón de favoritos - centrado debajo del logo SofIA */}
            {favorites.length > 0 && (
                <div className="favoritos-btn-container">
                    <button
                        className="favoritos-btn"
                        onClick={() => setShowFavoritos(true)}
                        aria-label={`Abrir favoritos. ${favorites.length} guardados`}
                    >
                        <span className="favoritos-btn-contador">{favorites.length}</span>
                        <span className="favoritos-btn-separador">|</span>
                        <span className="favoritos-btn-texto">Favoritos</span>
                    </button>
                </div>
            )}

            {/* Panel del Diccionario - fuera del main-content para no desplazarse */}
            <PanelGlosario
                isOpen={showGlosario}
                onClose={() => setShowGlosario(false)}
                glossary={glossary}
            />

            {/* Contenido principal: se desplaza cuando el diccionario está abierto */}
            <main className="main-content" id="main-content" aria-label="Contenido principal">

                {/* Botón de Diccionario tipo dropdown - izquierda */}
                <div className="diccionario-dropdown-container">
                    <button
                        className="diccionario-dropdown-btn"
                        onClick={() => setShowGlosario(!showGlosario)}
                        aria-label={showGlosario ? "Cerrar diccionario" : "Abrir diccionario"}
                        aria-expanded={showGlosario}
                        aria-controls="panel-glosario"
                    >
                        <span className="diccionario-dropdown-texto">Diccionario</span>
                    </button>
                </div>

                {/* Botón de Configuración de Ayuda - derecha*/}
                <div className="config-ayuda-dropdown-container">
                    <button
                        className="config-ayuda-dropdown-btn"
                        onClick={() => setShowResponseConfig(!showResponseConfig)}
                        aria-label={showResponseConfig ? "Cerrar configuración de respuestas" : "Configurar cómo quieres que aparezcan las respuestas"}
                        aria-expanded={showResponseConfig}
                        aria-controls="response-config-panel"
                    >
                        <span className="config-ayuda-dropdown-texto">Cómo quieres que aparezcan las respuestas</span>
                    </button>
                </div>

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
                        saveChatToHistory={handleFinalizarYVolver}
                        onGuardarFavorito={handleGuardarFavorito}
                        isResponseSaved={isResponseSaved}
                    />
                )}

                {/* Panel de configuración de respuestas - visible en todos los modos */}
                <ResponseConfigPanel
                    isOpen={showResponseConfig}
                    onClose={() => setShowResponseConfig(false)}
                    currentConfig={responseConfig}
                    onApply={handleApplyResponseConfig}
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
                    onDeleteChat={(entryToDelete) => {
                        setChatHistory(prev => prev.filter(entry => entry !== entryToDelete));
                        if (activeChat === entryToDelete) {
                            setActiveChat(null);
                        }
                        if (setChatHistoryGlobal) {
                            setChatHistoryGlobal(prev => prev.filter(entry => entry !== entryToDelete));
                        }
                    }}
                />

                {/* Modal de Favoritos */}
                <FavoritosModal
                    isOpen={showFavoritos}
                    onClose={() => setShowFavoritos(false)}
                    favorites={favorites}
                    onDelete={(id) => setFavorites(prev => prev.filter(f => f.id !== id))}
                />

            </main>

        </div>
    );
}
