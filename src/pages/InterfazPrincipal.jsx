/**
 * InterfazPrincipal.jsx
 *
 * Este componente es el centro de la experiencia conversacional con SofIA.
 * Administra la lógica y estados globales: chat, historial, configuración,
 * generación de preguntas y respuestas, interacción con la IA, y personalización
 * basada en el cuestionario inicial (`summary`).
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
import ExitConfirmModal from "../components/ExitConfirmModal";
import QuestionPromptPanel from "../components/QuestionPromptPanel";
import ChatActivePanel from "../components/ChatActivePanel";
import ResponseConfigPanel from "../components/ResponseConfigPanel";
import PanelGlosario from "../components/PanelGlosario";

const DEFAULT_RESPONSE_FORMAT = ["lectura-facil", "ejemplos"];

const normalizeResponseFormat = (formats = []) => {
    if (!Array.isArray(formats)) return [];

    const aliases = {
        lecturaFacil: "lectura-facil",
        ejemplo: "ejemplos",
        bullet: "listas",
        textocorto: "textos-cortos",
        frasescortas: "frases-sencillas",
    };

    return [...new Set(formats.map((format) => aliases[format] || format).filter(Boolean))];
};

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
    onRoleChange,
    onResponseConfigChange,
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

    // Configuración de respuestas (panel siempre visible)
    const [responseConfig, setResponseConfig] = useState(() =>
        normalizeResponseFormat(summary?.herramientas || DEFAULT_RESPONSE_FORMAT)
    );

    // Indica si el usuario ha modificado la configuración desde el panel
    const [userModifiedConfig, setUserModifiedConfig] = useState(false);

    // Rol actual del ayudante (puede cambiar desde el panel lateral)
    // Prioridad: modoSeleccionado (elección actual) > summary.rol (perfil guardado) > "profesor" (defecto)
    const [currentRole, setCurrentRole] = useState(modoSeleccionado || summary?.rol || "profesor");

    useEffect(() => {
        // Sólo sincronizar desde el perfil inicial si el usuario no ha aplicado cambios
        if (!userModifiedConfig) {
            setResponseConfig(normalizeResponseFormat(summary?.responseConfig || summary?.herramientas || DEFAULT_RESPONSE_FORMAT));
            setCurrentRole(modoSeleccionado || summary?.rol || "profesor");
        }
    }, [summary, modoSeleccionado, userModifiedConfig]);

    // Estado para el panel de glosario
    const [showGlosario, setShowGlosario] = useState(false);

    // ========================================
    // ESTADOS PARA DETECCIÓN DE CAMBIOS
    // ========================================
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalChatFlow, setOriginalChatFlow] = useState(null);
    const [originalChatId, setOriginalChatId] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitAction, setExitAction] = useState(null); // 'sofia' o 'back'
    const [pendingHistorySelection, setPendingHistorySelection] = useState(null);

    const handleApplyResponseConfig = (newConfig, newRole) => {
        const normalizedConfig = normalizeResponseFormat(newConfig);
        const normalizedRole = newRole || currentRole;

        setResponseConfig(normalizedConfig);
        setCurrentRole(normalizedRole);

        // Marca que el usuario ha cambiado la configuración activamente (no persiste en el perfil)
        setUserModifiedConfig(true);

        // No sincronizamos con `summary` aquí: aplicar cambios en el panel lateral
        // debe afectar sólo a esta conversación (se guarda junto al chat cuando corresponda).

        // Regenerar la última respuesta con la nueva configuración
        void regenerateLastResponse(normalizedConfig, normalizedRole);
    };

    const {
        sendPrompt,
        sendCustomPrompt,
        generateTitleFromChat,
        regenerateLastResponse,
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
        setSpeechState,
        responseConfig,
        currentRole,
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
        initialHistory: chatHistoryGlobal,
    });

    // Favoritos (usando estado global desde App.jsx)
    const favorites = favoritesGlobal;
    const setFavorites = setFavoritesGlobal;
    const [showFavoritos, setShowFavoritos] = useState(false);

    /**
     * Guarda un par pregunta-respuesta específico en favoritos.
     */
    const handleGuardarFavorito = (aiIndex) => {
        const aiMessage = chatFlow[aiIndex];
        if (!aiMessage || aiMessage.type !== "ai") return;

        let userMessage = null;
        for (let i = aiIndex - 1; i >= 0; i--) {
            if (chatFlow[i].type === "user") {
                userMessage = chatFlow[i];
                break;
            }
        }

        if (!userMessage) return;

        const yaGuardado = favorites.some(
            f => f.question === userMessage.content && f.answer === aiMessage.content
        );

        if (yaGuardado) return;

        setFavorites(prev => [...prev, {
            id: Date.now(),
            question: userMessage.content,
            answer: aiMessage.content,
            timestamp: new Date().toISOString(),
        }]);
    };

    /**
     * Verifica si una respuesta ya está guardada en favoritos.
     */
    const isResponseSaved = (aiIndex) => {
        const aiMessage = chatFlow[aiIndex];
        if (!aiMessage || aiMessage.type !== "ai") return false;

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

    /**
     * Guarda la conversación actual y vuelve a QuestionPromptPanel.
     */
    const handleFinalizarYVolver = async () => {
        if (chatFlow.length === 0) {
            onFinalizarConversacion(null, null);
            onBack();
            return;
        }

        const title = originalChatId && activeChat
            ? activeChat.title
            : await generateTitleFromChat();

        const chatEntry = {
            title: title,
            flow: JSON.parse(JSON.stringify(chatFlow)), // Deep copy
            responseConfig: responseConfig,
            role: currentRole,
            timestamp: new Date().toISOString(),
        };

        // Pasar el chat original si existe (para actualizar en lugar de duplicar)
        onFinalizarConversacion(chatEntry, originalChatId ? activeChat : null);
        onBack();
    };

    /**
     * Maneja la confirmación de salida (clic en SofIA o botón volver).
     */
    const handleExitRequest = (action) => {
        if (!showChat || chatFlow.length === 0) {
            onBack();
            return;
        }

        if (hasUnsavedChanges) {
            setExitAction(action);
            setShowExitModal(true);
        } else {
            onBack();
        }
    };

    /**
     * Maneja la opción "Guardar y salir" del modal.
     */
    const saveCurrentChatToHistory = async () => {
        if (chatFlow.length === 0) return;

        const title = originalChatId && activeChat
            ? activeChat.title
            : await generateTitleFromChat();

        const chatEntry = {
            title,
            flow: JSON.parse(JSON.stringify(chatFlow)),
            responseConfig: responseConfig,
            role: currentRole,
            timestamp: new Date().toISOString(),
            id: originalChatId && activeChat
                ? activeChat.id
                : `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        if (originalChatId && activeChat) {
            setChatHistory((prev) => prev.map((entry) =>
                entry.id === activeChat.id ? chatEntry : entry
            ));
            if (setChatHistoryGlobal) {
                setChatHistoryGlobal((prev) => prev.map((entry) =>
                    entry.id === activeChat.id ? chatEntry : entry
                ));
            }
        } else {
            setChatHistory((prev) => [...prev, chatEntry]);
            if (setChatHistoryGlobal) {
                setChatHistoryGlobal((prev) => [...prev, chatEntry]);
            }
            setOriginalChatId(chatEntry.id);
        }
    };

    const selectHistoryChat = (entry) => {
        const flowCopy = JSON.parse(JSON.stringify(entry.flow));
        setActiveChat(entry);
        setChatFlow(flowCopy);
        setOriginalChatFlow(flowCopy);
        setOriginalChatId(entry.id);
        // Restaurar configuración asociada al chat (si la tiene)
        setResponseConfig(normalizeResponseFormat(entry.responseConfig || summary?.responseConfig || summary?.herramientas || DEFAULT_RESPONSE_FORMAT));
        setCurrentRole(entry.role || modoSeleccionado || summary?.rol || "profesor");
        setUserModifiedConfig(false);
        setShowChat(true);
        setShowHelpOptions(true);
        setHasUnsavedChanges(false);
    };

    const handleSelectHistoryChat = (entry) => {
        if (entry.id === activeChat?.id) return;
        if (hasUnsavedChanges) {
            setPendingHistorySelection(entry);
            setExitAction('history');
            setShowExitModal(true);
            return;
        }
        selectHistoryChat(entry);
    };

    const handleGuardarYSalir = async () => {
        setShowExitModal(false);
        if (pendingHistorySelection) {
            await saveCurrentChatToHistory();
            const entry = pendingHistorySelection;
            setPendingHistorySelection(null);
            selectHistoryChat(entry);
            return;
        }
        await handleFinalizarYVolver();
    };

    /**
     * Maneja la salida sin guardar.
     */
    const handleSalirSinGuardar = () => {
        setShowExitModal(false);
        if (pendingHistorySelection) {
            const entry = pendingHistorySelection;
            setPendingHistorySelection(null);
            selectHistoryChat(entry);
            return;
        }
        onBack();
    };

    // ========================================
    // EFECTOS PARA DETECCIÓN DE CAMBIOS
    // ========================================

    const promptInicialEnviado = useRef(false);

    useEffect(() => {
        if (promptInicial && !promptInicialEnviado.current) {
            promptInicialEnviado.current = true;
            // Nuevo chat: reiniciar la bandera de cambios del panel lateral
            setUserModifiedConfig(false);
            setShowChat(true);
            sendCustomPrompt(promptInicial);
            setPrompt("");
        }
    }, [promptInicial]);

    const lastResumedChat = useRef(null);

    useEffect(() => {
        if (chatToResume && chatToResume !== lastResumedChat.current) {
            lastResumedChat.current = chatToResume;
            const flowCopy = JSON.parse(JSON.stringify(chatToResume.flow));
            setChatFlow(flowCopy);
            setOriginalChatFlow(flowCopy);
            setOriginalChatId(chatToResume.id);
            setActiveChat(chatToResume);
            // Restaurar configuración guardada en el chat reanudado
            setResponseConfig(normalizeResponseFormat(chatToResume.responseConfig || summary?.responseConfig || summary?.herramientas || DEFAULT_RESPONSE_FORMAT));
            setCurrentRole(chatToResume.role || modoSeleccionado || summary?.rol || "profesor");
            setUserModifiedConfig(false);
            setShowChat(true);
            setShowHelpOptions(true);
            setHasUnsavedChanges(false);
        }
    }, [chatToResume, setChatFlow, setActiveChat, setShowChat, setShowHelpOptions]);

    // Detectar cambios en el chatFlow
    useEffect(() => {
        if (showChat && chatFlow.length > 0) {
            if (originalChatFlow) {
                const hasChanges = JSON.stringify(chatFlow) !== JSON.stringify(originalChatFlow);
                setHasUnsavedChanges(hasChanges);
            } else {
                setHasUnsavedChanges(chatFlow.length > 0);
            }
        }
    }, [chatFlow, originalChatFlow, showChat]);

    // Sincronizar chatHistory con el estado global
    useEffect(() => {
        if (setChatHistoryGlobal && chatHistory.length > 0) {
            setChatHistoryGlobal(chatHistory);
        }
    }, [chatHistory, setChatHistoryGlobal]);

    // Calcular posición de la conversación actual en el historial
    const currentChatIndex = activeChat ? chatHistory.findIndex(entry => entry.id === activeChat.id) : -1;
    const currentNumber = currentChatIndex !== -1 ? currentChatIndex + 1 : 0;
    const totalChats = chatHistory.length;

    return (
        <div className={`app-wrapper config-abierto`}>
            <div className="header-bar">
                <div className="header-bar-container">
                    {/* Izquierda: botón Historial y diccionario */}
                    <div className="header-bar-left">
                            {/*Botón Historial */}
                        <button
                            className="header-historial-btn"
                                onClick={toggleHistory}
                                aria-label={`Abrir historial de conversaciones. Chat ${currentNumber} de ${totalChats}`}
                                aria-expanded={showHistory}
                        >
                            <span className="header-historial-texto">Historial</span>
                        </button>

                         {/*Botón Diccionario */}
                        <button
                            className="header-diccionario-btn"
                            onClick={() => setShowGlosario(!showGlosario)}
                            aria-label={showGlosario ? "Cerrar diccionario" : "Abrir diccionario"}
                            aria-expanded={showGlosario}
                            aria-controls="panel-glosario"
                        >
                            <span className="header-diccionario-texto">Diccionario</span>
                        </button>

                    </div>

                    {/* Centro: título SofIA */}
                    <h1
                        className="header-bar-title"
                        onClick={() => handleExitRequest('sofia')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleExitRequest('sofia');
                            }
                        }}
                        aria-label="SofIA. Haz clic para volver al inicio"
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

            {/* Botón de respuestas guardadas */}
            {favorites.length > 0 && (
                <div className="favoritos-btn-container">
                    <button
                        className="favoritos-btn"
                        onClick={() => setShowFavoritos(true)}
                        aria-label={`Ver ${favorites.length} ${favorites.length === 1 ? "respuesta guardada" : "respuestas guardadas"}`}
                    >
                        <span className="favoritos-btn-texto">
                            {favorites.length} {favorites.length === 1 ? "respuesta guardada" : "respuestas guardadas"}
                        </span>
                    </button>
                </div>
            )}

            {/* Panel del Diccionario */}
            <PanelGlosario
                isOpen={showGlosario}
                onClose={() => setShowGlosario(false)}
                glossary={glossary}
            />

            <main className="main-content" id="main-content" aria-label="Contenido principal">

                {/* Chat activo o panel de pregunta */}
                {!showChat ? (
                    <QuestionPromptPanel
                        onBack={onBack}
                        userName={summary?.nombre}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        sendPrompt={sendPrompt}
                        favorites={favorites}
                        onOpenFavoritos={() => setShowFavoritos(true)}
                    />
                ) : (
                    <ChatActivePanel
                        chatFlow={chatFlow}
                        expandedResponses={expandedResponses}
                        toggleExpanded={toggleExpanded}
                        toggleSpeech={toggleSpeech}
                        activeSpeechId={activeSpeechId}
                        speechState={speechState}
                        avatarMode={currentRole}
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

                {/* Panel de configuración de respuestas (siempre visible) */}
                <ResponseConfigPanel
                    currentConfig={responseConfig}
                    currentRole={currentRole}
                    onApply={handleApplyResponseConfig}
                />

                {/* Modal de confirmación de salida */}
                <ExitConfirmModal
                    isOpen={showExitModal}
                    onClose={() => {
                        setShowExitModal(false);
                        setPendingHistorySelection(null);
                    }}
                    onSaveAndExit={handleGuardarYSalir}
                    onExitWithoutSaving={handleSalirSinGuardar}
                />

                {/* Modal de Historial */}
                <HistoryModal
                    isOpen={showHistory}
                    onClose={toggleHistory}
                    chatHistory={chatHistory}
                    activeChat={activeChat}
                    onSelectChat={handleSelectHistoryChat}
                    onDeleteChat={(entryToDelete) => {
                        setChatHistory(prev => prev.filter(entry => entry.id !== entryToDelete.id));
                        if (activeChat?.id === entryToDelete.id) {
                            setActiveChat(null);
                            setOriginalChatFlow(null);
                            setOriginalChatId(null);
                        }
                        if (setChatHistoryGlobal) {
                            setChatHistoryGlobal(prev => prev.filter(entry => entry.id !== entryToDelete.id));
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