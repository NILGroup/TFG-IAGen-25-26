import { useState, useEffect } from "react";

export default function ProfilePanel({ isOpen, onClose, summary, onSave }) {
  const [nombre, setNombre] = useState(summary?.nombre || "");
  const [discapacidad, setDiscapacidad] = useState(summary?.discapacidad || "");
  const [grado, setGrado] = useState(summary?.grado || "");
  const [rol, setRol] = useState(summary?.rol || "");

  useEffect(() => {
    if (isOpen) {
      setNombre(summary?.nombre || "");
      setDiscapacidad(summary?.discapacidad || "");
      setGrado(summary?.grado || "");
      setRol(summary?.rol || "");
    }
  }, [isOpen, summary]);

  const handleDiscapacidadChange = (value) => {
    setDiscapacidad(value);
    if (value !== "Sí") {
      setGrado("");
    }
  };

  const handleGuardar = () => {
    const updatedSummary = {
      ...summary,
      nombre,
      discapacidad,
      grado: discapacidad === "Sí" ? grado : "",
      rol,
    };
    onSave(updatedSummary);
    onClose();
  };

  return (
    <div
      className={`panel-perfil ${isOpen ? "abierto" : "cerrado"}`}
      role="complementary"
      aria-label="Panel de perfil"
    >
      {/* Header */}
      <div className="panel-perfil-header">
        <button
          onClick={onClose}
          className="panel-perfil-cerrar"
          aria-label="Cerrar perfil"
        >
          →
        </button>
        <h2 className="panel-perfil-titulo">Mi Perfil</h2>
      </div>

      <div className="panel-perfil-contenido">
        {/* Nombre */}
        <div className="panel-perfil-seccion">
          <label htmlFor="perfil-nombre" className="panel-perfil-label">
            ¿Cómo te llamas?
          </label>
          <input
            id="perfil-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Escribe tu nombre..."
            className="panel-perfil-input"
            aria-label="Campo de texto para escribir tu nombre"
          />
        </div>

        {/* Discapacidad */}
        <div className="panel-perfil-seccion">
          <label className="panel-perfil-label">
            ¿Tienes discapacidad intelectual?
          </label>
          <div className="panel-perfil-opciones">
            {["Sí", "No", "No lo sé / No estoy seguro(a)", "Prefiero no decirlo"].map((opcion) => (
              <button
                key={opcion}
                onClick={() => handleDiscapacidadChange(opcion)}
                className={`panel-perfil-opcion ${
                  discapacidad === opcion ? "seleccionada" : ""
                }`}
                aria-pressed={discapacidad === opcion}
                role="radio"
              >
                <span className="panel-perfil-opcion-texto">{opcion}</span>
                {discapacidad === opcion && (
                  <div className="panel-perfil-check">
                    <svg className="panel-perfil-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grado (solo si tiene discapacidad) */}
        {discapacidad === "Sí" && (
          <div className="panel-perfil-seccion panel-perfil-seccion-animada">
            <label className="panel-perfil-label">
              ¿Sabes el grado de tu discapacidad intelectual?
            </label>
            <div className="panel-perfil-opciones">
              {["Leve", "Moderada", "Severa", "Profunda", "No lo sé / No estoy seguro(a)", "Prefiero no decirlo"].map((opcion) => (
                <button
                  key={opcion}
                  onClick={() => setGrado(opcion)}
                  className={`panel-perfil-opcion ${
                    grado === opcion ? "seleccionada" : ""
                  }`}
                  aria-pressed={grado === opcion}
                  role="radio"
                >
                  <span className="panel-perfil-opcion-texto">{opcion}</span>
                  {grado === opcion && (
                    <div className="panel-perfil-check">
                      <svg className="panel-perfil-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rol */}
        <div className="panel-perfil-seccion">
          <label className="panel-perfil-label">
            ¿Qué rol quieres que tenga SofIA?
          </label>
          <div className="panel-perfil-opciones">
            {[
              { value: "profesor", label: "Profesor" },
              { value: "familiar", label: "Familiar" },
            ].map((opcion) => (
              <button
                key={opcion.value}
                onClick={() => setRol(opcion.value)}
                className={`panel-perfil-opcion ${
                  rol === opcion.value ? "seleccionada" : ""
                }`}
                aria-pressed={rol === opcion.value}
                role="radio"
              >
                <span className="panel-perfil-opcion-texto">{opcion.label}</span>
                {rol === opcion.value && (
                  <div className="panel-perfil-check">
                    <svg className="panel-perfil-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="panel-perfil-footer">
        <button
          onClick={handleGuardar}
          className="panel-perfil-guardar"
          aria-label="Guardar cambios del perfil"
        >
          Guardar Perfil
        </button>
      </div>
    </div>
  );
}
