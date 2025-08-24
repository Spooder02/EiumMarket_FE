let kakaoPromise = null;

export function loadKakaoMap() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window is undefined"));
  }
  // 이미 로드되어 있으면 그대로 반환
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao);
  }
  // 최초 1회만 스크립트 삽입
  if (!kakaoPromise) {
    kakaoPromise = new Promise((resolve, reject) => {
      const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
      if (!appkey) {
        reject(new Error("VITE_KAKAO_MAP_KEY is missing"));
        return;
      }
      const script = document.createElement("script");
      script.async = true;
      script.src =
        `https://dapi.kakao.com/v2/maps/sdk.js` +
        `?appkey=${appkey}&libraries=services,clusterer&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => resolve(window.kakao));
      };
      script.onerror = () => reject(new Error("Failed to load Kakao Maps script"));
      document.head.appendChild(script);
    });
  }
  return kakaoPromise;
}