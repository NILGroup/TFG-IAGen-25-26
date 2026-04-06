import { useState } from "react";

const PALABRAS = [
  {
    id: "1",
    palabra: "Mariposa",
    definicion: "Insecto con alas grandes y coloridas",
    imagen: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    palabra: "Océano",
    definicion: "Gran masa de agua salada que cubre la Tierra",
    imagen: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    palabra: "Montaña",
    definicion: "Elevación natural del terreno de gran altura",
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    palabra: "Girasol",
    definicion: "Planta de flores grandes y amarillas que siguen al sol",
    imagen: "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    palabra: "Nieve",
    definicion: "Agua congelada que cae del cielo en copos blancos",
    imagen: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    palabra: "Arcoíris",
    definicion: "Banda de colores que aparece en el cielo después de la lluvia",
    imagen: "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=400&h=300&fit=crop",
  },
  {
    id: "7",
    palabra: "Estrella",
    definicion: "Punto brillante de luz en el cielo nocturno",
    imagen: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop",
  },
  {
    id: "8",
    palabra: "Luna",
    definicion: "Satélite natural que ilumina la noche",
    imagen: "https://images.unsplash.com/photo-1509973850138-3b0f0b587069?w=400&h=300&fit=crop",
  },
];

const ITEMS_POR_PAGINA = 4;

export default function PanelGlosario({ isOpen, onClose }) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const palabrasFiltradas = PALABRAS.filter((palabra) =>
    palabra.palabra.toLowerCase().includes(busqueda.toLowerCase())
  );

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
            placeholder="Buscar palabra..."
            className="panel-glosario-busqueda-input"
            aria-label="Buscar en el diccionario"
          />
        </div>
      </div>

      <div className="panel-glosario-lista">
        {palabrasActuales.length === 0 ? (
          <p className="panel-glosario-vacio">
            No se encontraron palabras
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
              <p className="panel-glosario-palabra-definicion">
                {palabra.definicion}
              </p>
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
