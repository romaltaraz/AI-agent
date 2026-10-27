import { useEffect } from "react";
import "./ConfirmModal.css";

// A custom confirmation dialog (used instead of window.confirm).
export default function ConfirmModal({ title, message, confirmLabel, busy, error, onConfirm, onCancel }) {
  // Escape closes the dialog.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel]);

  return (
    // Clicking the dark background closes the dialog; clicking inside it does not.
    <div className="modal-backdrop" onClick={() => !busy && onCancel()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        <p dir="auto">{message}</p>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          {/* autoFocus on "cancel" so Enter does not delete by accident */}
          <button className="modal-cancel" autoFocus disabled={busy} onClick={onCancel}>
            ביטול
          </button>
          <button className="modal-confirm" disabled={busy} onClick={onConfirm}>
            {busy ? "מוחק..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
