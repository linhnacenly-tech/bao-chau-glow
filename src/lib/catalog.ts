// Dữ liệu sinh bởi scripts/sync-skills.py từ kho-tong.json — không sửa tay src/data/skills.json.
import data from "@/data/skills.json";

export type Niche = { id: string; ten: string; eyebrow: string; moTa: string };
export type Skill = {
  slug: string;
  ma: string | null;
  ten: string;
  niche: string;
  moTa: string;
  loiIch: string[];
  gia: number;
  congXuong: string | null;
  thumb: string;
};
export type Bundle = { slug: string; ten: string; niche: string; soSkill: number; moTa: string };

export const skills = data.skills as Skill[];
export const bundles = data.bundles as Bundle[];
export const GIA_LE = data.giaLe; // 59.000đ / skill
export const NGUONG_GIAM = data.nguongGiam; // từ 5 skill
export const zaloUrl = "https://zalo.me/0967934486";

export const skillsByNiche = (id: string) => skills.filter((s) => s.niche === id);
// Chỉ hiện ngách đang có skill
export const niches = (data.niches as Niche[]).filter((n) => skillsByNiche(n.id).length > 0);
export const nicheById = (id: string) => niches.find((n) => n.id === id);

// Giá Châu chốt 17/10: 1–4 skill giá thường; từ 5 skill trong một đơn giảm 35% trên tổng (không làm tròn).
export function tinhGia(soSkill: number) {
  const goc = soSkill * GIA_LE;
  const coGiam = soSkill >= NGUONG_GIAM;
  return { goc, coGiam, tong: coGiam ? (goc * 65) / 100 : goc };
}

export const formatVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export const zaloLink = (text: string) => `${zaloUrl}?text=${encodeURIComponent(text)}`;

export function donComboText(ten: string, soSkill: number) {
  const g = tinhGia(soSkill);
  const gia = g.coGiam ? `${formatVnd(g.tong)} (giá gốc ${formatVnd(g.goc)}, giảm 35%)` : formatVnd(g.tong);
  return `Chào Bảo Châu AI, mình muốn mua ${ten} (${soSkill} skill) giá ${gia}.`;
}

export function donLeText(list: Skill[]) {
  const g = tinhGia(list.length);
  const gia = g.coGiam ? `${formatVnd(g.tong)} (giá gốc ${formatVnd(g.goc)}, giảm 35%)` : formatVnd(g.tong);
  const ds = list.map((s, i) => `${i + 1}. ${s.ten}${s.ma ? ` (${s.ma})` : ""}`).join("\n");
  return `Chào Bảo Châu AI, mình muốn đặt ${list.length} skill, tổng ${gia}:\n${ds}`;
}

const boDau = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export const khopTimKiem = (s: Skill, q: string) => {
  const k = boDau(q.trim());
  return !k || boDau(`${s.ten} ${s.moTa} ${s.loiIch.join(" ")}`).includes(k);
};
