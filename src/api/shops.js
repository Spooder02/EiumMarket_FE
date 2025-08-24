import api from "./client";

// 상점 상세(아이템 포함 응답)
export const getShop = (marketId, shopId) =>
  api.get(`/markets/${marketId}/shops/${shopId}`);