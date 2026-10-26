// Dữ liệu sinh bởi scripts/sync-skills.py từ kho-tong.json — không sửa tay src/data/skills.json.
import data from "@/data/skills.json";

export type Niche = { id: string; ten: string; eyebrow: string; moTa: string };
export type Skill = {
  slug: string;
  ma: string | null;
  ten: string;
  tenNgan: string;
  niche: string;
  moTa: string;
  loiIch: string[];
  gia: number;
  hot?: boolean; // ngách Tự động hoá (22/10): giá riêng 135K, không vào mốc giảm 35%
  khuyenMai?: { gia: number; tu: string; den: string; lyDo?: string }; // giá có hạn (vd 59K trong 48 giờ sau Zoom, 23/10)
  congXuong: string | null;
  thumb: string;
};
export type Bundle = { slug: string; ten: string; tenNgan: string; niche: string; soSkill: number; moTa: string; thumb: string };

export const skills = data.skills as Skill[];
export const bundles = data.bundles as Bundle[];
export const GIA_LE = data.giaLe; // 59.000đ / skill
export const NGUONG_GIAM = data.nguongGiam; // từ 5 skill
export const zaloUrl = "https://zalo.me/0967934486";
// Thanh toán SePay + giao skill chạy trên máy chủ Công xưởng AGENT (dùng chung webhook, /quan-tri, Drive)
export const API_DON = "https://bcai-workshop-cong-xuong-agent.lovable.app/api/glow-order";

export const skillsByNiche = (id: string) => skills.filter((s) => s.niche === id);
export const bundlesByNiche = (id: string) => bundles.filter((b) => b.niche === id);
// Chỉ hiện ngách đang có skill
export const niches = (data.niches as Niche[]).filter((n) => skillsByNiche(n.id).length > 0);
export const nicheById = (id: string) => niches.find((n) => n.id === id);
export const skillBySlug = (slug: string) => skills.find((s) => s.slug === slug);
export const bundleBySlug = (slug: string) => bundles.find((b) => b.slug === slug);
export const tenNgach = (ten: string) => ten.replace(/^Sảnh [IVX]+ · /, "");

// Giá Châu chốt 17/10: 1–4 skill giá thường; từ 5 skill trong một đơn giảm 35% trên tổng (không làm tròn).
export function tinhGia(soSkill: number) {
  const goc = soSkill * GIA_LE;
  const coGiam = soSkill >= NGUONG_GIAM;
  return { goc, coGiam, tong: coGiam ? (goc * 65) / 100 : goc };
}

// Số skill của một món trong giỏ (bộ combo tính theo số skill trong bộ)
export const soSkillCua = (slug: string) => bundleBySlug(slug)?.soSkill ?? 1;
// Giá riêng (khớp giaRieng ở máy chủ Công xưởng, Châu chốt 26/10): skill hot, hoặc skill có giá khác giá lẻ
// (vd 135K gạch, khuyến mại ra mắt 59K) — tính theo giá của chính nó, không vào mốc giảm 35%.
export const coGiaRieng = (s: Skill | undefined) => !!s && (!!s.hot || s.gia !== GIA_LE);
const laHot = (slug: string) => coGiaRieng(skillBySlug(slug));
// Khuyến mãi có hạn (khớp giaHot ở máy chủ Công xưởng): trong khung giờ tính giá khuyến mãi, hết giờ tự về giá gốc.
export const dangKhuyenMai = (s: Skill | undefined, luc = Date.now()) => !!s?.khuyenMai && luc >= Date.parse(s.khuyenMai.tu) && luc < Date.parse(s.khuyenMai.den);
export const giaHienTai = (s: Skill) => (dangKhuyenMai(s) ? s.khuyenMai!.gia : s.gia);
// Giá một món trước giảm: skill tự động hoá theo giá riêng, còn lại GIA_LE × số skill.
export const giaCua = (slug: string) => (laHot(slug) ? giaHienTai(skillBySlug(slug)!) : soSkillCua(slug) * GIA_LE);

// Giá một giỏ (khớp glowPrice ở máy chủ Công xưởng). Từ 22/10: skill tự động hoá giá cố định, không giảm và
// không tính vào mốc 5 skill; mốc giảm 35% chỉ đếm skill giá thường.
export function tinhGiaGio(slugs: string[]) {
  const thuong = slugs.filter((s) => !laHot(s));
  const soThuong = thuong.reduce((n, s) => n + soSkillCua(s), 0);
  const g = tinhGia(soThuong);
  const tongHot = slugs.filter(laHot).reduce((n, s) => n + giaCua(s), 0);
  return { goc: g.goc + tongHot, coGiam: g.coGiam, tong: g.tong + tongHot, soThuong, coHot: tongHot > 0 };
}

export const formatVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

export const zaloLink = (text: string) => `${zaloUrl}?text=${encodeURIComponent(text)}`;

export function donText(slugs: string[]) {
  const so = slugs.reduce((n, s) => n + soSkillCua(s), 0);
  const g = tinhGiaGio(slugs);
  const gia = g.coGiam ? `${formatVnd(g.tong)} (giá gốc ${formatVnd(g.goc)}, giảm 35%)` : formatVnd(g.tong);
  const ds = slugs.map((s, i) => `${i + 1}. ${skillBySlug(s)?.ten ?? bundleBySlug(s)?.ten ?? s}`).join("\n");
  return `Chào Bảo Châu AI, mình muốn đặt ${so} skill, tổng ${gia}:\n${ds}`;
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
  return !k || boDau(`${s.ten} ${s.tenNgan} ${s.moTa} ${s.loiIch.join(" ")}`).includes(k);
};
