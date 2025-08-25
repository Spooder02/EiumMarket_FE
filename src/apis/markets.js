// src/apis/markets.js
import { apiFetch } from "../lib/api";

// 쿼리스트링 유틸
const qs = (obj) => {
  const s = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const str = String(v).trim();
    if (str !== "") s.append(k, str);
  });
  return s.toString();
};

/**
 * 시장 존재 여부 확인
 * GET /markets/check-exist?name=...&address=...
 * @returns {Promise<boolean>}
 */
export async function checkMarketExist({ name, address }) {
  const res = await apiFetch(`/markets/check-exist?${qs({ name, address })}`);
  if (!res.ok) throw new Error(`check-exist 실패: ${res.status}`);
  const bool = await res.json();
  return Boolean(bool);
}

/**
 * 목록에서 marketId 찾기 (정확 일치)
 * GET /markets?page=0&size=200
 * @returns {Promise<number|null>}
 */
export async function findMarketId({ name, address }) {
  const res = await apiFetch(`/markets?${qs({ page: 0, size: 200 })}`);
  if (!res.ok) throw new Error(`GET /markets 실패: ${res.status}`);
  const data = await res.json();

  const norm = (s) => String(s || "").trim();
  const hit = data?.content?.find(
    (m) =>
      (name && norm(m.name) === norm(name)) ||
      (address && norm(m.address) === norm(address))
  );
  return hit?.marketId ?? null;
}

export async function createMarket({
  name,
  address,
  latitude,
  longitude,
  description = "",
  imageUrls = [],
}) {
  const payload = {
    name,
    address,
    latitude,
    longitude,
    description,
    imageUrls,
  };
  
  const formData = new FormData();
  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const value = payload[key];
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  }
  
  // imageFiles 필드를 비어있는 상태로 추가
  const emptyFile = new Blob([], { type: 'application/octet-stream' });
  formData.append('imageFiles', emptyFile, '');

  const res = await apiFetch(`/markets`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /markets 실패: ${res.status} ${text}`);
  }

  return res.json(); 
}

/**
 * 시장 이름을 기반으로 ID를 찾아 반환합니다.
 * @param {string} name - 찾을 시장의 이름.
 * @returns {Promise<number|null>} 시장 ID 또는 찾을 수 없을 경우 null.
 */
export async function findMarketIdByName(name) {
  const res = await apiFetch(`/markets/search?name=${encodeURIComponent(name)}`);
  
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const foundMarket = data.content?.find(market => market.name === name);
  
  return foundMarket?.marketId || null;
}


/**
 * 최종 보증: 존재하면 ID, 없으면 생성 후 ID 반환
 * @returns {Promise<number>}
 */
export async function ensureMarketId(payload /* {name,address,latitude,longitude,...} */) {
  const exists = await checkMarketExist(payload);
  
  if (exists) {
    const id = await findMarketIdByName(payload.name);
    if (id) return id;

    // 이름으로 못 찾았을 경우, 주소로 재탐색하거나 다른 로직을 추가할 수 있습니다.
    // 여기서는 간단히 오류를 발생시킵니다.
    throw new Error("시장 존재는 true지만 marketId 탐색 실패");
  }

  // 없으면 생성
  const created = await createMarket(payload);
  if (!created?.marketId) throw new Error("시장 생성 응답에 marketId 없음");
  
  return created.marketId;
}