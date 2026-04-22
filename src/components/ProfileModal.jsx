/**
 * ProfileModal.jsx
 *
 * Modal de pantalla completa para editar el perfil del usuario.
 * Similar a HistoryModal pero con el contenido del perfil.
 * Incluye aviso si hay cambios sin guardar al intentar cerrar.
 */

import { useState, useEffect } from "react";

export default function ProfileModal({ isOpen, onClose, summary, onSave }) {
  // Estados para todos los campos del perfil
  const [nombre, setNombre] = useState("");
  const [tieneDI, setTieneDI] = useState("");
  const [grado, setGrado] = useState("");
  const [retos, setRetos] = useState([]);
  const [retoOtro, setRetoOtro] = useState("");
  const [herramientas, setHerramientas] = useState([]);
  const [rol, setRol] = useState("profesor");

  // Estado para mostrar aviso de cambios sin guardar
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Sincronizar estados con summary cuando se abre el modal
  useEffect(() => {
    if (isOpen && summary) {
      setNombre(summary.nombre || "");
      setTieneDI(summary.discapacidad?.tieneDI || "");
      setGrado(summary.discapacidad?.grado || "");
      setRetos(summary.retos || []);
      setRetoOtro(summary.retoOtro || "");
      setHerramientas(summary.herramientas || []);
      setRol(summary.rol || "profesor");
      setShowUnsavedWarning(false);
    }
  }, [isOpen, summary]);

  if (!isOpen) return null;

  /**
   * Detecta si hay cambios comparando con los valores originales.
   */
  const hayChangios =
    nombre !== (summary?.nombre || "") ||
    tieneDI !== (summary?.discapacidad?.tieneDI || "") ||
    grado !== (summary?.discapacidad?.grado || "") ||
    JSON.stringify(retos) !== JSON.stringify(summary?.retos || []) ||
    retoOtro !== (summary?.retoOtro || "") ||
    JSON.stringify(herramientas) !== JSON.stringify(summary?.herramientas || []) ||
    rol !== (summary?.rol || "profesor");

  /**
   * Maneja el cambio de discapacidad.
   */
  const handleTieneDIChange = (value) => {
    setTieneDI(value);
    if (value !== "si") {
      setGrado("");
    }
  };

  /**
   * Toggle para dificultades (retos)
   */
  const toggleReto = (id) => {
    setRetos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Toggle para herramientas
   */
  const toggleHerramienta = (id) => {
    setHerramientas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Guarda los cambios del perfil.
   */
  const handleGuardar = () => {
    const updatedSummary = {
      ...summary,
      nombre,
      discapacidad: {
        tieneDI,
        grado: tieneDI === "si" ? grado : "",
      },
      retos,
      retoOtro,
      herramientas,
      rol,
    };
    onSave(updatedSummary);
    onClose();
  };

  /**
   * Intenta cerrar el modal. Si hay cambios, muestra aviso.
   */
  const handleCloseRequest = () => {
    if (hayChangios) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  /**
   * Cierra sin guardar (desde el aviso).
   */
  const handleCloseWithoutSaving = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  /**
   * Cancela el cierre y vuelve al formulario.
   */
  const handleCancelClose = () => {
    setShowUnsavedWarning(false);
  };

  // Lista de herramientas
  const tools = [
    {
      id: "lecturaFacil",
      label: "Texto fácil de leer",
      description: "Te explico todo con palabras sencillas",
      ejemplo: "Un planeta es una bola muy grande. Está en el cielo. Da vueltas alrededor del Sol.",
    },
    {
      id: "ejemplo",
      label: "Con ejemplos",
      description: "Te lo explico con cosas que conoces",
      ejemplo: "Un planeta es como una pelota grande que da vueltas al Sol.",
    },
    {
      id: "bullet",
      label: "Con listas",
      description: "Te lo cuento punto por punto",
      ejemplo: "• Es muy grande\n• Da vueltas al Sol\n• Tiene forma de bola",
    },
    {
      id: "textocorto",
      label: "Respuestas cortas",
      description: "Te lo cuento en pocas palabras",
      ejemplo: "Un planeta es una bola grande que gira alrededor del Sol.",
    },
    {
      id: "frasescortas",
      label: "Frases cortas",
      description: "Cada idea en una frase",
      ejemplo: "Es una bola. Es muy grande. Da vueltas al Sol.",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-perfil-backdrop"
        onClick={handleCloseRequest}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="modal-perfil"
        role="dialog"
        aria-labelledby="profile-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="modal-perfil-header">
          <h2 id="profile-modal-title" className="modal-perfil-titulo">
            Mi Perfil
          </h2>
          <button
            onClick={handleCloseRequest}
            className="modal-perfil-cerrar"
            aria-label="Cerrar perfil"
          >
            Cerrar
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="modal-perfil-contenido">
          <p className="modal-perfil-subtitulo">
            Edita tu información y preferencias
          </p>

          {/* SECCIÓN 1: NOMBRE */}
          <div className="formulario-card">
            <label htmlFor="modal-perfil-nombre" className="formulario-label">
              ¿Cómo te llamas?
            </label>
            <input
              id="modal-perfil-nombre"
              type="text"
              className="formulario-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre..."
              aria-label="Campo de texto para escribir tu nombre"
            />
          </div>

          {/* SECCIÓN 2: DISCAPACIDAD INTELECTUAL */}
          <div className="formulario-card">
            <fieldset className="radio-group" aria-labelledby="modal-pregunta-di">
              <legend id="modal-pregunta-di" className="formulario-label">
                ¿Tienes discapacidad intelectual?
              </legend>

              {[
                { id: "si", label: "Sí" },
                { id: "no", label: "No" },
                { id: "no_se", label: "No lo sé / No estoy segura(o)" },
                { id: "prefiero_no", label: "Prefiero no decirlo" },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`radio-card ${tieneDI === option.id ? "checked" : ""}`}
                  htmlFor={`modal-di-${option.id}`}
                >
                  <input
                    type="radio"
                    name="modal-tieneDI"
                    id={`modal-di-${option.id}`}
                    checked={tieneDI === option.id}
                    onChange={() => handleTieneDIChange(option.id)}
                  />
                  <span className="radio-label">{option.label}</span>
                  <span className="radio-indicator" aria-hidden="true">
                    {tieneDI === option.id ? "✓" : ""}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>

          {/* SECCIÓN 3: GRADO (solo si tiene DI) */}
          {tieneDI === "si" && (
            <div className="formulario-card perfil-card-animada">
              <fieldset
                className="radio-group radio-group-secondary"
                aria-labelledby="modal-pregunta-grado"
              >
                <legend id="modal-pregunta-grado" className="formulario-label">
                  ¿Sabes el grado de tu discapacidad intelectual?
                </legend>

                {[
                  { id: "limite", label: "Límite" },
                  { id: "leve", label: "Leve" },
                  { id: "moderada", label: "Moderada" },
                  { id: "severa", label: "Severa" },
                  { id: "profunda", label: "Profunda" },
                  { id: "no_se", label: "No lo sé / No estoy segura(o)" },
                  { id: "prefiero_no", label: "Prefiero no decirlo" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className={`radio-card ${grado === option.id ? "checked" : ""}`}
                    htmlFor={`modal-grado-${option.id}`}
                  >
                    <input
                      type="radio"
                      name="modal-gradoDI"
                      id={`modal-grado-${option.id}`}
                      checked={grado === option.id}
                      onChange={() => setGrado(option.id)}
                    />
                    <span className="radio-label">{option.label}</span>
                    <span className="radio-indicator" aria-hidden="true">
                      {grado === option.id ? "✓" : ""}
                    </span>
                  </label>
                ))}
              </fieldset>
            </div>
          )}

          {/* SECCIÓN 4: DIFICULTADES (RETOS) */}
          <div className="formulario-card">
            <fieldset
              className="checkbox-list-vertical"
              aria-labelledby="modal-titulo-dificultades"
            >
              <legend id="modal-titulo-dificultades" className="formulario-label">
                ¿Qué te cuesta más?
              </legend>
              <p className="formulario-helper">Puedes elegir varias opciones</p>

              {[
                { id: "frases_largas", label: "Me cuesta leer y entender frases largas." },
                { id: "palabras_dificiles", label: "Me cuesta leer y entender palabras difíciles." },
                { id: "muchas_cosas", label: "Me cuesta entender si me dicen muchas cosas seguidas." },
                { id: "recordar", label: "Me cuesta recordar cosas de hace poco tiempo." },
                { id: "pensar_palabras", label: "Me cuesta pensar las palabras para escribir lo que quiero." },
                { id: "escribir_largo", label: "Me cuesta escribir frases largas." },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`checkbox-card-row ${retos.includes(option.id) ? "checked" : ""}`}
                  htmlFor={`modal-reto-${option.id}`}
                >
                  <input
                    type="checkbox"
                    id={`modal-reto-${option.id}`}
                    checked={retos.includes(option.id)}
                    onChange={() => toggleReto(option.id)}
                  />
                  <span className="checkbox-card-row-label">{option.label}</span>
                  <span className="checkbox-card-row-indicator" aria-hidden="true">
                    {retos.includes(option.id) ? "✓" : ""}
                  </span>
                </label>
              ))}

              {/* Opción "Otra" */}
              <div className={`checkbox-card-otra-directa ${retoOtro.trim() ? "activa" : ""}`}>
                <span className="otra-opcion-label">Me cuesta otra cosa:</span>
                <input
                  type="text"
                  className="otra-opcion-input-directa"
                  placeholder="Escribe aquí..."
                  value={retoOtro}
                  onChange={(e) => setRetoOtro(e.target.value)}
                />
              </div>
            </fieldset>
          </div>

          {/* SECCIÓN 5: HERRAMIENTAS DE AYUDA */}
          <div className="formulario-card">
            <fieldset
              className="checkbox-list-vertical"
              aria-labelledby="modal-titulo-herramientas"
            >
              <legend id="modal-titulo-herramientas" className="formulario-label">
                ¿Cómo quieres que te ayude?
              </legend>
              <p className="formulario-helper">Marca lo que prefieras. Puedes elegir varias.</p>

              {tools.map((tool) => (
                <label
                  key={tool.id}
                  className={`checkbox-card-row-expanded ${herramientas.includes(tool.id) ? "checked" : ""}`}
                  htmlFor={`modal-tool-${tool.id}`}
                >
                  <input
                    type="checkbox"
                    id={`modal-tool-${tool.id}`}
                    checked={herramientas.includes(tool.id)}
                    onChange={() => toggleHerramienta(tool.id)}
                  />
                  <div className="checkbox-card-row-content">
                    <div className="checkbox-card-row-header">
                      <span className="checkbox-card-row-label">{tool.label}</span>
                      <span className="checkbox-card-row-indicator" aria-hidden="true">
                        {herramientas.includes(tool.id) ? "✓" : ""}
                      </span>
                    </div>
                    <span className="checkbox-card-row-desc">{tool.description}</span>
                    <div className="checkbox-card-row-example">
                      <span className="checkbox-card-row-example-title">Ejemplo:</span>
                      <p className="checkbox-card-row-example-text">{tool.ejemplo}</p>
                    </div>
                  </div>
                </label>
              ))}
            </fieldset>
          </div>

          {/* SECCIÓN 6: ROL DE SOFÍA */}
          <div className="formulario-card">
            <fieldset className="radio-group" aria-labelledby="modal-pregunta-rol">
              <legend id="modal-pregunta-rol" className="formulario-label">
                ¿Qué rol quieres que tenga SofIA?
              </legend>
              <p className="formulario-helper">Elige cómo quieres que SofIA te ayude</p>

              {[
                { value: "profesor", label: "Profesor" },
                { value: "familiar", label: "Familiar" },
              ].map((opcion) => (
                <label
                  key={opcion.value}
                  className={`radio-card ${rol === opcion.value ? "checked" : ""}`}
                  htmlFor={`modal-rol-${opcion.value}`}
                >
                  <input
                    type="radio"
                    name="modal-rol"
                    id={`modal-rol-${opcion.value}`}
                    checked={rol === opcion.value}
                    onChange={() => setRol(opcion.value)}
                  />
                  <span className="radio-label">{opcion.label}</span>
                  <span className="radio-indicator" aria-hidden="true">
                    {rol === opcion.value ? "✓" : ""}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>
        </div>

        {/* Footer con botón guardar */}
        <div className="modal-perfil-footer">
          <button
            className={`modal-perfil-btn-guardar ${hayChangios ? "con-cambios" : ""}`}
            onClick={handleGuardar}
          >
            {hayChangios ? "Aplicar cambios" : "Guardar"}
          </button>
        </div>

        {/* Modal de aviso de cambios sin guardar */}
        {showUnsavedWarning && (
          <>
            <div
              className="modal-aviso-backdrop"
              onClick={handleCancelClose}
              aria-hidden="true"
            />
            <div
              className="modal-aviso"
              role="alertdialog"
              aria-labelledby="aviso-title"
              aria-describedby="aviso-desc"
            >
              <h3 id="aviso-title" className="modal-aviso-titulo">
                Tienes cambios sin guardar
              </h3>
              <p id="aviso-desc" className="modal-aviso-texto">
                Si cierras ahora, perderás los cambios que has hecho.
              </p>
              <div className="modal-aviso-botones">
                <button
                  className="modal-aviso-btn-cancelar"
                  onClick={handleCancelClose}
                >
                  Volver al perfil
                </button>
                <button
                  className="modal-aviso-btn-cerrar"
                  onClick={handleCloseWithoutSaving}
                >
                  Cerrar sin guardar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
