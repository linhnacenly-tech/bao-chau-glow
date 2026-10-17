# -*- coding: utf-8 -*-
"""Vẽ thumbnail skill từ ảnh THẬT có sẵn của Linh Na Model (không tạo ảnh AI mới).

Kiểu Châu chốt 17/10 (giống 15 thumbnail Trợ lý AGEN cũ): khổ 4:3, Linh Na mặc áo khoác
trắng logo Bảo Châu AI · KOL AI bên phải, tên skill chữ đậm xanh bên trái, nhãn ngách + biểu tượng.
Gương mặt lấy xoay vòng từ nhiều biểu cảm có sẵn (15 thumbnail cũ + ảnh bàn làm việc SĂC THÁI),
hai thẻ liền nhau không trùng biểu cảm. Crop theo khuôn mặt (OpenCV nếu có).
"""
import os
import shutil
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

PHOTO_DIR = os.environ.get("LINH_NA_PHOTOS", r"G:\My Drive\HÌNH ẢNH\CHÂU LINH NA")
W, H = 1200, 900
NAVY = (11, 26, 46)
CYAN = (19, 181, 216)
GLOW = (127, 224, 239)
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_SEMI = r"C:\Windows\Fonts\seguisb.ttf"
FONT_BLACK = r"C:\Windows\Fonts\seguibl.ttf"
FONT_EMOJI = r"C:\Windows\Fonts\seguiemj.ttf"
BLUE = (16, 76, 214)
BLUE_2 = (24, 119, 242)

