/**
 * Chat.jsx
 *
 *  Este componente se encarga de renderizar todo el flujo de conversación
 *  que ha ocurrido en el chat. Muestra tanto los mensajes del usuario como 
 *  las respuestas de la IA, permitiendo expandir textos largos y reproducir las 
 *  respuestas en voz alta.
 */

import React from "react";
import ReactMarkdown from "react-markdown";

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
    avatarMode           // Modo seleccionado: "profesor" | "familiar"
}) {
    const avatarSrc = avatarMode ? AVATAR_IMAGES[avatarMode] : null;

    return (
        <div className="chat-wrapper">
            {chatFlow.map((entry, index) => (
                <div
                    key={index}
                    className={`chat-container ${entry.type === "user" ? "user-container" : "ai-container"}`}
                >
                    {/* Avatar junto a respuestas de la IA */}
                    {entry.type === "ai" && avatarSrc && (
                        <img
                            src={avatarSrc}
                            alt={avatarMode === "profesor" ? "Profesor" : "Familia"}
                            className="chat-avatar"
                        />
                    )}
                    <div className={`chat-message ${entry.type === "user" ? "user-message" : "ai-message"}`}>

                        {/* Muestra el contenido del mensaje en formato Markdown */}
                        <ReactMarkdown>
                            {expandedResponses[index] || entry.content.length <= 1000
                                ? entry.content
                                : entry.content.slice(0, 1000) + "…"}
                        </ReactMarkdown>

                        {/* Si el mensaje es de la IA, muestra botones de interacción */}
                        {entry.type === "ai" && (
                            <div className="ai-bottom-row">
                                {/* Botón para ver más/ver menos si la respuesta es muy larga */}
                                {entry.content.length > 1000 && (
                                    <button
                                        className="see-more-btn"
                                        onClick={() => toggleExpanded(index)}
                                    >
                                        {expandedResponses[index] ? "Ver menos" : "Ver más"}
                                    </button>
                                )}

                                {/* Botón para reproducir o controlar audio */}
                                <button
                                    className="audio-btn"
                                    onClick={() => toggleSpeech(entry.content, index)}
                                    title={
                                        activeSpeechId !== index || speechState === "idle"
                                            ? "🔊 Reproducir"
                                            : speechState === "playing"
                                                ? "⏸️ Pausar"
                                                : "▶️ Reanudar"
                                    }
                                >
                                    {activeSpeechId !== index || speechState === "idle"
                                        ? "🔊"
                                        : speechState === "playing"
                                            ? "⏸️"
                                            : "▶️"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
