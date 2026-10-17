import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SiteFooter, SiteHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { API_DON, bundleBySlug, donText, formatVnd, GIA_LE, NGUONG_GIAM, skillBySlug, soSkillCua, zaloLink } from "@/lib/catalog";

export const Route = createFileRoute("/gio-hang")({
  head: () => ({ meta: [{ title: "Giỏ hàng | Bảo Châu AI" }, { name: "robots", content: "noindex" }] }),
  component: CartPage,
});

type Don = {
  order_token: string;
  amount: number;
  count: number;
  qr_image_url: string | null;
  transfer: { bank: string | null; account_number: string | null; account_name: string; content: string };
  items: string[];
};

const DON_KEY = "glow-don-cho";

function chep(text: string, label: string) {
  try {
    void navigator.clipboard?.writeText(text);
    toast.success(`Đã chép ${label}`);
  } catch {
    /* bỏ qua */
  }
}

function CartPage() {
  const cart = useCart();
  const [form, setForm] = useState({ name: "", gmail: "", phone: "" });
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);
  const [don, setDon] = useState<Don | null>(null);
  const [daTra, setDaTra] = useState(false);

  // Đơn đang chờ chuyển khoản vẫn hiện lại khi tải lại trang
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DON_KEY);
      if (saved) setDon(JSON.parse(saved) as Don);
    } catch {
      /* bỏ qua */
    }
  }, []);

  // Kiểm tra trạng thái mỗi 5 giây cho tới khi SePay báo đã nhận tiền
  useEffect(() => {
    if (!don || daTra) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`${API_DON}?token=${encodeURIComponent(don.order_token)}`);
        const body = (await res.json()) as { ok: boolean; status?: string };
        if (body.ok && body.status === "paid") {
          setDaTra(true);
          cart.clear();
          try {
            localStorage.removeItem(DON_KEY);
          } catch {
            /* bỏ qua */
          }
        }
      } catch {
        /* mạng chập chờn: thử lại lượt sau */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [don, daTra, cart]);

  const datHang = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoi(null);
    setDangGui(true);
    try {
      const res = await fetch(API_DON, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: cart.items, gmail: form.gmail, name: form.name || undefined, phone: form.phone || undefined }) });
      const body = (await res.json()) as { ok: boolean; message?: string } & Partial<Don>;
      if (!res.ok || !body.ok) throw new Error(body.message || "Chưa tạo được đơn");
      const moi = { ...(body as Don), items: cart.items };
      setDon(moi);
      try {
        localStorage.setItem(DON_KEY, JSON.stringify(moi));
      } catch {
        /* bỏ qua */
      }
    } catch (err) {
      // Lỗi mạng (máy chủ thanh toán chưa sẵn sàng) → câu dễ hiểu, kèm nút đặt qua Zalo
      setLoi(err instanceof TypeError ? "Cổng thanh toán đang bận, bạn thử lại sau ít phút hoặc" : err instanceof Error ? err.message : "Chưa tạo được đơn");
    } finally {
      setDangGui(false);
    }
  };

  const huyDon = () => {
    setDon(null);
    try {
      localStorage.removeItem(DON_KEY);
    } catch {
      /* bỏ qua */
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="flex items-center gap-3 font-display text-4xl">
          <ShoppingCart className="size-8 text-primary" /> Giỏ hàng
        </h1>

        {daTra ? (
          <div className="mt-8 rounded-2xl border-2 border-primary bg-card p-8 text-center shadow-glow">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h2 className="mt-4 font-display text-3xl">Cảm ơn bạn, Châu đã nhận được tiền!</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Skill đã được chia sẻ vào Gmail của bạn qua Google Drive — mở email từ Google Drive để tải về. Chưa thấy sau vài phút thì nhắn Zalo 0967 934 486 nhé.</p>
            <Button asChild className="mt-6">
              <Link to="/">Về trang chủ</Link>
            </Button>
          </div>
        ) : don ? (
          <div className="mt-8 grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-soft md:grid-cols-[280px_1fr]">
            <div className="text-center">
              {don.qr_image_url ? <img src={don.qr_image_url} alt="Mã QR chuyển khoản" width={280} height={280} className="mx-auto w-full max-w-[280px] rounded-xl border border-border" /> : <p className="text-sm text-muted-foreground">Chưa có mã QR — chuyển khoản theo thông tin bên cạnh.</p>}
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Đang chờ chuyển khoản…
              </p>
            </div>
            <div>
              <h2 className="font-display text-3xl">Quét mã để thanh toán</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2"><dt className="text-muted-foreground">Số tiền</dt><dd className="font-extrabold text-primary">{formatVnd(don.amount)}</dd></div>
                {don.transfer.bank && <div className="flex justify-between gap-4 border-b border-border pb-2"><dt className="text-muted-foreground">Ngân hàng</dt><dd className="font-bold">{don.transfer.bank}</dd></div>}
                {don.transfer.account_number && (
                  <div className="flex justify-between gap-4 border-b border-border pb-2">
                    <dt className="text-muted-foreground">Số tài khoản</dt>
                    <dd className="flex items-center gap-2 font-bold">
                      {don.transfer.account_number}
                      <button type="button" aria-label="Chép số tài khoản" onClick={() => chep(don.transfer.account_number!, "số tài khoản")}><Copy className="size-4 text-primary" /></button>
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-b border-border pb-2"><dt className="text-muted-foreground">Chủ tài khoản</dt><dd className="font-bold">{don.transfer.account_name}</dd></div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Nội dung chuyển khoản</dt>
                  <dd className="flex items-center gap-2 font-mono text-base font-black">
                    {don.transfer.content}
                    <button type="button" aria-label="Chép nội dung" onClick={() => chep(don.transfer.content, "nội dung chuyển khoản")}><Copy className="size-4 text-primary" /></button>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 rounded-lg bg-secondary p-3 text-sm">Giữ <b>NGUYÊN</b> nội dung chuyển khoản để đơn tự xác nhận. Tiền vào là skill tự gửi vào Gmail của bạn.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={zaloLink(`Chào Bảo Châu AI, mình đã chuyển khoản đơn ${don.transfer.content} (${formatVnd(don.amount)}).`)} target="_blank" rel="noreferrer">Cần hỗ trợ qua Zalo</a>
                </Button>
                <Button variant="ghost" size="sm" onClick={huyDon}>Đặt lại đơn khác</Button>
              </div>
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Giỏ hàng đang trống.</p>
            <Button asChild className="mt-4">
              <Link to="/" hash="nganh">Chọn ngách để xem skill</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {cart.items.map((slug) => {
                const s = skillBySlug(slug);
                const b = bundleBySlug(slug);
                const n = soSkillCua(slug);
                return (
                  <li key={slug} className="flex items-center gap-4 p-3">
                    <img src={(s ?? b)?.thumb} alt="" width={120} height={90} className="h-[60px] w-20 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{s?.ten ?? b?.ten}</p>
                      <p className="text-xs text-muted-foreground">{n > 1 ? `Bộ ${n} skill · ` : ""}{formatVnd(n * GIA_LE)}</p>
                    </div>
                    <button type="button" aria-label="Bỏ khỏi giỏ" onClick={() => cart.remove(slug)} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <form onSubmit={datHang} className="price-card h-fit !p-5">
              <p className="text-sm text-muted-foreground">{cart.soSkill} skill</p>
              {cart.gia.coGiam && <p className="mt-2 text-sm"><s className="text-muted-foreground">{formatVnd(cart.gia.goc)}</s> <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-extrabold text-primary-foreground">-35%</span></p>}
              <p className="mt-1 font-display text-4xl">{formatVnd(cart.gia.tong)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{cart.gia.coGiam ? "Đã giảm 35% vì đơn từ 5 skill." : `Thêm ${NGUONG_GIAM - cart.soSkill} skill nữa để được giảm 35%.`}</p>
              <div className="mt-5 space-y-3">
                <label className="block text-sm font-semibold">
                  Gmail nhận skill <span className="text-destructive">*</span>
                  <input required type="email" value={form.gmail} onChange={(e) => setForm({ ...form, gmail: e.target.value })} placeholder="ten@gmail.com" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block text-sm font-semibold">
                  Họ tên
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block text-sm font-semibold">
                  Số Zalo
                  <input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
                </label>
              </div>
              {loi && (
                <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {loi}{" "}
                  <a className="font-bold underline" href={zaloLink(donText(cart.items))} target="_blank" rel="noreferrer" onClick={() => chep(donText(cart.items), "nội dung đơn")}>
                    Đặt qua Zalo
                  </a>
                </div>
              )}
              <Button type="submit" disabled={dangGui} className="mt-5 w-full rounded-full" size="lg">
                {dangGui ? <Loader2 className="size-4 animate-spin" /> : null} Thanh toán bằng mã QR
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Thanh toán qua SePay · skill gửi vào Gmail ngay khi tiền vào.</p>
            </form>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
