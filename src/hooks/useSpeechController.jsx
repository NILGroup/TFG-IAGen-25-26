import { useCallback, useState } from "react";

/**
 * Controlador para síntesis de voz de respuestas en chat.
 */
export default function useSpeechController() {
  const [speechState, setSpeechState] = useState("idle");
  const [activeSpeechId, setActiveSpeechId] = useState(null);

  const speakText = useCallback((text, id) => {
    if (!text.trim()) {
      alert("No hay texto para reproducir.");
      return;
    }

    if (!window.speechSynthesis) {
      alert("Tu navegador no soporta la síntesis de voz.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setActiveSpeechId(id);
      setSpeechState("playing");
    };

    utterance.onend = () => {
      setSpeechState("idle");
      setActiveSpeechId(null);
    };

    utterance.onerror = () => {
      setSpeechState("idle");
      setActiveSpeechId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleSpeech = useCallback(
    (text, id) => {
      if (activeSpeechId !== id) {
        speakText(text, id);
      } else if (speechState === "playing") {
        window.speechSynthesis.pause();
        setSpeechState("paused");
      } else if (speechState === "paused") {
        window.speechSynthesis.resume();
        setSpeechState("playing");
      }
    },
    [activeSpeechId, speakText, speechState]
  );

  const resetSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setActiveSpeechId(null);
    setSpeechState("idle");
  }, []);

  return {
    speechState,
    activeSpeechId,
    setSpeechState,
    setActiveSpeechId,
    toggleSpeech,
    resetSpeech,
  };
}
