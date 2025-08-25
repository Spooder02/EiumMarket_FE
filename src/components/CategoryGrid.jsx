import React, { useEffect, useRef, useState } from "react";
import { Link, generatePath } from "react-router-dom";
import { CATEGORY_DISPLAY_MAP } from "../utils/categoryStyleMap";

export default function CategoryGrid({ marketId }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 사용할 파스텔 색상 Tailwind 클래스들을 배열로 정의합니다.
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
        const res = await fetch(`/api/markets/${marketId}/categories`);
        if (!res.ok) throw new Error(`카테고리 조회 실패 ${res.status}`);
        const data = await res.json(); // [{ categoryId, name, icon }]
        
        if (!cancelled) {
          // API 응답 데이터에 각 카테고리별로 고유한 랜덤 색상 클래스를 추가합니다.
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
  }, [marketId]);

  if (!marketId) return null;
  if (loading) return <div className="text-sm text-slate-600">카테고리 불러오는 중…</div>;

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((c) => {
        // 기존 매핑과 백엔드 데이터 사용 로직은 그대로 유지합니다.
        const style = CATEGORY_DISPLAY_MAP[c.name] || {
          label: c.name, // 매핑 없으면 백엔드 그대로 보여줌
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
            {/* 임의로 생성된 randomBg 속성을 클래스에 직접 적용합니다. */}
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