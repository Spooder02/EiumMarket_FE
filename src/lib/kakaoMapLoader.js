// src/lib/kakaoMapLoader.js
let kakaoReadyPromise = null;

export function loadKakaoMap() {
  if (typeof window === "undefined") {
    // SSR 방지
    return Promise.reject(new Error("kakao map cannot load on SSR"));
  }

  // 이미 로드되어 있으면 즉시 반환
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao);
  }

  // 중복 로드 방지 (싱글톤 프로미스)
  if (kakaoReadyPromise) return kakaoReadyPromise;

  const APP_KEY = import.meta.env.VITE_KAKAO_MAP_API_KEY;
  if (!APP_KEY) {
    console.error("❌ VITE_KAKAO_MAP_API_KEY is missing in .env");
    return Promise.reject(
      new Error("VITE_KAKAO_MAP_API_KEY is missing in .env")
    );
  }

  kakaoReadyPromise = new Promise((resolve, reject) => {
    // 이미 같은 스크립트가 있으면 그걸 재사용
    const existing = document.querySelector(
      'script[src^="https://dapi.kakao.com/v2/maps/sdk.js"]'
    );
    if (existing) {
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }

    function onLoad() {
      // autoload=false 로 불렀으니 load()로 초기화
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => resolve(window.kakao));
      } else {
        reject(new Error("kakao maps object not found after script load"));
      }
    }
    function onError(e) {
      reject(new Error("failed to load Kakao Maps SDK"));
    }

    const script = document.createElement("script");
    // HTTPS 고정 + services 라이브러리 + autoload=false
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${APP_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.head.appendChild(script);
  });

  return kakaoReadyPromise;
}