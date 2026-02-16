/**
 * Questionario.jsx
 *
 * Este componente representa un cuestionario que recopila información sobre:
 * - El nombre del usuario
 * - Con qué condiciones o discapacidades se identifica
 * - Qué retos tiene al aprender o entender información
 * - Qué herramientas le resultan más útiles para ayudarle con los retos
 * 
 * Con la finalidad de personalizar al máximo su experiencia usando OlivIA.
 *
 * A medida que el usuario avanza, se guarda la información en un resumen (`summary`),
 * que luego se utiliza para adaptar la experiencia conversacional.
 * 
 * Al completar el formulario, se llama a `onComplete(summary)`, que transfiere los datos
 * a la interfaz principal de la aplicación.
 */


import { useState } from "react";
import "../App.css";
import robotLogo from "../assets/AventurIA_robot_sinfondo.png";
import robotLogoCuerpo from "../assets/AventurIA_robotCuerposinfondo.png";

/** =================================
 *  BARRA DE PROGRESO DEL CUESTIONARIO
 *  =================================
 */

const stepLabels = [
    { number: 1, label: "Tu nombre" },
    { number: 2, label: "Identidad" },
    { number: 3, label: "Retos" },
    { number: 4, label: "Herramientas" },
    { number: 5, label: "Resumen" }
];

