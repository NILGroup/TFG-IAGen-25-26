import { useState } from "react";

const ITEMS_POR_PAGINA = 2;

const formatSynonyms = (text) => {
  if (!text) return "";
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const withoutTitle = normalized.replace(/^(?:\s*#{1,6})?\s*Palabras parecidas\s*:?\s*/i, "").trim();

  const lines = withoutTitle
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]+\s*/, "").trim())
    .filter(Boolean);

  const items = lines.flatMap((line) =>
    line.split(",").map((item) => item.trim()).filter(Boolean)
  );

  return [...new Set(items)].join(", ");
};

export default function PanelGlosario({ isOpen, onClose, glossary = [] }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  // visualizar glosario
  const palabrasGlosario = glossary.map((item, index) => ({
    id: `glossary-${index}`,
    palabra: item.term,
    definicion: item.definicion || null,
    sinonimo: item.sinonimo || null,
  }));

  const palabrasFiltradas = palabrasGlosario.filter((palabra) =>
    palabra.palabra.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejo de páginas
  const totalPaginas = Math.ceil(palabrasFiltradas.length / ITEMS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const palabrasActuales = palabrasFiltradas.slice(indiceInicio, indiceFin);

  const handleBusqueda = (valor) => {
    setBusqueda(valor);
    setPaginaActual(1);
  };

  const handleAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const handleSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual(paginaActual + 1);
    }
  };

  return (
    <div
      className={`panel-glosario ${isOpen ? "abierto" : "cerrado"}`}
      role="complementary"
      aria-label="Panel de glosario"
    >
      <div className="panel-glosario-header">
        <button
          onClick={onClose}
          className="panel-glosario-cerrar"
          aria-label="Cerrar diccionario"
        >
          ←
        </button>
        <h2 className="panel-glosario-titulo">Diccionario</h2>
      </div>

      <div className="panel-glosario-busqueda-contenedor">
        <div className="panel-glosario-busqueda">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            placeholder="Busca palabras..."
            className="panel-glosario-busqueda-input"
            aria-label="Buscar en el diccionario"
          />
        </div>
      </div>

      <div className="panel-glosario-lista">
        {palabrasActuales.length === 0 ? (
          <p className="panel-glosario-vacio">
            ¡Selecciona palabras del texto  y aparecerán aquí!
          </p>
        ) : (
          palabrasActuales.map((palabra) => (
            <div key={palabra.id} className="panel-glosario-palabra">
              {palabra.imagen && (
                <img
                  src={palabra.imagen}
                  alt={palabra.palabra}
                  className="panel-glosario-palabra-imagen"
                />
              )}
              <h3 className="panel-glosario-palabra-titulo">
                {palabra.palabra}
              </h3>
              
              {palabra.definicion && (
                <p className="panel-glosario-palabra-definicion">
                  <strong>¿Qué significa?</strong> {palabra.definicion}
                </p>
              )}
              
              {palabra.sinonimo && (
                <p className="panel-glosario-palabra-sinonimo">
                  <strong>Palabras parecidas:</strong> {formatSynonyms(palabra.sinonimo)}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {palabrasFiltradas.length > 0 && (
        <div className="panel-glosario-paginacion">
          <div className="panel-glosario-paginacion-botones">
            <button
              onClick={handleAnterior}
              disabled={paginaActual === 1}
              className="panel-glosario-paginacion-boton"
              aria-label="Página anterior"
            >
              ← Anterior
            </button>
            <button
              onClick={handleSiguiente}
              disabled={paginaActual === totalPaginas}
              className="panel-glosario-paginacion-boton"
              aria-label="Página siguiente"
            >
              Siguiente →
            </button>
          </div>
          <p className="panel-glosario-paginacion-texto">
            Página {paginaActual} de {totalPaginas}
          </p>
        </div>
      )}
    </div>
  );
}
