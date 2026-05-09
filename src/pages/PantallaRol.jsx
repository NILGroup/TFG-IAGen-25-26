/**
 * PantallaRol.jsx
 *
 * Pantalla que aparece después del cuestionario inicial.
 * El usuario elige quién le va a acompañar: Profesor o Familia.
 * El modo seleccionado determina el avatar que aparecerá
 * junto a las respuestas de la IA en el chat.
 */

import "../styles/Pantallas.css";

export default function PantallaRol({ onSelectMode, selectedMode = null }) {
    return (
        <div className="modo-container">
            <div className="modo-content">
                <h1 className="modo-title">¿Quién te va a acompañar?</h1>
                <p className="modo-subtitle">Elige a tu compañero para esta aventura</p>

                <div className="modo-options">
                    {/* Tarjeta Profesor */}
                    <button
                        className={`modo-card ${selectedMode === "profesor" ? "checked" : ""}`}
                        aria-label="Elegir Profesor"
                        onClick={() => onSelectMode("profesor")}
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}Profesor_eleccion.png`}
                            alt="Ilustración del Profesor"
                            className="modo-img"
                        />
                        <span className="modo-card-title">Profesor</span>
                        <span className="modo-card-desc">Te explica como un experto</span>
                    </button>

                    {/* Tarjeta Familiar */}
                    <button
                        className={`modo-card ${selectedMode === "familiar" ? "checked" : ""}`}
                        aria-label="Elegir Familiar"
                        onClick={() => onSelectMode("familiar")}
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}Familiar_eleccion.png`}
                            alt="Ilustración del Familiar"
                            className="modo-img"
                        />
                        <span className="modo-card-title">Familiar</span>
                        <span className="modo-card-desc">Te ayuda como un familiar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
