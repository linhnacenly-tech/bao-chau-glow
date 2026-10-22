import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Check, Plus, ShoppingBag } from "lucide-react";

import { SiteFooter, SiteHeader, SkillCard } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatVnd, nicheById, skillBySlug, skillsByNiche, tenNgach } from "@/lib/catalog";

export const Route = createFileRoute("/skill/$slug")({
  loader: ({ params }) => {
    const skill = skillBySlug(params.slug);
    if (!skill) throw notFound();
    return { skill };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.skill.ten} | Skill AI Bảo Châu AI` },
          { name: "description", content: loaderData.skill.moTa },
          { property: "og:image", content: loaderData.skill.thumb },
        ]
      : [],
  }),
  component: SkillPage,
});

function SkillPage() {
  const { skill } = Route.useLoaderData();
  const cart = useCart();
  const navigate = useNavigate();
  const niche = nicheById(skill.niche);
  const co = cart.has(skill.slug);
  const khac = skillsByNiche(skill.niche).filter((s) => s.slug !== skill.slug).slice(0, 4);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Trang chủ</Link> /{" "}
          {niche && (
            <Link to="/nganh/$id" params={{ id: niche.id }} className="hover:text-primary">
              {tenNgach(niche.ten)}
            </Link>
          )}
        </p>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <img src={skill.thumb} alt={`${skill.tenNgan} — ${skill.ten}`} width={1200} height={900} className="aspect-[4/3] w-full rounded-2xl border border-border object-cover shadow-soft" />
          <div>
            <p className="section-label">{skill.tenNgan}</p>
            <h1 className="mt-2 font-display text-4xl">{skill.ten}</h1>
            <p className="mt-4 leading-7 text-muted-foreground">{skill.moTa}</p>
            {skill.loiIch.length > 0 && (
              <>
                <p className="mt-6 text-sm font-extrabold">Skill giúp bạn</p>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  {skill.loiIch.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check className="mt-1 size-4 shrink-0 text-primary" /> {b}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-6 font-display text-4xl">{formatVnd(skill.gia)}</p>
            <p className="text-xs text-muted-foreground">{skill.hot ? "🔥 HOT · Skill tự động hoá, được nhiều người ưa chuộng nhất. Giá cố định, không tính giảm 35%." : "Mua từ 5 skill trong một đơn giảm 35%."}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => {
                  cart.add([skill.slug], true);
                  void navigate({ to: "/gio-hang" });
                }}
              >
                <ShoppingBag className="size-4" /> Mua ngay
              </Button>
              <Button size="lg" variant="outline" onClick={() => (co ? cart.remove(skill.slug) : cart.add([skill.slug]))}>
                {co ? <Check className="size-4" /> : <Plus className="size-4" />} {co ? "Đã trong giỏ" : "Thêm vào giỏ"}
              </Button>
            </div>
          </div>
        </div>
        {khac.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl">Cùng ngách</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {khac.map((s) => (
                <SkillCard key={s.slug} skill={s} />
              ))}
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
