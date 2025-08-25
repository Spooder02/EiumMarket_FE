// src/components/FrequentStores.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FrequentStores({ marketId, limit = 6 }) {
  const [shops, setShops] = useState(null);
  const [loading, setLoading] = useState(false);
  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!marketId) { setShops([]); return; }
      try {
        setLoading(true);
        const res = await fetch(`/api/markets/${marketId}/shops`);
        if (!res.ok) throw new Error(`상점 조회 실패 ${res.status}`);
        const data = await res.json();
        const list = (data.content || [])
          .slice()
          .sort((a, b) => (b.favoriteCount ?? 0) - (a.favoriteCount ?? 0))
          .slice(0, limit);
        if (!cancelled) setShops(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setShops([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [marketId, limit]);

  if (!marketId) return null;

  return (
    <div>
      {loading && (
        <div className="rounded-xl border p-4 text-sm text-slate-600 text-center">
          불러오는 중…
        </div>
      )}
      {!loading && shops && shops.length === 0 && (
        <div className="rounded-xl border p-4 text-sm text-slate-600 text-center">
          아직 찜한 가게가 없어요. 마음에 드는 가게에서 ❤️를 눌러보세요!
        </div>
      )}
      {!loading && shops && shops.length > 0 && (
        <div className="grid grid-cols-2 gap-[14px]">
          {shops.map((s) => {
            const img = s.imageUrls?.[0] ? (BACKEND_ENDPOINT + String(s.imageUrls[0]).replace(/[[\]"]/g, "")) : "";
            return (
              <Link
                key={s.shopId}
                to={`/markets/${marketId}/shops/${s.shopId}`}
                className="block rounded-[18px] bg-white shadow p-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-full h-24 rounded-[14px] bg-gray-100 overflow-hidden mb-2.5">
                  {img ? (
                    <img src={img} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-gray-400 text-sm">이미지 없음</div>
                  )}
                </div>
                <div className="font-extrabold mb-0.5 truncate">{s.name}</div>
                <div className="text-[12px] text-slate-500">찜 {s.favoriteCount ?? 0}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
