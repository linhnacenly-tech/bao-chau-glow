# -*- coding: utf-8 -*-
"""Đồng bộ kho skill tổng của Bảo Châu AI lên trang Bảo Châu Glow.

Chạy:  PYTHONUTF8=1 python scripts/sync-skills.py [--rebuild-thumbs]

- Nguồn duy nhất: data/kho-skill/kho-tong.json (agent Linh Kho gộp).
- Đọc SKILL.md trong gói zip (ưu tiên kho chuẩn hoá mới nhất) để lấy mô tả + 3 lợi ích.
- Ghi src/data/skills.json (khoá theo slug, chạy lại không trùng).
- Thumbnail: ảnh thật Linh Na Model + tên skill → public/thumbs/<slug>.webp
  (chỉ tạo ảnh còn thiếu; --rebuild-thumbs để vẽ lại tất cả).
"""
import glob
import io
import json
import os
import re
import sys
import zipfile
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MORNING = os.environ.get(
    "BCAI_MORNING",
    r"C:\Users\Châu\Documents\Codex\2026-09-28\referenced-chatgpt-conversation-this-is-an\work\morning-site-checkout",
)
KHO_TONG = os.path.join(MORNING, "data", "kho-skill", "kho-tong.json")
THUONG_MAI = r"G:\My Drive\02_SKILL & TRỢ LÝ AI\SKILL THƯƠNG MẠI"
OUT_JSON = os.path.join(ROOT, "src", "data", "skills.json")
CONG_XUONG = "https://bcai-workshop-cong-xuong-agent.lovable.app/san-pham/"
CX_PRODUCTS_TS = os.environ.get("BCAI_CX_PRODUCTS", r"C:\Users\Châu\Documents\GitHub\b-o-ch-u-ai-sales-page\src\lib\products.ts")
VIET_HOA = os.path.join(ROOT, "scripts", "viet-hoa.json")
TEN_NGAN = os.path.join(ROOT, "scripts", "ten-ngan.json")
# Danh mục trên Drive để Châu + các agent tra tên ngắn → gói giao khách
DANH_MUC_DRIVE = os.path.join(THUONG_MAI, "GLOW - DANH MỤC SKILL")
# Thumbnail do Codex vẽ (kiểu 15 thumbnail Trợ lý AGEN), tên file = tên ngắn không dấu
THUMB_CODEX = r"G:\My Drive\HÌNH ẢNH\CHÂU LINH NA\THUMNAIL\GLOW"
CODEX_QUEUE = os.path.join(MORNING, "data", "projects", "glow-thumbnail", "danh-sach.json")
# Thư mục giao hàng: mỗi skill kho một tệp, tên = tên ngắn không dấu. Máy chủ Công xưởng (tài khoản dịch vụ
# Google) tìm tệp theo tên trong thư mục này rồi chia sẻ cho Gmail khách sau khi SePay báo đã nhận tiền.
GIAO_HANG = os.path.join(THUONG_MAI, "GLOW - GIAO HÀNG")
CX_REPO = os.path.dirname(os.path.dirname(os.path.dirname(CX_PRODUCTS_TS)))
CX_CATALOG = os.path.join(CX_REPO, "src", "lib", "glow-catalog.json")
GIA_LE = 59000

# Skill riêng / không bán (thêm slug vào đây nếu Châu dặn bỏ)
KHONG_BAN = {"pheu-zalo-zoom", "bo-nhan-dien-video", "kho-skill-bcai", "edit-neon-3-tang"}
KHONG_BAN_TU_KHOA = re.compile(r"neon\s*3\s*tầng|phễu zalo\s*&?\s*zoom|pheu-zalo-zoom", re.I)

