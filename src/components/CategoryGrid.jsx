// src/pages/CategoryGrid.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, generatePath } from "react-router-dom";
import { CATEGORY_DISPLAY_MAP } from "../utils/categoryStyleMap";

export default function CategoryGrid({ marketId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  const pastelColors = [
    "bg-red-100",
    "bg-orange-100",
    "bg-yellow-100",
    "bg-green-100",
    "bg-teal-100",
    "bg-blue-100",
    "bg-indigo-100",
    "bg-purple-100",
    "bg-pink-100",
  ];

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!marketId) return;
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_ENDPOINT}/markets/${marketId}/categories`);
        if (!res.ok) throw new Error(`카테고리 조회 실패 ${res.status}`);
        const data = await res.json(); 
        
        if (!cancelled) {
          const categoriesWithRandomColors = Array.isArray(data)
            ? data.map((cat) => ({
                ...cat,
                randomBg: pastelColors[Math.floor(Math.random() * pastelColors.length)],
              }))
            : [];
          setCategories(categoriesWithRandomColors);
        }
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
  }, [marketId, BACKEND_ENDPOINT]);

  if (!marketId) return null;
  if (loading) return <div className="text-sm text-slate-600">카테고리 불러오는 중…</div>;

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((c) => {
        const style = CATEGORY_DISPLAY_MAP[c.name] || {
          label: c.name, 
          emoji: c.icon,
        };

        const to =
          generatePath("/markets/:marketId/shops", { marketId }) +
          `?categoryId=${encodeURIComponent(c.categoryId)}&category=${encodeURIComponent(style.label)}`;

        return (
          <Link
            key={c.categoryId}
            to={to}
            className="rounded-2xl border-gray-500 shadow-sm px-3 py-3 hover:bg-gray-50 transition text-center"
            title={style.label}
          >
            <div className={`w-11 h-11 rounded-xl mx-auto mb-2 flex items-center justify-center ${c.randomBg}`}>
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