# key: (đường dẫn trong kho ảnh, sắc thái)
# Không đưa vào POOLS: ga-tau, quat-vang, neon-hong (ảnh toàn thân, mặt quá nhỏ/khó cắt)
PHOTOS = {
    "kol-01": ("THUMNAIL/01-pheu-zalo-zoom-4k.jpg", "áo trắng logo · biểu cảm 01"),
    "kol-02": ("THUMNAIL/02-tao-skill-4k.jpg", "áo trắng logo · biểu cảm 02"),
    "kol-03": ("THUMNAIL/03-do-luong-chuyen-doi-4k.jpg", "áo trắng logo · biểu cảm 03"),
    "kol-04": ("THUMNAIL/04-radar-cong-dong-4k.jpg", "áo trắng logo · biểu cảm 04"),
    "kol-05": ("THUMNAIL/05-mo-ta-youtube-4k.jpg", "áo trắng logo · biểu cảm 05"),
    "kol-06": ("THUMNAIL/06-tong-dieu-hanh-4k.jpg", "áo trắng logo · biểu cảm 06"),
    "kol-07": ("THUMNAIL/07-cham-soc-binh-luan-fanpage-4k.jpg", "áo trắng logo · biểu cảm 07"),
    "kol-08": ("THUMNAIL/08-seo-youtube-4k.jpg", "áo trắng logo · biểu cảm 08"),
    "kol-09": ("THUMNAIL/09-chat-livestream-tiktok-4k.jpg", "áo trắng logo · biểu cảm 09"),
    "kol-10": ("THUMNAIL/10-tin-nhan-khach-hang-4k.jpg", "áo trắng logo · biểu cảm 10"),
    "kol-11": ("THUMNAIL/11-chuyen-doi-traffic-4k.jpg", "áo trắng logo · biểu cảm 11"),
    "kol-12": ("THUMNAIL/12-landing-page-workshop-4k.jpg", "áo trắng logo · biểu cảm 12"),
    "kol-13": ("THUMNAIL/13-nghien-cuu-noi-dung-4k.jpg", "áo trắng logo · biểu cảm 13"),
    "kol-14": ("THUMNAIL/14-dang-video-da-nen-tang-4k.jpg", "áo trắng logo · biểu cảm 14"),
    "kol-15": ("THUMNAIL/15-lich-van-hanh-tu-dong-4k.jpg", "áo trắng logo · biểu cảm 15"),
    "avatar": ("KÊNH LINH NA MODEL/linh-na-model-avatar.png", "cười ấm áp"),
    "cong-ai": ("SĂC THÁI/01-kol-cong-ai-ao-mo-khoa-logo-4k.jpg", "tự tin công nghệ"),
    "ai-xanh": ("SĂC THÁI/02-kol-ai-xanh-dam-ao-mo-khoa-logo-4k.jpg", "rạng rỡ công nghệ"),
    "bep": ("SĂC THÁI/03-kol-trong-bep-ao-mo-khoa-logo-4k.jpg", "thân thiện ở nhà"),
    "ngoai-troi": ("SĂC THÁI/04-kol-ngoai-troi-ao-mo-khoa-logo-4k.jpg", "selfie ngoài trời"),
    "rem-vang": ("SĂC THÁI/ChatGPT Image 15_45_19 14 thg 6, 2026.png", "vui tươi"),
    "phong-lab": ("SĂC THÁI/ChatGPT Image 18_34_57 14 thg 6, 2026.png", "khám phá"),
    "can-mat": ("SĂC THÁI/ChatGPT Image 21_40_06 13 thg 6, 2026.png", "cười rạng rỡ"),
    "chi-tay": ("SĂC THÁI/Cô gái KOL AI chỉ dẫn công nghệ.png", "chỉ dẫn hào hứng"),
    "ai-vong": ("SĂC THÁI/Ảnh ChatGPT 14_06_57 4 thg 10, 2026.png", "tự tin"),
    "ban-diu": ("SĂC THÁI/Ảnh ChatGPT 20_27_14 4 thg 10, 2026.png", "dịu dàng tập trung"),
    "ban-cuoi": ("SĂC THÁI/Ảnh ChatGPT 20_27_19 4 thg 10, 2026.png", "cười tươi"),
    "ban-noi": ("SĂC THÁI/Ảnh ChatGPT 20_27_26 4 thg 10, 2026.png", "đang giải thích"),
    "gioi-thieu": ("SĂC THÁI/Ảnh ChatGPT 20_27_32 4 thg 10, 2026.png", "hào hứng giới thiệu"),
    "ngac-nhien": ("SĂC THÁI/Ảnh ChatGPT 20_27_37 4 thg 10, 2026.png", "ngạc nhiên"),
    "y-tuong": ("SĂC THÁI/Ảnh ChatGPT 20_27_42 4 thg 10, 2026.png", "bật ra ý tưởng"),
    "bien-chieu": ("ẢNH XÂY KÊNH/02_denim_xanh_bien_chieu.png", "thư thái"),
    "mua-thu": ("ẢNH XÂY KÊNH/03_nau_kem_mua_thu.png", "nhẹ nhàng"),
    "tiem-sach": ("ẢNH XÂY KÊNH/04_cardigan_xanh_tiem_sach.png", "ham học"),
    "pho-dem": ("ẢNH XÂY KÊNH/05_da_do_ruou_pho_dem.png", "cá tính"),
    "ga-tau": ("ẢNH XÂY KÊNH/06_hoodie_xam_ga_tau.png", "năng động"),
    "kinh-den": ("ẢNH XÂY KÊNH/07_hoodie_den_san_truot.png", "tập trung"),
    "san-dat": ("ẢNH XÂY KÊNH/08_ao_nau_san_dat.png", "ấm áp"),
    "ca-phe": ("ẢNH XÂY KÊNH/09_ao_tre_vai_kem_ca_phe.png", "vui vẻ"),
    "trung-bay": ("ẢNH XÂY KÊNH/10_corset_den_phong_trung_bay.png", "sang trọng"),
    "vuon-hoa": ("ẢNH XÂY KÊNH/11_vay_trang_denim_vuon_hoa.png", "tươi tắn"),
    "san-thuong": ("ẢNH XÂY KÊNH/12_so_mi_xanh_chan_vay_den_san_thuong.png", "tự tin"),
    "sanh-tiec": ("ẢNH XÂY KÊNH/13_ao_xanh_chan_vay_den_sanh_tiec.png", "duyên dáng"),
    "pho-nhac": ("ẢNH XÂY KÊNH/14_ao_do_ruou_quan_rach_pho_nhac.png", "phấn khích"),
    "quang-truong": ("ẢNH XÂY KÊNH/15_denim_xam_quang_truong.png", "điềm tĩnh"),
    "ga-mua-thu": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_01 8 thg 10, 2026.png", "vui tươi"),
    "tai-nghe": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_06 8 thg 10, 2026.png", "năng động"),
    "cherry": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_10 8 thg 10, 2026.png", "đáng yêu"),
    "phong-hong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_15 8 thg 10, 2026.png", "ngọt ngào"),
    "hoang-hon": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_20 8 thg 10, 2026.png", "cool"),
    "long-vu": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_24 8 thg 10, 2026.png", "tinh nghịch"),
    "thu-vien": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_28 8 thg 10, 2026.png", "nghiêm túc"),
    "bao-tang": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_32 8 thg 10, 2026.png", "thanh lịch"),
    "trang-den": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_37 8 thg 10, 2026.png", "quyết đoán"),
    "hoa-hong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_43 8 thg 10, 2026.png", "nữ tính"),
    "nhung-xanh": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_47 8 thg 10, 2026.png", "quý phái"),
    "neon-hong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_35_52 8 thg 10, 2026.png", "sôi nổi"),
    "dam-do": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_36_01 8 thg 10, 2026.png", "rạng ngời"),
    "bien-hoa": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 01_36_08 8 thg 10, 2026.png", "tươi vui"),
    "xe-hong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_05_32 9 thg 10, 2026.png", "hồn nhiên"),
    "quat-vang": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_05_46 9 thg 10, 2026.png", "duyên dáng"),
    "vest-hong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_05_51 9 thg 10, 2026.png", "tự tin"),
    "co-phuc": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_05_55 9 thg 10, 2026.png", "an nhiên"),
    "quat-do": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_00 9 thg 10, 2026.png", "dịu dàng"),
    "tiem-banh": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_06 9 thg 10, 2026.png", "ngọt ngào"),
    "lau-dai": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_09 9 thg 10, 2026.png", "lộng lẫy"),
    "san-khau": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_13 9 thg 10, 2026.png", "tỏa sáng"),
    "dau-tay": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_17 9 thg 10, 2026.png", "tươi tắn"),
    "vuon-co": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_22 9 thg 10, 2026.png", "thanh thoát"),
    "suon-xam": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_06_58 9 thg 10, 2026.png", "bí ẩn"),
    "canh-dong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_03 9 thg 10, 2026.png", "vui tươi"),
    "cau-vong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_07 9 thg 10, 2026.png", "bùng nổ"),
    "ren-trang": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_11 9 thg 10, 2026.png", "nhẹ nhàng"),
    "tham-do": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_15 9 thg 10, 2026.png", "đẳng cấp"),
    "caro-hong": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_19 9 thg 10, 2026.png", "xinh xắn"),
    "vest-trang": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_23 9 thg 10, 2026.png", "chuyên nghiệp"),
    "trang-den-2": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_27 9 thg 10, 2026.png", "sắc sảo"),
    "ao-dai-do": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_34 9 thg 10, 2026.png", "truyền thống"),
    "dam-bac": ("ẢNH XÂY KÊNH/Ảnh ChatGPT 18_07_37 9 thg 10, 2026.png", "sang trọng"),
}

