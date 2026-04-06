/**
 * ChatHistory.jsx antiguo
 *
 * Este componente muestra el historial de conversaciones guardadas del usuario.
 * Permite al usuario abrir un chat anterior, visualizar sus mensajes, y reanudar
 * la conversación con la IA desde donde la dejó. También permite cerrar el chat activo.
 */

import React from "react";

const ChatHistory = ({
    showHistory,         // Booleano que indica si el historial está visible
    chatHistory,         // Lista de chats guardados
    activeChat,          // Chat actualmente abierto por el usuario
    chatFlow,            // Flujo de mensajes actual del chat activo
    setActiveChat,       // Función para establecer el chat activo
    setChatFlow,         // Función para actualizar el flujo del chat
    setShowChat,         // Función para mostrar u ocultar el chat
    setShowHelpOptions,  // Función para mostrar los botones de ayuda al reabrir un chat
    setChatHistory       // Función para actualizar el historial completo
}) => {

    // Cierra el chat activo y guarda cualquier cambio realizado en el flujo
    const handleCloseChat = () => {
        if (activeChat) {
            const updated = chatHistory.map(entry =>
                entry === activeChat
                    ? { ...entry, flow: [...chatFlow], timestamp: new Date().toLocaleString() }
                    : entry
            );
            setChatHistory(updated);
        }
        setActiveChat(null);
        setChatFlow([]);
        setShowChat(false);
    };

    // Abre un chat previamente guardado
    const handleOpenChat = (entry) => {
        setActiveChat(entry);
        setChatFlow([...entry.flow]);
        setShowChat(true);
        setShowHelpOptions(true);
    };


    return (
        <div className={`chat-history-sidebar ${showHistory ? "show" : "hide"}`}>
            {chatHistory.length === 0 ? (
                <div className="no-chats-message">
                    <h3>Aún no hay chats guardados.</h3>
                </div>) : (
                <ul>
                    {chatHistory.map((entry, index) => (
                        <li
                            key={index}
                            className={`chat-bubble ${entry.isNew ? "new-entry" : ""}`}
                        >
                            <div className="chat-preview">
                                {entry.title || "Chat sin título"}
                            </div>

                            <div className="chat-timestamp">
                                <small>{entry.timestamp}</small>
                            </div>
                            {/* Botón para abrir o cerrar el chat */}
                            {activeChat === entry ? (
                                <button
                                    className="help-btn blue"
                                    onClick={handleCloseChat}
                                >
                                    📁 Cerrar chat
                                </button>

                            ) : (
                                <button
                                    className="help-btn blue"
                                    onClick={() => handleOpenChat(entry)}
                                >
                                    📂 Abrir chat
                                </button>

                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ChatHistory;
