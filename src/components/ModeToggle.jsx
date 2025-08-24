// src/components/ModeToggle.jsx
export default function ModeToggle({ mode, onToggle }) {
  const isAdmin = mode === "admin";
  return (
    <div className="ml-2 flex items-center gap-2">
      <span className="text-emerald-700 font-semibold">
        {isAdmin ? "관리자" : "사용자"}
      </span>
      <button
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-colors ${
          isAdmin ? "bg-emerald-500" : "bg-gray-300"
        }`}
        aria-pressed={isAdmin}
        title="관리자/사용자 전환"
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            isAdmin ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
