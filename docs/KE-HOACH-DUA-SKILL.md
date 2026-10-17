# Kế hoạch đưa kho skill lên Bảo Châu Glow (17/10/2026 — Linh Glow)

## Hiện trạng repo
- Dự án Lovable (TanStack Start + Tailwind), một trang tĩnh `src/routes/index.tsx`, không có backend thanh toán/giao hàng.
- Trước đây: 15 skill viết tay trong 3 "sảnh" (Điều phối & Nghiên cứu · Video đa nền tảng · Xây kênh & Chuyển đổi), giá $5, mọi nút mua mở Zalo.

## Cách làm
1. **Nguồn duy nhất**: `morning-site-checkout/data/kho-skill/kho-tong.json` (Linh Kho gộp). Chỉ lấy skill **đã có gói giao** (bỏ trạng thái `CHUA_CO_GOI`) và bỏ skill riêng của Châu (`pheu-zalo-zoom`, bộ nhận diện video, NEON 3 tầng…).
2. **Script** `scripts/sync-skills.py` → sinh `src/data/skills.json` (khoá theo slug, chạy lại không trùng):
   - mô tả "làm được gì cho bạn" từ `description` trong SKILL.md (ưu tiên kho chuẩn hoá mới nhất trên Drive), 3 lợi ích lấy từ mục Đầu ra / Kết quả / Quy trình — không bịa;
   - 21 skill Công xưởng lấy mô tả + sản phẩm giao từ `b-o-ch-u-ai-sales-page/src/lib/products.ts`;
   - skill có SKILL.md tiếng Anh: tên/mô tả Việt hoá trong `scripts/viet-hoa.json`.
3. **Ngách**: giữ 3 sảnh cũ cho 21 skill Công xưởng; thêm ngách nghề theo cột `ngach`/`nhom` của kho tổng (Spa & Làm đẹp, Video & Phim AI, Hình ảnh & Thiết kế, Nội dung & Marketing, Bán hàng & Chuyển đổi, Giáo viên & Đào tạo, Kế toán & Tài chính, Văn phòng & Nhân sự, Bất động sản, Kiến trúc & Nội thất, Website & Tự động hóa, Nha khoa & Y tế, Phong thủy & Đời sống, Du lịch & Dịch vụ). Ngách chưa có skill thì tự ẩn.
4. **Giá** (Châu chốt 17/10): 1–4 skill 59.000đ/skill; từ 5 skill trong một đơn giảm 35% trên tổng (không làm tròn). Khối "Mua cả combo ngách" ở đầu trang và cuối mỗi ngách; khối "Sở hữu trọn gói sàn Skill" → nút Liên hệ Châu (Zalo), không ghi giá.
5. **Mua**: skill đang bán ở Công xưởng → "Mua ngay" sang `/san-pham/<slug>` của Công xưởng. Skill kho, combo và đơn tự chọn → mở Zalo 0967 934 486, trang tự chép nội dung đơn (tên + giá đã tính) để khách dán vào chat. Chưa làm cổng thanh toán riêng — chờ Châu chọn.
6. **Thumbnail** `scripts/thumbs.py`: ảnh THẬT có sẵn của Linh Na Model (`G:\My Drive\HÌNH ẢNH\CHÂU LINH NA\` — SĂC THÁI, ẢNH XÂY KÊNH, KÊNH LINH NA MODEL), cắt theo khuôn mặt, mỗi ngách một bộ sắc thái, thẻ liền nhau không trùng ảnh; tên skill tiếng Việt (Segoe UI), màu xanh phát quang của trang; webp 600×750 ≤ 200KB → `public/thumbs/`. Ảnh hero/combo/sàn/CTA → `public/linh-na/`.

## Chạy lại khi kho có skill mới
```bash
PYTHONUTF8=1 python scripts/sync-skills.py      # thêm skill mới + vẽ thumbnail còn thiếu
npm run build                                   # kiểm tra
```
`--rebuild-thumbs` để vẽ lại toàn bộ thumbnail.
