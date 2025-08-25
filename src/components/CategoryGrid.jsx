import React, { useEffect, useState } from "react";
import { Link, generatePath } from "react-router-dom";
import { CATEGORY_DISPLAY_MAP } from "../utils/categoryStyleMap";

export default function CategoryGrid({ marketId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!marketId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/markets/${marketId}/categories`);
        if (!res.ok) throw new Error(`카테고리 조회 실패 ${res.status}`);
        const data = await res.json(); // [{ categoryId, name }]
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [marketId]);

  if (!marketId) return null;
  if (loading) return <div className="text-sm text-slate-600">카테고리 불러오는 중…</div>;

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((c) => {
        // 매핑 있으면 사용자 친화적인 label/emoji 사용
        const style = CATEGORY_DISPLAY_MAP[c.name] || {
          label: c.name, // 매핑 없으면 백엔드 그대로 보여줌
          emoji: "🛍️",
          bg: "bg-gray-100",
        };

        const to =
          generatePath("/markets/:marketId/shops", { marketId }) +
          `?categoryId=${encodeURIComponent(c.categoryId)}&category=${encodeURIComponent(style.label)}`;

        return (
          <Link
            key={c.categoryId}
            to={to}
            className="rounded-2xl border shadow-sm bg-white px-3 py-3 hover:bg-gray-50 transition text-center"
            title={style.label}
          >
            <div className={`w-11 h-11 rounded-xl mx-auto mb-2 flex items-center justify-center ${style.bg}`}>
              <span className="text-[20px]">{style.emoji}</span>
            </div>
            <div className="text-[14px] font-bold text-slate-900 truncate">
              {style.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}