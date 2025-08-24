// src/hooks/useAdminMode.js
import { useEffect, useState } from "react";

const KEY = "appMode"; // "admin" | "user"

export default function useAdminMode() {
  // 첫 마운트 시 localStorage에서 읽기
  const [mode, setMode] = useState(() => {
    const v = localStorage.getItem(KEY);
    return v === "admin" || v === "user" ? v : "user";
  });

  const isAdmin = mode === "admin";

  // 변경사항 저장
  useEffect(() => {
    localStorage.setItem(KEY, mode);
  }, [mode]);

  const toggle = () => setMode((m) => (m === "admin" ? "user" : "admin"));

  return { mode, isAdmin, toggle, setMode };
}
