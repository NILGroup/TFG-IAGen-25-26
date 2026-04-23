/**
 * ResponseConfigPanel.jsx
 *
 * Panel lateral derecho para configurar:
 * - Cómo se presentan las respuestas de SofIA (Lectura Fácil, Ejemplos, etc.)
 * - El rol del ayudante (Profesor o Familiar)
 *
 * Al aplicar cambios, la IA regenera la respuesta con la nueva configuración.
 */

import { useState, useEffect } from "react";

// Opciones de formato de respuesta
const RESPONSE_OPTIONS = [
  {
    id: "lectura-facil",
    label: "Lectura Fácil",
    description: "Texto simplificado y fácil de entender",
  },
  {
    id: "ejemplos",
    label: "Con ejemplos",
    description: "Incluir ejemplos prácticos para ilustrar",
  },
  {
    id: "listas",
    label: "Con listas",
    description: "Organizar la información en puntos clave",
  },
  {
    id: "textos-cortos",
    label: "Textos cortos",
    description: "Respuestas breves y concisas",
  },
  {
    id: "frases-sencillas",
    label: "Frases sencillas",
    description: "Usar frases cortas y vocabulario común",
  },
];

// Opciones de rol
const ROLE_OPTIONS = [
  {
    id: "profesor",
    label: "Profesor",
    description: "Explica de forma didáctica y paciente",
  },
  {
    id: "familiar",
    label: "Familiar",
    description: "Cercano, cálido y de confianza",
  },
];

export default function ResponseConfigPanel({
  currentConfig = [],
  currentRole = "profesor",
  onApply,
  onRoleChange,
}) {
  const [selectedOptions, setSelectedOptions] = useState(currentConfig);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar con la configuración actual
  useEffect(() => {
    setSelectedOptions(currentConfig);
    setSelectedRole(currentRole);
    setHasChanges(false);
  }, [currentConfig, currentRole]);

  // Detectar cambios
  useEffect(() => {
    const configChanged =
      JSON.stringify([...selectedOptions].sort()) !==
      JSON.stringify([...currentConfig].sort());
    const roleChanged = selectedRole !== currentRole;

    setHasChanges(configChanged || roleChanged);
  }, [selectedOptions, selectedRole, currentConfig, currentRole]);

  const toggleOption = (id) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    if (onApply) {
      onApply(selectedOptions);
    }
    if (onRoleChange && selectedRole !== currentRole) {
      onRoleChange(selectedRole);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setSelectedOptions(currentConfig);
    setSelectedRole(currentRole);
    setHasChanges(false);
  };

  return (
    <div
      className="response-config-panel"
      role="complementary"
      aria-label="Panel de configuración"
    >
      {/* Sección: Formato de respuestas */}
      <div className="response-config-section">
        <h2 className="response-config-section-title">
          Cómo quieres que aparezcan las respuestas
        </h2>

        {/* Mensaje de advertencia */}
        {hasChanges && (
          <div className="response-config-warning">
            <span className="response-config-warning-text">
              Pulsa "Aplicar cambios" para regenerar la respuesta
            </span>
          </div>
        )}

        {/* Lista de opciones de formato */}
        <div className="response-config-options">
          {RESPONSE_OPTIONS.map((option) => {
            const isSelected = selectedOptions.includes(option.id);

            return (
              <label
                key={option.id}
                className={`checkbox-card-row ${isSelected ? "checked" : ""}`}
                htmlFor={`config-${option.id}`}
              >
                <input
                  type="checkbox"
                  id={`config-${option.id}`}
                  checked={isSelected}
                  onChange={() => toggleOption(option.id)}
                />
                <div className="checkbox-card-row-text">
                  <span className="checkbox-card-row-label">{option.label}</span>
                  <span className="checkbox-card-row-desc">{option.description}</span>
                </div>
                <span className="checkbox-card-row-indicator" aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sección: Rol del ayudante */}
      <div className="response-config-section">
        <h2 className="response-config-section-title">
          Quién te acompaña
        </h2>

        <div className="response-config-options">
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.id;

            return (
              <label
                key={option.id}
                className={`radio-card ${isSelected ? "checked" : ""}`}
                htmlFor={`role-${option.id}`}
              >
                <input
                  type="radio"
                  name="role-config"
                  id={`role-${option.id}`}
                  checked={isSelected}
                  onChange={() => setSelectedRole(option.id)}
                />
                <span className="radio-label">{option.label}</span>
                <span className="radio-indicator" aria-hidden="true">
                  {isSelected ? "✓" : ""}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="response-config-actions">
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="response-config-btn reset-btn"
          aria-label="Descartar cambios"
        >
          Descartar
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