# Gương mặt cho thumbnail: chỉ ảnh áo khoác trắng logo Bảo Châu AI, nhiều biểu cảm khác nhau.
KOL_POOL = [f"kol-{i:02d}" for i in range(1, 16)] + ["ban-diu", "ban-cuoi", "ban-noi", "gioi-thieu", "ngac-nhien", "y-tuong"]

NICHE_ICON = {
    "dieu-phoi": "🧭", "video-da-nen-tang": "▶️", "xay-kenh": "🚀", "spa": "🌸", "video": "🎬",
    "hinh-anh": "🎨", "noi-dung": "📣", "ban-hang": "🛒", "giao-duc": "📚", "ke-toan": "📊",
    "van-phong": "🗂️", "bds": "🏠", "kien-truc": "📐", "website": "🤖", "y-te": "🦷",
    "phong-thuy": "☯️", "du-lich": "✈️",
}

# Ảnh dùng cho hero / các khối của trang (chỉ ảnh, không chữ)
SITE_PHOTOS = {
    "hero": ("gioi-thieu", 900),
    "hero-2": ("avatar", 420),
    "hero-3": ("y-tuong", 420),
    "combo": ("chi-tay", 640),
    "san": ("tham-do", 760),
    "cta": ("ban-cuoi", 640),
    "faq": ("ngac-nhien", 640),
}

_cascade = None


def _face_detector():
    global _cascade
    if _cascade is not None:
        return _cascade or None
    try:
        import cv2

        src = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        dst = os.path.join(tempfile.gettempdir(), "bcai_face.xml")
        shutil.copyfile(src, dst)
        c = cv2.CascadeClassifier(dst)
        _cascade = c if not c.empty() else False
    except Exception:
        _cascade = False
    return _cascade or None


def _face_box(img):
    det = _face_detector()
    if det is None:
        return None
    import cv2
    import numpy as np

    small = img.copy()
    scale = 900 / max(img.size)
    small = small.resize((int(img.width * scale), int(img.height * scale)))
    g = cv2.cvtColor(np.array(small.convert("RGB")), cv2.COLOR_RGB2GRAY)
    faces = det.detectMultiScale(g, 1.05, 6, minSize=(24, 24))
    # chỉ nhận khuôn mặt ở phần trên ảnh (tránh nhận nhầm chân/váy ở ảnh toàn thân)
    faces = [f for f in faces if f[1] + f[3] / 2 < small.height * 0.42]
    if len(faces) == 0:
        return None
    faces = sorted(faces, key=lambda f: -f[2] * f[3])
    x, y, w, h = faces[0]
    return x / scale, y / scale, w / scale, h / scale


