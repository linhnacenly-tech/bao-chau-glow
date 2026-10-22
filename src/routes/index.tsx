import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Bot, Check, ChevronDown, Crown, Headphones, Zap } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { formatVnd, GIA_LE, niches, skills, skillsByNiche, tenNgach, tinhGia, zaloUrl } from "@/lib/catalog";

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

function Index() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />

      <section className="hero-grid relative border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:min-h-[600px] lg:grid-cols-[1.1fr_.9fr] lg:py-20">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-4 py-2 text-xs font-extrabold uppercase text-primary shadow-soft">
              <Zap className="size-4" /> {niches.length} ngách nghề · {skills.length} Skill AI
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              Chọn <span className="text-primary">Skill AI</span> đúng nghề của bạn.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Mỗi Skill là một trợ lý chuyên trách cho đúng một việc. Bấm <b className="text-foreground">Ngách</b> trên thanh menu để xem bộ skill của nghề bạn, cho vào giỏ và thanh toán bằng mã QR — skill gửi thẳng vào Gmail.
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
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Dùng ngay, không cần code</span>
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Thanh toán QR, nhận skill tự động</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
            <div className="hero-photo-frame">
              <img src="/linh-na/hero.webp" alt="Linh Na giới thiệu thư viện Skill AI của Bảo Châu AI" width={900} height={1125} className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-lg border border-primary/20 bg-card p-4 shadow-glow sm:-left-10">
              <p className="text-3xl font-extrabold text-primary">{skills.length}</p>
              <p className="text-xs font-bold text-muted-foreground">Skill · {niches.length} ngách</p>
            </div>
          </div>
        </div>
      </section>

      <section id="nganh" className="scroll-mt-16 border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-5">
          <p className="section-label">CHỌN NGÁCH CỦA BẠN</p>
          <h2 className="mt-2 font-display text-4xl">Mỗi nghề một bộ trợ lý</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {niches.map((n) => {
              const list = skillsByNiche(n.id);
              return (
                <Link key={n.id} to="/nganh/$id" params={{ id: n.id }} className="skill-card group block">
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    <img src={list[0]!.thumb} alt={tenNgach(n.ten)} loading="lazy" width={1200} height={900} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-4">
                    <p className="section-label">{n.eyebrow}</p>
                    <h3 className="mt-1 font-display text-xl">{tenNgach(n.ten)}</h3>
                    <p className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                      {list.length} skill <ArrowRight className="size-4 text-primary" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/55">
        <div className="mx-auto grid max-w-6xl gap-px bg-border md:grid-cols-3">
          {[
            { icon: Bot, title: "Cài vào AI", text: "Claude, ChatGPT… cấu trúc sẵn để bắt đầu nhanh." },
            { icon: Zap, title: "Thanh toán QR", text: "Quét mã, tiền vào là skill tự gửi vào Gmail của bạn." },
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

      <section id="faq" className="scroll-mt-16 py-20">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mb-10 text-center">
            <p className="section-label">GIẢI ĐÁP NHANH</p>
            <h2 className="mt-3 font-display text-4xl">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-3">
            {[
              ["Giá tính thế nào?", `1 đến 4 skill: ${formatVnd(GIA_LE)}/skill, không giảm. Từ 5 skill trở lên trong một đơn (tự chọn hoặc combo ngách) giảm 35% trên tổng — ví dụ 5 skill ${formatVnd(tinhGia(5).tong)}, 10 skill ${formatVnd(tinhGia(10).tong)}. Riêng skill tự động hoá (agent chạy việc hằng ngày, nhãn HOT) giá cố định 135.000đ, không tính vào mốc giảm.`],
              ["Mua thế nào?", "Bấm Ngách trên thanh menu → chọn skill → Thêm giỏ hoặc Mua ngay → nhập Gmail → quét mã QR chuyển khoản, giữ nguyên nội dung chuyển khoản. Tiền vào là skill tự chia sẻ vào Gmail của bạn qua Google Drive."],
              ["Không biết code có dùng được không?", "Có. Skill dùng bằng ngôn ngữ tự nhiên; lần đầu skill sẽ hỏi hồ sơ của bạn để làm đúng thương hiệu."],
              ["Chuyển khoản rồi mà chưa nhận skill?", "Nhắn Zalo 0967 934 486 kèm nội dung chuyển khoản, Châu kiểm tra và gửi ngay."],
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

      <SiteFooter />
    </main>
  );
}
