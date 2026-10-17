# -*- coding: utf-8 -*-
"""Vẽ thumbnail skill từ ảnh THẬT có sẵn của Linh Na Model (không tạo ảnh AI mới).

Mỗi ngách có một bộ ảnh hợp sắc thái; skill trong ngách lấy lần lượt từng ảnh
để hai thẻ liền nhau không trùng ảnh. Crop theo khuôn mặt (OpenCV nếu có).
"""
import os
import shutil
import tempfile

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

PHOTO_DIR = os.environ.get("LINH_NA_PHOTOS", r"G:\My Drive\HÌNH ẢNH\CHÂU LINH NA")
W, H = 600, 750
NAVY = (11, 26, 46)
CYAN = (19, 181, 216)
GLOW = (127, 224, 239)
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_SEMI = r"C:\Windows\Fonts\seguisb.ttf"

# key: (đường dẫn trong kho ảnh, sắc thái)
# Không đưa vào POOLS: ga-tau, quat-vang, neon-hong (ảnh toàn thân, mặt quá nhỏ/khó cắt)
PHOTOS = {
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

POOLS = {
    "dieu-phoi": ["ai-vong", "ban-noi", "ban-diu", "ai-xanh", "phong-lab", "y-tuong", "kinh-den"],
    "video-da-nen-tang": ["gioi-thieu", "ngac-nhien", "san-khau", "cong-ai", "chi-tay", "cau-vong", "bien-chieu"],
    "xay-kenh": ["y-tuong", "chi-tay", "ban-cuoi", "vest-hong", "vest-trang", "san-thuong"],
    "spa": ["avatar", "cherry", "long-vu", "hoa-hong", "bien-hoa", "tiem-banh", "dau-tay", "caro-hong", "vuon-hoa", "can-mat", "phong-hong", "cau-vong", "xe-hong", "lau-dai"],
    "video": ["san-khau", "cau-vong", "ngac-nhien", "gioi-thieu", "san-thuong", "bien-chieu", "pho-dem", "hoang-hon", "pho-nhac", "ai-xanh"],
    "hinh-anh": ["trung-bay", "bao-tang", "trang-den", "trang-den-2", "xe-hong", "tiem-sach", "sanh-tiec", "dam-bac"],
    "noi-dung": ["gioi-thieu", "y-tuong", "ngac-nhien", "chi-tay", "ban-noi", "rem-vang", "ca-phe", "tai-nghe"],
    "ban-hang": ["vest-hong", "sanh-tiec", "vest-trang", "chi-tay", "hoang-hon", "nhung-xanh", "dam-do"],
    "giao-duc": ["tiem-sach", "kinh-den", "thu-vien", "ban-cuoi", "ban-diu", "mua-thu", "ga-mua-thu"],
    "ke-toan": ["ban-diu", "ban-cuoi", "ban-noi", "vest-trang", "thu-vien", "trang-den", "kinh-den"],
    "van-phong": ["ban-noi", "vest-trang", "sanh-tiec", "trang-den", "kinh-den", "ban-diu", "bao-tang"],
    "bds": ["san-thuong", "nhung-xanh", "tham-do", "bien-chieu", "lau-dai", "dam-do", "dam-bac"],
    "kien-truc": ["bep", "trung-bay", "nhung-xanh", "trang-den-2", "bao-tang"],
    "website": ["cong-ai", "ai-xanh", "phong-lab", "ai-vong"],
    "y-te": ["avatar", "can-mat", "dau-tay", "cherry", "bien-hoa", "ban-cuoi"],
    "phong-thuy": ["co-phuc", "quat-do", "vuon-co", "suon-xam", "ren-trang", "ao-dai-do"],
    "du-lich": ["ngoai-troi", "bien-chieu", "mua-thu", "ga-mua-thu", "tai-nghe", "bien-hoa", "xe-hong", "san-dat"],
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


def draw_thumb(key, title, label, out_path):
    base = crop_portrait(key, W, H).convert("RGBA")
    # lớp phủ chuyển màu xanh đậm phía dưới
    grad = Image.new("L", (1, H))
    for y in range(H):
        t = max(0.0, (y - H * 0.42) / (H * 0.58))
        grad.putpixel((0, y), int(min(1, t ** 1.1) * 238))
    overlay = Image.new("RGBA", (W, H), NAVY + (0,))
    overlay.putalpha(grad.resize((W, H)))
    base = Image.alpha_composite(base, overlay)
    d = ImageDraw.Draw(base)

    # nhãn ngách
    lf = _font(FONT_SEMI, 21)
    lw = d.textlength(label.upper(), font=lf)
    d.rounded_rectangle([22, 22, 22 + lw + 30, 60], radius=19, fill=(255, 255, 255, 235))
    d.text((37, 41), label.upper(), font=lf, fill=CYAN, anchor="lm")

    # tên skill — tự thu nhỏ để vừa tối đa 3 dòng
    size = 52
    while size > 30:
        tf = _font(FONT_BOLD, size)
        lines = _wrap(d, title, tf, W - 64)
        if len(lines) <= 3:
            break
        size -= 3
    lines = lines[:3]
    lh = int(size * 1.16)
    y = H - 46 - lh * len(lines)
    # vạch sáng + thương hiệu
    bf = _font(FONT_SEMI, 19)
    d.rounded_rectangle([32, y - 40, 76, y - 34], radius=3, fill=CYAN)
    d.text((88, y - 37), "BẢO CHÂU AI · SKILL", font=bf, fill=GLOW, anchor="lm")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for i, ln in enumerate(lines):
        gd.text((32, y + i * lh), ln, font=tf, fill=CYAN + (150,))
    base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(9)))
    d = ImageDraw.Draw(base)
    for i, ln in enumerate(lines):
        d.text((32, y + i * lh), ln, font=tf, fill=(255, 255, 255))

    base.convert("RGB").save(out_path, "WEBP", quality=80, method=6)


def make_all(root, skills, rebuild=False, force=()):
    import json

    niches = {n["id"]: n["ten"] for n in json.load(open(os.path.join(root, "src", "data", "skills.json"), encoding="utf-8"))["niches"]}
    out_dir = os.path.join(root, "public", "thumbs")
    os.makedirs(out_dir, exist_ok=True)
    counters, made = {}, 0
    for s in skills:
        pool = POOLS.get(s["niche"]) or POOLS["noi-dung"]
        i = counters.get(s["niche"], 0)
        counters[s["niche"]] = i + 1
        key = pool[i % len(pool)]
        path = os.path.join(out_dir, s["slug"] + ".webp")
        if os.path.exists(path) and not rebuild and s["slug"] not in force:
            continue
        label = niches[s["niche"]].split("·")[-1].strip()
        draw_thumb(key, s["ten"], label, path)
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
