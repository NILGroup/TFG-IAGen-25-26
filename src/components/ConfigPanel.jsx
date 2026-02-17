/**
 * ConfigPanel.jsx
 *
 * Panel de configuración para editar el perfil del usuario.
 *
 * MEJORAS DE ACCESIBILIDAD COGNITIVA:
 * - Títulos claros y descriptivos (no técnicos)
 * - Etiquetas en Lectura Fácil (sin acrónimos)
 * - Sin anglicismos ("bullets" → "listas")
 * - Confirmación clara al guardar
 */

import React, { useState } from "react";

const ConfigPanel = ({
    summary,
    tempSummary,
    setTempSummary,
    savedEffect,
    setSavedEffect,
    setEditingField
}) => {

    // Estado para confirmación de descartar
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    // Títulos claros para cada sección (Lectura Fácil)
    const sectionTitles = {
        nombre: "Tu nombre",
        discapacidad: "Cómo eres tú",
        retos: "Qué cosas te cuestan",
        herramientas: "Cómo quieres que te ayude"
    };

    // Opciones disponibles por categoría
    const getOptionsForField = (key) => {
        const options = {
            nombre: [],
            discapacidad: ["TEA", "Dislexia", "TDAH", "Memoria", "Prefiero no responder"],
            retos: ["Textos Largos", "Palabras Dificiles", "Organizar Ideas", "Mantener Atencion", "Memoria"],
            herramientas: ["ejemplo", "bullet", "textocorto", "frasescortas"]
        };
        return options[key] || [];
    };

    // Etiquetas en Lectura Fácil (sin acrónimos, sin anglicismos)
    const getLabelForOption = (option) => {
        const labels = {
            // Identificación - Lenguaje claro
            "TEA": "Tengo autismo",
            "Dislexia": "Me cuesta leer",
            "TDAH": "Me cuesta concentrarme",
            "Memoria": "Se me olvidan las cosas",
            "Prefiero no responder": "Prefiero no decirlo",
            // Retos - Lenguaje concreto
            "Textos Largos": "Leer textos largos",
            "Palabras Dificiles": "Entender palabras nuevas",
            "Organizar Ideas": "Ordenar mis ideas",
            "Mantener Atencion": "Estar concentrado",
            // Herramientas - Sin anglicismos
            "ejemplo": "Con ejemplos",
            "bullet": "Con listas",
            "textocorto": "Respuestas cortas",
            "frasescortas": "Frases fáciles"
        };
        return labels[option] || option;
    };

    // Emojis para cada opción
    const getEmojiForOption = (option) => {
        const emojis = {
            "TEA": "🧩",
            "Dislexia": "🔠",
            "TDAH": "⚡",
            "Memoria": "🧠",
            "Prefiero no responder": "🚫",
            "Textos Largos": "📖",
            "Palabras Dificiles": "❓",
            "Organizar Ideas": "🧩",
            "Mantener Atencion": "🎯",
            "ejemplo": "💡",
            "bullet": "📋",
            "textocorto": "📝",
            "frasescortas": "✂️"
        };
        return emojis[option] || "🔧";
    };

    // Toggle de opciones
    const toggleOption = (key, option) => {
        const current = tempSummary[key] || [];
        const exists = current.includes(option);
        const updated = exists
            ? current.filter(o => o !== option)
            : [...current, option];

        setTempSummary({ ...tempSummary, [key]: updated });
    };

    // Guardar cambios
    const handleSave = () => {
        Object.keys(summary).forEach(key => {
            if (["nombre", "discapacidad", "retos", "herramientas"].includes(key)) {
                summary[key] = tempSummary[key];
            }
        });
        setSavedEffect(true);
        setTimeout(() => setSavedEffect(false), 2000);
    };

    // Descartar cambios (con confirmación)
    const handleDiscard = () => {
        setTempSummary({ ...summary });
        setEditingField(null);
        setShowDiscardConfirm(false);
    };

    return (
        <div className="config-panel">
            <h2><span aria-hidden="true">⚙️ </span>Tu configuración</h2>
            <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>
                Aquí puedes cambiar lo que nos contaste antes.
            </p>

            {/* Secciones de configuración */}
            {Object.entries(summary)
                .filter(([key]) => ["nombre", "discapacidad", "retos", "herramientas"].includes(key))
                .map(([key]) => (
                    <div className="config-section" key={key}>
                        <h3>{sectionTitles[key]}</h3>

                        <div className="edit-options">
                            {key === "nombre" ? (
                                <>
                                    <label htmlFor="config-nombre" style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                        Escribe tu nombre:
                                    </label>
                                    <input
                                        id="config-nombre"
                                        type="text"
                                        className="nombre-input"
                                        value={tempSummary.nombre}
                                        onChange={(e) => setTempSummary({ ...tempSummary, nombre: e.target.value })}
                                        placeholder="Tu nombre aquí..."
                                    />
                                </>
                            ) : (
                                <>
                                    {getOptionsForField(key).map(option => (
                                        <label key={option} className="config-toggle-option">
                                            <span>
                                                <span aria-hidden="true">{getEmojiForOption(option)} </span>
                                                {getLabelForOption(option)}
                                            </span>
                                            <label className="switch" htmlFor={`config-${key}-${option}`}>
                                                <input
                                                    id={`config-${key}-${option}`}
                                                    type="checkbox"
                                                    checked={tempSummary[key]?.includes(option)}
                                                    onChange={() => toggleOption(key, option)}
                                                    aria-label={getLabelForOption(option)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </label>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                ))}

            {/* Botones de acción */}
            <div className="edit-buttons-global">
                <button
                    className="cancel-btn"
                    onClick={() => setShowDiscardConfirm(true)}
                >
                    Cancelar
                </button>

                <button
                    className={`save-btn ${savedEffect ? "saved-effect" : ""}`}
                    onClick={handleSave}
                >
                    {savedEffect ? "✓ Guardado" : "Guardar cambios"}
                </button>
            </div>

            {/* Mensaje de confirmación de guardado */}
            {savedEffect && (
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '8px',
                        color: '#2e7d32',
                        fontWeight: '600'
                    }}
                >
                    <span aria-hidden="true">✅ </span>
                    ¡Listo! Tus cambios están guardados.
                </div>
            )}

            {/* Diálogo de confirmación para descartar */}
            {showDiscardConfirm && (
                <div
                    className="confirm-overlay"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="discard-title"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000
                    }}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            maxWidth: '400px',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        <h3 id="discard-title" style={{ marginTop: 0 }}>
                            <span aria-hidden="true">⚠️ </span>
                            ¿Seguro que quieres cancelar?
                        </h3>
                        <p style={{ color: '#555' }}>
                            Los cambios que has hecho no se guardarán.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                            <button
                                onClick={() => setShowDiscardConfirm(false)}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#e0e0e0',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                No, seguir editando
                            </button>
                            <button
                                onClick={handleDiscard}
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigPanel;
