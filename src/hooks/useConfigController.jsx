import { useEffect, useState, useCallback } from "react";

/**
 * Controlador de configuración de perfil en sesión.
 * Mantiene una copia local de summary para evitar mutaciones directas de props.
 */
export default function useConfigController(summary) {
  const [showConfig, setShowConfig] = useState(false);
  const [savedEffect, setSavedEffect] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [userSummary, setUserSummary] = useState(summary ? { ...summary } : null);
  const [tempSummary, setTempSummary] = useState(summary ? { ...summary } : {});

  useEffect(() => {
    if (!summary) return;
    setUserSummary({ ...summary });
    setTempSummary({ ...summary });
  }, [summary]);

  const handleSaveSummary = useCallback((nextSummary) => {
    setUserSummary({ ...nextSummary });
    setTempSummary({ ...nextSummary });
    setSavedEffect(true);
    setTimeout(() => setSavedEffect(false), 2000);
  }, []);

  return {
    showConfig,
    setShowConfig,
    savedEffect,
    setSavedEffect,
    editingField,
    setEditingField,
    userSummary,
    tempSummary,
    setTempSummary,
    handleSaveSummary,
  };
}
