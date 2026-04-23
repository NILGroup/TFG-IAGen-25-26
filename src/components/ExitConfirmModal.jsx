/**
 * ExitConfirmModal.jsx
 *
 * Modal de confirmación para cuando el usuario intenta salir del chat
 * sin haber guardado los cambios.
 *
 * Características de accesibilidad (COGA/WCAG):
 * - Lenguaje claro y opciones limitadas (COGA 4.2.1)
 * - Botones grandes y bien separados (WCAG 2.5.5)
 * - Foco visible en todos los elementos (WCAG 2.4.7)
 * - Contraste adecuado (WCAG 1.4.3)
 */

export default function ExitConfirmModal({
    isOpen,
    onClose,
    onSaveAndExit,
    onExitWithoutSaving,
}) {
    if (!isOpen) return null;

    return (
        <>
            {/* Fondo oscuro */}
            <div
                className="exit-modal-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="exit-modal"
                role="dialog"
                aria-labelledby="exit-modal-title"
                aria-describedby="exit-modal-description"
                aria-modal="true"
            >
                <div className="exit-modal-header">
                    <h2 id="exit-modal-title" className="exit-modal-title">
                        ¿Qué quieres hacer?
                    </h2>
                </div>

                <div className="exit-modal-content">
                    <p id="exit-modal-description" className="exit-modal-description">
                        Esta conversación tiene cambios sin guardar.
                    </p>

                    <div className="exit-modal-options">
                        <button
                            className="exit-modal-btn exit-modal-btn-primary"
                            onClick={onSaveAndExit}
                            aria-label="Guardar conversación y salir"
                        >
                            Guardar y salir
                        </button>

                        <button
                            className="exit-modal-btn exit-modal-btn-secondary"
                            onClick={onExitWithoutSaving}
                            aria-label="Salir sin guardar la conversación"
                        >
                            Salir sin guardar
                        </button>

                        <button
                            className="exit-modal-btn exit-modal-btn-tertiary"
                            onClick={onClose}
                            aria-label="Cancelar y seguir conversando"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}