# ---------------------------------------------------------------- ngách
# Ba sảnh cũ của trang giữ nguyên cho 21 skill Công xưởng AGENT, sau đó là các ngách nghề.
NICHES = [
    ("dieu-phoi", "Sảnh I · Điều phối & Nghiên cứu", "CÔNG XƯỞNG AGENT", "Biến ý tưởng rời rạc thành một hệ thống nội dung có chiến lược."),
    ("video-da-nen-tang", "Sảnh II · Video đa nền tảng", "CÔNG XƯỞNG AGENT", "Lên ý tưởng, sản xuất và tối ưu video trong cùng một quy trình."),
    ("xay-kenh", "Sảnh III · Xây kênh & Chuyển đổi", "CÔNG XƯỞNG AGENT", "Các trợ lý chuyên biệt để mở rộng độ phủ và tạo hành động."),
    ("spa", "Spa & Làm đẹp", "CHỦ SPA · THẨM MỸ", "Giữ khách, tăng lịch hẹn và vận hành spa gọn gàng hơn."),
    ("video", "Video & Phim AI", "NỘI DUNG & VIDEO", "Từ ý tưởng tới kịch bản, phân cảnh và prompt cho phim ngắn AI."),
    ("hinh-anh", "Hình ảnh & Thiết kế", "NỘI DUNG & VIDEO", "Ảnh thương hiệu, poster, bìa sách và ấn phẩm làm nhanh với AI."),
    ("noi-dung", "Nội dung & Marketing", "XÂY KÊNH", "Lên bài, viết quảng cáo và giữ nhịp đăng đều trên mọi kênh."),
    ("ban-hang", "Bán hàng & Chuyển đổi", "KINH DOANH", "Tư vấn, chốt đơn và chăm khách bằng quy trình rõ ràng."),
    ("giao-duc", "Giáo viên & Đào tạo", "GIÁO DỤC", "Soạn bài, ra đề, chấm chữa và quản lý lớp nhẹ nhàng hơn."),
    ("ke-toan", "Kế toán & Tài chính", "DOANH NGHIỆP", "Sổ sách, báo cáo, thuế và dòng tiền rõ ràng, có kiểm tra."),
    ("van-phong", "Văn phòng & Nhân sự", "CÁN BỘ · VĂN PHÒNG", "Văn bản, nhân sự và vận hành nội bộ gọn gàng, đúng quy trình."),
    ("bds", "Bất động sản", "MÔI GIỚI · BĐS", "Tìm khách, làm nội dung và chốt giao dịch bất động sản."),
    ("kien-truc", "Kiến trúc & Nội thất", "THIẾT KẾ · XÂY DỰNG", "Ý tưởng, phối cảnh và nội dung cho kiến trúc – nội thất."),
    ("website", "Website & Tự động hóa", "CÔNG NGHỆ", "Làm web, dữ liệu và tự động hóa không cần biết code."),
    ("y-te", "Nha khoa & Y tế", "PHÒNG KHÁM", "Xây uy tín phòng khám và chăm sóc khách an toàn."),
    ("phong-thuy", "Phong thủy & Đời sống", "ĐỜI SỐNG", "Tử vi, phong thủy và nội dung đời sống có chiều sâu."),
    ("du-lich", "Du lịch & Dịch vụ", "DU LỊCH · NHÀ HÀNG", "Nội dung và chăm khách cho du lịch, khách sạn, nhà hàng."),
]
NICHE_IDS = [n[0] for n in NICHES]

CX_SANH = {
    "dieu-phoi": ["tong-dieu-hanh", "nghien-cuu-noi-dung", "radar-cong-dong", "binh-luan-fanpage", "binh-luan-tu-nhien", "tin-nhan-khach-hang", "do-luong-chuyen-doi", "lich-van-hanh"],
    "video-da-nen-tang": ["mo-ta-youtube", "mo-ta-youtube-hang-loat", "seo-youtube", "seo-youtube-studio", "dang-video-da-nen-tang", "chat-live-tiktok", "edit-video-tu-dong", "van-hanh-tiktok", "kich-ban-tiktok", "video-kien-thuc"],
    "xay-kenh": ["tao-skill", "landing-page", "chuyen-doi-traffic", "caption-cham-noi-dau", "thiet-ke-uu-dai", "an-pham-thuong-hieu", "pheu-bai-tai-nguyen", "kho-anh-xay-kenh"],
}
CX_TO_SANH = {slug: sanh for sanh, slugs in CX_SANH.items() for slug in slugs}

