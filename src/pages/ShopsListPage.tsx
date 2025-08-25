import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import useAdminMode from "../hooks/useAdminMode";

// 아이콘 (기존 디자인 유지)
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ModeToggle = ({ mode, onToggle }: { mode: string; onToggle: () => void }) => (
  <button onClick={onToggle} className="text-white text-sm font-bold px-3 py-1.5 rounded-full bg-white/20">
    {mode === "user" ? "사용자 모드" : "관리자 모드"}
  </button>
);

export default function ShopsListPage() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { marketId } = useParams();
  const location = useLocation();

  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;
  const currentMarketName = localStorage.getItem("currentMarketName") || "시장";
  const { mode, toggle } = useAdminMode();

  // --- 쿼리: categoryId(우선), category(보조) ---
  const sp = new URLSearchParams(location.search);
  const selectedCategoryId = sp.get("categoryId");
  const selectedCategoryName = sp.get("category");

  // 응답에서 카테고리 정보 추출(필드명 다양성 대응)
  function pickCategoryId(shop: any): string {
    const id =
      shop?.categoryId ??
      shop?.category?.categoryId ??
      shop?.category_id ??
      shop?.category?.id ??
      null;
    return id != null ? String(id) : "";
  }
  function pickCategoryName(shop: any): string {
    return (
      shop?.category?.name ??
      shop?.categoryName ??
      shop?.category ??
      shop?.type ??
      ""
    );
  }

  // --- 데이터 fetch ---
  useEffect(() => {
    const fetchShops = async () => {
      if (!marketId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // ✅ /api를 제거하고 BACKEND_ENDPOINT를 직접 사용하도록 수정했습니다.
        const url = `${BACKEND_ENDPOINT}/markets/${marketId}/shops`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`서버 에러: ${response.status}`);
        const data = await response.json();
        setShops(data?.content || []);
      } catch (error) {
        console.error("상점 목록을 불러오는 데 실패했습니다.", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, [marketId, BACKEND_ENDPOINT]); // ✅ BACKEND_ENDPOINT를 의존성 배열에 추가

  // --- 클라이언트 필터 ---
  const filteredShops = useMemo(() => {
    if (!Array.isArray(shops)) return [];
    if (selectedCategoryId) {
      return shops.filter((s) => pickCategoryId(s) === String(selectedCategoryId));
    }
    if (selectedCategoryName) {
      return shops.filter((s) =>
        String(pickCategoryName(s)).includes(selectedCategoryName)
      );
    }
    return shops;
  }, [shops, selectedCategoryId, selectedCategoryName]);

  // === UI ===
  return (
    <div className="flex flex-col h-full bg-white">
      <header
        className="px-4 pt-12 pb-4 text-black flex-shrink-0 relative"
        style={{ backgroundColor: "#93DA97" }}
      >
        <div className="relative flex items-center justify-center h-10">
          <button 
            onClick={() => navigate("/")} 
            className="absolute left-0 p-2 text-white"
            aria-label="뒤로 가기"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-center text-white">
            {currentMarketName} 상점
          </h1>
          <div className="absolute right-0 p-2">
            <ModeToggle mode={mode} onToggle={toggle} />
          </div>
        </div>

        {(selectedCategoryId || selectedCategoryName) && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs text-white/90">선택된 카테고리:</span>
            <span className="px-2 py-0.5 rounded-full bg-white/25 text-white text-xs font-bold">
              {selectedCategoryName || selectedCategoryId}
            </span>
            <Link
              to={`/markets/${marketId}/shops`}
              className="text-xs underline text-white/90"
            >
              전체 보기
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            상점 목록을 불러오는 중...
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="text-xl font-bold">등록된 상점이 없습니다.</p>
            <p className="mt-2 text-sm">다른 카테고리를 선택해 보세요.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {filteredShops.map((shop) => {
              const img = shop?.imageUrls?.[0]
                ? BACKEND_ENDPOINT + String(shop.imageUrls[0]).replace(/[[\]"]/g, "")
                : "";
              const desc =
                typeof shop?.description === "string" && shop.description.length > 0
                  ? shop.description
                  : pickCategoryName(shop);

              return (
                <li key={shop.shopId} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <Link to={`/markets/${marketId}/shops/${shop.shopId}`} className="block">
                    <div className="w-full h-40 bg-gray-100 overflow-hidden">
                      {img ? (
                        <img
                          src={img}
                          alt={shop.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          이미지 없음
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold truncate">{shop.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <StarIcon />
                        <span className="ml-1 font-bold text-black">{shop.favoriteCount ?? 0}</span>
                        {desc && (
                          <span className="ml-2">
                            ({String(desc).substring(0, 20)}
                            {String(desc).length > 20 ? "..." : ""})
                          </span>
                        )}
                      </div>
                      {shop.openingHours && (
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <ClockIcon />
                          <span className="ml-2">{shop.openingHours}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* 우측 하단 + 버튼 (디자인 유지) */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => navigate("/add-store")}
          className="w-14 h-14 rounded-full shadow-xl active:scale-95 transition-transform"
          style={{ backgroundColor: "#93DA97" }}
          aria-label="가게 등록"
          title="가게 등록"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold">
            +
          </span>
        </button>
      </div>
    </div>
  );
}