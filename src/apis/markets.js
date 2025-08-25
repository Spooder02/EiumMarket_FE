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
 * 시장 이름 또는 주소를 검색하여 marketId를 찾습니다.
 * GET /markets/search?search=keyword
 * @returns {Promise<number|null>}
 */
export async function findMarketId({ name, address }) {
  const keyword = name || address;
  if (!keyword) {
    console.error("검색 키워드가 없습니다.");
    return null;
  }

  // URLSearchParams를 사용하여 파라미터를 안전하게 생성합니다.
  const params = new URLSearchParams();
  params.append('search', keyword);

  const url = `/markets/search?${params.toString()}`;
  
  // 디버깅을 위해 실제로 생성되는 URL을 확인합니다.
  console.log("실제 검색 요청 URL:", url);

  const res = await apiFetch(url);
  const id = await res.json().then(data => data.content[0].marketId);

  if (!res.ok) {
    console.error(`GET /markets/search 실패: ${res.status}`);
    return null;
  }
  
  const norm = (s) => String(s || "").trim();
  const data = norm(id);
  console.log(data)

  return data ?? null;
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

  const res = await apiFetch(`/api/markets`, {
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
 * 최종 보증: 시장이 존재하면 ID를 반환하고, 없으면 생성 후 ID를 반환합니다.
 * @param {object} payload - 시장 정보 객체
 * @returns {Promise<number>}
 */
export async function ensureMarketId(payload) {
  const exists = await checkMarketExist(payload);
  
  if (exists) {
    // 시장이 존재하면, 이름을 통해 marketId를 찾습니다.
    const id = await findMarketId(payload);
    if (id) {
        return id;
    }
    
    // 이 오류는 `checkMarketExist`가 true를 반환했음에도 불구하고,
    // `findMarketId`가 ID를 찾지 못할 때 발생합니다.
    throw new Error("시장 존재는 확인됐지만 marketId 탐색 실패");
  }

  // 시장이 존재하지 않으면, 새로 생성합니다.
  const created = await createMarket(payload);
  
  if (!created?.marketId) {
    // 생성 응답에 marketId가 없다면, 다시 이름을 통해 찾습니다.
    const newId = await findMarketId(payload);
    if (newId) {
        return newId;
    }
    throw new Error("시장 생성 응답에 marketId가 없으며, 재탐색에도 실패했습니다.");
  }
  
  return created.marketId;
}