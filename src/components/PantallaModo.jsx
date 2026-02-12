/**
 * PantallaModo.jsx
 *
 * Pantalla que aparece después del cuestionario inicial.
 * El usuario elige quién le va a acompañar: Profesor o Familia.
 * El modo seleccionado determina el avatar que aparecerá
 * junto a las respuestas de la IA en el chat.
 */

import "../styles/PantallaModo.css";

export default function PantallaModo({ onSelectMode }) {
    return (
        <div className="modo-container">
            <div className="modo-content">
                <h1 className="modo-title">¿Quién te va a acompañar?</h1>
                <p className="modo-subtitle">Elige a tu compañero para esta aventura</p>

                <div className="modo-options">
                    {/* Tarjeta Profesor */}
                    <div
                        className="modo-card"
                        role="button"
                        tabIndex={0}
                        aria-label="Elegir modo Profesor"
                        onClick={() => onSelectMode("profesor")}
                        onKeyDown={(e) => e.key === "Enter" && onSelectMode("profesor")}
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}Profesor_eleccion.png`}
                            alt="Profesor"
                            className="modo-img"
                        />
                        <h2 className="modo-card-title">Profesor</h2>
                    </div>

                    {/* Tarjeta Familia */}
                    <div
                        className="modo-card"
                        role="button"
                        tabIndex={0}
                        aria-label="Elegir modo Familia"
                        onClick={() => onSelectMode("familiar")}
                        onKeyDown={(e) => e.key === "Enter" && onSelectMode("familiar")}
                    >
                        <img
                            src={`${import.meta.env.BASE_URL}Familiar_eleccion.png`}
                            alt="Familia"
                            className="modo-img"
                        />
                        <h2 className="modo-card-title">Familia</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
