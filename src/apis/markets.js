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

/**
 * 시장 생성 (Swagger 스펙: JSON body)
 * POST /markets
 * body: { name, address, latitude, longitude, description?, imageUrls? }
 * @returns {Promise<{marketId:number}>}
 */
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

  const res = await apiFetch(`/markets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 일부 서버가 중복 생성 시 409를 줄 수 있음 → 그 경우엔 다시 조회해서 ID 반환
  if (res.status === 409) {
    const id = await findMarketId({ name, address });
    if (id) return { marketId: id };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /markets 실패: ${res.status} ${text}`);
  }

  return res.json(); // { marketId, ... }
}

/**
 * 최종 보증: 존재하면 ID, 없으면 생성 후 ID 반환
 * @returns {Promise<number>}
 */
export async function ensureMarketId(payload /* {name,address,latitude,longitude,...} */) {
  const exists = await checkMarketExist(payload);
  if (exists) {
    const id = await findMarketId(payload);
    if (id) return id;

    // 혹시 첫 페이지에 없을 수 있어 페이지를 넓혀 1회 더 시도
    const res2 = await apiFetch(`/markets?${qs({ page: 0, size: 500 })}`);
    if (res2.ok) {
      const data2 = await res2.json();
      const norm = (s) => String(s || "").trim();
      const hit = data2?.content?.find(
        (m) =>
          (payload.name && norm(m.name) === norm(payload.name)) ||
          (payload.address && norm(m.address) === norm(payload.address))
      );
      if (hit?.marketId) return hit.marketId;
    }
    throw new Error("시장 존재는 true지만 marketId 탐색 실패");
  }

  // 없으면 생성
  const created = await createMarket(payload);
  if (!created?.marketId) throw new Error("시장 생성 응답에 marketId 없음");
  return created.marketId;
}