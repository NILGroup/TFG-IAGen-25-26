/**
 * QuestionPromptPanel.jsx
 *
 * Vista de la pantalla inicial donde el usuario elige una pregunta y lanza
 * una nueva consulta. Mantiene la capa visual separada de la orquestación.
 */

import robotLogo from "../assets/AventurIA_robot_sinfondo.png";

export default function QuestionPromptPanel({
    onBack,
    userName,
    selectedOption,
    prompt,
    setPrompt,
    sendPrompt,
}) {
    return (
        <div className="principal-container">
            {onBack && (
                <button className="back-to-choice-btn" onClick={onBack}>
                    ← Volver a elegir modo
                </button>
            )}

            <div className="icon-container">
                <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
            </div>

            <h1 className="title">
                {userName
                    ? `Hola ${userName}, ¿Qué vamos a aprender hoy?`
                    : "Hola ¿Qué vamos a aprender hoy?"}
            </h1>

            <div className={`question-container ${selectedOption ? selectedOption.color : ""}`}>
                <h3 className="question-title">
                    {selectedOption ? selectedOption.text : "Formula una pregunta"}
                </h3>

                <input
                    type="text"
                    className="question-input"
                    placeholder="Escribe aquí..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendPrompt(prompt, selectedOption);
                        }
                    }}
                />

                <button
                    className="discover-btn"
                    onClick={() => {
                        sendPrompt(prompt, selectedOption);
                        setPrompt("");
                    }}
                >
                    ¡Descubrir Respuesta!
                </button>
            </div>
        </div>
    );
}
