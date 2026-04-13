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
    onGuardarFavorito,           // Guarda el último par pregunta-respuesta
    savedToast,                  // "saved" | "already" | null
}) {
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
        <div className="chat-active-wrapper">
            {/* ========================================
                CUADRO BLANCO: ÁREA DE MENSAJES
                ========================================
                - Contiene todos los mensajes de la conversación
                - Tiene scroll independiente (solo esta área)
                - Incluye tooltip para seleccionar texto y obtener ayuda
            */}
            <div className="chat-selection-area" onMouseUp={handleTextSelection}>
                {/* Componente Chat: renderiza todos los mensajes */}
                <Chat
                    chatFlow={chatFlow}
                    expandedResponses={expandedResponses}
                    toggleExpanded={toggleExpanded}
                    toggleSpeech={toggleSpeech}
                    activeSpeechId={activeSpeechId}
                    speechState={speechState}
                    avatarMode={avatarMode}
                />

                {/* Tooltip que aparece al seleccionar texto en los mensajes */}
                <TooltipBubble
                    tooltipInfo={tooltipInfo}
                    handleButtonClick={handleButtonClick}
                    handleReplaceText={handleReplaceText}
                />
            </div>

            {/* ========================================
                BOTÓN FINALIZAR CONVERSACIÓN
                ========================================
                - Fuera del cuadro blanco, fijo en pantalla
                - Solo aparece cuando hay mensajes en el chat
                - Al hacer clic, guarda la conversación en el historial
            */}
            {chatFlow.length > 0 && (
                <div className="chat-actions-bottom">
                    {/* Toast de confirmación */}
                    {savedToast && (
                        <div
                            className={`guardar-toast ${savedToast === "already" ? "already" : ""}`}
                            role="status"
                            aria-live="polite"
                        >
                            {savedToast === "already" ? "Ya guardado" : "Guardado"}
                        </div>
                    )}

                    <button
                        className="guardar-favorito-btn"
                        onClick={onGuardarFavorito}
                        aria-label="Guardar esta pregunta y respuesta"
                    >
                        Guardar
                    </button>

                    <button
                        className="finalizar-conversacion-btn-bottom"
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
                - Fuera del cuadro blanco, fija en la parte inferior
                - Siempre visible, no afectada por el scroll
                - Estilo similar a WhatsApp/ChatGPT
                - Presionar Enter envía la pregunta
            */}
            <div className="chat-input-bar">
                <div className="chat-input-container">
                    {/* Label oculto para accesibilidad (lectores de pantalla) */}
                    <label htmlFor="chat-input" className="sr-only">
                        Escribe tu siguiente pregunta para SofIA
                    </label>

                    {/* Campo de texto para escribir la pregunta */}
                    <input
                        id="chat-input"
                        type="text"
                        className="chat-input-field"
                        placeholder="Escribe tu pregunta aquí..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            // Enviar pregunta al presionar Enter
                            if (e.key === "Enter") {
                                e.preventDefault();
                                submitFollowup();
                            }
                        }}
                        aria-label="Campo para escribir tu pregunta a SofIA"
                    />

                    {/* Botón de enviar (deshabilitado si no hay texto) */}
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
