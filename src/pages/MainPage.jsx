import React, { useState } from "react";
import MarketSelectModal from "../components/modals/MarketSelectModal";
import marketImg from "../assets/korean-market-storefront.png";

export default function MainPage() {
  const [market, setMarket] = useState("여수 서시장");
  const [open, setOpen] = useState(false);

  const popular = [
    {
      name: "숙이 떡집",
      desc: "전통 떡과 한과 전문점",
      distance: "1.4km",
      open: true,
      emoji: "🍡",
    },
    {
      name: "돌산 족발",
      desc: "신선한 족발과 보쌈 전문",
      distance: "1.2km",
      open: true,
      emoji: "🍖",
    },
  ];
  const categories = [
    { name: "숙이 떡집", emoji: "🍡", bg: "bg-orange-100" },
    { name: "돌산 족발", emoji: "🍖", bg: "bg-pink-100" },
    { name: "식품", emoji: "🍜", bg: "bg-yellow-100" },
    { name: "의류", emoji: "👔", bg: "bg-sky-100" },
    { name: "생활용품", emoji: "🧴", bg: "bg-green-100" },
    { name: "식당", emoji: "🏪", bg: "bg-violet-100" },
    { name: "과일", emoji: "🍎", bg: "bg-rose-100" },
    { name: "수산물", emoji: "🐟", bg: "bg-cyan-100" },
    { name: "정육점", emoji: "🥩", bg: "bg-rose-200" },
  ];
  const markets = ["여수 서시장", "여수 수산시장"];

  return (
    <div className="max-w-[390px] mx-auto bg-white min-h-full">
      {/* 헤더 */}
      <header
        className="px-4 pt-12 pb-6 text-white"
        style={{ backgroundColor: "#93DA97" }}
      >
        <div className="flex items-center justify-between mb-3.5">
          <button className="inline-flex items-center justify-center size-8 rounded-full bg-white/20">
            🔔
          </button>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-emerald-800 font-bold"
          >
            {market} ▾
          </button>

          <button className="inline-flex items-center justify-center size-8 rounded-full bg-white/20">
            MY
          </button>
        </div>

        {/* 검색 */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">
            🔎
          </span>
          <input
            className="w-full h-12 rounded-xl border-none outline-none pl-9 pr-3 text-slate-700 bg-white shadow"
            placeholder="오늘의 장보기 시작!"
          />
        </div>
      </header>

      {/* 배너 */}
      <main className="p-4 space-y-6">
        <section>
          <div className="rounded-2xl overflow-hidden shadow relative h-[160px]">
            <img
              src={marketImg}
              alt="전통시장"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </section>

        {/* 자주 찾는 가게 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-[16px]">자주 찾는 가게</h3>
            <button className="px-2 py-1 rounded-md font-bold text-emerald-700 hover:bg-emerald-50">
              전체보기
            </button>
          </div>
          <div className="grid grid-cols-2 gap-[14px]">
            {popular.map((s) => (
              <div
                key={s.name}
                className="rounded-[18px] bg-white shadow p-3.5"
              >
                <div className="w-12 h-12 rounded-[14px] bg-rose-50 flex items-center justify-center mb-2.5">
                  <span className="text-[22px]">{s.emoji}</span>
                </div>
                <div className="font-extrabold mb-1">{s.name}</div>
                <div className="text-[13px] text-slate-500 leading-[1.35] h-[34px] overflow-hidden">
                  {s.desc}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-500 mt-2">
                  <span>{s.distance}</span>
                  {s.open && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5">
                      <span className="inline-block size-2 rounded-full bg-emerald-500" />
                      현재 영업중
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 카테고리 */}
        <section>
          <h3 className="font-extrabold text-[16px] mb-3">카테고리</h3>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c.name} className="rounded-2xl shadow p-3 text-center">
                <div
                  className={`w-11 h-11 rounded-xl mx-auto mb-2 flex items-center justify-center ${c.bg}`}
                >
                  <span className="text-[20px]">{c.emoji}</span>
                </div>
                <div className="text-[14px] font-bold text-slate-900">
                  {c.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 모달 */}
      <MarketSelectModal
        open={open}
        markets={markets}
        current={market}
        onSelect={setMarket}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
