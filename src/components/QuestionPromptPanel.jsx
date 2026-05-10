/**
 * QuestionPromptPanel.jsx
 * Pantalla principal después de completar el cuestionario y elegir rol.
 * El usuario escribe su primera pregunta para iniciar la conversación con SofIA.
 */

const BASE = import.meta.env.BASE_URL;
const robotLogoPath = `${BASE}AventurIA_robot_sinfondo.png`;
const AVATAR_IMAGES = {
    profesor: `${BASE}Profesor_avatar.png`,
    familiar: `${BASE}Familiar_avatar.png`
};

export default function QuestionPromptPanel({
    onBack,           // Función para volver a PantallaRol (cambiar de ayudante)
    userName,         // Nombre del usuario desde el cuestionario
    prompt,           // Texto actual de la pregunta
    setPrompt,        // Función para actualizar el texto
    sendPrompt,       // Función para enviar la pregunta y navegar al chat
    isSubmitting,     // Indica si se está enviando la pregunta (para deshabilitar el botón)
    favorites = [],   // Lista de favoritos guardados
    onOpenFavoritos,  // Función para abrir el modal de favoritos
    avatarMode,       // Rol seleccionado para mostrar su avatar
}) {
    /**
     * Maneja el envío del formulario.
     * Previene el comportamiento por defecto y solo envía si hay texto.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || isSubmitting) return;
        
        sendPrompt(trimmedPrompt);
    };

    /**
     * Maneja la tecla Enter en el textarea.
     * Shift + Enter crea nueva línea, Enter solo envía el formulario.
     */
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="question-prompt-container">
            {/* Botón de respuestas guardadas - centrado debajo del header */}
            {favorites.length > 0 && onOpenFavoritos && (
                <div className="favoritos-btn-container">
                    <button
                        className="favoritos-btn"
                        onClick={onOpenFavoritos}
                        aria-label={`Ver ${favorites.length} ${favorites.length === 1 ? "respuesta guardada" : "respuestas guardadas"}`}
                    >
                        <span className="favoritos-btn-texto">
                            {favorites.length} {favorites.length === 1 ? "respuesta guardada" : "respuestas guardadas"}
                        </span>
                    </button>
                </div>
            )}

            {/* Contenido principal centrado */}
            <div className="question-prompt-content">
                {/* Botón para cambiar de ayudante (dentro del cuadro, como en PantallaEleccion) */}
                {onBack && (
                    <button
                        className="pantalla-back-btn"
                        onClick={onBack}
                        aria-label="Cambiar de ayudante"
                    >
                        Cambiar de ayudante
                    </button>
                )}

                {/* Logo del robot / Avatar */}
                <div className="question-prompt-logo-container">
                    <img 
                        src={avatarMode && AVATAR_IMAGES[avatarMode] ? AVATAR_IMAGES[avatarMode] : robotLogoPath} 
                        alt={avatarMode ? `Avatar ${avatarMode}` : "SofIA"} 
                        className="question-prompt-logo" 
                        style={avatarMode ? { width: "128px", height: "128px", borderRadius: "50%", objectFit: "cover" } : {}}
                        fetchPriority="high"
                    />
                </div>

                {/* Saludo personalizado */}
                <h1 className="question-prompt-title">
                    {userName ? `¡Hola ${userName}!` : "¡Hola!"}
                </h1>
                
                {/* Instrucción clara y directa */}
                <p className="question-prompt-subtitle">
                    ¿Qué quieres aprender hoy?
                </p>

                {/* Formulario con textarea amplio */}
                <form 
                    className="question-prompt-form" 
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Label siempre visible (WCAG 3.3.2) */}
                    <label 
                        htmlFor="question-input" 
                        className="question-prompt-label"
                    >
                        Escribe tu pregunta:
                    </label>

                    <textarea
                        id="question-input"
                        className="question-prompt-textarea"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={4}
                        disabled={isSubmitting}
                        aria-describedby="question-hint"
                        aria-label="Escribe aquí tu pregunta para SofIA"
                    />

                    {/* Texto de ayuda oculto para lectores de pantalla */}
                    <span id="question-hint" className="sr-only">
                        Puedes escribir varias líneas. Presiona Enter para enviar, 
                        Shift + Enter para nueva línea.
                    </span>

                    {/* Botón de envío prominente */}
                    <button
                        type="submit"
                        className="question-prompt-submit-btn"
                        disabled={!prompt.trim() || isSubmitting}
                        aria-busy={isSubmitting}
                    >
                        {isSubmitting ? "Enviando..." : "Descubrir respuesta"}
                    </button>
                </form>
            </div>
        </div>
    );
}
