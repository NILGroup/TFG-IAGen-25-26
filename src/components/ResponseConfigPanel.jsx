/**
 * ResponseConfigPanel.jsx
 *
 * Panel lateral derecho para configurar cómo se presentan las respuestas de SofIA.
 * Solo aparece cuando el usuario elige el flujo "con ayuda".
 * Permite activar/desactivar opciones como Lectura Fácil, Ejemplos, Listas, etc.
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

export default function ResponseConfigPanel({
  isOpen,
  onClose,
  currentConfig = [],
  onApply,
}) {
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
      className={`response-config-panel ${isOpen ? "open" : "closed"}`}
      role="complementary"
      aria-label="Panel de configuración de respuestas"
    >
      {/* Header */}
      <div className="response-config-header">
        <button
          onClick={onClose}
          className="response-config-close-btn"
          aria-label="Ocultar configuración"
        >
          ←
        </button>
        <h2 className="response-config-title">Respuestas</h2>
      </div>

      {/* Warning Message */}
      {hasChanges && (
        <div className="response-config-warning">
          <span className="response-config-warning-icon">⚠️</span>
          <p className="response-config-warning-text">
            Los cambios no se aplicarán hasta que pulses el botón{" "}
            <strong>"Aplicar cambios"</strong>
          </p>
        </div>
      )}

      {/* Options List */}
      <div className="response-config-options">
        {RESPONSE_OPTIONS.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => toggleOption(option.id)}
              className={`response-config-option ${
                isSelected ? "selected" : ""
              }`}
              aria-pressed={isSelected}
              role="checkbox"
              aria-checked={isSelected}
            >
              <div className="response-config-option-content">
                <div className="response-config-option-label">
                  {option.label}
                </div>
                <div className="response-config-option-desc">
                  {option.description}
                </div>
              </div>
              <div className={`response-config-checkbox ${isSelected ? "checked" : ""}`}>
                {isSelected && <span>✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="response-config-actions">
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="response-config-btn reset-btn"
          aria-label="Eliminar cambios"
        >
          Eliminar cambios
        </button>
        <button
          onClick={handleApply}
          disabled={!hasChanges}
          className="response-config-btn apply-btn"
          aria-label="Aplicar cambios"
        >
          Aplicar cambios
        </button>
      </div>
    </div>
  );
}