function ProgressStepper({ currentStep }) {
    const totalSteps = stepLabels.length;

    return (
        <div className="progress-stepper" role="navigation" aria-label="Progreso del cuestionario">
            <p className="progress-text" aria-live="polite">
                Paso {currentStep} de {totalSteps}
            </p>
            <div className="stepper-bar">
                {stepLabels.map((step) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const status = isCompleted ? "completed" : isCurrent ? "current" : "pending";

                    return (
                        <div key={step.number} className={`stepper-step ${status}`}>
                            <div
                                className={`stepper-circle ${status}`}
                                aria-current={isCurrent ? "step" : undefined}
                            >
                                {isCompleted ? "✓" : step.number}
                            </div>
                            <span className="stepper-label">{step.label}</span>
                            {step.number < totalSteps && (
                                <div className={`stepper-line ${isCompleted ? "completed" : ""}`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


export default function Questionario({ onComplete }) {

    /** ===================================
     *  ESTADOS DEL CUESTIONARIO (useState)
     *  ===================================
     */

    // Control de la página actual del cuestionario
    const [page, setPage] = useState(1);

    // Selección del usuario en la pregunta 2 ( solo una opcion )
    // const [userSelection, setUserSelection] = useState("");

    // Múltiples selecciones del usuario en preguntas tipo checkbox
    const [userSelections, setUserSelections] = useState([]);

    // Estado para el campo "Otra opción"
    const [otraSeleccionada, setOtraSeleccionada] = useState(false);
    const [otraData, setOtraData] = useState({
        caso2: { seleccionada: false, respuesta: "", guardada: false },
        caso3: { seleccionada: false, respuesta: "", guardada: false }
    });


    /** =========================
      *  NAVEGACIÓN ENTRE PÁGINAS
      *  ========================
      */

    // Función para avanzar a la siguiente página
    const nextPage = () => {
        if (page < 5) {
            setPage(page + 1);
        } else {
            onComplete(); // Termina el cuestionario y vuelve a la interfaz principal
        }
    };

    // Función para retroceder a la página anterior
    const prevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    /** ============================================
     *  ALMACENAMIENTO DE SELECCIÓN DEL CUESTIONARIO
     *  ============================================
     */
    const [summary, setSummary] = useState({
        nombre: "",            // Para el caso 1
        discapacidad: [],      // Para el caso 2
        retos: [],             // Para el caso 3
        herramientas: [],      // Para el caso 4
        mostrarPorPartes: false // Para la opción "Mostrar por partes"
    });

    // PÁGINA 1
    const handleNameChange = (e) => {
        setSummary(prevSummary => ({
            ...prevSummary,
            nombre: e.target.value
        }));
    };

    // PÁGINA 2
    const togglediscapacidad = (id) => {
        if (id == "Otra") {
            setOtraSeleccionada(!otraSeleccionada);

            if (!otraSeleccionada && otraRespuesta.trim()) {
                setSummary(prevSummary => ({
                    ...prevSummary,
                    discapacidad: [...prevSummary.discapacidad, `Otra - ${otraRespuesta}`]
                }));
            } else {
                setSummary(prevSummary => ({
                    ...prevSummary,
                    discapacidad: prevSummary.discapacidad.filter(item => !item.startsWith("Otra - "))
                }));
            }
        } else {
            setSummary(prevSummary => ({
                ...prevSummary,
                discapacidad: prevSummary.discapacidad.includes(id)
                    ? prevSummary.discapacidad.filter((item) => item !== id)
                    : [...prevSummary.discapacidad, id]
            }));
        }
    };


    // PÁGINA 3
    const toggleReto = (id) => {
        if (id === "Otra") {
            setOtraSeleccionada(!otraSeleccionada);

            if (!otraSeleccionada && otraRespuesta.trim()) {
                setSummary(prevSummary => ({
                    ...prevSummary,
                    retos: [...prevSummary.retos, `Otra - ${otraRespuesta}`]
                }));
            } else {
                setSummary(prevSummary => ({
                    ...prevSummary,
                    retos: prevSummary.retos.filter(item => !item.startsWith("Otra - "))
                }));
            }
        } else {
            setSummary(prevSummary => ({
                ...prevSummary,
                retos: prevSummary.retos.includes(id)
                    ? prevSummary.retos.filter((item) => item !== id)
                    : [...prevSummary.retos, id]
            }));
        }
    };


    // PÁGINA 4
    const toggleTool = (id) => {
        setSummary(prevSummary => ({
            ...prevSummary,
            herramientas: prevSummary.herramientas.includes(id)
                ? prevSummary.herramientas.filter((item) => item !== id)
                : [...prevSummary.herramientas, id]
        }));

    };

    // PÁGINA 5
    const generateSummary = () => (
        <div className="summary-box-horizontal" role="region" aria-label="Resumen de tu configuración">
            <h3>Tu resumen:</h3>

            {/* Nombre (PÁGINA 1)*/}
            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">🧑 </span>Tu nombre:</span>
                <span className="summary-data">{summary.nombre || "No indicado"}</span>
            </div>

            {/* Identificación (PÁGINA 2)*/}
            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">⭐ </span>Te identificas con:</span>
                <ul className="summary-bubbles">
                    {summary.discapacidad.length > 0 ? (
                        summary.discapacidad.map((item) => <li key={item}>{item}</li>)
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>

            {/* Retos (PÁGINA 3)*/}
            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">📌 </span>Te cuesta:</span>
                <ul className="summary-bubbles">
                    {summary.retos.length > 0 ? (
                        summary.retos.map((item) => <li key={item}>{item}</li>)
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>

            {/* Herramientas (PÁGINA 4)*/}
            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">🧠 </span>Te ayudará usando:</span>
                <ul className="summary-bubbles">
                    {summary.herramientas.length > 0 ? (
                        summary.herramientas.map((toolId) => {
                            if (toolId === "mostrarPorPartes") {
                                return <li key={toolId}><span aria-hidden="true">📚 </span>Mostrar por partes</li>;
                            }
                            const tool = tools.find((t) => t.id === toolId);
                            return <li key={toolId}>{tool?.label || toolId}</li>;
                        })
                    ) : (
                        <li>Ninguna seleccionada</li>
                    )}
                </ul>
            </div>
        </div>
    );



    /** ==============
     *  HERRAMIENTAS 
     *  ==============
     */

    // Lista de herramientas disponibles
    const tools = [
        { id: "ejemplo", label: "🖋️ Usar ejemplos", color: "green" },
        { id: "bullet", label: "📒 Respuestas en bullets", color: "purple" },
        { id: "textocorto", label: "📃 Texto Corto", color: "blue" },
        { id: "frasescortas", label: "✂️ Frases cortas", color: "yellow" }
    ];


    /* ========================
   *  CONTENIDO DE CADA PÁGINAS
   *  =========================
   */

    const renderPage = () => {
        switch (page) {
            case 1:
                return (
                    <div className="question-page">
                        <img src={robotLogo} alt="Robot OlivIA" className="robot-logo" />
                        <h2><span aria-hidden="true">🤖 </span>Vamos a preparar a OlivIA para ti</h2>
                        <p>OlivIA es tu ayudante digital.
                            <br />Te ayudará a aprender y a resolver dudas.
                        </p>
                        <label htmlFor="user-name" className="question-label">¿Cómo te llamas?</label>
                        <input
                            id="user-name"
                            type="text"
                            placeholder="Escribe tu nombre aquí..."
                            className="custom-input"
                            autoComplete="name"
                            value={summary.nombre}
                            onChange={handleNameChange}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="question-page">
                        <h2><span aria-hidden="true">⭐ </span>¿Con qué te identificas?</h2>
                        <p>Elige lo que mejor te describa:</p>

                        <fieldset className="toggle-options-container">
                            <legend className="sr-only">Selecciona con qué te identificas</legend>
                            {[
                                { id: "TEA", label: "TEA", icon: "🧩" },
                                { id: "Dislexia", label: "Dislexia", icon: "🔠" },
                                { id: "TDAH", label: "TDAH", icon: "⚡" },
                                { id: "Memoria", label: "Memoria", icon: "🧠" },
                                { id: "Prefiero no responder", label: "No responder", icon: "❌" }
                            ].map((option) => (
                                <div
                                    key={option.id}
                                    className={`toggle-option ${summary.discapacidad.includes(option.id) ? "active" : ""}`}
                                >
                                    <span className="toggle-label"><span aria-hidden="true">{option.icon} </span>{option.label}</span>
                                    <label className="switch" htmlFor={`disc-${option.id}`}>
                                        <input
                                            id={`disc-${option.id}`}
                                            type="checkbox"
                                            checked={summary.discapacidad.includes(option.id)}
                                            onChange={() => togglediscapacidad(option.id)}
                                            aria-label={option.label}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}

                            {/* Botón "Otra opción" en Caso 2 */}
                            <div className={`toggle-option ${otraData.caso2.guardada ? "active" : ""}`}>
                                <span className="toggle-label"><span aria-hidden="true">➕ </span>Otra opción</span>
                                <label className="switch" htmlFor="otra-caso2">
                                    <input
                                        id="otra-caso2"
                                        type="checkbox"
                                        checked={otraData.caso2.seleccionada}
                                        aria-label="Otra opción"
                                        onChange={() =>
                                            setOtraData(prev => ({
                                                ...prev,
                                                caso2: { ...prev.caso2, seleccionada: !prev.caso2.seleccionada }
                                            }))
                                        }
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {/* Campo de texto y botón de guardar */}
                            {otraData.caso2.seleccionada && (
                                <div className="other-input-container">
                                    <label htmlFor="otra-texto-caso2" className="sr-only">Escribe tu opción</label>
                                    <textarea
                                        id="otra-texto-caso2"
                                        className="custom-textarea"
                                        placeholder="Escribe aquí..."
                                        value={otraData.caso2.respuesta}
                                        onChange={(e) =>
                                            setOtraData(prev => ({
                                                ...prev,
                                                caso2: { ...prev.caso2, respuesta: e.target.value }
                                            }))
                                        }
                                    ></textarea>

                                    {otraData.caso2.respuesta.trim() && (
                                        <button
                                            className={`accept-btn ${otraData.caso2.guardada ? "saved" : ""}`}
                                            onClick={() => {
                                                setSummary(prevSummary => ({
                                                    ...prevSummary,
                                                    discapacidad: [...prevSummary.discapacidad, `Otra - ${otraData.caso2.respuesta}`]
                                                }));
                                                setOtraData(prev => ({
                                                    ...prev,
                                                    caso2: { ...prev.caso2, guardada: true }
                                                }));
                                            }}
                                        >
                                            {otraData.caso2.guardada ? "✅ Guardado" : "✅ Guardar"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </fieldset>
                    </div>
                );

            case 3:
                return (
                    <div className="question-page">
                        <h2><span aria-hidden="true">🌟 </span>¿Qué te cuesta más?</h2>
                        <p>Elige todo lo que quieras:</p>

                        <fieldset className="toggle-options-container">
                            <legend className="sr-only">Selecciona qué te cuesta más</legend>
                            {[
                                { id: "Textos Largos", label: "Textos largos", icon: "📖" },
                                { id: "Palabras Dificiles", label: "Palabras difíciles", icon: "🧩" },
                                { id: "Organizar Ideas", label: "Organizar ideas", icon: "📝" },
                                { id: "Mantener Atencion", label: "Mantener la atención", icon: "🎯" },
                                { id: "Memoria", label: "Recordar", icon: "🧠" },
                            ].map((option) => (
                                <div
                                    key={option.id}
                                    className={`toggle-option ${summary.retos.includes(option.id) ? "active" : ""}`}
                                >
                                    <span className="toggle-label"><span aria-hidden="true">{option.icon} </span>{option.label}</span>
                                    <label className="switch" htmlFor={`reto-${option.id}`}>
                                        <input
                                            id={`reto-${option.id}`}
                                            type="checkbox"
                                            checked={summary.retos.includes(option.id)}
                                            onChange={() => toggleReto(option.id)}
                                            aria-label={option.label}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}

                            {/* Botón "Otra opción" en Caso 3 */}
                            <div className={`toggle-option ${otraData.caso3.guardada ? "active" : ""}`}>
                                <span className="toggle-label"><span aria-hidden="true">➕ </span>Otra opción</span>
                                <label className="switch" htmlFor="otra-caso3">
                                    <input
                                        id="otra-caso3"
                                        type="checkbox"
                                        checked={otraData.caso3.seleccionada}
                                        aria-label="Otra opción"
                                        onChange={() =>
                                            setOtraData(prev => ({
                                                ...prev,
                                                caso3: { ...prev.caso3, seleccionada: !prev.caso3.seleccionada }
                                            }))
                                        }
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {/* Campo de texto y botón de guardar */}
                            {otraData.caso3.seleccionada && (
                                <div className="other-input-container">
                                    <label htmlFor="otra-texto-caso3" className="sr-only">Escribe tu opción</label>
                                    <textarea
                                        id="otra-texto-caso3"
                                        className="custom-textarea"
                                        placeholder="Escribe aquí..."
                                        value={otraData.caso3.respuesta}
                                        onChange={(e) =>
                                            setOtraData(prev => ({
                                                ...prev,
                                                caso3: { ...prev.caso3, respuesta: e.target.value }
                                            }))
                                        }
                                    ></textarea>

                                    {otraData.caso3.respuesta.trim() && (
                                        <button
                                            className={`accept-btn ${otraData.caso3.guardada ? "saved" : ""}`}
                                            onClick={() => {
                                                setSummary(prevSummary => ({
                                                    ...prevSummary,
                                                    retos: [...prevSummary.retos, `Otra - ${otraData.caso3.respuesta}`]
                                                }));
                                                setOtraData(prev => ({
                                                    ...prev,
                                                    caso3: { ...prev.caso3, guardada: true }
                                                }));
                                            }}
                                        >
                                            {otraData.caso3.guardada ? "✅ Guardado" : "✅ Guardar"}
                                        </button>
                                    )}
                                </div>
                            )}


                        </fieldset>
                    </div>
                );

            case 4:
                return (
                    <div className="question-page">
                        <h2><span aria-hidden="true">🌟 </span>¿Cómo quieres que te ayude OlivIA?</h2>
                        <p>Elige todo lo que quieras:</p>

                        <fieldset className="options-container">
                            <legend className="sr-only">Selecciona las herramientas que quieres usar</legend>
                            {tools.map((tool) => (
                                <div key={tool.id} className={`option-box ${summary.herramientas.includes(tool.id) ? "active" : ""}`}>
                                    <div className="option-header">
                                        <span className="option-title">{tool.label}</span>
                                        <label className="switch" htmlFor={`tool-${tool.id}`}>
                                            <input
                                                id={`tool-${tool.id}`}
                                                type="checkbox"
                                                checked={summary.herramientas.includes(tool.id)}
                                                onChange={() => toggleTool(tool.id)}
                                                aria-label={tool.label}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    {/* Ejemplo visual según la herramienta seleccionada */}
                                    <div className="example-container">
                                        <span className="example-title">Ejemplo:</span>
                                        {tool.id === "ejemplo" && (
                                            <ul>
                                                <li>Un planeta es como una pelota gigante que da vueltas alrededor de una luz muy fuerte, como el Sol. Por ejemplo, la Tierra es un planeta que gira alrededor del Sol.</li>
                                            </ul>
                                        )}

                                        {tool.id === "bullet" && (
                                            <ul>
                                                <li>🪐 Cuerpo celeste.</li>
                                                <li>💫 Órbita alrededor de una estrella.</li>
                                                <li>🌍 Suficiente masa para ser esférico.</li>
                                            </ul>
                                        )}

                                        {tool.id === "textocorto" && (
                                            <ul>
                                                <li>Un planeta es un cuerpo celeste que gira alrededor de una estrella y tiene forma esférica.</li>
                                            </ul>
                                        )}

                                        {tool.id === "frasescortas" && (
                                            <ul>
                                                <li>Es un cuerpo celeste. Orbita alrededor de una estrella. Tiene masa suficiente para volverse esférico.</li>
                                            </ul>
                                        )}

                                    </div>
                                </div>
                            ))}
                        </fieldset>

                    </div>
                );

            case 5:
                return (
                    <div className="question-page">
                        <div className="final-content">
                            <h2 className="final-title">
                                <span aria-hidden="true">🚀 </span>OlivIA está lista para ayudarte
                            </h2>
                            <p className="final-text">
                                Gracias por contarnos cómo podemos ayudarte.
                                OlivIA ya está preparada.</p>

                            {generateSummary()} {/* RESUMEN COMPLETO */}

                            <div className="robot-container">
                                <img src={robotLogoCuerpo} alt="Compañero Virtual" className="robot-img" />
                            </div>

                            <h3 className="final-question">¿Todo está bien?</h3>

                            <div className="button-group">
                                <button className="final-btn gray" onClick={() => setPage(1)}>
                                    <span aria-hidden="true">🔄 </span>Quiero cambiar algo
                                </button>
                                <button className="final-btn green" onClick={() => onComplete(summary)}>
                                    <span aria-hidden="true">✔️ </span>Sí, estoy listo
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return <></>;
        }
    };

    /** ================================
     *  RETORNO DE LA INTERFAZ (UI)
     *  ================================
     */

    return (
        <div className="container questionnaire-layout">
            <ProgressStepper currentStep={page} />

            <div className="questionnaire-content">
                {renderPage()}
            </div>

            <div className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}>
                {page > 1 && page < 5 && <button className="back-btn" onClick={prevPage}>Anterior</button>}
                {page < 5 && <button className="next-btn" onClick={nextPage}>Siguiente →</button>}
            </div>
        </div>
    );
}

