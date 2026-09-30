import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Bot, Check, ChevronDown, Headphones, Sparkle, Zap } from "lucide-react";

import automationImage from "@/assets/skill-automation.jpg";
import researchImage from "@/assets/skill-research.jpg";
import socialImage from "@/assets/skill-social.jpg";
import videoImage from "@/assets/skill-video.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bảo Châu AI | Thư viện Skill AI thực chiến" },
      { name: "description", content: "Khám phá hệ thống Skill AI thực chiến của Bảo Châu AI dành cho sáng tạo nội dung, video và bán hàng." },
      { property: "og:title", content: "Bảo Châu AI | Thư viện Skill AI thực chiến" },
      { property: "og:description", content: "Bộ Skill AI giúp bạn nghiên cứu, sáng tạo nội dung và vận hành nhanh hơn." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Skill = { name: string; code: string; description: string; tag: string; image: string; status?: string };

const skillGroups: { eyebrow: string; title: string; subtitle: string; skills: Skill[] }[] = [
  {
    eyebrow: "HỆ THỐNG NỘI DUNG",
    title: "Sảnh I · Điều phối & Nghiên cứu",
    subtitle: "Biến ý tưởng rời rạc thành một hệ thống nội dung có chiến lược.",
    skills: [
      { name: "Content Automation OS", code: "bcai-content-automation-os", description: "Điều phối tổng toàn bộ guồng máy nội dung AI của bạn.", tag: "Điều phối", image: automationImage },
      { name: "Content Research", code: "bcai-content-research", description: "Nghiên cứu chủ đề, bắt trend và tìm góc triển khai nhanh.", tag: "Nghiên cứu", image: researchImage },
      { name: "Facebook Comment Care", code: "bcai-facebook-comment-care", description: "Chăm sóc bình luận Fanpage nhất quán và đúng giọng thương hiệu.", tag: "Cộng đồng", image: socialImage },
      { name: "Inbox DM Care", code: "bcai-inbox-dm-care", description: "Hỗ trợ xử lý bình luận và tin nhắn theo quy trình rõ ràng.", tag: "Tin nhắn", image: socialImage, status: "Sắp ra mắt" },
      { name: "Conversion Analytics", code: "bcai-conversion-analytics", description: "Đọc tín hiệu nội dung và theo dõi hiệu quả chuyển đổi.", tag: "Phân tích", image: researchImage, status: "Sắp ra mắt" },
    ],
  },
  {
    eyebrow: "VIDEO & YOUTUBE",
    title: "Sảnh II · Video đa nền tảng",
    subtitle: "Lên ý tưởng, sản xuất và tối ưu video trong cùng một quy trình.",
    skills: [
      { name: "YouTube Description", code: "bcai-youtube-description", description: "Mô tả YouTube có cấu trúc, rõ ý và thân thiện tìm kiếm.", tag: "YouTube", image: videoImage },
      { name: "YouTube SEO", code: "bcai-youtube-seo", description: "Tối ưu chủ đề, từ khóa và tín hiệu khám phá trên YouTube.", tag: "SEO", image: videoImage },
      { name: "Cross-platform Video Ops", code: "bcai-cross-platform-video-ops", description: "Điều phối video đa nền tảng mà không mất chất lượng.", tag: "Video", image: videoImage, status: "Sắp ra mắt" },
      { name: "TikTok Live Chat", code: "bcai-tiktok-live-chat", description: "Hỗ trợ vận hành hội thoại và kịch bản TikTok Live.", tag: "TikTok", image: socialImage, status: "Sắp ra mắt" },
      { name: "Lịch Hàng Ngày", code: "bcai-lich-hang-ngay", description: "Quy trình lịch tự động và hướng nội dung bắt trend.", tag: "Lịch nội dung", image: automationImage },
    ],
  },
  {
    eyebrow: "TĂNG TRƯỞNG & CHUYỂN ĐỔI",
    title: "Sảnh III · Xây kênh & Chuyển đổi",
    subtitle: "Các trợ lý chuyên biệt để mở rộng độ phủ và tạo hành động.",
    skills: [
      { name: "Skill Builder", code: "bcai-skill-builder", description: "Tạo skill AI chuyên dụng theo đúng quy trình làm việc của bạn.", tag: "No-code", image: automationImage },
      { name: "Workshop Landing", code: "bcai-workshop-landing", description: "Xây nội dung landing page workshop mạch lạc và thuyết phục.", tag: "Landing page", image: researchImage },
      { name: "KOL Go Global Radar", code: "bcai-kol-go-global-radar", description: "Radar cơ hội quốc tế dành cho nhà sáng tạo và KOL.", tag: "KOL", image: researchImage, status: "Sắp ra mắt" },
      { name: "Traffic Conversion", code: "bcai-traffic-conversion", description: "Chuyển người xem thành lượt quan tâm bằng luồng nội dung đúng điểm chạm.", tag: "Chuyển đổi", image: automationImage, status: "Sắp ra mắt" },
      { name: "Zalo Zoom Funnel", code: "bcai-zalo-zoom-funnel", description: "Thiết kế hành trình Zalo và Zoom liền mạch cho chiến dịch.", tag: "Funnel", image: socialImage, status: "Sắp ra mắt" },
    ],
  },
];

const zaloUrl = "https://zalo.me/0967934486";

function SkillCard({ skill }: { skill: Skill }) {
  const purchaseUrl = `${zaloUrl}?text=${encodeURIComponent(`Chào Bảo Châu AI, mình muốn mua Skill ${skill.name} (${skill.code}) giá $5.`)}`;
  const detailUrl = `${zaloUrl}?text=${encodeURIComponent(`Chào Bảo Châu AI, mình muốn xem chi tiết Skill ${skill.name} (${skill.code}).`)}`;
  const ownedUrl = `${zaloUrl}?text=${encodeURIComponent(`Chào Bảo Châu AI, mình đã mua Skill ${skill.name} và cần hỗ trợ.`)}`;

  return (
    <article className="skill-card group">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img src={skill.image} alt={skill.name} loading="lazy" width={768} height={960} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        <span className="absolute left-3 top-3 rounded-full border border-card/70 bg-card/90 px-3 py-1 text-[10px] font-extrabold uppercase text-primary backdrop-blur">{skill.tag}</span>
        {skill.status && <span className="absolute right-3 top-3 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold text-background">{skill.status}</span>}
        <div className="absolute inset-x-0 bottom-0 bg-image-fade p-4 pt-14">
          <h3 className="font-display text-2xl leading-[1.05] text-card">{skill.name}</h3>
        </div>
      </div>
      <div className="flex min-h-52 flex-col p-4">
        <p className="text-sm leading-6 text-muted-foreground">{skill.description}</p>
        <p className="mt-3 truncate font-mono text-[10px] text-primary">{skill.code}</p>
        <div className="mt-auto space-y-2 pt-4">
          <Button asChild className="w-full"><a href={purchaseUrl} target="_blank" rel="noreferrer"><span className="text-center leading-tight">🛒 Mua · $5<span className="block text-[10px] font-semibold opacity-75">135.000 ₫</span></span></a></Button>
          <Button asChild variant="outline" className="w-full"><a href={detailUrl} target="_blank" rel="noreferrer">Xem chi tiết</a></Button>
          <a href={ownedUrl} target="_blank" rel="noreferrer" className="block py-1 text-center text-xs text-muted-foreground transition-colors hover:text-primary">Đã mua rồi?</a>
        </div>
      </div>
    </article>
  );
}

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <div className="bg-foreground text-background">
        <div className="mx-auto flex min-h-10 max-w-7xl items-center justify-between gap-4 px-5 text-xs font-semibold">
          <span>✦ HỆ SINH THÁI SKILL AI THỰC CHIẾN</span>
          <a className="transition-colors hover:text-primary" href={zaloUrl} target="_blank" rel="noreferrer">Zalo 0967 934 486</a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-3" aria-label="Bảo Châu AI">
            <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow"><Sparkle className="size-5" /></span>
            <span className="font-display text-xl font-bold">Bảo Châu <i className="font-normal text-primary">AI</i></span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a href="#skills" className="hover:text-primary">Thư viện Skill</a>
            <a href="#combo" className="hover:text-primary">Combo</a>
            <a href="#faq" className="hover:text-primary">Câu hỏi</a>
          </nav>
          <Button asChild size="sm"><a href={zaloUrl} target="_blank" rel="noreferrer">Liên hệ Zalo</a></Button>
        </div>
      </header>

      <section id="top" className="hero-grid relative border-b border-border">
        <div className="mx-auto grid min-h-[660px] max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-4 py-2 text-xs font-extrabold uppercase text-primary shadow-soft"><Zap className="size-4" /> Bộ công cụ dành cho người làm nội dung</div>
            <h1 className="font-display text-5xl font-semibold leading-[.98] sm:text-7xl lg:text-8xl">Làm chủ nội dung với <span className="text-primary">Skill AI</span> của riêng bạn.</h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Mỗi Skill là một trợ lý chuyên trách — giúp Châu nghiên cứu, sản xuất, chăm sóc cộng đồng và tăng trưởng nhanh hơn.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg"><a href="#skills">Khám phá 15 Skill <ArrowRight className="size-4" /></a></Button>
              <Button asChild variant="outline" size="lg"><a href={zaloUrl} target="_blank" rel="noreferrer">Zalo 0967 934 486</a></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Dùng ngay, không cần code</span>
              <span className="flex items-center gap-2"><BadgeCheck className="size-4 text-primary" /> Hướng dẫn rõ ràng</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="hero-photo-frame"><img src={automationImage} alt="Bảo Châu AI hỗ trợ vận hành nội dung" width={768} height={960} className="h-full w-full object-cover" /></div>
            <div className="absolute -bottom-5 -left-5 rounded-lg border border-primary/20 bg-card p-4 shadow-glow sm:-left-10">
              <p className="text-3xl font-extrabold text-primary">15</p><p className="text-xs font-bold text-muted-foreground">Skill chuyên biệt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/55">
        <div className="mx-auto grid max-w-6xl gap-px bg-border md:grid-cols-3">
          {[{ icon: Bot, title: "Cài vào AI", text: "Cấu trúc sẵn để bắt đầu nhanh." }, { icon: Zap, title: "Nhận ngay", text: "Không chờ xét duyệt thủ công." }, { icon: Headphones, title: "Đồng hành", text: "Tư vấn trực tiếp qua Zalo." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-4 bg-secondary px-7 py-8"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon className="size-5" /></span><div><h3 className="font-display text-xl">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>)}
        </div>
      </section>

      <div id="skills">
        {skillGroups.map((group) => (
          <section key={group.title} className="border-b border-border py-20">
            <div className="mx-auto max-w-7xl px-5">
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="section-label">{group.eyebrow}</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{group.title}</h2><p className="mt-2 text-sm text-muted-foreground">{group.subtitle}</p></div>
                <a href={zaloUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-primary">Tư vấn chọn Skill <ArrowRight className="size-4" /></a>
              </div>
              <div className="skill-scroll">{group.skills.map((skill) => <SkillCard key={skill.code} skill={skill} />)}</div>
            </div>
          </section>
        ))}
      </div>

      <section id="combo" className="border-b border-border bg-secondary/55 py-24">
        <div className="mx-auto max-w-4xl px-5">
          <div className="mx-auto mb-12 max-w-xl text-center"><p className="section-label">LỰA CHỌN LINH HOẠT</p><h2 className="mt-3 font-display text-4xl">Chọn cách bắt đầu phù hợp</h2></div>
          <div className="grid gap-5 md:grid-cols-2">
            <article className="price-card flex flex-col border-2 border-primary shadow-glow">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Bán chạy nhất</p>
              <h3 className="mt-2 font-display text-2xl">Combo 10 Skill tự chọn</h3>
              <div className="mt-5 flex items-end gap-3">
                <p className="font-display text-5xl leading-none">$39</p>
                <p className="pb-1 text-sm font-semibold text-muted-foreground">1.053.000 ₫</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="line-through text-muted-foreground">$50</span>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold text-primary-foreground">-22%</span>
                <span className="text-muted-foreground">giá trị lẻ</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-primary">Tiết kiệm $11</p>
              <p className="mt-3 text-sm text-muted-foreground">Còn $3,90 mỗi Skill — rẻ hơn $11 so với mua lẻ</p>
              <ul className="mt-7 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Chọn bất kỳ 10 Skill trong các sảnh</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Câu lệnh làm việc cho AI, kèm cách gỡ lỗi hay gặp</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Còn $3,90 mỗi Skill thay vì $5</li>
              </ul>
              <Button asChild className="mt-8 w-full rounded-full bg-gradient-to-r from-primary to-primary-glow"><a href={`${zaloUrl}?text=${encodeURIComponent("Chào Bảo Châu AI, mình muốn mua Combo 10 Skill tự chọn giá $39.")}`} target="_blank" rel="noreferrer">Chọn combo <ArrowRight className="size-4" /></a></Button>
            </article>
            <article className="price-card flex flex-col bg-foreground text-background">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Gói lớn nhất · Tiết kiệm nhiều nhất</p>
              <h3 className="mt-2 font-display text-2xl">KOL AI SYSTEM</h3>
              <div className="mt-5 flex items-end gap-3">
                <p className="font-display text-5xl leading-none">$145</p>
                <p className="pb-1 text-sm font-semibold text-background/60">3.868.000 ₫</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="line-through text-background/60">$326</span>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold text-primary-foreground">-55%</span>
                <span className="text-background/60">giá trị lẻ</span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-primary">Tiết kiệm $181</p>
              <ul className="mt-7 space-y-3 text-sm text-background/70">
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Toàn bộ 15 Skill trong sảnh, gồm cả Skill ra mắt sau này</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Trọn bộ combo 10 Skill tự chọn</li>
                <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Đồng hành phát triển 1 năm cùng Bảo Châu AI</li>
              </ul>
              <Button asChild className="mt-auto w-full rounded-full bg-gradient-to-r from-primary to-primary-glow"><a href={`${zaloUrl}?text=${encodeURIComponent("Chào Bảo Châu AI, mình muốn mua KOL AI SYSTEM (trọn bộ 15 Skill) giá $145.")}`} target="_blank" rel="noreferrer">Liên hệ với chúng tôi <ArrowRight className="size-4" /></a></Button>
            </article>
          </div>
        </div>
      </section>

      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-5"><div className="mb-10 text-center"><p className="section-label">GIẢI ĐÁP NHANH</p><h2 className="mt-3 font-display text-4xl">Câu hỏi thường gặp</h2></div>
          <div className="space-y-3">{[
            ["Không biết code có dùng được không?", "Có. Các Skill được thiết kế để sử dụng trực tiếp bằng ngôn ngữ tự nhiên."],
            ["Châu nên bắt đầu với Skill nào?", "Hãy nhắn Zalo và chia sẻ mục tiêu hiện tại, Bảo Châu AI sẽ gợi ý lựa chọn phù hợp."],
            ["Các Skill sắp ra mắt khi nào có?", "Lịch phát hành sẽ được cập nhật trực tiếp qua kênh Zalo của Bảo Châu AI."],
            ["Có hướng dẫn sau khi nhận Skill không?", "Có hướng dẫn sử dụng để Châu dễ dàng bắt đầu và tùy chỉnh theo công việc."],
          ].map(([q, a]) => <details key={q} className="faq-item group"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">{q}<ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" /></summary><p className="pt-4 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div>
        </div>
      </section>

      <section className="border-y border-primary/20 bg-primary py-16 text-primary-foreground"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-5 text-center md:flex-row md:text-left"><div><p className="text-xs font-black uppercase">BẢO CHÂU AI</p><h2 className="mt-2 font-display text-4xl">Nâng cấp cách Châu làm nội dung.</h2></div><Button asChild variant="outline" size="lg" className="border-primary-foreground/30 bg-primary-foreground text-primary hover:bg-primary-foreground/90"><a href={zaloUrl} target="_blank" rel="noreferrer">Nhắn Zalo 0967 934 486 <ArrowRight className="size-4" /></a></Button></div></section>

      <footer className="bg-foreground py-10 text-background"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 text-sm md:flex-row"><div><p className="font-display text-xl">Bảo Châu <span className="text-primary">AI</span></p><p className="mt-2 text-background/55">Hệ sinh thái Skill AI thực chiến.</p></div><div className="md:text-right"><a href={zaloUrl} target="_blank" rel="noreferrer" className="font-bold text-primary">Zalo 0967 934 486</a><p className="mt-2 text-background/45">© 2026 Bảo Châu AI</p></div></div></footer>
    </main>
  );
}
