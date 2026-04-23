/**
 * Chat.jsx
 *
 *  Este componente se encarga de renderizar todo el flujo de conversación
 *  que ha ocurrido en el chat. Muestra tanto los mensajes del usuario como
 *  las respuestas de la IA, permitiendo expandir textos largos y reproducir las
 *  respuestas en voz alta.
 */

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Para tablas, tachados, listas de tareas, etc.
import rehypeRaw from "rehype-raw"; // Para renderizar HTML directo (como <br>, <center>...)

const BASE = import.meta.env.BASE_URL;
const AVATAR_IMAGES = {
    profesor: `${BASE}Profesor_avatar.png`,
    familiar: `${BASE}Familiar_avatar.png`
};

export default function Chat({
    chatFlow,            // Array que contiene todos los mensajes del chat (usuario y IA)
    expandedResponses,   // Objeto que indica qué respuestas están expandidas
    toggleExpanded,      // Función para alternar entre "ver más" y "ver menos"
    toggleSpeech,        // Función para reproducir/pausar/reanudar el texto con síntesis de voz
    activeSpeechId,      // ID del mensaje actualmente siendo leído por voz
    speechState,         // Estado de la reproducción de voz: "idle" (inactivo), "playing" (leyendo) o "paused" (esperando reanudación)
    avatarMode,          // Modo seleccionado: "profesor" | "familiar"
    onGuardarFavorito,   // Función para guardar un par pregunta-respuesta
    isResponseSaved,     // Función que verifica si una respuesta ya está guardada
}) {
    const avatarSrc = avatarMode ? AVATAR_IMAGES[avatarMode] : null;
    const messagesEndRef = useRef(null);

    // Scroll automático cuando se añaden nuevos mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatFlow]);

    return (
        <div
            className="chat-wrapper"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label="Historial de conversación con SofIA"
        >
            {chatFlow.map((entry, index) => (
                <div
                    key={index}
                    className={`chat-container ${entry.type === "user" ? "user-container" : entry.type === "loading" ? "ai-container" : "ai-container"}`}
                    role="article"
                    aria-label={entry.type === "user" ? "Tu pregunta" : entry.type === "loading" ? "SofIA está escribiendo" : "Respuesta de SofIA"}
                >
                    {/* Avatar junto a respuestas de la IA y estado de carga */}
                    {(entry.type === "ai" || entry.type === "loading") && avatarSrc && (
                        <img
                            src={avatarSrc}
                            alt={avatarMode === "profesor" ? "Profesor" : "Familia"}
                            className="chat-avatar"
                        />
                    )}
                    <div className={`chat-message ${entry.type === "user" ? "user-message" : entry.type === "loading" ? "loading-message" : "ai-message"}`}>

                        {/* Indicador de carga con puntos animados */}
                        {entry.type === "loading" ? (
                            <div className="typing-indicator">
                                <span className="typing-label">SofIA está escribiendo</span>
                                <div className="typing-dots">
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Timestamp del mensaje */}
                                {entry.timestamp && (
                                    <p className="message-timestamp">
                                        {new Date(entry.timestamp).toLocaleTimeString("es-ES", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                )}
                                
                                {/* Muestra el contenido del mensaje en formato Markdown */}
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        li: ({ children }) => (
                                            <li style={{ marginBottom: '8px', fontSize: 'inherit' }}>
                                                - {children}
                                            </li>
                                        ),
                                        p: ({ children }) => (
                                            <p style={{ marginBottom: '8px', fontSize: 'inherit' }}>
                                                {children}
                                            </p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: 'inherit' }}>
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol style={{ margin: '8px 0', paddingLeft: '20px', fontSize: 'inherit' }}>
                                                {children}
                                            </ol>
                                        )
                                    }}
                                >
                                    {expandedResponses[index] || entry.content.length <= 1000
                                        ? entry.content
                                        : entry.content.slice(0, 1000) + "…"}
                                </ReactMarkdown>

                                
                            </>
                        )}

                        {/* Si el mensaje es de la IA, muestra botones de interacción */}
                        {entry.type === "ai" && (
                            <div className="ai-bottom-row">
                                {/* Botón para ver más/ver menos si la respuesta es muy larga */}
                                {entry.content.length > 1000 && (
                                    <button
                                        className="see-more-btn"
                                        onClick={() => toggleExpanded(index)}
                                        aria-expanded={expandedResponses[index] ? "true" : "false"}
                                        aria-label={expandedResponses[index] ? "Mostrar menos contenido de la respuesta" : "Mostrar más contenido de la respuesta"}
                                    >
                                        {expandedResponses[index] ? "Ver menos" : "Ver más"}
                                    </button>
                                )}

                                {/* Botón para reproducir o controlar audio */}
                                <button
                                    className="audio-btn"
                                    onClick={() => toggleSpeech(entry.content, index)}
                                    aria-label={
                                        activeSpeechId !== index || speechState === "idle"
                                            ? "Reproducir en voz alta"
                                            : speechState === "playing"
                                                ? "Pausar lectura"
                                                : "Reanudar lectura"
                                    }
                                >
                                    {activeSpeechId !== index || speechState === "idle"
                                        ? "Reproducir"
                                        : speechState === "playing"
                                            ? "Pausar"
                                            : "Reanudar"}
                                </button>

                                {/* Botón para recordar esta respuesta */}
                                <button
                                    className={`guardar-respuesta-btn ${isResponseSaved(index) ? "guardado" : ""}`}
                                    onClick={() => onGuardarFavorito(index)}
                                    disabled={isResponseSaved(index)}
                                    aria-label={isResponseSaved(index) ? "Ya está recordado" : "Recordar esta respuesta"}
                                >
                                    {isResponseSaved(index) ? "Recordado" : "Recordar"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {/* Elemento invisible para scroll automático */}
            <div ref={messagesEndRef} />
        </div>
    );
}
