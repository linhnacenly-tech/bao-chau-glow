import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Eye, LayoutGrid, Plus, ShoppingBag, ShoppingCart, Sparkle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatVnd, GIA_LE, NGUONG_GIAM, niches, skillsByNiche, tenNgach, tinhGia, zaloUrl, type Bundle, type Skill } from "@/lib/catalog";

// Thanh menu: "Ngách" mở bảng mọi ngách → bấm ngách nào hiện sản phẩm ngách đó.
function NicheMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary">
        <LayoutGrid className="size-4" /> Ngách
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="fixed inset-x-3 top-[7.5rem] z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-soft sm:absolute sm:inset-x-auto sm:left-0 sm:top-12 sm:w-[560px]">
          <p className="px-2 pb-2 text-xs font-black uppercase tracking-[0.14em] text-primary">Chọn ngách của bạn</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {niches.map((n) => (
              <Link key={n.id} to="/nganh/$id" params={{ id: n.id }} onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-secondary hover:text-primary" activeProps={{ className: "bg-secondary text-primary" }}>
                {tenNgach(n.ten)}
                <span className="rounded-full bg-secondary px-2 text-xs text-muted-foreground">{skillsByNiche(n.id).length}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const cart = useCart();
  return (
    <>
      <div className="bg-foreground text-background">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] font-semibold sm:px-5 sm:text-xs">
          <span>✦ 59.000Đ/SKILL · MUA TỪ 5 SKILL GIẢM 35%</span>
          <a className="hidden hover:text-primary sm:inline" href={zaloUrl} target="_blank" rel="noreferrer">
            Zalo 0967 934 486
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-5">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/" className="flex items-center gap-2" aria-label="Bảo Châu AI — trang chủ">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow">
                <Sparkle className="size-5" />
              </span>
              <span className="hidden font-display text-xl font-bold sm:inline">
                Bảo Châu <i className="font-normal text-primary">AI</i>
              </span>
            </Link>
            <NicheMenu />
          </div>
          <nav className="flex items-center gap-2">
            <Link to="/" hash="san" className="hidden px-2 text-sm font-semibold hover:text-primary md:inline">
              Sở hữu trọn sàn
            </Link>
            <Button asChild size="sm" className="relative rounded-full">
              <Link to="/gio-hang">
                <ShoppingCart className="size-4" /> Giỏ hàng
                {cart.items.length > 0 && <span className="ml-1 rounded-full bg-background px-1.5 text-xs font-black text-primary">{cart.soSkill}</span>}
              </Link>
            </Button>
          </nav>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
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
  );
}

// Thẻ sản phẩm: Xem · Thêm vào giỏ · Mua ngay
export function SkillCard({ skill }: { skill: Skill }) {
  const cart = useCart();
  const navigate = useNavigate();
  const co = cart.has(skill.slug);
  return (
    <article className={`skill-card group flex flex-col ${co ? "ring-2 ring-primary" : ""}`}>
      <Link to="/skill/$slug" params={{ slug: skill.slug }} className="relative block aspect-[4/3] overflow-hidden bg-secondary">
        <img src={skill.thumb} alt={`${skill.tenNgan} — ${skill.ten}`} loading="lazy" decoding="async" width={1200} height={900} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold leading-snug">{skill.ten}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{skill.moTa}</p>
        <div className="mt-auto pt-4">
          <p className="font-display text-2xl leading-none">{formatVnd(skill.gia)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/skill/$slug" params={{ slug: skill.slug }}>
                <Eye className="size-4" /> Xem
              </Link>
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => (co ? cart.remove(skill.slug) : cart.add([skill.slug]))} aria-pressed={co}>
              {co ? <Check className="size-4" /> : <Plus className="size-4" />} {co ? "Trong giỏ" : "Thêm giỏ"}
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              cart.add([skill.slug], true);
              void navigate({ to: "/gio-hang" });
            }}
          >
            <ShoppingBag className="size-4" /> Mua ngay
          </Button>
        </div>
      </div>
    </article>
  );
}

export function GiaCombo({ soSkill }: { soSkill: number }) {
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

// Khối "Mua cả combo": thêm cả nhóm skill vào giỏ rồi sang thanh toán
export function ComboBlock({ ten, moTa, slugs, soSkill }: { ten: string; moTa: string; slugs: string[]; soSkill: number }) {
  const cart = useCart();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-primary/30 bg-secondary/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="section-label">MUA CẢ COMBO</p>
        <h3 className="mt-1 font-display text-2xl">{ten}</h3>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{moTa}</p>
        <p className="mt-1 text-xs font-bold text-primary">Mua từ {NGUONG_GIAM} skill giảm 35%.</p>
      </div>
      <div className="flex flex-col gap-3 sm:items-end">
        <GiaCombo soSkill={soSkill} />
        <Button
          type="button"
          className="rounded-full"
          onClick={() => {
            cart.add(slugs, true);
            void navigate({ to: "/gio-hang" });
          }}
        >
          Mua combo <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export const comboCuaBo = (b: Bundle) => ({ ten: b.ten, moTa: b.moTa, slugs: [b.slug], soSkill: b.soSkill });
