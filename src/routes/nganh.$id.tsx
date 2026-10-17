import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Search, X } from "lucide-react";

import { ComboBlock, comboCuaBo, SiteFooter, SiteHeader, SkillCard } from "@/components/site";
import { bundlesByNiche, khopTimKiem, nicheById, niches, skillsByNiche, tenNgach } from "@/lib/catalog";

export const Route = createFileRoute("/nganh/$id")({
  loader: ({ params }) => {
    const niche = nicheById(params.id);
    if (!niche) throw notFound();
    return { niche };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${tenNgach(loaderData.niche.ten)} | Skill AI Bảo Châu AI` },
          { name: "description", content: `${skillsByNiche(loaderData.niche.id).length} Skill AI cho ${tenNgach(loaderData.niche.ten)}: ${loaderData.niche.moTa} 59.000đ/skill, từ 5 skill giảm 35%.` },
        ]
      : [],
  }),
  component: NichePage,
});

function NichePage() {
  const { niche } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const all = skillsByNiche(niche.id);
  const list = all.filter((s) => khopTimKiem(s, q));
  const ten = tenNgach(niche.ten);
  const combo = { ten: `Combo ${ten}`, moTa: `Trọn ${all.length} skill của ngách ${ten}.`, slugs: all.map((s) => s.slug), soSkill: all.length };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">Trang chủ</Link> / Ngách
          </p>
          <p className="section-label mt-4">{niche.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{niche.ten}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {niche.moTa} · {all.length} skill
          </p>
          <div className="mt-6">
            <ComboBlock {...combo} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-3xl">Sản phẩm của ngách</h2>
            {all.length > 8 && (
              <label className="relative block sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm trong ngách…" aria-label="Tìm skill trong ngách" className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-9 text-sm outline-none focus:border-primary" />
                {q && (
                  <button type="button" aria-label="Xoá tìm kiếm" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <X className="size-4" />
                  </button>
                )}
              </label>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((s) => (
              <SkillCard key={s.slug} skill={s} />
            ))}
          </div>
          {list.length === 0 && <p className="py-10 text-center text-muted-foreground">Chưa thấy skill khớp “{q}”.</p>}
          <div className="mt-10 space-y-4">
            {bundlesByNiche(niche.id).map((b) => (
              <ComboBlock key={b.slug} {...comboCuaBo(b)} />
            ))}
            <ComboBlock {...combo} />
          </div>
          <div className="mt-12">
            <p className="section-label">NGÁCH KHÁC</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {niches
                .filter((n) => n.id !== niche.id)
                .map((n) => (
                  <Link key={n.id} to="/nganh/$id" params={{ id: n.id }} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:border-primary hover:text-primary">
                    {tenNgach(n.ten)}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
