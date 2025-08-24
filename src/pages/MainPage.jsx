// src/pages/MainPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import marketImg from "../assets/korean-market-storefront.png";
import useAdminMode from "../hooks/useAdminMode";
import ModeToggle from "../components/ModeToggle";

const MY_MARKETS_KEY = "myMarkets";
const readMyMarkets = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(MY_MARKETS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export default function MainPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const { mode, isAdmin, toggle } = useAdminMode();

  const [market, setMarket] = useState(
    () => localStorage.getItem("currentMarketName") || ""
  );
  const [myMarkets, setMyMarkets] = useState(() => readMyMarkets());
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // 라우트 변경 시(시장 설정에서 돌아온 직후 포함) 최신값 동기화
  useEffect(() => {
    setMarket(localStorage.getItem("currentMarketName") || "");
    setMyMarkets(readMyMarkets());
  }, [location.pathname, location.search]);

  // 포커스/스토리지 동기화(다른 탭 대비)
  useEffect(() => {
    const sync = () => {
      setMarket(localStorage.getItem("currentMarketName") || "");
      setMyMarkets(readMyMarkets());
    };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // 외부 클릭으로 드롭다운 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function goMarketSetting() {
    setOpen(false);
    navigate("/market-setting");
  }

  // 드롭다운 열 때 최신 목록 재읽기
  function toggleMenu() {
    if (!open) setMyMarkets(readMyMarkets());
    setOpen((v) => !v);
  }

  // “선택”: 현재 시장 지정
  function chooseMarket(m) {
    localStorage.setItem("currentMarketName", m.name);
    if (m.id) localStorage.setItem("currentMarketId", m.id);
    if (m.lat) localStorage.setItem("currentMarketLat", String(m.lat));
    if (m.lng) localStorage.setItem("currentMarketLng", String(m.lng));
    setMarket(m.name);
    setOpen(false);
  }

  // 선택만 해제(저장 목록은 유지)
  function clearSelection() {
    localStorage.removeItem("currentMarketName");
    localStorage.removeItem("currentMarketId");
    localStorage.removeItem("currentMarketLat");
    localStorage.removeItem("currentMarketLng");
    setMarket("");
    setOpen(false);
  }

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

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <header
        className="px-4 pt-12 pb-6 text-white flex-shrink-0"
        style={{ backgroundColor: "#93DA97" }}
      >
        <div className="relative flex items-center justify-between mb-3.5">
          {/* 알림 버튼 */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="inline-flex items-center justify-center size-8 rounded-full bg-white/20 shrink-0
                transition-transform duration-150 active:scale-95 focus:outline-none
                focus:ring-2 focus:ring-white/50"
              aria-expanded={notifOpen}
              aria-haspopup="true"
              aria-label="알림 열기"
            >
              🔔
            </button>

            <div
              className={`absolute left-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5
              p-3 text-sm text-slate-700 text-center z-40
              transform transition-all duration-200 ease-out origin-top-left
              ${
                notifOpen
                  ? "opacity-100 translate-x-0 translate-y-0 scale-100"
                  : "opacity-0 -translate-x-2 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              현재 알림이 없습니다.
            </div>
          </div>

          {/* 가운데 절대 배치: 버튼이 항상 정확히 중앙에 고정 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-30"
            ref={menuRef}
          >
            <button
              onClick={toggleMenu}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5
                text-emerald-800 font-bold transition-transform duration-150
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-expanded={open}
              aria-haspopup="true"
            >
              {market || "시장 선택"} ▾
            </button>

            <div
              className={`absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl bg-white shadow-lg
            ring-1 ring-black/5 p-1 z-40 text-slate-900
            transform transition-all duration-300 ease-out origin-top
            ${
              open
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
            }`}
              aria-hidden={!open}
              style={{ willChange: "transform, opacity" }} /* 부드럽게 */
            >
              {/* 저장된 시장 목록 / 비어있으면 안내 */}
              <div className="px-3 py-2 text-xs text-gray-500">저장된 시장</div>

              {myMarkets.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  저장된 시장이 없습니다
                </div>
              ) : (
                myMarkets.map((m) => (
                  <button
                    key={m.id ?? `${m.name}-${m.lat},${m.lng}`}
                    onClick={() => chooseMarket(m)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{m.name}</span>
                    {market === m.name && (
                      <span className="text-emerald-600 text-xs font-bold">
                        선택됨
                      </span>
                    )}
                  </button>
                ))
              )}

              <div className="my-1 h-px bg-gray-200" />

              {market && (
                <button
                  onClick={clearSelection}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-rose-600"
                >
                  선택 해제
                </button>
              )}

              <button
                onClick={goMarketSetting}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                시장 찾기/추가하기
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 관리자 ↔ 사용자 토글 */}
            <ModeToggle mode={mode} onToggle={toggle} />
          </div>
        </div>

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
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
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

        {!market ? (
          <section className="flex items-center justify-center py-8">
            <div className="mx-auto max-w-[360px] rounded-2xl border p-4 text-center">
              <div className="font-bold mb-1">
                아직 시장이 선택되지 않았어요
              </div>
              <div className="text-sm text-slate-600 mb-3">
                먼저 내 주변 시장을 선택하면 가게/상품을 추천해 드릴게요.
              </div>
              <button
                onClick={goMarketSetting}
                className="px-4 py-2 rounded-lg bg-[#93DA97] text-black font-semibold block mx-auto
                  hover:bg-[#7ecb82] transition-colors"
              >
                내 시장 추가하러 가기
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* 자주 찾는 가게 */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-[16px]">자주 찾는 가게</h3>
                <Link
                  to="/store"
                  className="px-2 py-1 rounded-md font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  전체보기
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-[14px]">
                {popular.map((s) => (
                  <Link
                    to="/store"
                    key={s.name}
                    className="block rounded-[18px] bg-white shadow p-3.5 hover:bg-gray-50 transition-colors"
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
                  </Link>
                ))}
              </div>
            </section>

            {/* 카테고리 */}
            <section>
              <h3 className="font-extrabold text-[16px] mb-3">카테고리</h3>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-2xl shadow p-3 text-center"
                  >
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
          </>
        )}
      </main>
      {/* 관리자 모드에서만: 우하단 FAB */}
      {isAdmin && (
        <button
          onClick={() => navigate("/add-product")}
          className="absolute w-14 h-14 rounded-full shadow-xl active:scale-95"
          style={{
            backgroundColor: "#93DA97",
            right: "20px", // 스마트폰 프레임 내부에서 20px 띄움
            bottom: "24px", // 프레임 하단에서 24px 위
          }}
          aria-label="상품 등록"
          title="상품 등록"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold">
            +
          </span>
        </button>
      )}
    </div>
  );
}