NGACH_MAP = {
    "Spa & Làm đẹp": "spa", "Làm đẹp & Mỹ phẩm": "spa",
    "Video & Phim AI": "video", "Video AI & Sáng tạo": "video",
    "Hình ảnh & Thiết kế": "hinh-anh",
    "Nội dung & Marketing": "noi-dung", "Marketing & Nội dung": "noi-dung",
    "Bán hàng & Chuyển đổi": "ban-hang", "Kinh doanh & Bán hàng": "ban-hang",
    "Giáo dục & Đào tạo": "giao-duc", "Giáo dục & Học liệu": "giao-duc",
    "Tài chính & Kế toán": "ke-toan", "Kế toán & Doanh nghiệp": "ke-toan",
    "Nhân sự & Vận hành": "van-phong",
    "Bất động sản": "bds",
    "Kiến trúc & Nội thất": "kien-truc", "Kiến trúc & Xây dựng": "kien-truc",
    "Website & Công nghệ": "website", "Dữ liệu & Tự động hóa": "website", "Xây dựng website WEB-IN-WEB": "website",
    "Nha khoa & Y tế": "y-te",
    "Phong thủy": "phong-thuy", "Phong thủy & Đời sống": "phong-thuy",
    "Du lịch & Dịch vụ": "du-lich",
}
NHOM_MAP = {
    "Làm đẹp & Mỹ phẩm": "spa", "Video AI & Sáng tạo": "video", "Giáo dục & Đào tạo": "giao-duc",
    "Marketing & Nội dung": "noi-dung", "Kế toán & Doanh nghiệp": "ke-toan", "Kinh doanh & Bán hàng": "ban-hang",
    "Bất động sản": "bds", "Website & Tự động hóa": "website", "Nhân sự & Vận hành": "van-phong",
    "Nha khoa & Y tế": "y-te", "Phong thủy": "phong-thuy", "Kiến trúc & Xây dựng": "kien-truc",
    "Du lịch & Nhà hàng": "du-lich", "Đầu tư & Tài chính": "ke-toan",
}


def niche_of(sk):
    cx = sk.get("dangBanCongXuong")
    if cx and cx in CX_TO_SANH:
        return CX_TO_SANH[cx]
    ngach, nhom = sk.get("ngach") or "", sk.get("nhom") or ""
    if ngach == "Sức khỏe & Làm đẹp":
        return "y-te" if nhom == "Nha khoa & Y tế" else "spa"
    if ngach in NGACH_MAP:
        return NGACH_MAP[ngach]
    if nhom in NHOM_MAP:  # "Combo theo ngành", "Công xưởng AGENT" chưa bán…
        return NHOM_MAP[nhom]
    return "noi-dung"


# ---------------------------------------------------------------- đọc SKILL.md
def kho_dirs():
    dirs = sorted(glob.glob(os.path.join(THUONG_MAI, "KHO SKILL BCAI - CHUẨN HÓA *")), reverse=True)
    return [d for d in dirs if os.path.isdir(d)]


KHO_DIRS = kho_dirs()


def read_skill_md(sk):
    """Trả về nội dung SKILL.md của skill (str) hoặc ''."""
    z = sk.get("goiZip") or ""
    base = os.path.basename(z)
    cands = [os.path.join(d, base) for d in KHO_DIRS] + [z]
    for path in cands:
        if not path or not os.path.exists(path):
            continue
        if path.lower().endswith(".zip"):
            try:
                zf = zipfile.ZipFile(path)
            except zipfile.BadZipFile:
                continue
            names = [n for n in zf.namelist() if n.endswith("SKILL.md")]
            # gói bộ (vd 100 skill spa): tìm thư mục con đúng slug
            hit = [n for n in names if f"/{sk['slug']}/" in "/" + n]
            if not hit:
                hit = sorted(names, key=lambda n: n.count("/"))[:1] if len(names) <= 3 else []
            if hit:
                return zf.read(hit[0]).decode("utf-8", "ignore")
        elif path.lower().endswith(".rar"):
            folder = path[:-4]
            md = glob.glob(os.path.join(folder, "**", "SKILL.md"), recursive=True)
            if md:
                return ""  # bộ combo: mô tả lấy từ kho tổng
    return ""


def count_in_bundle(sk):
    z = sk.get("goiZip") or ""
    if z.lower().endswith(".rar") and os.path.isdir(z[:-4]):
        return len(glob.glob(os.path.join(z[:-4], "**", "SKILL.md"), recursive=True))
    return 0


def clean(t):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", t)
    t = re.sub(r"[*_`>#]+", "", t)
    t = re.sub(r"\s+", " ", t).strip(" -–:;.")
    return t