_cache = {}


def load_photo(key):
    if key in _cache:
        return _cache[key]
    rel = PHOTOS[key][0]
    im = ImageOps.exif_transpose(Image.open(os.path.join(PHOTO_DIR, rel))).convert("RGB")
    if key.startswith("kol-"):  # thumbnail cũ: bỏ hẳn nửa trái có chữ/icon cũ, chỉ giữ người + phòng
        im = im.crop((int(im.width * 0.56), 0, im.width, im.height))
    _cache[key] = (im, _face_box(im))
    return _cache[key]


def crop_portrait(key, out_w, out_h, face_frac=0.27, face_top=0.17):
    """Cắt khung dọc out_w×out_h, mặt rộng ~face_frac khung, đỉnh mặt ở face_top."""
    im, face = load_photo(key)
    ratio = out_w / out_h
    if face:
        fx, fy, fw, fh = face
        bw = min(fw / face_frac, im.width, im.height * ratio)
        bh = bw / ratio
        left = fx + fw / 2 - bw / 2
        top = fy - face_top * bh
    else:
        bw = min(im.width, im.height * ratio)
        bh = bw / ratio
        left, top = (im.width - bw) / 2, 0
    left = max(0, min(left, im.width - bw))
    top = max(0, min(top, im.height - bh))
    return im.crop((int(left), int(top), int(left + bw), int(top + bh))).resize((out_w, out_h), Image.LANCZOS)


def _font(path, size):
    return ImageFont.truetype(path, size)


def _wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= max_w:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def _person_panel(key, pw, ph):
    return crop_portrait(key, pw, ph, face_frac=0.30, face_top=0.10)


def draw_thumb(key, title, label, icon, out_path):
    pw = 640
    person = _person_panel(key, pw, H)
    # nền: góc phòng phía sau (mép phải ảnh) phóng to, làm mờ và sáng — tông phòng làm việc sáng như bộ cũ
    strip = person.crop((int(pw * 0.72), 0, pw, H))
    bg = strip.resize((W, H)).filter(ImageFilter.GaussianBlur(40))
    bg = Image.blend(bg, Image.new("RGB", (W, H), (250, 247, 242)), 0.5).convert("RGBA")
    mask = Image.new("L", (pw, H), 255)
    md = ImageDraw.Draw(mask)
    for x in range(200):
        md.line([(x, 0), (x, H)], fill=int(255 * (x / 200) ** 1.4))
    bg.paste(person, (W - pw, 0), mask)
    _ve_chu(bg, title, label, icon).convert("RGB").save(out_path, "WEBP", quality=76, method=6)


def _ve_chu(bg, title, label, icon):
    """In nhãn, tên ngắn và thẻ ngách lên nửa trái (dùng cho ảnh tạm và ảnh Codex vẽ không chữ)."""
    d = ImageDraw.Draw(bg)

    # nhãn trên cùng
    pf = _font(FONT_BLACK, 30)
    pill = "TRỢ LÝ BẢO CHÂU AI"
    pwid = d.textlength(pill, font=pf)
    d.rounded_rectangle([56, 58, 56 + pwid + 92, 116], radius=29, fill=(255, 255, 255), outline=(206, 222, 250), width=3)
    d.ellipse([70, 69, 106, 105], fill=BLUE_2)
    d.ellipse([82, 77, 94, 89], fill=(255, 255, 255))
    d.pieslice([77, 88, 99, 110], 180, 360, fill=(255, 255, 255))
    d.text((118, 87), pill, font=pf, fill=BLUE, anchor="lm")

    # tên skill: chữ hoa đậm, viền trắng, tự thu nhỏ để vừa tối đa 4 dòng
    text = title.upper()
    max_w = 560
    size = 92
    while size > 44:
        tf = _font(FONT_BLACK, size)
        lines = _wrap(d, text, tf, max_w)
        if len(lines) <= (3 if size > 70 else 4) and all(d.textlength(l, font=tf) <= max_w for l in lines):
            break
        size -= 4
    lines = lines[:4]
    lh = int(size * 1.08)
    y = 150
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    for i, ln in enumerate(lines):
        sd.text((60, y + i * lh + 6), ln, font=tf, fill=(16, 60, 160, 110))
    bg = Image.alpha_composite(bg, shadow.filter(ImageFilter.GaussianBlur(8)))
    d = ImageDraw.Draw(bg)
    for i, ln in enumerate(lines):
        d.text((56, y + i * lh), ln, font=tf, fill=BLUE if i % 2 == 0 else BLUE_2, stroke_width=6, stroke_fill=(255, 255, 255))
    yb = y + len(lines) * lh + 28

    # thẻ biểu tượng + nhãn ngách
    d.rounded_rectangle([56, yb, 176, yb + 120], radius=26, fill=(255, 255, 255), outline=(206, 222, 250), width=3)
    try:
        d.text((116, yb + 62), icon, font=_font(FONT_EMOJI, 64), embedded_color=True, anchor="mm")
    except Exception:
        pass
    lf = _font(FONT_BLACK, 26)
    lw = d.textlength(label.upper(), font=lf)
    d.rounded_rectangle([196, yb + 38, 196 + lw + 40, yb + 84], radius=23, fill=BLUE_2)
    d.text((216, yb + 61), label.upper(), font=lf, fill=(255, 255, 255), anchor="lm")

    return bg


