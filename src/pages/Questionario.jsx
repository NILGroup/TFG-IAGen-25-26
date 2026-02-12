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
        <div className="summary-box-horizontal">
            <h3>Resumen de tu nueva compañera virtual:</h3>

            {/* Nombre (PÁGINA 1)*/}
            <div className="summary-row">
                <span className="summary-title">🧑 Tu nombre:</span>
                <span className="summary-data">{summary.nombre || "No indicado"}</span>
            </div>

            {/* Identificación (PÁGINA 2)*/}
            <div className="summary-row">
                <span className="summary-title">⭐ Te identificas con:</span>
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
                <span className="summary-title">📌 Te cuesta:</span>
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
                <span className="summary-title">🧠 Te ayudará usando:</span>
                <ul className="summary-bubbles">
                    {summary.herramientas.length > 0 ? (
                        summary.herramientas.map((toolId) => {
                            if (toolId === "mostrarPorPartes") {
                                return <li key={toolId}>📚 Mostrar por partes</li>;
                            }
                            const tool = tools.find((t) => t.id === toolId);
                            return <li key={toolId}>{tool?.label || toolId}</li>;
                        })
                    ) : (
                        <li>No se seleccionó ninguna herramienta</li>
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
                        <img src={robotLogo} alt="AventurIA Logo" className="robot-logo" />
                        <h2> ¡Vamos a crear a tu Compañero Digital de Inteligencia Artifical!</h2>
                        <p>¡Bienvenido! Hoy vas a diseñar a OlivIA, tu compañera digital única, hecho a tu medida.
                            <br />                            Ella te ayudará a aprender, resolver dudas y acompañarte en tu día a día.
                        </p>
                        <h3>¿Cómo te llamas?</h3>
                        <input
                            type="text"
                            placeholder="Escribe tu nombre aquí..."
                            className="custom-input"
                            value={summary.nombre}
                            onChange={handleNameChange}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="question-page">
                        <h2>⭐ Paso 1: Cada persona es única</h2>
                        <p>Para que OlivIA pueda ayudarte mejor, quiere conocerte un poquito más.</p>
                        <h3>¿Con qué te sientes más identificado?</h3>

                        <div className="toggle-options-container">
                            {[
                                { id: "TEA", label: "🧩 TEA" },
                                { id: "Dislexia", label: "🔠 Dislexia" },
                                { id: "TDAH", label: "⚡ TDAH" },
                                { id: "Memoria", label: "🧠 Memoria" },
                                { id: "Prefiero no responder", label: "❌ No responder" }
                            ].map((option) => (
                                <div
                                    key={option.id}
                                    className={`toggle-option ${userSelections.includes(option.id) ? "active" : ""}`}

                                >
                                    <span className="toggle-label">{option.label}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={summary.discapacidad.includes(option.id)}
                                            onChange={() => togglediscapacidad(option.id)} />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}

                            {/* Botón "Otra opción" en Caso 2 */}
                            <div className={`toggle-option ${otraData.caso2.guardada ? "active" : ""}`}>
                                <span className="toggle-label">➕ Otra opción</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={otraData.caso2.seleccionada}
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
                                    <textarea
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
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="question-page">
                        <h2>🌟 Paso 2: ¡Haz que tu compañera digital sea tu mejor guía!</h2>
                        <h3>¿Qué te cuesta más entender?</h3>
                        <p>Elige todas las que veas necesarias:</p>

                        <div className="toggle-options-container">
                            {[
                                { id: "Textos Largos", label: "Textos largos", color: "yellow", icon: "📖 " },
                                { id: "Palabras Dificiles", label: "Palabras difíciles", color: "green", icon: "🧩 " },
                                { id: "Organizar Ideas", label: "Organizar ideas", color: "blue", icon: "📝 " },
                                { id: "Mantener Atencion", label: "Mantener la atención", color: "orange", icon: "🎯 " },
                                { id: "Memoria", label: "Recordar", color: "purple", icon: "🧠 " },
                            ].map((option) => (
                                <div
                                    key={option.id}
                                    className={`toggle-option ${userSelections.includes(option.id) ? "active" : ""}`}

                                >
                                    <span className="toggle-label"> {option.icon}{option.label}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={summary.retos.includes(option.id)}
                                            onChange={() => toggleReto(option.id)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            ))}

                            {/* Botón "Otra opción" en Caso 3 */}
                            <div className={`toggle-option ${otraData.caso3.guardada ? "active" : ""}`}>
                                <span className="toggle-label">➕ Otra opción</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={otraData.caso3.seleccionada}
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
                                    <textarea
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


                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="question-page">
                        <h2>🎭 Paso 3: Dale una personalidad a tu compañera virtual </h2>
                        <p>Teniendo en cuenta lo elegido antes</p>
                        <h3>¿Cómo quieres que te ayude tu compañero digital? </h3>
                        <p>Elige todas las opciones que veas necesarias:</p>


                        <div className="options-container">
                            {tools.map((tool) => (
                                <div key={tool.id} className={`option-box ${summary.herramientas.includes(tool.id) ? "active" : ""}`}>
                                    <div className="option-header">
                                        <span className="option-title">{tool.label}</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={summary.herramientas.includes(tool.id)}
                                                onChange={() => toggleTool(tool.id)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>

                                    {/* Ejemplo visual según la herramienta seleccionada */}
                                    <div className="example-container">
                                        <label className="example-title">Ejemplo:</label>
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
                        </div>

                    </div>
                );

            case 5:
                return (
                    <div className="question-page">
                        <div className="final-content">
                            <h2 className="final-title">
                                ¡OlivIA está lista para ayudarte! 🚀
                            </h2>
                            <p className="final-text">
                                Gracias por contarme cómo puedo ayudarte mejor.
                                OlivIA ya está preparada para explicarte lo que necesites, cuando lo necesites.</p>

                            {generateSummary()} {/* RESUMEN COMPLETO */}

                            <div className="robot-container">
                                <img src={robotLogoCuerpo} alt="Compañero Virtual" className="robot-img" />
                            </div>

                            <h3 className="final-question">¿Quieres conocer a tu nueva compañera?</h3>

                            <div className="button-group">
                                <button className="final-btn gray" onClick={() => setPage(1)}>
                                    🔄 No, quiero cambiar algo
                                </button>
                                <button className="final-btn green" onClick={() => onComplete(summary)}>
                                    ✔️ Sí, estoy listo
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
        <div className="container">
            {renderPage()}
            <div className={`nav-buttons ${page === 1 ? "center-nav" : "right-nav"}`}>
                {page > 1 && page < 5 && <button className="back-btn" onClick={prevPage}>Anterior</button>}
                {page < 5 && <button className="next-btn" onClick={nextPage}>Siguiente →</button>}
            </div>

            <ProgressStepper currentStep={page} />

        </div>

    );
}

