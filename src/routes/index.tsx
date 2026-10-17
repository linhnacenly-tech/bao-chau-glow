import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, Bot, Check, ChevronDown, Crown, Headphones, Plus, Search, ShoppingBag, Sparkle, X, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import {
  bundles,
  donComboText,
  donLeText,
  formatVnd,
  GIA_LE,
  khopTimKiem,
  NGUONG_GIAM,
  niches,
  skills,
  skillsByNiche,
  tinhGia,
  zaloLink,
  zaloUrl,
  type Niche,
  type Skill,
} from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bảo Châu AI | Thư viện Skill AI theo từng nghề" },
      { name: "description", content: `${skills.length} Skill AI thực chiến của Bảo Châu AI chia theo ngách: spa, giáo viên, kế toán, bất động sản, video, bán hàng… 59.000đ/skill, mua từ 5 skill giảm 35%.` },
      { property: "og:title", content: "Bảo Châu AI | Thư viện Skill AI theo từng nghề" },
      { property: "og:description", content: "Chọn Skill AI đúng nghề của bạn — 59.000đ/skill, từ 5 skill giảm 35%." },
      { property: "og:image", content: "/linh-na/hero.webp" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tenNgan = (ten: string) => ten.replace(/^Sảnh [IVX]+ · /, "");

// Chép nội dung đơn trước khi mở Zalo (Zalo không tự điền sẵn tin nhắn trên mọi thiết bị)
function chepDon(text: string) {
  try {
    void navigator.clipboard?.writeText(text);
    toast.success("Đã chép nội dung đơn", { description: "Dán vào khung chat Zalo với Châu để đặt mua nhé." });
  } catch {
    /* trình duyệt chặn clipboard: vẫn mở Zalo */
  }
}

function ZaloOrder({ text, children, className, variant }: { text: string; children: React.ReactNode; className?: string; variant?: "outline" }) {
  return (
    <Button asChild className={className} {...(variant ? { variant } : {})}>
      <a href={zaloLink(text)} target="_blank" rel="noreferrer" onClick={() => chepDon(text)}>
        {children}
      </a>
    </Button>
  );
}

function GiaCombo({ soSkill }: { soSkill: number }) {
  const g = tinhGia(soSkill);
  return (
    <div>
      {g.coGiam && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground line-through">{formatVnd(g.goc)}</span>
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold text-primary-foreground">-35%</span>
        </div>
      )}
      <p className="mt-1 font-display text-3xl leading-none">{formatVnd(g.tong)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {soSkill} skill · {g.coGiam ? `chỉ ${formatVnd(g.tong / soSkill)}/skill` : `${formatVnd(GIA_LE)}/skill`}
      </p>
    </div>
  );
}

function SkillCard({ skill, chon, onChon }: { skill: Skill; chon: boolean; onChon: () => void }) {
  const leText = `Chào Bảo Châu AI, mình muốn mua Skill ${skill.ten}${skill.ma ? ` (${skill.ma})` : ""} giá ${formatVnd(skill.gia)}.`;
  return (
    <article className={`skill-card group flex flex-col ${chon ? "ring-2 ring-primary" : ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img src={skill.thumb} alt={`Linh Na giới thiệu skill ${skill.ten}`} loading="lazy" decoding="async" width={600} height={750} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        {skill.congXuong && <span className="absolute right-3 top-3 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold text-background">Đang bán · Công xưởng</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold leading-snug">{skill.ten}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{skill.moTa}</p>
        {skill.loiIch.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-xs leading-5 text-muted-foreground">
            {skill.loiIch.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span className="line-clamp-2">{b}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto space-y-2 pt-4">
          <p className="font-display text-2xl leading-none">
            {formatVnd(skill.gia)} <span className="font-sans text-xs font-semibold text-muted-foreground">/ skill</span>
          </p>
          {skill.congXuong ? (
            <Button asChild className="w-full">
              <a href={skill.congXuong} target="_blank" rel="noreferrer">
                <ShoppingBag className="size-4" /> Mua ngay
              </a>
            </Button>
          ) : (
            <ZaloOrder text={leText} className="w-full">
              <ShoppingBag className="size-4" /> Đặt mua qua Zalo
            </ZaloOrder>
          )}
          <Button type="button" variant="outline" className="w-full" onClick={onChon} aria-pressed={chon}>
            {chon ? (
              <>
                <Check className="size-4" /> Đã thêm vào đơn
              </>
            ) : (
              <>
                <Plus className="size-4" /> Thêm vào đơn
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

function NicheCombo({ niche }: { niche: Niche }) {
  const n = skillsByNiche(niche.id).length;
  const ten = `Combo ${tenNgan(niche.ten)}`;
  return (
    <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-primary/30 bg-secondary/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="section-label">MUA CẢ COMBO NGÁCH</p>
        <h3 className="mt-1 font-display text-2xl">{ten}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Trọn {n} skill của ngách này{n >= NGUONG_GIAM ? " — mua từ 5 skill giảm 35%." : ". Mua từ 5 skill giảm 35%."}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        <GiaCombo soSkill={n} />
        <ZaloOrder text={donComboText(ten, n)} className="rounded-full">
          Đặt combo <ArrowRight className="size-4" />
        </ZaloOrder>
      </div>
    </div>
  );
}

function Index() {
  const [chon, setChon] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const toggle = (slug: string) => setChon((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));
  const dsChon = useMemo(() => skills.filter((s) => chon.includes(s.slug)), [chon]);
  const gioHang = tinhGia(dsChon.length);
  const comboTop = [
    ...niches.map((n) => ({ key: n.id, ten: `Combo ${tenNgan(n.ten)}`, so: skillsByNiche(n.id).length, moTa: n.moTa })),
    ...bundles.map((b) => ({ key: b.slug, ten: b.ten, so: b.soSkill, moTa: b.moTa })),
  ];
  const coKetQua = niches.some((n) => skillsByNiche(n.id).some((s) => khopTimKiem(s, q)));

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pb-28">
      <Toaster position="top-center" />
      <div className="bg-foreground text-background">
        <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-4 px-5 text-xs font-semibold">
          <span>✦ {skills.length} SKILL AI · 59.000Đ/SKILL · TỪ 5 SKILL GIẢM 35%</span>
          <a className="hidden transition-colors hover:text-primary sm:inline" href={zaloUrl} target="_blank" rel="noreferrer">
            Zalo 0967 934 486
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-3" aria-label="Bảo Châu AI">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
              <Sparkle className="size-5" />
            </span>
            <span className="font-display text-xl font-bold">
              Bảo Châu <i className="font-normal text-primary">AI</i>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#skills" className="hover:text-primary">Thư viện Skill</a>
            <a href="#combo" className="hover:text-primary">Combo ngách</a>
            <a href="#san" className="hover:text-primary">Sở hữu trọn sàn</a>
            <a href="#faq" className="hover:text-primary">Câu hỏi</a>
          </nav>
          <Button asChild size="sm">
            <a href={zaloUrl} target="_blank" rel="noreferrer">Liên hệ Zalo</a>
          </Button>
        </div>
      </header>

      <section id="top" className="hero-grid relative border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:min-h-[640px] lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-4 py-2 text-xs font-extrabold uppercase text-primary shadow-soft">
              <Zap className="size-4" /> {niches.length} ngách nghề · {skills.length} Skill AI
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              Chọn <span className="text-primary">Skill AI</span> đúng nghề của bạn.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Mỗi Skill là một trợ lý chuyên trách cho đúng một việc — chủ spa, giáo viên, kế toán, môi giới bất động sản, người làm video và bán hàng đều có bộ riêng. Cài vào AI là dùng, không cần biết code.
            </p>
            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
                <p className="text-xs font-bold text-muted-foreground">Mua 1–4 skill</p>
                <p className="mt-1 font-display text-3xl">
                  {formatVnd(GIA_LE)}
                  <span className="font-sans text-sm font-semibold text-muted-foreground"> /skill</span>
                </p>
              </div>
              <div className="rounded-xl border-2 border-primary bg-card p-4 shadow-glow">
                <p className="text-xs font-bold text-primary">Mua từ 5 skill trở lên</p>
                <p className="mt-1 font-display text-3xl">Giảm 35%</p>
                <p className="text-xs text-muted-foreground">
                  5 skill: <s>{formatVnd(tinhGia(5).goc)}</s> → {formatVnd(tinhGia(5).tong)}
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="#skills">
                  Khám phá {skills.length} Skill <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#combo">Xem combo ngách</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Dùng ngay, không cần code</span>
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Tự hỏi hồ sơ, làm theo thương hiệu của bạn</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
            <div className="hero-photo-frame">
              <img src="/linh-na/hero.webp" alt="Linh Na giới thiệu thư viện Skill AI của Bảo Châu AI" width={900} height={1125} className="h-full w-full object-cover" />
            </div>
            <img src="/linh-na/hero-2.webp" alt="Linh Na mỉm cười" width={420} height={525} loading="lazy" className="absolute -right-3 top-8 hidden w-32 rounded-2xl border-4 border-card object-cover shadow-glow sm:block lg:-right-8 lg:w-40" />
            <div className="absolute -bottom-5 -left-3 rounded-lg border border-primary/20 bg-card p-4 shadow-glow sm:-left-10">
              <p className="text-3xl font-extrabold text-primary">{skills.length}</p>
              <p className="text-xs font-bold text-muted-foreground">Skill · {niches.length} ngách</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/55">
        <div className="mx-auto grid max-w-6xl gap-px bg-border md:grid-cols-3">
          {[
            { icon: Bot, title: "Cài vào AI", text: "Claude, ChatGPT… cấu trúc sẵn để bắt đầu nhanh." },
            { icon: Zap, title: "Đúng việc của bạn", text: "Skill tự hỏi hồ sơ rồi làm theo thương hiệu của bạn." },
            { icon: Headphones, title: "Đồng hành", text: "Tư vấn chọn skill và hướng dẫn cài qua Zalo." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 bg-secondary px-7 py-8">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="combo" className="scroll-mt-16 border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_260px]">
            <div>
              <p className="section-label">MUA CẢ COMBO NGÁCH</p>
              <h2 className="mt-2 font-display text-4xl">Lấy trọn bộ skill của nghề bạn</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                <b className="text-foreground">Mua từ 5 skill giảm 35%</b> trên tổng đơn — áp dụng cho combo ngách và cả khi bạn tự chọn lẻ. Combo dưới 5 skill giữ giá thường {formatVnd(GIA_LE)}/skill.
              </p>
            </div>
            <img src="/linh-na/combo.webp" alt="Linh Na chỉ vào bảng combo" width={640} height={800} loading="lazy" className="hidden aspect-[4/5] w-full rounded-2xl object-cover shadow-glow lg:block" />
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {comboTop.map((c) => (
              <article key={c.key} className="price-card flex flex-col !p-5">
                <h3 className="font-display text-xl leading-tight">{c.ten}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{c.moTa}</p>
                <div className="mt-4">
                  <GiaCombo soSkill={c.so} />
                </div>
                <ZaloOrder text={donComboText(c.ten, c.so)} className="mt-auto w-full rounded-full" variant="outline">
                  Đặt combo <ArrowRight className="size-4" />
                </ZaloOrder>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div id="skills" className="scroll-mt-16">
        <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 md:flex-row md:items-center">
            <label className="relative block md:w-72 md:shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm skill: báo giá, giáo án, thuế…" aria-label="Tìm skill" className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-9 text-sm outline-none focus:border-primary" />
              {q && (
                <button type="button" aria-label="Xoá tìm kiếm" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="size-4" />
                </button>
              )}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold md:pb-0">
              {niches.map((n) => (
                <a key={n.id} href={`#ngach-${n.id}`} className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 hover:border-primary hover:text-primary">
                  {tenNgan(n.ten)} <span className="text-muted-foreground">{skillsByNiche(n.id).length}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {niches.map((niche) => {
          const list = skillsByNiche(niche.id).filter((s) => khopTimKiem(s, q));
          if (list.length === 0) return null;
          return (
            <section key={niche.id} id={`ngach-${niche.id}`} className="scroll-mt-40 border-b border-border py-16">
              <div className="mx-auto max-w-7xl px-5">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="section-label">{niche.eyebrow}</p>
                    <h2 className="mt-2 font-display text-3xl sm:text-4xl">{niche.ten}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {niche.moTa} · {list.length} skill
                    </p>
                  </div>
                  <a href={zaloUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary">
                    Tư vấn chọn Skill <ArrowRight className="size-4" />
                  </a>
                </div>
                <div className="skill-scroll">
                  {list.map((skill) => (
                    <SkillCard key={skill.slug} skill={skill} chon={chon.includes(skill.slug)} onChon={() => toggle(skill.slug)} />
                  ))}
                </div>
                {!q && <NicheCombo niche={niche} />}
              </div>
            </section>
          );
        })}
        {!coKetQua && (
          <p className="mx-auto max-w-7xl px-5 py-16 text-center text-muted-foreground">
            Chưa thấy skill khớp “{q}”.{" "}
            <a className="font-bold text-primary" href={zaloUrl} target="_blank" rel="noreferrer">
              Nhắn Châu
            </a>{" "}
            để được gợi ý.
          </p>
        )}
      </div>

      <section id="san" className="scroll-mt-16 border-b border-border bg-foreground py-20 text-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 lg:grid-cols-[.8fr_1.2fr]">
          <img src="/linh-na/san.webp" alt="Linh Na trong sảnh sang trọng" width={760} height={950} loading="lazy" className="mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl border border-primary/40 object-cover shadow-glow" />
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
              <Crown className="size-4" /> Dành cho doanh nghiệp · đối tác
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">Sở hữu trọn gói sàn Skill</h2>
            <p className="mt-4 max-w-xl leading-7 text-background/70">
              Nhận chuyển giao cả sàn: toàn bộ {skills.length} skill theo {niches.length} ngách cùng trang bán này để bạn vận hành dưới thương hiệu của mình. Châu tư vấn trực tiếp phạm vi chuyển giao.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-background/75">
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Trọn kho skill hiện có, chia sẵn theo ngách nghề</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Trang bán và hình ảnh sản phẩm đi kèm</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Trao đổi riêng với Châu qua Zalo</li>
            </ul>
            <Button asChild size="lg" className="mt-8 rounded-full bg-gradient-to-r from-primary to-primary-glow">
              <a href={zaloUrl} target="_blank" rel="noreferrer">
                Liên hệ Châu <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mb-10 text-center">
            <p className="section-label">GIẢI ĐÁP NHANH</p>
            <h2 className="mt-3 font-display text-4xl">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Giá tính thế nào?", `1 đến 4 skill: ${formatVnd(GIA_LE)}/skill, không giảm. Từ 5 skill trở lên trong một đơn (tự chọn lẻ hoặc combo ngách) giảm 35% trên tổng — ví dụ 5 skill ${formatVnd(tinhGia(5).tong)}, 10 skill ${formatVnd(tinhGia(10).tong)}.`],
              ["Mua thế nào?", "Skill có nhãn “Đang bán · Công xưởng” bấm Mua ngay để thanh toán và nhận skill tự động. Skill khác và combo: bấm Đặt mua — trang tự chép nội dung đơn, bạn dán vào Zalo cho Châu để nhận thông tin chuyển khoản và skill."],
              ["Không biết code có dùng được không?", "Có. Skill dùng bằng ngôn ngữ tự nhiên; lần đầu skill sẽ hỏi hồ sơ của bạn để làm đúng thương hiệu."],
              ["Nên bắt đầu với skill nào?", "Chọn ngách nghề của bạn ở thanh tìm kiếm, hoặc nhắn Zalo mục tiêu hiện tại để Châu gợi ý."],
            ].map(([hoi, dap]) => (
              <details key={hoi} className="faq-item group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  {hoi}
                  <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="pt-4 text-sm leading-6 text-muted-foreground">{dap}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-primary/20 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-5 py-12 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-5">
            <img src="/linh-na/cta.webp" alt="Linh Na" width={640} height={800} loading="lazy" className="hidden size-24 rounded-full border-4 border-primary-foreground/30 object-cover object-top sm:block" />
            <div>
              <p className="text-xs font-black uppercase">BẢO CHÂU AI</p>
              <h2 className="mt-2 font-display text-4xl">Cần chọn skill cho đúng nghề?</h2>
            </div>
          </div>
          <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            <a href={zaloUrl} target="_blank" rel="noreferrer">
              Nhắn Zalo 0967 934 486 <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="bg-foreground py-10 text-background">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 text-sm md:flex-row">
          <div>
            <p className="font-display text-xl">
              Bảo Châu <span className="text-primary">AI</span>
            </p>
            <p className="mt-2 text-background/55">Hệ sinh thái Skill AI thực chiến · hình ảnh: Linh Na Model.</p>
          </div>
          <div className="md:text-right">
            <a href={zaloUrl} target="_blank" rel="noreferrer" className="font-bold text-primary">
              Zalo 0967 934 486
            </a>
            <p className="mt-2 text-background/45">© 2026 Bảo Châu AI</p>
          </div>
        </div>
      </footer>

      {dsChon.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/30 bg-card/95 shadow-glow backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <p className="font-extrabold">
                Đơn của bạn: {dsChon.length} skill · {gioHang.coGiam && <s className="font-semibold text-muted-foreground">{formatVnd(gioHang.goc)}</s>} <span className="text-primary">{formatVnd(gioHang.tong)}</span>
              </p>
              <p className="text-xs text-muted-foreground">{gioHang.coGiam ? "Đã giảm 35% vì đơn từ 5 skill." : `Thêm ${NGUONG_GIAM - dsChon.length} skill nữa để được giảm 35%.`}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setChon([])}>
                Xoá
              </Button>
              <ZaloOrder text={donLeText(dsChon)} className="flex-1 sm:flex-none">
                <ShoppingBag className="size-4" /> Đặt đơn qua Zalo
              </ZaloOrder>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
