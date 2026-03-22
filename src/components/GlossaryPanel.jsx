/**
 * GlossaryPanel.jsx
 *
 * Panel lateral izquierdo con el diccionario de palabras.
 * Permite buscar y ver definiciones de palabras con imágenes.
 */

import { useState } from "react";

// Datos de ejemplo - se pueden reemplazar con datos reales
const MOCK_WORDS = [
  {
    id: "1",
    word: "Mariposa",
    definition: "Insecto con alas grandes y coloridas",
  },
  {
    id: "2",
    word: "Océano",
    definition: "Gran masa de agua salada que cubre la Tierra",
  },
  {
    id: "3",
    word: "Montaña",
    definition: "Elevación natural del terreno de gran altura",
  },
  {
    id: "4",
    word: "Girasol",
    definition: "Planta de flores grandes y amarillas que siguen al sol",
  },
  {
    id: "5",
    word: "Nieve",
    definition: "Agua congelada que cae del cielo en copos blancos",
  },
  {
    id: "6",
    word: "Arcoíris",
    definition: "Banda de colores que aparece en el cielo después de la lluvia",
  },
];

const ITEMS_PER_PAGE = 4;

export default function GlossaryPanel({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar palabras por búsqueda
  const filteredWords = MOCK_WORDS.filter((word) =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentWords = filteredWords.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambia la búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div
      className={`glossary-panel ${isOpen ? "open" : ""}`}
      role="complementary"
      aria-label="Panel de diccionario"
    >
      {/* Header */}
      <div className="glossary-header">
        <h2>Diccionario</h2>
        <button
          onClick={onClose}
          className="glossary-close-btn"
          aria-label="Cerrar diccionario"
        >
          ←
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="glossary-search">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar palabra..."
          className="glossary-search-input"
          aria-label="Buscar en el diccionario"
        />
      </div>

      {/* Lista de palabras */}
      <div className="glossary-content">
        {currentWords.length === 0 ? (
          <p className="glossary-empty">No se encontraron palabras</p>
        ) : (
          <div className="glossary-list">
            {currentWords.map((word) => (
              <div key={word.id} className="glossary-card">
                <h3 className="glossary-word">{word.word}</h3>
                <p className="glossary-definition">{word.definition}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {filteredWords.length > ITEMS_PER_PAGE && (
        <div className="glossary-pagination">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="glossary-page-btn"
            aria-label="Página anterior"
          >
            ← Anterior
          </button>
          <span className="glossary-page-info">
            {currentPage} de {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="glossary-page-btn"
            aria-label="Página siguiente"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
