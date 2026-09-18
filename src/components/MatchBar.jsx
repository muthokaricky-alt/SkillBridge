import { useEffect, useState } from "react";

export default function MatchBar({ match, index }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(0);
    const t = setTimeout(() => setWidth(match), 50 + index * 30);
    return () => clearTimeout(t);
  }, [match, index]);

  return (
    <div
      className="h-1.5 bg-[var(--sb-surface-alt)] rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={match}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Skill compatibility: ${match}%`}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: width + "%",
          background: "linear-gradient(90deg,#10B981,#34D399)",
          transition: "width 0.6s cubic-bezier(0.23,1,0.32,1)",
        }}
      />
    </div>
  );
}
