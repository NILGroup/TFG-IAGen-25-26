export default function FavoritosModal({ isOpen, onClose, favorites, onDelete }) {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal-historial-backdrop" onClick={onClose} aria-hidden="true" />
            <div className="modal-historial" role="dialog" aria-labelledby="favoritos-modal-title" aria-modal="true">

                {/* Header */}
                <div className="modal-historial-header">
                    <h2 id="favoritos-modal-title" className="modal-historial-titulo">
                        Favoritos
                    </h2>
                    <button onClick={onClose} className="modal-historial-cerrar" aria-label="Cerrar favoritos">
                        Cerrar
                    </button>
                </div>

                {/* Contenido */}
                <div className="modal-historial-contenido">
                    {favorites.length === 0 ? (
                        <div className="modal-historial-vacio">
                            <p className="modal-historial-vacio-texto">
                                Pulsa "Guardar" en el chat para guardar una pregunta aquí
                            </p>
                        </div>
                    ) : (
                        <div className="modal-historial-lista">
                            {favorites.map((fav) => (
                                <div key={fav.id} className="modal-historial-item">
                                    <div className="modal-historial-item-contenido">
                                        <div className="modal-historial-item-info">
                                            <span className="modal-historial-item-fecha">{fav.timestamp}</span>
                                        </div>
                                        <div className="modal-historial-item-pregunta">
                                            <p><strong>Pregunta:</strong> {fav.question}</p>
                                        </div>
                                        <div className="favorito-respuesta">
                                            <p><strong>Respuesta:</strong> {fav.answer}</p>
                                        </div>
                                    </div>
                                    {onDelete && (
                                        <div className="modal-historial-item-acciones">
                                            <button
                                                className="modal-historial-btn-eliminar"
                                                onClick={() => onDelete(fav.id)}
                                                aria-label="Eliminar favorito"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-historial-footer">
                    <p className="modal-historial-footer-total">
                        {favorites.length} {favorites.length === 1 ? "favorito" : "favoritos"}
                    </p>
                </div>
            </div>
        </>
    );
}
