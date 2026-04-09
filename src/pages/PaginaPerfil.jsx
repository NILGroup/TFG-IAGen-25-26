/**
 * PaginaPerfil.jsx
 *
 * Página completa de configuración del perfil del usuario.
 * Incluye TODOS los campos del cuestionario inicial:
 * - Nombre
 * - Discapacidad intelectual y grado
 * - Dificultades (retos)
 * - Herramientas de ayuda preferidas
 * - Rol de SofIA
 *
 * Usa el mismo diseño que Questionario.jsx para mantener coherencia.
 */

import { useState, useEffect } from "react";
import "../styles/Pantallas.css";
import PanelGlosario from "../components/PanelGlosario";

export default function PaginaPerfil({ summary, onSave, onBack }) {
  // Estados para todos los campos del perfil
  const [nombre, setNombre] = useState(summary?.nombre || "");
  const [tieneDI, setTieneDI] = useState(summary?.discapacidad?.tieneDI || "");
  const [grado, setGrado] = useState(summary?.discapacidad?.grado || "");
  const [retos, setRetos] = useState(summary?.retos || []);
  const [herramientas, setHerramientas] = useState(summary?.herramientas || []);
  const [rol, setRol] = useState(summary?.rol || "profesor");

  // Estado para el panel de glosario
  const [showGlosario, setShowGlosario] = useState(false);

  // Actualizar estados cuando cambie el summary
  useEffect(() => {
    setNombre(summary?.nombre || "");
    setTieneDI(summary?.discapacidad?.tieneDI || "");
    setGrado(summary?.discapacidad?.grado || "");
    setRetos(summary?.retos || []);
    setHerramientas(summary?.herramientas || []);
    setRol(summary?.rol || "profesor");
  }, [summary]);

  /**
   * Maneja el cambio de discapacidad.
   * Si el usuario selecciona algo diferente a "si", limpia el grado.
   */
  const handleTieneDIChange = (value) => {
    setTieneDI(value);
    if (value !== "si") {
      setGrado("");
    }
  };

  /**
   * Toggle para dificultades (retos) - múltiple selección
   */
  const toggleReto = (id) => {
    setRetos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Toggle para herramientas - múltiple selección
   */
  const toggleHerramienta = (id) => {
    setHerramientas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /**
   * Guarda los cambios del perfil y vuelve a la página anterior.
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
      herramientas,
      rol,
    };
    onSave(updatedSummary);
    onBack();
  };

  /**
   * Detecta si hay cambios comparando con los valores originales.
   */
  const hayChangios =
    nombre !== (summary?.nombre || "") ||
    tieneDI !== (summary?.discapacidad?.tieneDI || "") ||
    grado !== (summary?.discapacidad?.grado || "") ||
    JSON.stringify(retos) !== JSON.stringify(summary?.retos || []) ||
    JSON.stringify(herramientas) !== JSON.stringify(summary?.herramientas || []) ||
    rol !== (summary?.rol || "profesor");

  // Lista de herramientas (igual que en el cuestionario)
  const tools = [
    {
      id: "lecturaFacil",
      label: "Lectura Fácil",
      description: "Texto adaptado para una lectura más sencilla",
      ejemplo: "Un planeta es un cuerpo celeste. Un planeta orbita alrededor del Sol, es grande y tiene forma de bola.",
    },
    {
      id: "ejemplo",
      label: "Con ejemplos",
      description: "Te explico con casos de la vida real",
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
      label: "Textos cortos",
      description: "Te lo cuento en pocas palabras",
      ejemplo: "Un planeta es una bola grande que gira alrededor del Sol.",
    },
    {
      id: "frasescortas",
      label: "Frases sencillas",
      description: "Uso palabras fáciles de entender",
      ejemplo: "Es una bola. Es muy grande. Da vueltas al Sol.",
    },
  ];

  return (
    <div className="app-wrapper">
      {/* Header con logo */}
      <div className="header-bar">
        <div className="header-bar-container">
          <h1
            className="header-bar-title"
            onClick={onBack}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onBack();
              }
            }}
          >
            SofIA
          </h1>
        </div>
      </div>

      {/* Botón de Diccionario tipo dropdown - izquierda */}
      <div className="diccionario-dropdown-container">
        <button
          className="diccionario-dropdown-btn"
          onClick={() => setShowGlosario(!showGlosario)}
          aria-label="Abrir diccionario"
          aria-expanded={showGlosario}
        >
          <span className="diccionario-dropdown-texto">Diccionario</span>
          <span className="diccionario-dropdown-icono">▼</span>
        </button>
      </div>

      {/* Contenedor principal del perfil */}
      <div className="formulario-container perfil-container">
        <div className="formulario-content perfil-content">
          {/* Botón volver */}
          <button className="pantalla-back-btn" onClick={onBack}>
            Volver
          </button>

          {/* Título */}
          <h1 className="formulario-title">Mi Perfil</h1>
          <p className="formulario-subtitle">
            Edita tu información y preferencias
          </p>

          {/* =====================
              SECCIÓN 1: NOMBRE
              ===================== */}
          <div className="formulario-card">
            <label htmlFor="perfil-nombre" className="formulario-label">
              ¿Cómo te llamas?
            </label>
            <input
              id="perfil-nombre"
              type="text"
              className="formulario-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Escribe tu nombre..."
              aria-label="Campo de texto para escribir tu nombre"
            />
          </div>

          {/* ============================================
              SECCIÓN 2: DISCAPACIDAD INTELECTUAL
              ============================================ */}
          <div className="formulario-card">
            <fieldset className="radio-group" aria-labelledby="pregunta-di-perfil">
              <legend id="pregunta-di-perfil" className="formulario-label">
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
                  htmlFor={`perfil-di-${option.id}`}
                >
                  <input
                    type="radio"
                    name="tieneDI-perfil"
                    id={`perfil-di-${option.id}`}
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

          {/* ========================================
              SECCIÓN 3: GRADO (solo si tiene DI)
              ======================================== */}
          {tieneDI === "si" && (
            <div className="formulario-card perfil-card-animada">
              <fieldset
                className="radio-group radio-group-secondary"
                aria-labelledby="pregunta-grado-perfil"
              >
                <legend id="pregunta-grado-perfil" className="formulario-label">
                  ¿Sabes el grado de tu discapacidad intelectual?
                </legend>

                {[
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
                    htmlFor={`perfil-grado-${option.id}`}
                  >
                    <input
                      type="radio"
                      name="gradoDI-perfil"
                      id={`perfil-grado-${option.id}`}
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

          {/* ====================================
              SECCIÓN 4: DIFICULTADES (RETOS)
              ==================================== */}
          <div className="formulario-card">
            <fieldset
              className="checkbox-list-vertical"
              aria-labelledby="titulo-dificultades-perfil"
            >
              <legend id="titulo-dificultades-perfil" className="formulario-label">
                ¿Qué te cuesta más?
              </legend>
              <p className="formulario-helper">Puedes elegir varias opciones</p>

              {[
                { id: "frases_largas", label: "Me cuesta leer y entender frases largas." },
                {
                  id: "palabras_dificiles",
                  label: "Me cuesta leer y entender palabras difíciles.",
                },
                {
                  id: "muchas_cosas",
                  label: "Me cuesta entender si me dicen muchas cosas seguidas.",
                },
                { id: "recordar", label: "Me cuesta recordar cosas de hace poco tiempo." },
                {
                  id: "pensar_palabras",
                  label: "Me cuesta pensar las palabras para escribir lo que quiero.",
                },
                { id: "escribir_largo", label: "Me cuesta escribir frases largas." },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`checkbox-card-row ${
                    retos.includes(option.id) ? "checked" : ""
                  }`}
                  htmlFor={`perfil-reto-${option.id}`}
                >
                  <input
                    type="checkbox"
                    id={`perfil-reto-${option.id}`}
                    checked={retos.includes(option.id)}
                    onChange={() => toggleReto(option.id)}
                  />
                  <span className="checkbox-card-row-label">{option.label}</span>
                  <span className="checkbox-card-row-indicator" aria-hidden="true">
                    {retos.includes(option.id) ? "✓" : ""}
                  </span>
                </label>
              ))}
            </fieldset>
          </div>

          {/* =======================================
              SECCIÓN 5: HERRAMIENTAS DE AYUDA
              ======================================= */}
          <div className="formulario-card">
            <fieldset
              className="checkbox-list-vertical"
              aria-labelledby="titulo-herramientas-perfil"
            >
              <legend id="titulo-herramientas-perfil" className="formulario-label">
                ¿Cómo quieres que te ayude?
              </legend>
              <p className="formulario-helper">Marca lo que prefieras. Puedes elegir varias.</p>

              {tools.map((tool) => (
                <label
                  key={tool.id}
                  className={`checkbox-card-row-expanded ${
                    herramientas.includes(tool.id) ? "checked" : ""
                  }`}
                  htmlFor={`perfil-tool-${tool.id}`}
                >
                  <input
                    type="checkbox"
                    id={`perfil-tool-${tool.id}`}
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

          {/* ============================
              SECCIÓN 6: ROL DE SOFÍA
              ============================ */}
          <div className="formulario-card">
            <fieldset className="radio-group" aria-labelledby="pregunta-rol-perfil">
              <legend id="pregunta-rol-perfil" className="formulario-label">
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
                  htmlFor={`perfil-rol-${opcion.value}`}
                >
                  <input
                    type="radio"
                    name="rol-perfil"
                    id={`perfil-rol-${opcion.value}`}
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

          {/* Botón de guardar - solo si hay cambios */}
          {hayChangios && (
            <button className="formulario-submit-btn" onClick={handleGuardar}>
              Guardar Cambios
            </button>
          )}
        </div>
      </div>

      {/* Panel de Glosario */}
      <PanelGlosario isOpen={showGlosario} onClose={() => setShowGlosario(false)} />
    </div>
  );
}
