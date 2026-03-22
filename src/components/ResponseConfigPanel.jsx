/**
 * ResponseConfigPanel.jsx
 *
 * Panel lateral derecho para configurar cómo OlivIA responde.
 * Permite elegir opciones como lectura fácil, ejemplos, listas, etc.
 */

import { useState, useEffect } from "react";

const RESPONSE_OPTIONS = [
  {
    id: "lectura-facil",
    label: "Lectura Fácil",
    description: "Texto simplificado y fácil de entender",
  },
  {
    id: "ejemplos",
    label: "Ejemplos",
    description: "Incluir ejemplos prácticos para ilustrar",
  },
  {
    id: "listas",
    label: "Listas",
    description: "Organizar la información en puntos clave",
  },
  {
    id: "textos-cortos",
    label: "Textos Cortos",
    description: "Respuestas breves y concisas",
  },
  {
    id: "frases-sencillas",
    label: "Frases Sencillas",
    description: "Usar frases cortas y vocabulario común",
  },
];

export default function ResponseConfigPanel({ isOpen, onClose, currentConfig = [], onApply }) {
  const [selectedOptions, setSelectedOptions] = useState(currentConfig);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar con la configuración actual cuando se abre el panel
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions(currentConfig);
      setHasChanges(false);
    }
  }, [isOpen, currentConfig]);

  // Detectar cambios
  useEffect(() => {
    const changed =
      JSON.stringify([...selectedOptions].sort()) !==
      JSON.stringify([...currentConfig].sort());
    setHasChanges(changed);
  }, [selectedOptions, currentConfig]);

  const toggleOption = (id) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply(selectedOptions);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setSelectedOptions(currentConfig);
    setHasChanges(false);
  };

  return (
    <div
      className={`response-config-panel ${isOpen ? "open" : ""}`}
      role="complementary"
      aria-label="Panel de configuración de respuestas"
    >
      {/* Header */}
      <div className="response-config-header">
        <h2>Configuración</h2>
        <button
          onClick={onClose}
          className="response-config-close-btn"
          aria-label="Cerrar configuración"
        >
          →
        </button>
      </div>

      {/* Mensaje de cambios pendientes */}
      {hasChanges && (
        <div className="response-config-warning">
          <p>Los cambios no se aplicarán hasta que pulses <strong>"Aplicar"</strong></p>
        </div>
      )}

      {/* Lista de opciones */}
      <div className="response-config-content">
        <p className="response-config-instruction">
          Elige cómo quieres que te responda OlivIA:
        </p>
        <div className="response-config-options">
          {RESPONSE_OPTIONS.map((option) => {
            const isSelected = selectedOptions.includes(option.id);

            return (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`response-config-option ${isSelected ? "selected" : ""}`}
                aria-pressed={isSelected}
              >
                <div className="response-config-option-text">
                  <span className="response-config-option-label">{option.label}</span>
                  <span className="response-config-option-desc">{option.description}</span>
                </div>
                <span className="response-config-option-indicator">
                  {isSelected ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="response-config-actions">
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="response-config-reset-btn"
          aria-label="Deshacer cambios"
        >
          Deshacer
        </button>
        <button
          onClick={handleApply}
          disabled={!hasChanges}
          className="response-config-apply-btn"
          aria-label="Aplicar cambios"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
