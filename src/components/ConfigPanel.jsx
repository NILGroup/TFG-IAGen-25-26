/**
 * ConfigPanel.jsx
 *
 * Panel de configuración para editar el perfil del usuario.
 */

import React, { useState } from "react";

const ConfigPanel = ({
    summary,
    tempSummary,
    setTempSummary,
    savedEffect,
    setSavedEffect,
    setEditingField,
    onSaveSummary
}) => {
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [activeSection, setActiveSection] = useState("sobre-ti");

    // Opciones para cada sección (sin emojis, Lectura Fácil)
    const sections = {
        "sobre-ti": {
            title: "¿Tienes discapacidad intelectual?",
            options: [
                { id: "si", label: "Sí" },
                { id: "no", label: "No" },
                { id: "no_se", label: "No lo sé / No estoy segura(o)" },
                { id: "prefiero_no", label: "Prefiero no decirlo" }
            ]
        },
        "grado": {
            title: "¿Sabes el grado de tu discapacidad?",
            options: [
                { id: "leve", label: "Leve" },
                { id: "moderada", label: "Moderada" },
                { id: "severa", label: "Severa" },
                { id: "profunda", label: "Profunda" },
                { id: "no_se", label: "No lo sé / No estoy segura(o)" },
                { id: "prefiero_no", label: "Prefiero no decirlo" }
            ]
        },
        "retos": {
            title: "Qué te cuesta",
            key: "retos",
            options: [
                { id: "Textos Largos", label: "Leer mucho", description: "Me canso con textos largos" },
                { id: "Palabras Dificiles", label: "Palabras nuevas", description: "Hay palabras que no entiendo" },
                { id: "Organizar Ideas", label: "Ordenar ideas", description: "No sé por dónde empezar" },
                { id: "Mantener Atencion", label: "Concentrarme", description: "Me distraigo fácil" },
                { id: "Memoria", label: "Recordar cosas", description: "Se me olvida lo que leo" }
            ]
        },
        "herramientas": {
            title: "Cómo ayudarte",
            key: "herramientas",
            options: [
                { id: "ejemplo", label: "Con ejemplos", description: "Te explico con casos de la vida real" },
                { id: "bullet", label: "Con listas", description: "Te lo cuento punto por punto" },
                { id: "textocorto", label: "Textos cortos", description: "Te lo cuento en pocas palabras" },
                { id: "frasescortas", label: "Frases sencillas", description: "Uso palabras fáciles" }
            ]
        }
    };

    const toggleOption = (key, optionId) => {
        if (key === "tieneDI") {
            setTempSummary({ 
                ...tempSummary, 
                discapacidad: { 
                    ...tempSummary.discapacidad, 
                    tieneDI: optionId,
                    grado: optionId !== "si" ? "" : tempSummary.discapacidad.grado // Reset grado si no es "sí"
                } 
            });
        } else if (key === "grado") {
            setTempSummary({ 
                ...tempSummary, 
                discapacidad: { 
                    ...tempSummary.discapacidad, 
                    grado: optionId 
                } 
            });
        } else {
            // Para retos y herramientas (arrays de checkboxes)
            const current = tempSummary[key] || [];
            const updated = current.includes(optionId)
                ? current.filter(o => o !== optionId)
                : [...current, optionId];
            setTempSummary({ ...tempSummary, [key]: updated });
        }
    };

    const handleSave = () => {
        const nextSummary = {
            ...summary,
            ...tempSummary
        };

        if (onSaveSummary) {
            onSaveSummary(nextSummary);
            return;
        }

        // Fallback para mantener compatibilidad con pantallas antiguas
        summary.discapacidad = tempSummary.discapacidad;
        summary.retos = tempSummary.retos;
        summary.herramientas = tempSummary.herramientas;
        summary.nombre = tempSummary.nombre;
        setSavedEffect(true);
        setTimeout(() => setSavedEffect(false), 2000);
    };

    const handleDiscard = () => {
        setTempSummary({ ...summary });
        setEditingField(null);
        setShowDiscardConfirm(false);
    };

    const currentSection = sections[activeSection];

    return (
        <div className="config-panel-new">
            {/* Header */}
            <div className="config-header">
                <h1>Tu configuración</h1>
                <p>Cambia lo que quieras. Tus cambios se guardan cuando pulses "Guardar".</p>
            </div>

            {/* Tabs de navegación */}
            <div className="config-tabs">
                <button
                    className={`config-tab ${activeSection === "nombre" ? "active" : ""}`}
                    onClick={() => setActiveSection("nombre")}
                >
                    Tu nombre
                </button>
                <button
                    className={`config-tab ${activeSection === "sobre-ti" ? "active" : ""}`}
                    onClick={() => setActiveSection("sobre-ti")}
                >
                    Discapacidad
                </button>
                <button
                    className={`config-tab ${activeSection === "grado" ? "active" : ""}`}
                    onClick={() => setActiveSection("grado")}
                >
                    Grado
                </button>
                <button
                    className={`config-tab ${activeSection === "retos" ? "active" : ""}`}
                    onClick={() => setActiveSection("retos")}
                >
                    Qué te cuesta
                </button>
                <button
                    className={`config-tab ${activeSection === "herramientas" ? "active" : ""}`}
                    onClick={() => setActiveSection("herramientas")}
                >
                    Cómo ayudarte
                </button>
            </div>

            {/* Contenido de la sección activa */}
            <div className="config-content">
                {activeSection === "nombre" ? (
                    <div className="config-nombre-section">
                        <h2>Tu nombre</h2>
                        <label htmlFor="config-nombre-input">
                            ¿Cómo te llamas?
                        </label>
                        <input
                            id="config-nombre-input"
                            type="text"
                            className="config-nombre-input"
                            value={tempSummary.nombre || ""}
                            onChange={(e) => setTempSummary({ ...tempSummary, nombre: e.target.value })}
                            placeholder="Escribe tu nombre..."
                        />
                    </div>
                ) : activeSection === "sobre-ti" ? (
                    <div className="config-options-section">
                        <h2>{sections["sobre-ti"].title}</h2>
                        <div className="config-grid">
                            {sections["sobre-ti"].options.map((option) => (
                                <label
                                    key={option.id}
                                    className={`config-card ${tempSummary.discapacidad?.tieneDI === option.id ? 'checked' : ''}`}
                                    htmlFor={`config-tieneDI-${option.id}`}
                                >
                                    <input
                                        type="radio"
                                        name="tieneDI"
                                        id={`config-tieneDI-${option.id}`}
                                        checked={tempSummary.discapacidad?.tieneDI === option.id || false}
                                        onChange={() => toggleOption("tieneDI", option.id)}
                                    />
                                    <div className="config-card-text">
                                        <span className="config-card-label">{option.label}</span>
                                    </div>
                                    <span className="config-card-indicator" aria-hidden="true">
                                        {tempSummary.discapacidad?.tieneDI === option.id ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : activeSection === "grado" ? (
                    <div className="config-options-section">
                        <h2>{sections["grado"].title}</h2>
                        <p className="config-instruction">Esta pregunta solo aplica si respondiste "Sí" en la sección anterior.</p>
                        <div className="config-grid">
                            {sections["grado"].options.map((option) => (
                                <label
                                    key={option.id}
                                    className={`config-card ${tempSummary.discapacidad?.grado === option.id ? 'checked' : ''}`}
                                    htmlFor={`config-grado-${option.id}`}
                                >
                                    <input
                                        type="radio"
                                        name="grado"
                                        id={`config-grado-${option.id}`}
                                        checked={tempSummary.discapacidad?.grado === option.id || false}
                                        onChange={() => toggleOption("grado", option.id)}
                                    />
                                    <div className="config-card-text">
                                        <span className="config-card-label">{option.label}</span>
                                    </div>
                                    <span className="config-card-indicator" aria-hidden="true">
                                        {tempSummary.discapacidad?.grado === option.id ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="config-options-section">
                        <h2>{currentSection.title}</h2>
                        <p className="config-instruction">Marca lo que se aplica a ti.</p>

                        <div className="config-grid">
                            {currentSection.options.map((option) => (
                                <label
                                    key={option.id}
                                    className={`config-card ${tempSummary[currentSection.key]?.includes(option.id) ? 'checked' : ''}`}
                                    htmlFor={`config-${currentSection.key}-${option.id}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`config-${currentSection.key}-${option.id}`}
                                        checked={tempSummary[currentSection.key]?.includes(option.id) || false}
                                        onChange={() => toggleOption(currentSection.key, option.id)}
                                    />
                                    <div className="config-card-text">
                                        <span className="config-card-label">{option.label}</span>
                                        {option.description && (
                                            <span className="config-card-desc">{option.description}</span>
                                        )}
                                    </div>
                                    <span className="config-card-indicator" aria-hidden="true">
                                        {tempSummary[currentSection.key]?.includes(option.id) ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Botones de acción fijos */}
            <div className="config-actions">
                <button
                    className="config-cancel-btn"
                    onClick={() => setShowDiscardConfirm(true)}
                >
                    Cancelar
                </button>
                <button
                    className={`config-save-btn ${savedEffect ? "saved" : ""}`}
                    onClick={handleSave}
                >
                    {savedEffect ? "✓ Guardado" : "Guardar cambios"}
                </button>
            </div>

            {/* Mensaje de guardado */}
            {savedEffect && (
                <div className="config-saved-message" role="status" aria-live="polite">
                    ¡Listo! Tus cambios están guardados.
                </div>
            )}

            {/* Modal de confirmación */}
            {showDiscardConfirm && (
                <div className="config-modal-overlay">
                    <div className="config-modal">
                        <h3>¿Seguro que quieres cancelar?</h3>
                        <p>Los cambios que has hecho no se guardarán.</p>
                        <div className="config-modal-buttons">
                            <button onClick={() => setShowDiscardConfirm(false)}>
                                No, seguir editando
                            </button>
                            <button className="danger" onClick={handleDiscard}>
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
