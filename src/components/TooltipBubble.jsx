/**
 * TooltipBubble.jsx
 * 
 * Componente visual puro para mostrar tooltip de definiciones/sinónimos.
 * Encapsula toda la presentación del bocadillo con sus botones de interacción.
 */

export const TooltipBubble = ({ tooltipInfo, handleButtonClick, handleReplaceText }) => {
    if (!tooltipInfo.visible) return null;

    return (
        <div 
            onMouseUp={(e) => e.stopPropagation()}
            style={{
                position: "absolute",
                top: `${tooltipInfo.y}px`,
                left: `clamp(135px, ${tooltipInfo.x}px, calc(100vw - 135px))`,
                transform: "translate(-50%, -100%)",
                backgroundColor: "white",
                border: "2px solid #5C32A8",
                borderRadius: "10px",
                padding: "10px",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                zIndex: 1000,
                maxWidth: "250px",
                fontSize: "14px",
                color: "black",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
            }}
        >
            {tooltipInfo.loading ? (
                // Loading state
                <span>...</span>
            ) : tooltipInfo.content ? (
                // Final response state
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                        {tooltipInfo.content}
                    </div>
                    
                    {/* Replace button (only for ORACION) */}
                    {tooltipInfo.type === "ORACION" && (
                        <button 
                            onClick={handleReplaceText}
                            style={{ 
                                padding: "5px 10px", 
                                cursor: "pointer", 
                                borderRadius: "5px", 
                                border: "1px solid #008000", 
                                backgroundColor: "#e6ffe6", 
                                fontWeight: "bold", 
                                color: "#006600" 
                            }}
                        >
                            Cambiar en el texto
                        </button>
                    )}
                </div>
            ) : tooltipInfo.type === "PALABRA" ? (
                // Word selection buttons
                <>
                    <button 
                        onClick={() => handleButtonClick("definicion")}
                        style={{ 
                            padding: "5px 10px", 
                            cursor: "pointer", 
                            borderRadius: "5px", 
                            border: "1px solid #5C32A8", 
                            backgroundColor: "#f0e6ff" 
                        }}
                    >
                        1. ¿Qué significa?
                    </button>
                    <button 
                        onClick={() => handleButtonClick("sinonimo")}
                        style={{ 
                            padding: "5px 10px", 
                            cursor: "pointer", 
                            borderRadius: "5px", 
                            border: "1px solid #5C32A8", 
                            backgroundColor: "#f0e6ff" 
                        }}
                    >
                        2. Palabra parecida
                    </button>
                </>
            ) : tooltipInfo.type === "ORACION" ? (
                // Sentence rephrasing button
                <button 
                    onClick={() => handleButtonClick("reformular")}
                    style={{ 
                        padding: "5px 10px", 
                        cursor: "pointer", 
                        borderRadius: "5px", 
                        border: "1px solid #5C32A8", 
                        backgroundColor: "#f0e6ff" 
                    }}
                >
                    Explícalo de otra forma
                </button>
            ) : null}
        </div>
    );
};
