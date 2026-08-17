export default function SkillTag({ label, variant = "offer", onRemove }) {
  const colorClass =
    variant === "offer"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-violet-50 text-violet-700 border-violet-100";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-50 hover:opacity-100 hover:text-red-500 ml-0.5"
        >
          ×
        </button>
      )}
    </span>
  );
}
