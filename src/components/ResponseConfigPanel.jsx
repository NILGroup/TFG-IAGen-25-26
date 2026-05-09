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

const RESPONSE_FORMAT_OPTIONS = [
  {
    id: "lectura-facil",
    label: "Lectura Fácil",
    description: "Te explico todo con palabras sencillas",
  },
  {
    id: "ejemplos",
    label: "Con ejemplos",
    description: "Te explico todo con cosas que conoces ",
  },
  {
    id: "listas",
    label: "Con listas",
    description: "Te cuento las cosas punto por punto",
  },
  {
    id: "textos-cortos",
    label: "Respuestas cortas",
    description: "Te cuento las cosas en pocas palabras",
  },
  {
    id: "frases-sencillas",
    label: "Frases cortas",
    description: "Te cuento cada idea en una frase",
  },
  {
    id: "pasoapaso",
    label: "Paso a paso",
    description: "Te explico cómo hacerlo en orden",
  },
];

const normalizeResponseFormat = (formats = []) => {
  if (!Array.isArray(formats)) return [];

  const aliases = {
    lecturaFacil: "lectura-facil",
    ejemplo: "ejemplos",
    bullet: "listas",
    textocorto: "textos-cortos",
    frasescortas: "frases-sencillas",
  };

  return [...new Set(formats.map((format) => aliases[format] || format).filter(Boolean))];
};

// Opciones de rol
const ROLE_OPTIONS = [
  {
    id: "profesor",
    label: "Profesor",
    description: "Te ayuda como un profesor",
  },
  {
    id: "familiar",
    label: "Familiar",
    description: "Te ayuda como un familiar",
  },
];

export default function ResponseConfigPanel({
  currentConfig = [],
  currentRole = "profesor",
  onApply,
  onRoleChange,
}) {
  const [selectedOptions, setSelectedOptions] = useState(
    normalizeResponseFormat(currentConfig)
  );
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [hasChanges, setHasChanges] = useState(false);

  // Sincronizar con la configuración actual
  useEffect(() => {
    setSelectedOptions(normalizeResponseFormat(currentConfig));
    setSelectedRole(currentRole);
    setHasChanges(false);
  }, [currentConfig, currentRole]);

  // Detectar cambios
  useEffect(() => {
    const normalizedCurrentConfig = normalizeResponseFormat(currentConfig);
    const configChanged =
      JSON.stringify([...selectedOptions].sort()) !==
      JSON.stringify([...normalizedCurrentConfig].sort());
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
      onApply(normalizeResponseFormat(selectedOptions), selectedRole);
    }
    if (onRoleChange && selectedRole !== currentRole) {
      onRoleChange(selectedRole);
    }
    setHasChanges(false);
  };

  const handleReset = () => {
    setSelectedOptions(normalizeResponseFormat(currentConfig));
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
          Cómo quieres las respuestas
        </h2>

        {/* Mensaje de advertencia */}
        {hasChanges && (
          <div className="response-config-warning">
            <span className="response-config-warning-text">
              Pulsa Aplicar cambios para ver la respuesta de otra forma
            </span>
          </div>
        )}

        {/* Lista de opciones de formato */}
        <div className="response-config-options">
          {RESPONSE_FORMAT_OPTIONS.map((option) => {
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
          aria-label="No cambiar nada"
        >
          No cambiar
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
