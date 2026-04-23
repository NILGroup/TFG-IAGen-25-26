/**
 * ChatActivePanel.jsx
 *
 * Componente principal del chat activo con SofIA.
 *
 * Estructura:
 * 1. Cuadro blanco con los mensajes de la conversación (con scroll)
 * 2. Botón "Finalizar conversación" (fijo, fuera del cuadro)
 * 3. Barra de entrada para escribir preguntas (fija, fuera del cuadro)
 *
 * Características:
 * - Solo el área de mensajes tiene scroll (como WhatsApp/ChatGPT)
 * - Los controles (input y botón finalizar) siempre están visibles
 * - Tooltip para seleccionar texto y obtener ayuda
 */

import { useEffect, useRef } from "react";
import Chat from "./Chat";
import { TooltipBubble } from "./TooltipBubble";

export default function ChatActivePanel({
    // Estado y flujo del chat
    chatFlow,                    // Array con todos los mensajes de la conversación
    expandedResponses,           // Controla qué respuestas están expandidas
    toggleExpanded,              // Función para expandir/contraer respuestas

    // Control de voz (text-to-speech)
    toggleSpeech,                // Función para activar/desactivar lectura en voz alta
    activeSpeechId,              // ID del mensaje que se está leyendo
    speechState,                 // Estado de la síntesis de voz

    // Configuración visual
    avatarMode,                  // Modo del avatar (con/sin ayuda)

    // Tooltip para selección de texto
    tooltipInfo,                 // Información del tooltip (posición, texto seleccionado)
    handleTextSelection,         // Maneja cuando el usuario selecciona texto
    handleButtonClick,           // Maneja clicks en botones del tooltip
    handleReplaceText,           // Reemplaza texto seleccionado

    // Control del input de texto
    prompt,                      // Texto actual en el input
    setPrompt,                   // Actualiza el texto del input
    sendCustomPrompt,            // Envía la pregunta a SofIA

    // Gestión del historial
    saveChatToHistory,           // Guarda la conversación actual en el historial

    // Favoritos
    onGuardarFavorito,           // Guarda un par pregunta-respuesta específico
    isResponseSaved,             // Verifica si una respuesta ya está guardada
}) {
    // Ref para el contenedor del chat (para forzar repaint en Safari)
    const wrapperRef = useRef(null);

    /**
     * Fix para Safari: fuerza un repaint cuando el contenido cambia.
     * Safari no recalcula el layout automáticamente con flexbox dinámico.
     */
    useEffect(() => {
        if (wrapperRef.current) {
            // Forzar repaint en Safari
            const element = wrapperRef.current;

            // Técnica 1: Forzar reflow leyendo offsetHeight
            void element.offsetHeight;

            // Técnica 2: Cambiar display momentáneamente
            requestAnimationFrame(() => {
                element.style.display = 'none';
                void element.offsetHeight; // Forzar reflow
                element.style.display = '';
            });
        }
    }, [chatFlow]);

    /**
     * Envía una pregunta de seguimiento al chat.
     * Se ejecuta cuando el usuario presiona el botón de enviar o Enter.
     */
    const submitFollowup = () => {
        const cleanPrompt = prompt.trim();

        // No enviar si el texto está vacío
        if (!cleanPrompt) return;

        // Enviar la pregunta y limpiar el input
        sendCustomPrompt(cleanPrompt);
        setPrompt("");
    };

    return (
        <div className="chat-active-wrapper" ref={wrapperRef}>
            {/* ========================================
                CUADRO BLANCO: ÁREA DE MENSAJES
                ========================================
                - Contiene todos los mensajes de la conversación
                - Tiene scroll independiente (solo esta área)
                - Incluye tooltip para seleccionar texto y obtener ayuda
            */}
            <div className="chat-selection-area">
                {/* Contenedor con scroll interno */}
                <div className="chat-mensajes-container" onMouseUp={handleTextSelection}>
                    {/* Componente Chat: renderiza todos los mensajes */}
                    <Chat
                        chatFlow={chatFlow}
                        expandedResponses={expandedResponses}
                        toggleExpanded={toggleExpanded}
                        toggleSpeech={toggleSpeech}
                        activeSpeechId={activeSpeechId}
                        speechState={speechState}
                        avatarMode={avatarMode}
                        onGuardarFavorito={onGuardarFavorito}
                        isResponseSaved={isResponseSaved}
                    />
                </div>

                {/* Tooltip que aparece al seleccionar texto en los mensajes */}
                <TooltipBubble
                    tooltipInfo={tooltipInfo}
                    handleButtonClick={handleButtonClick}
                    handleReplaceText={handleReplaceText}
                />
            </div>

            {/* ========================================
                BOTÓN FINALIZAR CONVERSACIÓN (flotante)
                ========================================
            */}
            {chatFlow.length > 0 && (
                <div className="chat-actions-bottom">
                    <button
                        className="finalizar-conversacion-btn"
                        onClick={async () => {
                            await saveChatToHistory();
                        }}
                        aria-label="Finalizar y guardar conversación"
                    >
                        Finalizar conversación
                    </button>
                </div>
            )}

            {/* ========================================
                BARRA DE ENTRADA (INPUT)
                ========================================
            */}
            <div className="chat-input-bar">
                <div className="chat-input-container">
                    {/* Campo de texto para escribir la pregunta */}
                    <input
                        id="chat-input"
                        type="text"
                        className="chat-input-field"
                        placeholder="Escribe tu pregunta aquí..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                submitFollowup();
                            }
                        }}
                        aria-label="Campo para escribir tu pregunta a SofIA"
                    />

                    {/* Botón de enviar */}
                    <button
                        className="chat-send-btn"
                        onClick={submitFollowup}
                        disabled={!prompt.trim()}
                        aria-label="Enviar pregunta"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
