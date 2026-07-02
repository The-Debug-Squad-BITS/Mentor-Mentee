export default function Avatar({ initials, color, size = 36 }) {
  return (
    <div
      className="flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
      style={{
        width: size,
        height: size,
        borderRadius: size > 40 ? "16px" : "10px",
        background: color,
        fontSize: size * 0.4,
        fontFamily: "inherit",
        border: "1px solid rgba(255,255,255,0.1) inset"
      }}
    >
      {initials}
    </div>
  );
}
