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
    { number: 2, label: "Sobre ti" },
    { number: 3, label: "Qué te cuesta" },
    { number: 4, label: "Cómo ayudarte" },
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
     *  ESTADOS DEL CUESTIONARIO
     *  ===================================
     */

    const [page, setPage] = useState(1);

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

    // PÁGINA 2 - Toggle discapacidad
    const togglediscapacidad = (id) => {
        setSummary(prev => ({
            ...prev,
            discapacidad: prev.discapacidad.includes(id)
                ? prev.discapacidad.filter(item => item !== id)
                : [...prev.discapacidad, id]
        }));
    };

    // PÁGINA 3 - Toggle retos
    const toggleReto = (id) => {
        setSummary(prev => ({
            ...prev,
            retos: prev.retos.includes(id)
                ? prev.retos.filter(item => item !== id)
                : [...prev.retos, id]
        }));
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

    // Mapeo de IDs a etiquetas legibles (Lectura Fácil)
    const labelMap = {
        // Identificación
        "TEA": "Tengo autismo",
        "TDAH": "Me cuesta concentrarme",
        "Dislexia": "Me cuesta leer",
        "Memoria": "Se me olvidan las cosas",
        "Prefiero no responder": "Prefiero no decirlo",
        // Retos
        "Textos Largos": "Leer textos largos",
        "Palabras Dificiles": "Entender palabras nuevas",
        "Organizar Ideas": "Ordenar mis ideas",
        "Mantener Atencion": "Estar concentrado",
        // Herramientas
        "ejemplo": "Con ejemplos",
        "bullet": "Con listas",
        "textocorto": "Respuestas cortas",
        "frasescortas": "Frases fáciles"
    };

    // PÁGINA 5 - Resumen con etiquetas claras
    const generateSummary = () => (
        <div className="summary-box-horizontal" role="region" aria-label="Resumen de tu configuración">
            <h3>Tu resumen:</h3>

            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">🧑 </span>Tu nombre:</span>
                <span className="summary-data">{summary.nombre || "No indicado"}</span>
            </div>

            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">⭐ </span>Sobre ti:</span>
                <ul className="summary-bubbles">
                    {summary.discapacidad.length > 0 ? (
                        summary.discapacidad.map((item) => (
                            <li key={item}>{labelMap[item] || item}</li>
                        ))
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>

            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">📌 </span>Te cuesta:</span>
                <ul className="summary-bubbles">
                    {summary.retos.length > 0 ? (
                        summary.retos.map((item) => (
                            <li key={item}>{labelMap[item] || item}</li>
                        ))
                    ) : (
                        <li>No seleccionado</li>
                    )}
                </ul>
            </div>

            <div className="summary-row">
                <span className="summary-title"><span aria-hidden="true">🛠️ </span>Te ayudaré:</span>
                <ul className="summary-bubbles">
                    {summary.herramientas.length > 0 ? (
                        summary.herramientas.map((toolId) => (
                            <li key={toolId}>{labelMap[toolId] || toolId}</li>
                        ))
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

    // Lista de herramientas disponibles (Lectura Fácil: sin anglicismos)
    const tools = [
        {
            id: "ejemplo",
            label: "💡 Con ejemplos",
            description: "Te explico con casos de la vida real",
            ejemplo: "Un planeta es como una pelota muy grande que da vueltas alrededor del Sol. Por ejemplo, la Tierra es un planeta."
        },
        {
            id: "bullet",
            label: "📋 Con listas",
            description: "Te lo cuento punto por punto",
            ejemplo: "• Es muy grande\n• Da vueltas al Sol\n• Tiene forma de bola"
        },
        {
            id: "textocorto",
            label: "📝 Respuestas cortas",
            description: "Te lo cuento en pocas palabras",
            ejemplo: "Un planeta es una bola grande que da vueltas al Sol."
        },
        {
            id: "frasescortas",
            label: "✂️ Frases fáciles",
            description: "Uso palabras sencillas",
            ejemplo: "Es una bola. Es muy grande. Da vueltas al Sol."
        }
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
                        <h2>Vamos a conocernos</h2>
                        <p>Soy OlivIA.</p>
                        <p>Te voy a ayudar a aprender cosas nuevas.</p>
                        <p>También te ayudaré cuando tengas dudas.</p>
                        <label htmlFor="user-name" className="question-label">
                            <strong>Escribe tu nombre:</strong>
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            placeholder="Tu nombre aquí..."
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
                        <h2>Cuéntanos sobre ti</h2>
                        <p>Esto nos ayuda a entenderte mejor.</p>
                        <p className="instruction">
                            <strong>Marca todo lo que sea verdad para ti.</strong>
                            <br />
                            <span className="hint">Puedes marcar varias opciones.</span>
                        </p>

                        <fieldset className="checkbox-grid">
                            <legend className="sr-only">
                                Selecciona las características que te describen
                            </legend>

                            {[
                                {
                                    id: "TEA",
                                    label: "Tengo autismo (TEA)",
                                    description: "Me cuesta entender lo que piensan otras personas",
                                    icon: "🧩"
                                },
                                {
                                    id: "TDAH",
                                    label: "Me cuesta concentrarme (TDAH)",
                                    description: "Me distraigo fácil o me muevo mucho",
                                    icon: "⚡"
                                },
                                {
                                    id: "Dislexia",
                                    label: "Me cuesta leer (Dislexia)",
                                    description: "Las letras se mezclan o leo muy despacio",
                                    icon: "🔠"
                                },
                                {
                                    id: "Memoria",
                                    label: "Se me olvidan las cosas (Memoria)",
                                    description: "Me cuesta recordar lo que acabo de leer",
                                    icon: "🧠"
                                },
                                {
                                    id: "Prefiero no responder",
                                    label: "Prefiero no decirlo",
                                    description: "",
                                    icon: "🚫"
                                }
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`checkbox-card ${summary.discapacidad.includes(option.id) ? 'checked' : ''}`}
                                    htmlFor={`disc-${option.id}`}
                                >
                                    <div className="checkbox-content">
                                        <span className="checkbox-icon" aria-hidden="true">
                                            {option.icon}
                                        </span>
                                        <div className="checkbox-text">
                                            <span className="checkbox-label">{option.label}</span>
                                            {option.description && (
                                                <span className="checkbox-description">
                                                    {option.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id={`disc-${option.id}`}
                                        checked={summary.discapacidad.includes(option.id)}
                                        onChange={() => togglediscapacidad(option.id)}
                                        aria-describedby={option.description ?
                                            `desc-${option.id}` : undefined}
                                    />
                                    <span className="checkbox-indicator" aria-hidden="true">
                                        {summary.discapacidad.includes(option.id) ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* Opción personalizada */}
                        <div className="otra-seccion">
                            <button
                                type="button"
                                className={`otra-btn ${otraData.caso2.seleccionada ? 'activa'
                                    : ''}`}
                                onClick={() => setOtraData(prev => ({
                                    ...prev,
                                    caso2: {
                                        ...prev.caso2, seleccionada:
                                            !prev.caso2.seleccionada
                                    }
                                }))}
                                aria-expanded={otraData.caso2.seleccionada}
                            >
                                <span aria-hidden="true">➕</span>
                                Quiero escribir otra cosa
                            </button>

                            {otraData.caso2.seleccionada && (
                                <div className="otra-contenido">
                                    <label htmlFor="otra-texto-caso2">
                                        Escribe aquí lo que quieras contarnos:
                                    </label>
                                    <textarea
                                        id="otra-texto-caso2"
                                        value={otraData.caso2.respuesta}
                                        onChange={(e) => setOtraData(prev => ({
                                            ...prev,
                                            caso2: { ...prev.caso2, respuesta: e.target.value }
                                        }))}
                                        placeholder="Por ejemplo: me mareo cuando leo mucho..."
                                        rows={3}
                                    />
                                    {otraData.caso2.respuesta.trim() && (
                                        <button
                                            type="button"
                                            className={`guardar-otra-btn ${otraData.caso2.guardada ? 'guardado' : ''}`}
                                            onClick={() => {
                                                setSummary(prev => ({
                                                    ...prev,
                                                    discapacidad: [...prev.discapacidad, `Otra: ${otraData.caso2.respuesta}`]
                                                }));
                                                setOtraData(prev => ({
                                                    ...prev,
                                                    caso2: { ...prev.caso2, guardada: true }
                                                }));
                                            }}
                                            disabled={otraData.caso2.guardada}
                                        >
                                            {otraData.caso2.guardada ? '✓ Guardado' : 'Guardar'}
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
                        <h2>¿Qué cosas te cuestan?</h2>
                        <p>Así sabemos cómo ayudarte mejor.</p>
                        <p className="instruction">
                            <strong>Marca todo lo que te cueste hacer.</strong>
                            <br />
                            <span className="hint">Puedes marcar varias opciones.</span>
                        </p>

                        <fieldset className="checkbox-grid">
                            <legend className="sr-only">Selecciona las cosas que te cuestan</legend>
                            {[
                                { id: "Textos Largos", label: "Leer textos largos", description: "Me canso o me pierdo cuando hay mucho texto", icon: "📖" },
                                { id: "Palabras Dificiles", label: "Entender palabras nuevas", description: "Hay palabras que no conozco", icon: "❓" },
                                { id: "Organizar Ideas", label: "Ordenar mis ideas", description: "No sé por dónde empezar a pensar", icon: "🧩" },
                                { id: "Mantener Atencion", label: "Estar concentrado", description: "Me distraigo con facilidad", icon: "🎯" },
                                { id: "Memoria", label: "Recordar cosas", description: "Se me olvida lo que acabo de leer", icon: "🧠" },
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`checkbox-card ${summary.retos.includes(option.id) ? 'checked' : ''}`}
                                    htmlFor={`reto-${option.id}`}
                                >
                                    <div className="checkbox-content">
                                        <span className="checkbox-icon" aria-hidden="true">{option.icon}</span>
                                        <div className="checkbox-text">
                                            <span className="checkbox-label">{option.label}</span>
                                            {option.description && (
                                                <span className="checkbox-description">{option.description}</span>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id={`reto-${option.id}`}
                                        checked={summary.retos.includes(option.id)}
                                        onChange={() => toggleReto(option.id)}
                                    />
                                    <span className="checkbox-indicator" aria-hidden="true">
                                        {summary.retos.includes(option.id) ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* Opción "Otra" */}
                        <div className="otra-seccion">
                            <button
                                type="button"
                                className={`otra-btn ${otraData.caso3.seleccionada ? 'activa' : ''}`}
                                onClick={() => setOtraData(prev => ({
                                    ...prev,
                                    caso3: { ...prev.caso3, seleccionada: !prev.caso3.seleccionada }
                                }))}
                                aria-expanded={otraData.caso3.seleccionada}
                            >
                                <span aria-hidden="true">➕</span>
                                Quiero escribir otra cosa
                            </button>

                            {otraData.caso3.seleccionada && (
                                <div className="otra-contenido">
                                    <label htmlFor="otra-texto-caso3">
                                        Escribe aquí lo que te cuesta:
                                    </label>
                                    <textarea
                                        id="otra-texto-caso3"
                                        value={otraData.caso3.respuesta}
                                        onChange={(e) => setOtraData(prev => ({
                                            ...prev,
                                            caso3: { ...prev.caso3, respuesta: e.target.value }
                                        }))}
                                        placeholder="Por ejemplo: me pongo nervioso con los exámenes..."
                                        rows={3}
                                    />
                                    {otraData.caso3.respuesta.trim() && (
                                        <button
                                            type="button"
                                            className={`guardar-otra-btn ${otraData.caso3.guardada ? 'guardado' : ''}`}
                                            onClick={() => {
                                                setSummary(prev => ({
                                                    ...prev,
                                                    retos: [...prev.retos, `Otra: ${otraData.caso3.respuesta}`]
                                                }));
                                                setOtraData(prev => ({
                                                    ...prev,
                                                    caso3: { ...prev.caso3, guardada: true }
                                                }));
                                            }}
                                            disabled={otraData.caso3.guardada}
                                        >
                                            {otraData.caso3.guardada ? '✓ Guardado' : 'Guardar'}
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
                        <h2>¿Cómo quieres que te ayude?</h2>
                        <p>Elige cómo quieres que te explique las cosas.</p>
                        <p className="instruction">
                            <strong>Marca las opciones que prefieras.</strong>
                            <br />
                            <span className="hint">Mira los ejemplos de cada una.</span>
                        </p>

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
                                    <p style={{ fontSize: '14px', color: '#555', margin: '4px 0 8px 0' }}>
                                        {tool.description}
                                    </p>
                                    <div className="example-container">
                                        <span className="example-title">Ejemplo:</span>
                                        <p style={{ whiteSpace: 'pre-line', margin: '4px 0 0 0', fontSize: '13px' }}>
                                            {tool.ejemplo}
                                        </p>
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
                                <span aria-hidden="true">🎉 </span>¡Ya estamos listos!
                            </h2>
                            <p className="final-text">
                                Mira si todo está bien.
                            </p>

                            {generateSummary()}

                            <div className="robot-container">
                                <img src={robotLogoCuerpo} alt="OlivIA está lista" className="robot-img" />
                            </div>

                            <h3 className="final-question">¿Quieres cambiar algo?</h3>

                            <div className="button-group">
                                <button className="final-btn gray" onClick={() => setPage(1)}>
                                    <span aria-hidden="true">🔄 </span>Sí, quiero cambiar algo
                                    <span className="btn-hint">Volver al principio</span>
                                </button>
                                <button className="final-btn green" onClick={() => onComplete(summary)}>
                                    <span aria-hidden="true">✓ </span>No, todo está bien
                                    <span className="btn-hint">Empezar a usar OlivIA</span>
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

