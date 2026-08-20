import { getAvatarColor } from "../utils.js";

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-2xl",
};

export default function Avatar({ name, initials, size = "md", showOnline = false }) {
  const color = getAvatarColor(name);
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center font-semibold`}
        style={{ background: color + "1A", color }}
      >
        {initials}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}
