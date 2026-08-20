/**
 * ModalShell component serves as a generic wrapper or layout container for all modals.
 * It handles the overlay positioning, visibility classes, background click-to-close behavior,
 * and standard header/close layout.
 *
 * @param {Object} props
 * @param {boolean} props.open - Controls the visibility of the modal.
 * @param {string} props.title - The title text displayed at the top of the modal.
 * @param {function} props.onClose - Callback triggered when the modal is closed (via background click or close button).
 * @param {React.ReactNode} props.children - The modal's main body content.
 */
export default function ModalShell({ open, title, onClose, children }) {
  return (
    <div
      className={`mo${open ? " on" : ""}`}
      // Closes the modal only if the click was directly on the background overlay (and not its children)
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="mo-box">
        <div className="mo-title">
          {title}
          <button className="mo-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