def frontmatter_desc(md):
    m = re.search(r"^description:\s*(.+)$", md, re.M)
    if not m:
        return ""
    d = m.group(1).strip().strip('"').strip("'")
    d = re.sub(r"^(BCAI|Bảo Châu AI)\s*[·:\-–]\s*", "", d)
    d = re.sub(r"^Trợ lý [^(]{2,60}\([^)]*\)\s*:\s*", "", d)  # "Trợ lý X (Công xưởng AGENT · Bảo Châu AI): …"
    d = re.split(r"\s*(?:Dùng khi|Use when|Kích hoạt khi|Sử dụng khi)\b", d)[0].strip()
    return d


BENEFIT_HEADS = [
    r"đầu ra", r"kết quả", r"nhiệm vụ lõi", r"bàn giao", r"mục tiêu", r"làm được", r"nhận được",
    r"tình huống sử dụng", r"quy trình", r"workflow",
]
SKIP_HEADS = re.compile(r"lời chào|hồ sơ|đầu vào|rào chắn|kiểm tra|ví dụ|chuẩn bị|môi trường|nguyên tắc|điều cấm|cấm|giọng|tài liệu|references|cài đặt|lưu ý", re.I)
SKIP_LINE = re.compile(r"https?://|zalo|\{|\}|<|>|\.md|\.py|\.json|references/|scripts/|mkdir|bash |python|hồ sơ|bảo châu|người dùng|\?$|^đọc |^hỏi ", re.I)


def sections(md):
    md = re.sub(r"^---.*?^---\s*$", "", md, count=1, flags=re.M | re.S)
    out = []
    parts = re.split(r"^#{1,4}\s+(.+)$", md, flags=re.M)
    for i in range(1, len(parts) - 1, 2):
        out.append((parts[i].strip().lower(), parts[i + 1]))
    return out


def bullets_from(body):
    res = []
    for line in body.splitlines():
        m = re.match(r"^\s{0,3}(?:[-*•]|\d+[.)])\s+(.+)$", line)
        if not m:
            continue
        raw = m.group(1)
        bold = re.match(r"^\*\*([^*]{4,60})\*\*\s*[:：]?\s*(.*)$", raw)
        t = clean(raw)
        t = re.sub(r"^(Tình huống|Quyết định cần hỗ trợ)\s*:\s*", "", t)
        if bold and len(t) > 120:  # "**Video 9:16 đã edit**: cắt khoảng lặng…" → giữ ý chính
            t = clean(bold.group(1)) + ": " + clean(bold.group(2))
        if len(t) < 6 or SKIP_LINE.search(t) or not VIET.search(t) or (len(t) > 25 and not is_viet(t)):
            continue
        if len(t) > 120:
            t = t[:117].rsplit(" ", 1)[0] + "…"
        res.append(t[0].upper() + t[1:])
    return res


def benefits(md, desc):
    secs = [(h, b) for h, b in sections(md) if not SKIP_HEADS.search(h)]
    got = []
    ordered = []
    for pat in BENEFIT_HEADS:
        ordered += [s for s in secs if re.search(pat, s[0]) and s not in ordered]
    ordered += [s for s in secs if s not in ordered]
    for _, body in ordered:
        for b in bullets_from(body):
            if b not in got:
                got.append(b)
        if len(got) >= 3:
            return got[:3]
    # không lấy câu mô tả làm lợi ích (tránh lặp, không bịa)
    return got[:3]


ACRONYM = {"ai", "seo", "tvc", "kol", "cskh", "bđs", "thcs", "thpt", "crm", "kpi", "sop", "hr", "ugc", "pr", "bcai", "cv", "pdf", "excel", "zalo", "tiktok", "youtube", "facebook", "google", "veo", "spa", "okr", "vat", "tncn", "tndn", "b2b", "sme", "3d", "2d", "mc", "ui"}
PROPER = {"zalo": "Zalo", "tiktok": "TikTok", "youtube": "YouTube", "facebook": "Facebook", "google": "Google", "veo": "Veo", "excel": "Excel", "spa": "spa"}


