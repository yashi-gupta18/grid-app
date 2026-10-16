import { useMemo, useState } from "react";

export const palette = ["#14b8a6", "#38bdf8", "#818cf8", "#f472b6", "#fb7185", "#f59e0b", "#84cc16", "#a78bfa"];

const STORAGE_KEY = "pixelclaim:user";

const createId = () => {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useLocalUser = () => {
  const [user, setUser] = useState(readUser);

  const saveUser = (input) => {
    const nextUser = {
      userId: input.userId || createId(),
      username: input.username.trim().replace(/\s+/g, " "),
      color: input.color
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const resetUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return useMemo(() => ({ user, saveUser, resetUser }), [user]);
};
