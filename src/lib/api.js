// src/lib/api.js
// 모든 API 호출은 이 함수 하나로만 나가게 통일합니다.
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://geonnie-be.space";

/**
 * path는 항상 "/..." 로 시작 (예: "/markets", "/markets/1/shops")
 * 예) apiFetch('/markets?size=50')
 */
export function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  const p = fetch(url, { ...options, headers });

  if (import.meta.env.VITE_DEBUG_API === "true") {
    console.log("[API →]", options.method || "GET", url);
    p.then(res => {
      console.log("[API ←]", res.status, url);
      return res;
    }).catch(err => {
      console.log("[API ✖︎]", url, err);
    });
  }
  return p;
}