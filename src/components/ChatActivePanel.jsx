/**
 * ChatActivePanel.jsx
 *
 * Vista completa del modo chat activo. Agrupa el render del chat,
 * el tooltip de selección de texto y el cuadro para continuar la conversación.
 */

import Chat from "./Chat";
import { TooltipBubble } from "./TooltipBubble";

export default function ChatActivePanel({
    chatFlow,
    expandedResponses,
    toggleExpanded,
    toggleSpeech,
    activeSpeechId,
    speechState,
    avatarMode,
    tooltipInfo,
    handleTextSelection,
    handleButtonClick,
    handleReplaceText,
    prompt,
    setPrompt,
    sendCustomPrompt,
}) {
    const submitFollowup = () => {
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt) return;

        sendCustomPrompt(cleanPrompt);
        setPrompt("");
    };

    return (
        <>
            <div className="chat-selection-area" onMouseUp={handleTextSelection}>
                <Chat
                    chatFlow={chatFlow}
                    expandedResponses={expandedResponses}
                    toggleExpanded={toggleExpanded}
                    toggleSpeech={toggleSpeech}
                    activeSpeechId={activeSpeechId}
                    speechState={speechState}
                    avatarMode={avatarMode}
                />

                <TooltipBubble
                    tooltipInfo={tooltipInfo}
                    handleButtonClick={handleButtonClick}
                    handleReplaceText={handleReplaceText}
                />
            </div>
            <div className="chat-container">
                <div className="custom-followup-box">
                    <h4 className="custom-followup-title"><strong>¿Prefieres formular la pregunta desde cero?</strong></h4>
                    <textarea
                        className="custom-followup-textarea"
                        placeholder="Escribe aquí tu pregunta..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                submitFollowup();
                            }
                        }}
                    ></textarea>
                    <button className="custom-followup-btn" onClick={submitFollowup}>
                        🔍 ¡Descubrir Respuesta!
                    </button>
                </div>
            </div>
        </>
    );
}