def nice_name(name):
    name = re.sub(r"^(SKILL|BỘ SKILL)\s+", "", name.strip())
    name = re.sub(r"^PHƯƠNG\s*-\s*SKILL\s+", "", name)
    letters = [c for c in name if c.isalpha()]
    words_ = name.split()
    title_case = len(words_) >= 3 and sum(w[:1].isupper() for w in words_) / len(words_) > 0.8
    if letters and (sum(c.isupper() for c in letters) / len(letters) > 0.7 or title_case):
        words = []
        for i, w in enumerate(name.lower().split()):
            core = re.sub(r"\W", "", w)
            if core in PROPER:
                w = w.replace(core, PROPER[core])
            elif core in ACRONYM:
                w = w.upper()
            elif i == 0:
                w = w[0].upper() + w[1:]
            words.append(w)
        name = " ".join(words)
    name = name.replace("Bảo Châu AI", "").strip(" -–·")
    return name[0].upper() + name[1:] if name else name


VIET = re.compile(r"[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]", re.I)


def is_viet(t):
    return bool(t) and len(VIET.findall(t)) >= max(2, len(t) // 40)


def short_desc(desc, fallback):
    d = desc if is_viet(desc) else (fallback or desc or "")
    d = d.strip().strip('"').strip("'").strip()
    d = re.sub(r"^(BCAI|Bảo Châu AI)\s*[·:\-–]\s*", "", d)
    d = re.sub(r"…$", "", d).strip()
    d = d[0].upper() + d[1:] if d else d
    if len(d) > 190:
        cut = d[:190]
        p = max(cut.rfind(". "), cut.rfind("; "))
        d = cut[: p + 1] if p > 80 else cut.rsplit(" ", 1)[0] + "…"
    return d


def khong_dau(text):
    import unicodedata
    t = unicodedata.normalize("NFD", text.replace("Đ", "D").replace("đ", "d"))
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


BIEU_CAM = [
    "mỉm cười dịu dàng, tay chống cằm",
    "cười tươi rạng rỡ, nhìn thẳng ống kính",
    "ngạc nhiên thích thú, một tay chạm má",
    "hào hứng giới thiệu, bàn tay mở về phía chữ",
    "cười lớn, cầm bút như vừa nảy ra ý tưởng",
    "chỉ ngón tay lên phía chữ, miệng cười",
    "tự tin, hai tay đặt trên bàn phím laptop",
    "nghiêng đầu tinh nghịch, nháy một mắt",
    "tập trung suy nghĩ, ngón tay chạm cằm",
    "vui vẻ giơ ngón tay cái",
    "bất ngờ, miệng hé mở, mắt mở to",
    "bình thản, mỉm cười nhẹ, hai tay đan vào nhau",
]


# Châu 18/10: giữ mặt + sắc thái + áo khoác KOL; bối cảnh và dáng đổi theo nội dung từng skill.
BOI_CANH = {
    "dieu-phoi": ["phòng điều hành nhiều màn hình số liệu", "góc làm việc sáng tạo có bảng ý tưởng", "quán cà phê làm việc buổi sáng"],
    "video-da-nen-tang": ["studio quay video có đèn ring và máy quay", "phòng livestream bán hàng", "phòng dựng phim nhiều màn hình"],
    "xay-kenh": ["văn phòng startup hiện đại", "sân khấu thuyết trình nhỏ có màn hình", "studio sáng tạo nội dung"],
    "spa": ["phòng trị liệu spa sang trọng", "quầy lễ tân spa", "phòng tư vấn da có gương sáng", "khu thư giãn spa có cây xanh"],
    "video": ["phim trường có máy quay và đèn", "phòng dựng phim nhiều màn hình", "set quay ngoài trời lúc hoàng hôn"],
    "hinh-anh": ["studio chụp ảnh có đèn flash", "bàn thiết kế có bảng vẽ điện tử", "phòng trưng bày ảnh"],
    "noi-dung": ["góc quay nội dung có điện thoại trên chân máy", "quán cà phê sáng tạo", "phòng họp marketing có bảng kế hoạch"],
    "ban-hang": ["cửa hàng có kệ sản phẩm", "kho hàng online gọn gàng", "quầy thu ngân hiện đại"],
    "giao-duc": ["lớp học có bảng và học sinh phía sau mờ nhẹ", "phòng giáo viên có chồng giáo án", "thư viện trường học"],
    "ke-toan": ["văn phòng kế toán có tủ hồ sơ", "bàn làm việc với máy tính và biểu đồ tài chính", "phòng họp tài chính"],
    "van-phong": ["phòng họp cơ quan", "bàn làm việc công sở có văn bản", "hành lang toà nhà văn phòng"],
    "bds": ["phòng khách căn hộ mẫu cao cấp", "sàn giao dịch bất động sản có mô hình dự án", "ban công nhìn ra thành phố"],
    "kien-truc": ["xưởng thiết kế có bản vẽ kiến trúc", "phòng nội thất đẹp vừa hoàn thiện"],
    "website": ["phòng công nghệ có màn hình code", "trung tâm dữ liệu sáng màu xanh", "góc lập trình hiện đại"],
    "y-te": ["phòng khám nha khoa sạch sáng", "quầy tiếp đón phòng khám"],
    "phong-thuy": ["không gian trà đạo phương Đông", "phòng đọc có la bàn phong thuỷ và lịch âm"],
    "du-lich": ["sảnh khách sạn sang trọng", "bãi biển nghỉ dưỡng", "nhà hàng ấm cúng"],
}
TU_THE = [
    "đứng nửa người, tay giới thiệu về phía chữ",
    "ngồi cạnh bàn, cầm vật dụng đúng chủ đề",
    "đứng nghiêng người, cầm máy tính bảng",
    "đi bộ tự nhiên, nhìn vào ống kính",
    "tựa nhẹ vào quầy/kệ trong bối cảnh",
    "cận nửa người, cầm điện thoại",
]


def ghi_danh_muc(skills, bundles, kho_by_slug, niche_name):
    """Danh mục Drive (csv + json) + hàng đợi vẽ thumbnail cho Codex."""
    import csv

    rows = []
    for i, s in enumerate(skills + bundles, 1):
        sk = kho_by_slug.get(s["slug"], {})
        rows.append({
            "stt": i, "tenNgan": s["tenNgan"], "fileThumbnail": s["thumbFile"] + ".png", "ngach": niche_name[s["niche"]],
            "tenDayDu": s["ten"], "slug": s["slug"], "ma": sk.get("ma") or "",
            "soSkill": s.get("soSkill", 1), "goiGiaoKhach": sk.get("goiZip") or "",
            "dangBanCongXuong": sk.get("dangBanCongXuong") or "",
        })
    out = {"capNhat": date.today().isoformat(), "ghiChu": "Danh mục trang Bảo Châu Glow. Tên ngắn = chữ trên thumbnail = tên file thumbnail (không dấu). Agent giao khách: tra tenNgan/slug → goiGiaoKhach.", "skill": rows}
    try:
        os.makedirs(DANH_MUC_DRIVE, exist_ok=True)
        with open(os.path.join(DANH_MUC_DRIVE, "danh-muc-glow.json"), "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
        with open(os.path.join(DANH_MUC_DRIVE, "danh-muc-glow.csv"), "w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f)
            w.writerow(["STT", "Tên ngắn", "File thumbnail", "Ngách", "Tên đầy đủ", "Slug", "Mã", "Số skill", "Gói giao khách", "Đang bán Công xưởng"])
            for r in rows:
                w.writerow(list(r.values()))
    except OSError as e:
        print("Không ghi được danh mục Drive:", e)
    with open(os.path.join(MORNING, "data", "kho-skill", "glow-danh-muc.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    # Hàng đợi cho Codex: chỉ thêm mục mới, giữ nguyên mục cũ (Codex ghi tiến độ ở tien-do.json)
    os.makedirs(os.path.dirname(CODEX_QUEUE), exist_ok=True)
    q = json.load(open(CODEX_QUEUE, encoding="utf-8")) if os.path.exists(CODEX_QUEUE) else {"items": []}
    have = {x["file"] for x in q["items"]}
    niche_of_file = {s["thumbFile"] + ".png": s["niche"] for s in skills + bundles}
    for r in rows:
        if r["fileThumbnail"] not in have:
            q["items"].append({
                "file": r["fileThumbnail"], "chuTrenAnh": r["tenNgan"], "ngach": r["ngach"],
                "noiDung": next((s["moTa"] for s in skills + bundles if s["slug"] == r["slug"]), "")[:160],
                "bieuCam": BIEU_CAM[(len(q["items"]) * 5) % len(BIEU_CAM)],
            })
    # gắn bối cảnh + dáng cho mọi mục (cả mục cũ) theo ngách, xoay vòng để ảnh liền nhau khác cảnh
    dem = {}
    for i, it in enumerate(q["items"]):
        nid = niche_of_file.get(it["file"], "noi-dung")
        k = dem.get(nid, 0)
        dem[nid] = k + 1
        canh = BOI_CANH.get(nid) or BOI_CANH["noi-dung"]
        it["boiCanh"] = canh[k % len(canh)]
        it["tuThe"] = TU_THE[i % len(TU_THE)]
    q["quyTac"] = "1810: giữ mặt + sắc thái + áo khoác KOL; bối cảnh/dáng theo nội dung; không làm mờ che mặt"
    q["thuMucLuu"] = THUMB_CODEX
    q["capNhat"] = date.today().isoformat()
    with open(CODEX_QUEUE, "w", encoding="utf-8") as f:
        json.dump(q, f, ensure_ascii=False, indent=1)
    return len(rows)


def goi_moi_nhat(goi):
    """Ưu tiên bản trong kho chuẩn hoá mới nhất (cùng tên tệp)."""
    for d in KHO_DIRS:
        p = os.path.join(d, os.path.basename(goi))
        if os.path.exists(p):
            return p
    return goi if goi and os.path.exists(goi) else None


def chuan_bi_giao_hang(skills, bundles, kho_by_slug):
    """Chép gói vào GLOW - GIAO HÀNG (tên dễ nhận) + ghi catalog cho máy chủ Công xưởng."""
    import shutil

    os.makedirs(GIAO_HANG, exist_ok=True)
    cat = {"capNhat": date.today().isoformat(), "thuMucGiaoHang": os.path.basename(GIAO_HANG), "giaLe": GIA_LE, "nguongGiam": 5, "items": {}}
    thieu = []
    for s in skills + bundles:
        sk = kho_by_slug.get(s["slug"], {})
        cx = sk.get("dangBanCongXuong")
        entry = {"ten": s["ten"], "tenNgan": s["tenNgan"], "soSkill": s.get("soSkill", 1), "cx": cx, "file": None}
        if not cx:
            src = goi_moi_nhat(sk.get("goiZip") or "")
            if src:
                name = s["thumbFile"] + os.path.splitext(src)[1].lower()
                dst = os.path.join(GIAO_HANG, name)
                if not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src) or os.path.getmtime(dst) < os.path.getmtime(src):
                    shutil.copy2(src, dst)
                entry["file"] = name
            else:
                thieu.append(s["slug"])
        cat["items"][s["slug"]] = entry
    if os.path.isdir(os.path.dirname(CX_CATALOG)):
        with open(CX_CATALOG, "w", encoding="utf-8") as f:
            json.dump(cat, f, ensure_ascii=False, indent=1)
    if thieu:
        print("CẢNH BÁO không tìm thấy gói giao:", thieu)
    return len(cat["items"]) - len(thieu)


def load_cx_products():
    """Mô tả + sản phẩm giao của 21 skill Công xưởng (repo b-o-ch-u-ai-sales-page)."""
    out = {}
    if not os.path.exists(CX_PRODUCTS_TS):
        return out
    src = open(CX_PRODUCTS_TS, encoding="utf-8").read()
    for m in re.finditer(r'^\s*\["([a-z0-9-]+)",\s*"([^"]*)",\s*"[^"]*",\s*"[^"]*",\s*"([^"]*)",\s*"[^"]*",\s*\[([^\]]*)\]\]', src, re.M):
        slug, name, desc, deliv = m.groups()
        out[slug] = {"ten": name, "moTa": desc, "loiIch": re.findall(r'"([^"]+)"', deliv)[:3]}
    return out


# ---------------------------------------------------------------- main
def main():
    rebuild = "--rebuild-thumbs" in sys.argv
    kho = json.load(open(KHO_TONG, encoding="utf-8"))
    old = {}
    if os.path.exists(OUT_JSON):
        for s in json.load(open(OUT_JSON, encoding="utf-8")).get("skills", []):
            old[s["slug"]] = s

    cx_products = load_cx_products()
    viet = json.load(open(VIET_HOA, encoding="utf-8")) if os.path.exists(VIET_HOA) else {}
    ten_ngan = json.load(open(TEN_NGAN, encoding="utf-8")) if os.path.exists(TEN_NGAN) else {}
    skills, bundles, seen, skipped = [], [], set(), []
    for sk in kho["skill"]:
        slug = sk["slug"]
        if sk.get("trangThai") == "CHUA_CO_GOI":
            skipped.append((slug, "chưa có gói giao"))
            continue
        if slug in KHONG_BAN or KHONG_BAN_TU_KHOA.search(sk["ten"] + " " + slug):
            skipped.append((slug, "skill riêng"))
            continue
        if slug in seen:
            continue
        seen.add(slug)
        niche = niche_of(sk)
        m = re.search(r"BỘ\s+(\d+)\s+CÔNG CỤ", sk["ten"].upper())
        if sk.get("loai") == "combo" or m:
            n = int(m.group(1)) if m else count_in_bundle(sk)
            up = sk["ten"].upper()
            niche = "giao-duc" if "GIÁO DỤC" in up else "ke-toan" if "KẾ TOÁN" in up else "spa" if "SPA" in up else niche
            bundles.append({
                "slug": slug, "ten": nice_name(sk["ten"]), "niche": niche, "soSkill": n,
                "moTa": short_desc("", sk.get("moTa")),
                "thumb": f"/thumbs/{slug}.webp",
            })
            continue
        md = read_skill_md(sk)
        desc = short_desc(frontmatter_desc(md), sk.get("moTa"))
        cx = sk.get("dangBanCongXuong")
        loi_ich = benefits(md, desc)
        if cx and cx in cx_products:
            desc, loi_ich = cx_products[cx]["moTa"] or desc, cx_products[cx]["loiIch"] or loi_ich
        vh = viet.get(slug, {})
        skills.append({
            "slug": slug,
            "ma": sk.get("ma"),
            "ten": vh.get("ten") or (cx_products.get(cx, {}).get("ten") if cx else None) or nice_name(sk["ten"]),
            "niche": niche,
            "moTa": vh.get("moTa") or desc,
            "loiIch": loi_ich,
            "gia": GIA_LE,
            "congXuong": (CONG_XUONG + cx) if cx else None,
            "thumb": f"/thumbs/{slug}.webp",
        })

    for s in skills + bundles:
        s["tenNgan"] = ten_ngan.get(s["slug"]) or s["ten"].upper()
        s["thumbFile"] = khong_dau(s["tenNgan"])
    dup = sorted({s["thumbFile"] for s in skills + bundles if sum(x["thumbFile"] == s["thumbFile"] for x in skills + bundles) > 1})
    if dup:
        print("CẢNH BÁO tên ngắn trùng — sửa scripts/ten-ngan.json:", dup)
    order = {n: i for i, n in enumerate(NICHE_IDS)}
    skills.sort(key=lambda s: (order[s["niche"]], s["congXuong"] is None, s["ten"]))
    data = {
        "capNhat": date.today().isoformat(),
        "nguon": "data/kho-skill/kho-tong.json",
        "giaLe": GIA_LE,
        "nguongGiam": 5,
        "tyLeGiam": 0.35,
        "niches": [{"id": i, "ten": t, "eyebrow": e, "moTa": m} for i, t, e, m in NICHES],
        "skills": skills,
        "bundles": bundles,
    }
    os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)

    new = [s["slug"] for s in skills if s["slug"] not in old]
    print(f"Skill: {len(skills)} (mới {len(new)}) · bộ combo: {len(bundles)} · bỏ qua: {len(skipped)}")
    from collections import Counter
    for nid, c in sorted(Counter(s["niche"] for s in skills).items(), key=lambda x: order[x[0]]):
        print(f"  {nid}: {c}")

    n_dm = ghi_danh_muc(skills, bundles, {s["slug"]: s for s in kho["skill"]}, {i: t for i, t, _, _ in NICHES})
    print(f"Danh mục Drive + hàng đợi Codex: {n_dm} mục")
    n_gh = chuan_bi_giao_hang(skills, bundles, {s["slug"]: s for s in kho["skill"]})
    print(f"Thư mục giao hàng + catalog Công xưởng: {n_gh} mục có gói")

    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import thumbs  # noqa: E402

    nhap, co_codex = thumbs.nhap_tu_codex(ROOT, skills + bundles, THUMB_CODEX)
    print(f"Thumbnail Codex đã nhập: {nhap} (đang dùng ảnh Codex: {len(co_codex)})")
    renamed = {s["slug"] for s in skills if s["slug"] in old and old[s["slug"]]["ten"] != s["ten"]}
    made = thumbs.make_all(ROOT, skills + bundles, rebuild=rebuild, force=renamed, bo_qua=co_codex)
    print(f"Thumbnail mới vẽ: {made}")


if __name__ == "__main__":
    main()
