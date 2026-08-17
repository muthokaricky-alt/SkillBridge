import ModalShell from "./ModalShell.jsx";

/**
 * ReviewModal displays a dialog for the user to rate a completed skill exchange session.
 * It features an interactive 5-star rating selector.
 *
 * @param {Object} props
 * @param {boolean} props.open - Indicates whether the rating modal is visible.
 * @param {function} props.onClose - Callback triggered when the review is skipped or modal closed.
 * @param {Object} props.session - The session object being reviewed (contains session details like partner name and skill topic).
 * @param {number} props.star - The current star rating value (typically an integer 1-5).
 * @param {function} props.setStar - State setter to update the selected star count.
 * @param {function} props.onSubmit - Callback triggered when the review is submitted.
 */
export default function ReviewModal({ open, onClose, session, star, setStar, onSubmit }) {
  return (
    <ModalShell open={open} title="Rate this session" onClose={onClose}>
      {/* Renders summary information about the session if available */}
      <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl mb-4 text-sm text-[#444]">

        {session ? `${session.with} · ${session.skill}` : ""}
      </div>

      <div className="mb-4">
        <label className="mo-label">Your rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              onClick={() => setStar(n)}
              className={`text-3xl leading-none cursor-pointer transition-colors ${
                n <= star ? "text-amber-500" : "text-[#DDD] hover:text-amber-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="mo-actions">
        <button className="mo-cancel" onClick={onClose}>Skip</button>
        <button className="mo-confirm" onClick={onSubmit}>Submit Review →</button>
      </div>
    </ModalShell>
  );
}
