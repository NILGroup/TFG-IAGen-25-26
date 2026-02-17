/**
 * ConfigPanel.jsx
 *
 * Panel de configuración para editar el perfil del usuario.
 * Diseño consistente con el cuestionario (COGA + Lectura Fácil)
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
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [activeSection, setActiveSection] = useState("sobre-ti");

    // Opciones para cada sección (sin emojis, Lectura Fácil)
    const sections = {
        "sobre-ti": {
            title: "Sobre ti",
            key: "discapacidad",
            options: [
                { id: "TEA", label: "Autismo (TEA)", description: "Me cuesta entender cómo piensan otros" },
                { id: "TDAH", label: "Atención (TDAH)", description: "Me distraigo rápido o me muevo mucho" },
                { id: "Dislexia", label: "Lectura (Dislexia)", description: "Las letras se mezclan o leo lento" },
                { id: "Memoria", label: "Memoria", description: "Olvido lo que acabo de leer o hacer" },
                { id: "Prefiero no responder", label: "Prefiero no decirlo", description: "" }
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
        const current = tempSummary[key] || [];
        const updated = current.includes(optionId)
            ? current.filter(o => o !== optionId)
            : [...current, optionId];
        setTempSummary({ ...tempSummary, [key]: updated });
    };

    const handleSave = () => {
        Object.keys(sections).forEach(sectionKey => {
            const key = sections[sectionKey].key;
            summary[key] = tempSummary[key];
        });
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
                    Sobre ti
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
