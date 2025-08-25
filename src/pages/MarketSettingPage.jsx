// src/pages/MarketSettingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadKakaoMap } from "../lib/kakaoMapLoader";
import { ensureMarketId } from "../apis/markets";

const FALLBACK_CENTER = { lat: 36.7794, lng: 127.0036 }; // 지오로케이션 실패 시
const MY_MARKETS_KEY = "myMarkets";

const readMyMarkets = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(MY_MARKETS_KEY) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const writeMyMarkets = (arr) =>
  localStorage.setItem(MY_MARKETS_KEY, JSON.stringify(arr));
const toEntry = (m) => ({
  id: m.id || `${m.lat},${m.lng}`,
  name: m.name,
  addr: m.addr,
  lat: m.lat,
  lng: m.lng,
});

export default function MarketSettingPage() {
  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markersRef = useRef([]);
  const overlayRef = useRef(null); // 커스텀 말풍선 (재사용 1개)

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(() =>
    readMyMarkets().map((m) => m.id)
  );
  const [flash, setFlash] = useState(null); // { id, mode: 'added'|'removed' }

  useEffect(() => {
    let canceled = false;

    async function init() {
      try {
        const kakao = await loadKakaoMap();

        // 1) 현재 위치
        const center = await new Promise((resolve) => {
          if (!navigator.geolocation) return resolve(FALLBACK_CENTER);
          navigator.geolocation.getCurrentPosition(
            ({ coords }) =>
              resolve({ lat: coords.latitude, lng: coords.longitude }),
            () => resolve(FALLBACK_CENTER),
            { enableHighAccuracy: true, timeout: 4000 }
          );
        });
        if (canceled) return;

        // 2) 지도 생성
        const mapCenter = new kakao.maps.LatLng(center.lat, center.lng);
        const map = new kakao.maps.Map(mapRef.current, {
          center: mapCenter,
          level: 4,
        });
        mapObj.current = map;

        // 내 위치 마커
        new kakao.maps.Marker({ position: mapCenter }).setMap(map);

        // 커스텀 오버레이 생성(가운데 정렬)
        overlayRef.current = new kakao.maps.CustomOverlay({
          xAnchor: 0.5,
          yAnchor: 1.25,
        });

        // 3) 주변 "시장" 키워드 검색
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(
          "시장",
          (data, status) => {
            if (canceled) return;
            if (status !== kakao.maps.services.Status.OK) {
              setResults([]);
              setLoading(false);
              return;
            }

            // 이전 마커 정리
            markersRef.current.forEach((m) => m.setMap(null));
            markersRef.current = [];

            // 결과 매핑
            const list = data.map((p) => ({
              id: p.id,
              name: p.place_name,
              addr: p.road_address_name || p.address_name,
              lat: parseFloat(p.y),
              lng: parseFloat(p.x),
            }));
            setResults(list);

            // 마커 생성 + 클릭 시 커스텀 말풍선 열기
            list.forEach((p) => {
              const marker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(p.lat, p.lng),
                title: p.name,
              });
              marker.setMap(map);

              kakao.maps.event.addListener(marker, "click", () => {
                if (!overlayRef.current) return;
                overlayRef.current.setContent(bubbleHTML(p.name));
                overlayRef.current.setPosition(marker.getPosition());
                overlayRef.current.setMap(map);
              });

              markersRef.current.push(marker);
            });

            setLoading(false);
          },
          { location: mapCenter, radius: 4000 }
        );
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }

    init();
    return () => {
      canceled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (overlayRef.current) overlayRef.current.setMap(null);
      mapObj.current = null;
    };
  }, []);

  // 목록에서 클릭 시: 지도 이동 + 해당 마커 기준으로 말풍선 열기
  function panTo(m) {
    const kakao = window.kakao;
    const map = mapObj.current;
    if (!map) return;

    const pos = new kakao.maps.LatLng(m.lat, m.lng);
    map.relayout();
    map.setCenter(pos);

    const marker = markersRef.current.find(
      (mk) => mk.getTitle && mk.getTitle() === m.name
    );
    if (marker && overlayRef.current) {
      overlayRef.current.setContent(bubbleHTML(m.name));
      overlayRef.current.setPosition(marker.getPosition());
      overlayRef.current.setMap(map);
    }
  }

  // 저장 토글 + DB 보증 + marketId 보관
  async function toggleSave(m) {
    const id = m.id || `${m.lat},${m.lng}`;
    const current = readMyMarkets();
    const exists = current.some((x) => x.id === id);

    if (exists) {
      const next = current.filter((x) => x.id !== id);
      writeMyMarkets(next);
      setSavedIds(next.map((x) => x.id));
      setFlash({ id, mode: "removed" });
      // 선택 해제할 때는 currentMarketId 유지(필요 시 지워도 됨)
    } else {
      const entry = toEntry(m);
      const next = [entry, ...current.filter((x) => x.id !== id)].slice(0, 10);
      writeMyMarkets(next);
      setSavedIds(next.map((x) => x.id));
      setFlash({ id, mode: "added" });

      // ★ DB 보증: 존재 확인 → 없으면 생성 → marketId 저장
      try {
        const marketId = await ensureMarketId({
          name: m.name,
          address: m.addr,
          latitude: m.lat,
          longitude: m.lng,
        });
        localStorage.setItem("currentMarketId", String(marketId));
        localStorage.setItem("currentMarketName", String(m.name));
        navigate('/')
      } catch (e) {
        console.error(e);
        alert("시장 등록/확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
    setTimeout(() => setFlash(null), 650);
  }

  return (
    <div className="w-full h-dvh bg-white flex flex-col overflow-hidden">
      {/* 상단 풀블리드 컬러 헤더 */}
      <div
        className="relative w-full text-white"
        style={{ backgroundColor: "#93DA97", paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="h-14 flex items-center justify-center text-black">
          <h1 className="text-lg font-extrabold">시장 설정</h1>
          <button
            onClick={() => navigate(-1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="h-[360px] bg-gray-100 shrink-0" />

      {/* 인근 시장 목록 */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2">
        <h2 className="text-slate-900 font-extrabold mb-2">인근 시장</h2>
        {loading && <div className="text-sm text-slate-500">주변 시장을 찾는 중…</div>}
        {!loading && results.length === 0 && (
          <div className="text-sm text-slate-500">주변에서 시장을 찾지 못했어요.</div>
        )}

        {results.map((m) => {
          const id = m.id || `${m.lat},${m.lng}`;
          const isSaved = savedIds.includes(id);
          const isFlash = flash?.id === id;
          const flashRing =
            isFlash && flash.mode === "added"
              ? "ring-2 ring-emerald-500"
              : isFlash && flash.mode === "removed"
              ? "ring-2 ring-rose-400"
              : "";

          return (
            <div key={id} className={`rounded-xl border p-3 transition ${flashRing}`}>
              <div className="flex items-start justify-between gap-3">
                <div onClick={() => panTo(m)} className="flex-1 cursor-pointer">
                  <div className="font-bold text-emerald-700">{m.name}</div>
                  <div className="text-sm text-slate-500">{m.addr || "주소 없음"}</div>
                </div>

                <button
                  onClick={() => toggleSave(m)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-semibold transition active:scale-95
                    ${isSaved ? "bg-emerald-600 text-white" : "bg-white border hover:bg-emerald-50"}
                    ${isFlash ? "animate-pulse" : ""}`}
                >
                  {isSaved ? "추가됨 ✓" : "추가하기"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 말풍선 HTML */
function bubbleHTML(text) {
  return `
    <div style="position:relative; display:inline-block; background:#fff; border:1px solid #cfd4dc;
                border-radius:8px; padding:6px 10px; font-weight:700; white-space:nowrap;
                box-shadow:0 1px 6px rgba(0,0,0,.08);">
      ${escapeHtml(text)}
      <div style="position:absolute; left:50%; transform:translateX(-50%); bottom:-6px; width:0; height:0;
                  border-left:6px solid transparent; border-right:6px solid transparent; border-top:6px solid #fff;
                  filter: drop-shadow(0 -1px 0 rgba(0,0,0,.15));"></div>
    </div>`;
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}