import { useState, useCallback } from "react";
import { fetchFromGroq } from "../services/apiFunctions";

/**
 * Controlador de selección de texto y bocadillo explicativo en el chat.
 */
export default function useTooltipController({ chatFlow, setChatFlow }) {
  const [tooltipInfo, setTooltipInfo] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    type: null,
    content: "",
    loading: false,
  });

  const [glossary, setGlossary] = useState([]);

  const handleTextSelection = useCallback(async () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    let text = selection.toString().trim();

    if (text.length > 0) {
      const range = selection.getRangeAt(0);

      // Expandir selección a palabras completas
      const isWordChar = (char) => /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(char);

      // Expandir hacia la izquierda
      if (range.startContainer.nodeType === Node.TEXT_NODE) {
        const textContent = range.startContainer.textContent;
        let startOffset = range.startOffset;
        while (startOffset > 0 && isWordChar(textContent[startOffset - 1])) {
          startOffset--;
        }
        range.setStart(range.startContainer, startOffset);
      }

      // Expandir hacia la derecha
      if (range.endContainer.nodeType === Node.TEXT_NODE) {
        const textContent = range.endContainer.textContent;
        let endOffset = range.endOffset;
        while (endOffset < textContent.length && isWordChar(textContent[endOffset])) {
          endOffset++;
        }
        range.setEnd(range.endContainer, endOffset);
      }

      selection.removeAllRanges();
      selection.addRange(range);

      text = selection.toString().trim();
      
      const rect = range.getBoundingClientRect();

      setTooltipInfo({
        visible: true,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 10,
        text,
        type: null,
        content: "",
        loading: true,
      });

      const promptClasificador = `Actua como un analizador sintactico estricto. Analiza este texto y clasificalo en una categoria:
            - PALABRA: Si es una palabra suelta, expresion corta o sintagma sin verbo principal.
            - ORACION: Si es una frase con al menos un verbo conjugado e idea completa.
            REGLA ESTRICTA: Responde UNICA Y EXCLUSIVAMENTE con la palabra PALABRA o la palabra ORACION. Sin puntos ni explicaciones.
            Texto: "${text}"`;

      const msg = [{ role: "user", content: `${promptClasificador}` }];

      const respuestaIA = await fetchFromGroq(msg);
      const clasificacion = respuestaIA.trim().toUpperCase();

      setTooltipInfo((prev) => ({
        ...prev,
        type: clasificacion.includes("ORACION") ? "ORACION" : "PALABRA",
        loading: false,
      }));
    } else {
      setTooltipInfo({
        visible: false,
        x: 0,
        y: 0,
        text: "",
        type: null,
        content: "",
        loading: false,
      });
    }
  }, []);
  
  // Opción en desuso, posible eliminación
  const handleButtonClick = useCallback( // Al pulsar alguna opcion del bocadillo
    async (accion) => {
      setTooltipInfo((prev) => ({ ...prev, loading: true }));

      const mensajesNoUsuario = chatFlow.filter((msg) => msg.role !== "user");
      const contexto =
        mensajesNoUsuario.length > 0
          ? mensajesNoUsuario[mensajesNoUsuario.length - 1].content
          : "";

      let promptFinal = `Eres un experto en accesibilidad. Teniendo en cuenta este texto como contexto: "${contexto}", `;

      if (accion === "definicion") {
        promptFinal += `define de forma muy breve (maximo 2 lineas), sencilla y en Lectura Facil este termino: "${tooltipInfo.text}". Devuelve SOLO la definicion.`;
      } else if (accion === "sinonimo") {
        promptFinal += `escribe 2 o 3 sinonimos muy faciles de entender para: "${tooltipInfo.text}". Devuelve SOLO los sinonimos en formato bullet (-) con el título: "Palabras parecidas", no añadas ningún simbolo más`;
      } else if (accion === "reformular") {
        promptFinal += `reescribe esta oracion de la forma mas sencilla, facil de entender y directa posible, en Lectura Facil: "${tooltipInfo.text}". Devuelve SOLO la oracion reformulada.`;
      }

      const msg = [{ role: "user", content: `${promptFinal}` }];
      const resultado = await fetchFromGroq(msg);

      if (accion === "definicion" || accion === "sinonimo") {
        setGlossary((prevGlossary) => {
          const textLower = tooltipInfo.text.toLowerCase();

          const exist = prevGlossary.findIndex(
            (item) => item.term.toLowerCase() === textLower
          );

          if (exist >= 0) {
            const updatedGlossary = [...prevGlossary];
            if (!updatedGlossary[exist][accion]) {
              updatedGlossary[exist] = {
                ...updatedGlossary[exist],
                [accion]: resultado,
              };
              return updatedGlossary;
            }
            return prevGlossary;
          }

          return [
            ...prevGlossary,
            {
              term: tooltipInfo.text,
              [accion]: resultado,
            },
          ];
        });
      }

      setTooltipInfo((prev) => ({
        ...prev,
        content: resultado,
        loading: false,
      }));
    },
    [chatFlow, tooltipInfo.text]
  );

  const handleReplaceText = useCallback(() => {
    setChatFlow((prevFlow) =>
      prevFlow.map((mensaje) => ({
        ...mensaje,
        content: mensaje.content.replace(tooltipInfo.text, tooltipInfo.content),
      }))
    );

    setTooltipInfo({
      visible: false,
      x: 0,
      y: 0,
      text: "",
      type: null,
      content: "",
      loading: false,
    });
  }, [setChatFlow, tooltipInfo.content, tooltipInfo.text]);

  return {
    tooltipInfo,
    glossary,
    handleTextSelection,
    handleButtonClick,
    handleReplaceText,
  };
}
