import { v4 as uuid } from "uuid";
import { DEFAULT_CATEGORIES } from "../constants/defaultCategories";
import { storage } from "../storage/mmkv";

const KEY = "custom_categories";

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  isCustom: boolean;
};

export const getCategories = (type: "income" | "expense"): Category[] => {
  const custom: Category[] = JSON.parse(storage.getString(KEY) || "[]");

  const defaults = DEFAULT_CATEGORIES[type].map((c) => ({
    ...c,
    type,
    isCustom: false,
  }));

  return [...defaults, ...custom.filter((c) => c.type === type)];
};

export const addCustomCategory = (name: string, type: "income" | "expense") => {
  const existing: Category[] = JSON.parse(storage.getString(KEY) || "[]");

  existing.push({
    id: uuid(),
    name,
    type,
    isCustom: true,
  });

  storage.set(KEY, JSON.stringify(existing));
};

export const updateCustomCategory = (id: string, newName: string) => {
  const existing: Category[] = JSON.parse(storage.getString(KEY) || "[]");

  const updated = existing.map((c) =>
    c.id === id ? { ...c, name: newName } : c,
  );

  storage.set(KEY, JSON.stringify(updated));
};

export const deleteCustomCategory = (id: string) => {
  const existing: Category[] = JSON.parse(storage.getString(KEY) || "[]");

  const updated = existing.filter((c) => c.id !== id);

  storage.set(KEY, JSON.stringify(updated));
};
