/**
 * App.jsx
 *
 * Punto de entrada de la aplicación OlivIA, es decir, arranca todo lo visual
 * Controla la navegación entre el cuestionario inicial (`Questionario`)
 * y la interfaz principal conversacional (`InterfazPrincipal`).
 *
 * - Usa un estado `completed` para saber si el cuestionario ya se completó.
 * - Recoge y guarda el resumen del usuario (`summary`) para personalizar la experiencia.
 * - Muestra el cuestionario al inicio y, tras completarlo, la interfaz principal.
 */

import { useState } from "react";
import Questionario from "./pages/Questionario";
import PantallaEleccion from "./components/PantallaEleccion";
import FormularioPrompt from "./components/FormularioPrompt";
import InterfazPrincipal from "./pages/InterfazPrincipal";
import "./App.css";

export default function App() {
  // Estados para controlar la navegación
  const [paso, setPaso] = useState("cuestionario"); // cuestionario, eleccion, formulario, chat
  const [summary, setSummary] = useState(null); // Resumen del cuestionario inicial
  const [promptGenerado, setPromptGenerado] = useState(null); // Prompt del formulario

  // 1. Cuando termina el cuestionario inicial
  const handleQuestionnaireComplete = (data) => {
    setSummary(data);
    setPaso("eleccion"); // Ir a la pantalla de elección
  };

  // 2. Cuando el usuario elige en la pantalla de elección
  const handleSelectOption = (opcion) => {
    if (opcion === "formulario") {
      setPaso("formulario"); // Ir al formulario guiado
    } else if (opcion === "directa") {
      setPaso("chat"); // Ir directamente al chat
    }
  };

  // 3. Cuando completa el formulario guiado
  const handleFormularioComplete = (prompt) => {
    setPromptGenerado(prompt); // Guardar el prompt generado
    setPaso("chat"); // Ir al chat con el prompt listo
  };

  // 4. Para volver a la pantalla de elección
  const handleVolverAEleccion = () => {
    setPromptGenerado(null); // Limpiar el prompt generado
    setPaso("eleccion");
  };

  return (
    <div className="app-wrapper">
      {/* Barra superior siempre visible */}
      <div className="header-bar">OlivIA</div>

      {/* Renderizado condicional según el paso */}
      {paso === "cuestionario" && (
        <Questionario onComplete={handleQuestionnaireComplete} />
      )}

      {paso === "eleccion" && (
        <PantallaEleccion onSelectOption={handleSelectOption} />
      )}

      {paso === "formulario" && (
        <FormularioPrompt
          onComplete={handleFormularioComplete}
          onBack={handleVolverAEleccion}
          summary={summary}
        />
      )}

      {paso === "chat" && (
        <InterfazPrincipal
          summary={summary}
          promptInicial={promptGenerado}
          onBack={handleVolverAEleccion}
        />
      )}
    </div>
  );
}
