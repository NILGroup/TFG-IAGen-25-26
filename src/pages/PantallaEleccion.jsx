/**
 * PantallaEleccion.jsx
 *
 * Pantalla que aparece después de elegir el rol.
 * Muestra dos opciones al usuario:
 * 1. "Con ayuda" - Le guía con un formulario para crear un buen prompt
 * 2. "Directa" - Le permite escribir libremente sin ayuda
 */

import "../styles/Pantallas.css";

export default function PantallaEleccion({ onSelectOption, onBack }) {
    return (
        <div className="eleccion-container">
            <div className="eleccion-content">
                {/* Botón volver */}
                <button className="pantalla-back-btn" onClick={onBack}>
                    Volver
                </button>

                <h1 className="eleccion-title">¿Cómo quieres empezar?</h1>
                <p className="eleccion-subtitle">Pulsa en la opción que quieras</p>

                <div className="eleccion-options">
                    {/* Tarjeta Con ayuda */}
                    <button
                        className="eleccion-card"
                        aria-label="Empezar con ayuda"
                        onClick={() => onSelectOption("formulario")}
                    >
                        <span className="eleccion-card-title">Con ayuda</span>
                        <span className="eleccion-card-desc">
                            Te haré preguntas sencillas para preparar tu mensaje
                        </span>
                    </button>

                    {/* Tarjeta Directa */}
                    <button
                        className="eleccion-card"
                        aria-label="Empezar directamente"
                        onClick={() => onSelectOption("directa")}
                    >
                        <span className="eleccion-card-title">Directa</span>
                        <span className="eleccion-card-desc">
                            Escribe directamente lo que quieras preguntar
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
