import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { bundleBySlug, skillBySlug, soSkillCua, tinhGiaGio } from "@/lib/catalog";

const KEY = "glow-gio-hang";

type Cart = {
  items: string[];
  has: (slug: string) => boolean;
  add: (slugs: string[], quiet?: boolean) => void;
  remove: (slug: string) => void;
  clear: () => void;
  soSkill: number;
  gia: ReturnType<typeof tinhGiaGio>;
};

const CartContext = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]") as unknown;
      if (Array.isArray(saved)) setItems(saved.filter((s): s is string => typeof s === "string" && !!(skillBySlug(s) ?? bundleBySlug(s))));
    } catch {
      /* bộ nhớ trình duyệt bị chặn: giỏ chỉ sống trong phiên */
    }
  }, []);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);
  // Lưu sau mỗi thay đổi (bỏ qua lượt đầu để không ghi đè giỏ đã lưu bằng giỏ rỗng)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* bỏ qua */
    }
  }, [items, loaded]);

  const value = useMemo<Cart>(() => {
    const soSkill = items.reduce((n, s) => n + soSkillCua(s), 0);
    return {
      items,
      has: (slug) => items.includes(slug),
      add: (slugs, quiet) => {
        const moi = slugs.filter((s) => !items.includes(s));
        setItems((prev) => [...prev, ...slugs.filter((s) => !prev.includes(s))]);
        if (!quiet) toast.success(moi.length ? `Đã thêm ${moi.length > 1 ? `${moi.length} món` : "vào giỏ"}` : "Đã có trong giỏ");
      },
      remove: (slug) => setItems((prev) => prev.filter((s) => s !== slug)),
      clear: () => setItems([]),
      soSkill,
      gia: tinhGiaGio(items),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart cần CartProvider");
  return c;
}