def make_all(root, skills, rebuild=False, force=()):
    import json

    niches = {n["id"]: n["ten"] for n in json.load(open(os.path.join(root, "src", "data", "skills.json"), encoding="utf-8"))["niches"]}
    out_dir = os.path.join(root, "public", "thumbs")
    os.makedirs(out_dir, exist_ok=True)
    made, n = 0, len(KOL_POOL)
    for i, s in enumerate(skills):
        key = KOL_POOL[(i * 8) % n]  # bước 8, n=21 nguyên tố cùng nhau → thẻ liền nhau luôn khác biểu cảm
        path = os.path.join(out_dir, s["slug"] + ".webp")
        if os.path.exists(path) and not rebuild and s["slug"] not in force:
            continue
        label = niches[s["niche"]].split("·")[-1].strip()
        draw_thumb(key, s.get("tenNgan") or s["ten"], label, NICHE_ICON.get(s["niche"], "✨"), path)
        made += 1
    # ảnh trang
    site_dir = os.path.join(root, "public", "linh-na")
    os.makedirs(site_dir, exist_ok=True)
    for name, (key, w) in SITE_PHOTOS.items():
        p = os.path.join(site_dir, name + ".webp")
        if os.path.exists(p) and not rebuild:
            continue
        crop_portrait(key, w, int(w * 1.25), face_frac=0.22, face_top=0.14).save(p, "WEBP", quality=82, method=6)
    return made


def nhap_tu_codex(root, items, src_dir):
    """Ảnh Codex vẽ (<tên ngắn không dấu>.png|jpg|webp) → public/thumbs/<slug>.webp (1200×900, ≤200KB).
    Ảnh tạm do script vẽ sẽ được thay khi Codex có ảnh mới hơn."""
    if not os.path.isdir(src_dir):
        return 0
    import json

    niches = {x["id"]: x["ten"] for x in json.load(open(os.path.join(root, "src", "data", "skills.json"), encoding="utf-8"))["niches"]}
    out_dir = os.path.join(root, "public", "thumbs")
    os.makedirs(out_dir, exist_ok=True)
    n = 0
    for s in items:
        names = [s["thumbFile"] + ext for ext in (".png", ".jpg", ".jpeg", ".webp")] + [s["thumbFile"] + "__khong-chu.png"]
        src = next((os.path.join(src_dir, f) for f in names if os.path.exists(os.path.join(src_dir, f))), None)
        if not src:
            continue
        dst = os.path.join(out_dir, s["slug"] + ".webp")
        if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
            continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        r = W / H  # khổ 4:3, cắt giữa nếu lệch tỉ lệ
        if im.width / im.height > r:
            nw = int(im.height * r)
            im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
        else:
            nh = int(im.width / r)
            im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
        im = im.resize((W, H), Image.LANCZOS)
        if src.endswith("__khong-chu.png"):  # Codex không viết đúng chữ → tự in tên ngắn
            im = _ve_chu(im.convert("RGBA"), s["tenNgan"], niches[s["niche"]].split("·")[-1].strip(), NICHE_ICON.get(s["niche"], "✨")).convert("RGB")
        for qv in (80, 72, 64, 56):
            im.save(dst, "WEBP", quality=qv, method=6)
            if os.path.getsize(dst) <= 200 * 1024:
                break
        n += 1
    return n
