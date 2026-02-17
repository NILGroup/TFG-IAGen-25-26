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

    const currentLabel = stepLabels.find(s => s.number === currentStep)?.label || "";

    return (
        <div className="progress-stepper" role="navigation" aria-label="Progreso del cuestionario">
            <p className="progress-text" aria-live="polite">
                Paso {currentStep} de {totalSteps} – {currentLabel}
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

    // Lista de herramientas disponibles (Lectura Fácil: sin anglicismos, sin emojis)
    const tools = [
        {
            id: "ejemplo",
            label: "Con ejemplos",
            description: "Te explico con casos de la vida real",
            ejemplo: "Un planeta es como una pelota grande que da vueltas al Sol."
        },
        {
            id: "bullet",
            label: "Con listas",
            description: "Te lo cuento punto por punto",
            ejemplo: "• Es muy grande\n• Da vueltas al Sol\n• Tiene forma de bola"
        },
        {
            id: "textocorto",
            label: "Textos cortos",
            description: "Te lo cuento en pocas palabras",
            ejemplo: "Un planeta es una bola grande que gira alrededor del Sol."
        },
        {
            id: "frasescortas",
            label: "Frases sencillas",
            description: "Uso palabras fáciles de entender",
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
                        <h2>¡Hola! Soy OlivIA</h2>
                        <p>Te ayudaré a aprender y resolver dudas.</p>
                        <label htmlFor="user-name" className="question-label">
                            <strong>¿Cómo te llamas?</strong>
                        </label>
                        <input
                            id="user-name"
                            type="text"
                            placeholder="Escribe tu nombre..."
                            className="custom-input"
                            autoComplete="name"
                            value={summary.nombre}
                            onChange={handleNameChange}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="question-page page-no-scroll">
                        <h2 id="titulo-sobre-ti">Cuéntanos sobre ti</h2>
                        <p className="instruction">
                            <strong>Marca lo que se aplica a ti. Puedes elegir varias.</strong>
                        </p>

                        {/* Grid 2x2 sin emojis */}
                        <fieldset className="checkbox-grid-2x2" aria-labelledby="titulo-sobre-ti">
                            {[
                                { id: "TEA", label: "Autismo (TEA)", description: "Me cuesta entender cómo piensan otros" },
                                { id: "TDAH", label: "Atención (TDAH)", description: "Me distraigo rápido o me muevo mucho" },
                                { id: "Dislexia", label: "Lectura (Dislexia)", description: "Las letras se mezclan o leo lento" },
                                { id: "Memoria", label: "Memoria", description: "Olvido lo que acabo de leer o hacer" }
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`checkbox-card-compact no-icon ${summary.discapacidad.includes(option.id) ? 'checked' : ''}`}
                                    htmlFor={`disc-${option.id}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`disc-${option.id}`}
                                        checked={summary.discapacidad.includes(option.id)}
                                        onChange={() => togglediscapacidad(option.id)}
                                    />
                                    <span className="checkbox-label-compact">{option.label}</span>
                                    <span className="checkbox-description-compact">{option.description}</span>
                                    <span className="checkbox-indicator-compact" aria-hidden="true">
                                        {summary.discapacidad.includes(option.id) ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* Opción "Prefiero no decirlo" separada */}
                        <label
                            className={`checkbox-standalone ${summary.discapacidad.includes("Prefiero no responder") ? 'checked' : ''}`}
                            htmlFor="disc-prefiero-no"
                        >
                            <input
                                type="checkbox"
                                id="disc-prefiero-no"
                                checked={summary.discapacidad.includes("Prefiero no responder")}
                                onChange={() => togglediscapacidad("Prefiero no responder")}
                            />
                            <span className="checkbox-label-standalone">Prefiero no decirlo</span>
                            <span className="checkbox-indicator-standalone" aria-hidden="true">
                                {summary.discapacidad.includes("Prefiero no responder") ? '✓' : ''}
                            </span>
                        </label>

                        {/* Acordeón controlado con React */}
                        <div className={`accordion-react ${otraData.caso2.seleccionada ? 'open' : ''}`}>
                            <button
                                type="button"
                                className="accordion-react-btn"
                                onClick={() => setOtraData(prev => ({
                                    ...prev,
                                    caso2: { ...prev.caso2, seleccionada: !prev.caso2.seleccionada }
                                }))}
                                aria-expanded={otraData.caso2.seleccionada}
                            >
                                <span className="accordion-icon" aria-hidden="true">
                                    {otraData.caso2.seleccionada ? '−' : '+'}
                                </span>
                                Quiero añadir otra cosa
                            </button>

                            {otraData.caso2.seleccionada && (
                                <div className="accordion-react-content">
                                    <label htmlFor="otra-texto-caso2">
                                        Escribe aquí si quieres contarnos algo más:
                                    </label>
                                    <textarea
                                        id="otra-texto-caso2"
                                        value={otraData.caso2.respuesta}
                                        onChange={(e) => setOtraData(prev => ({
                                            ...prev,
                                            caso2: { ...prev.caso2, respuesta: e.target.value }
                                        }))}
                                        placeholder="Por ejemplo: me mareo cuando leo mucho"
                                        rows={2}
                                        autoFocus
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
                    <div className="question-page page-no-scroll">
                        <h2 id="titulo-que-cuesta">¿Qué te cuesta?</h2>
                        <p className="instruction">
                            <strong>Marca lo que te cueste. Puedes elegir varias.</strong>
                        </p>

                        {/* Grid 2x2 sin emojis */}
                        <fieldset className="checkbox-grid-2x2" aria-labelledby="titulo-que-cuesta">
                            {[
                                { id: "Textos Largos", label: "Leer mucho", description: "Me canso con textos largos" },
                                { id: "Palabras Dificiles", label: "Palabras nuevas", description: "Hay palabras que no entiendo" },
                                { id: "Organizar Ideas", label: "Ordenar ideas", description: "No sé por dónde empezar" },
                                { id: "Mantener Atencion", label: "Concentrarme", description: "Me distraigo fácil" }
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`checkbox-card-compact no-icon ${summary.retos.includes(option.id) ? 'checked' : ''}`}
                                    htmlFor={`reto-${option.id}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`reto-${option.id}`}
                                        checked={summary.retos.includes(option.id)}
                                        onChange={() => toggleReto(option.id)}
                                    />
                                    <span className="checkbox-label-compact">{option.label}</span>
                                    <span className="checkbox-description-compact">{option.description}</span>
                                    <span className="checkbox-indicator-compact" aria-hidden="true">
                                        {summary.retos.includes(option.id) ? '✓' : ''}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* Opción "Memoria" separada */}
                        <label
                            className={`checkbox-standalone-with-desc ${summary.retos.includes("Memoria") ? 'checked' : ''}`}
                            htmlFor="reto-memoria"
                        >
                            <input
                                type="checkbox"
                                id="reto-memoria"
                                checked={summary.retos.includes("Memoria")}
                                onChange={() => toggleReto("Memoria")}
                            />
                            <div className="checkbox-standalone-text">
                                <span className="checkbox-label-standalone">Recordar cosas</span>
                                <span className="checkbox-description-standalone">Se me olvida lo que acabo de leer</span>
                            </div>
                            <span className="checkbox-indicator-standalone" aria-hidden="true">
                                {summary.retos.includes("Memoria") ? '✓' : ''}
                            </span>
                        </label>

                        {/* Acordeón controlado con React */}
                        <div className={`accordion-react ${otraData.caso3.seleccionada ? 'open' : ''}`}>
                            <button
                                type="button"
                                className="accordion-react-btn"
                                onClick={() => setOtraData(prev => ({
                                    ...prev,
                                    caso3: { ...prev.caso3, seleccionada: !prev.caso3.seleccionada }
                                }))}
                                aria-expanded={otraData.caso3.seleccionada}
                            >
                                <span className="accordion-icon" aria-hidden="true">
                                    {otraData.caso3.seleccionada ? '−' : '+'}
                                </span>
                                Quiero añadir otra cosa
                            </button>

                            {otraData.caso3.seleccionada && (
                                <div className="accordion-react-content">
                                    <label htmlFor="otra-texto-caso3">
                                        Escribe aquí si te cuesta algo más:
                                    </label>
                                    <textarea
                                        id="otra-texto-caso3"
                                        value={otraData.caso3.respuesta}
                                        onChange={(e) => setOtraData(prev => ({
                                            ...prev,
                                            caso3: { ...prev.caso3, respuesta: e.target.value }
                                        }))}
                                        placeholder="Por ejemplo: me pongo nervioso con los exámenes"
                                        rows={2}
                                        autoFocus
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
                        <h2 id="titulo-como-ayudar">¿Cómo quieres que te ayude?</h2>
                        <p className="instruction">
                            <strong>Marca lo que prefieras. Puedes elegir varias.</strong>
                        </p>

                        {/* Grid 2x2 con ejemplos visibles */}
                        <fieldset className="checkbox-grid-2x2-examples" aria-labelledby="titulo-como-ayudar">
                            {tools.map((tool) => (
                                <label
                                    key={tool.id}
                                    className={`checkbox-card-example ${summary.herramientas.includes(tool.id) ? 'checked' : ''}`}
                                    htmlFor={`tool-${tool.id}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={`tool-${tool.id}`}
                                        checked={summary.herramientas.includes(tool.id)}
                                        onChange={() => toggleTool(tool.id)}
                                    />
                                    <div className="card-example-header">
                                        <span className="card-example-label">{tool.label}</span>
                                        <span className="card-example-indicator" aria-hidden="true">
                                            {summary.herramientas.includes(tool.id) ? '✓' : ''}
                                        </span>
                                    </div>
                                    <span className="card-example-desc">{tool.description}</span>
                                    <div className="card-example-box">
                                        <span className="card-example-title">Ejemplo:</span>
                                        <p className="card-example-text">{tool.ejemplo}</p>
                                    </div>
                                </label>
                            ))}
                        </fieldset>
                    </div>
                );

            case 5:
                return (
                    <div className="question-page">
                        <div className="final-content">
                            <h2 className="final-title">
                                <span aria-hidden="true">🎉 </span>¡Listo!
                            </h2>
                            <p className="final-text">
                                Mira si todo está bien.
                            </p>

                            {generateSummary()}

                            <div className="robot-container">
                                <img src={robotLogoCuerpo} alt="OlivIA está lista" className="robot-img" />
                            </div>

                            <div className="button-group">
                                <button className="final-btn gray" onClick={() => setPage(1)}>
                                    <span aria-hidden="true">🔄 </span>Cambiar algo
                                </button>
                                <button className="final-btn green" onClick={() => onComplete(summary)}>
                                    <span aria-hidden="true">✓ </span>Todo bien, empezar
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

