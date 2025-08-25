// src/pages/MainPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import marketImg from "../assets/korean-market-storefront.png";
import useAdminMode from "../hooks/useAdminMode";
import ModeToggle from "../components/ModeToggle";
import { findMarketId } from "../apis/markets";
import FrequentStores from "../components/FrequentStores";
import CategoryGrid from "../components/CategoryGrid";

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
  const [searchQuery, setSearchQuery] = useState("");

  const [market, setMarket] = useState(
    () => localStorage.getItem("currentMarketName") || ""
  );
  // marketId 상태 추가
  const [marketId, setMarketId] = useState(
    () => localStorage.getItem("currentMarketId") || ""
  );
  const [myMarkets, setMyMarkets] = useState(() => readMyMarkets());
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);


  // 라우트 변경 시 최신값 동기화
  // 검색 핸들러 수정
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      // 시장이 선택되었는지 확인
      if (!marketId) {
        alert("먼저 검색할 시장을 선택해주세요.");
        return;
      }
      // marketId를 포함하여 검색 결과 페이지로 이동
      navigate(`/markets/${marketId}/search-results?keyword=${searchQuery}`);
    }
  };

  // 라우트 변경 시 marketId도 동기화
  useEffect(() => {
    setMarket(localStorage.getItem("currentMarketName") || "");
    setMarketId(localStorage.getItem("currentMarketId") || "");
    setMyMarkets(readMyMarkets());
  }, [location.pathname, location.search]);

  // 포커스/스토리지 동기화
  useEffect(() => {
    const sync = () => {
      setMarket(localStorage.getItem("currentMarketName") || "");
      setMarketId(localStorage.getItem("currentMarketId") || ""); // 동기화 추가
      setMyMarkets(readMyMarkets());
    };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  
  // 외부 클릭 → 드롭다운 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);


  // 시장 이름이 바뀔 때마다 marketId fetch
  useEffect(() => {
    const fetchMarketId = async () => {
      if (!market) {
        setMarketId("");
        localStorage.removeItem("currentMarketId");
        return;
      }
      const id = await findMarketId({ name: market });
      if (id) {
        setMarketId(id);
        localStorage.setItem("currentMarketId", id);
      } else {
        setMarketId("");
        localStorage.removeItem("currentMarketId");
        console.error("선택된 시장의 ID를 찾을 수 없습니다.");
      }
    };
    fetchMarketId();
  }, [market]);

  function goMarketSetting() {
    setOpen(false);
    navigate("/market-setting");
  }

  function toggleMenu() {
    if (!open) setMyMarkets(readMyMarkets());
    setOpen((v) => !v);
  }

  function chooseMarket(m) {
    localStorage.setItem("currentMarketName", m.name);
    if (m.id) {
      localStorage.setItem("currentMarketId", m.id);
      setMarketId(m.id);
    }

    if (m.lat) localStorage.setItem("currentMarketLat", String(m.lat));
    if (m.lng) localStorage.setItem("currentMarketLng", String(m.lng));
    setMarket(m.name);
    setMarketId(m.id); // marketId 상태 업데이트
    setOpen(false);
  }

  function clearSelection() {
    localStorage.removeItem("currentMarketName");
    localStorage.removeItem("currentMarketId");
    localStorage.removeItem("currentMarketLat");
    localStorage.removeItem("currentMarketLng");
    setMarket("");
    setMarketId(""); // marketId 상태 초기화
    setOpen(false);
  }

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

          {/* 가운데 시장 선택 드롭다운 */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-30"
            ref={menuRef}
          >
            <button
              onClick={toggleMenu}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5
                text-emerald-800 font-bold transition-transform duration-150
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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
            >
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
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
              <div className="font-bold mb-1">아직 시장이 선택되지 않았어요</div>
              <div className="text-sm text-slate-600 mb-3">
                먼저 내 주변 시장을 선택하면 가게/상품을 추천해 드릴게요.
              </div>
              <button
                onClick={goMarketSetting}
                className="px-4 py-2 rounded-lg bg-[#93DA97] text-black font-semibold block mx-auto hover:bg-[#7ecb82] transition-colors"
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
                  to={`/markets/${marketId}/shops/`}
                  className="px-2 py-1 rounded-md font-bold text-emerald-700 hover:bg-emerald-50"
                >
                  전체보기
                </Link>
              </div>
              <FrequentStores marketId={marketId} limit={6} />
            </section>

            {/* 카테고리 */}
            <section>
              <h3 className="font-extrabold text-[16px] mb-3">카테고리</h3>
              <CategoryGrid marketId={marketId} />
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
            right: "20px",
            bottom: "24px",
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