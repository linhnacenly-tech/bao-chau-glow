// Glow đã gộp vào sân chơi AI Thực Chiến (Châu chốt 26/10/2026 tối): mọi đường dẫn Glow chuyển hướng 301 sang sân chơi, giữ query.
// Không xoá repo/worker. Deploy: cd chuyen-huong && npx wrangler deploy (thay mã Glow cũ trên worker bao-chau-glow).
// Muốn chạy lại Glow cũ: deploy nhánh cloudflare như trước (wrangler.jsonc ở gốc repo).
const SAN_CHOI = 'https://bcai-san-choi.linhnacenly.workers.dev';

export default {
  fetch(req) {
    const url = new URL(req.url);
    const p = decodeURIComponent(url.pathname).replace(/\/+$/, '');
    // Sân chơi một trang, chuyển khu bằng #hash: /skill/<slug> mở đúng skill, /nganh/<id> mở trang ngách.
    let hash = '';
    const skill = p.match(/^\/skill\/([^/]+)$/);
    const nganh = p.match(/^\/nganh\/([^/]+)$/);
    if (skill) hash = `#skill-${skill[1]}`;
    else if (nganh) hash = `#/ngach/${nganh[1]}`;
    // Tệp tĩnh (ảnh thumbnail /thumbs/…, logo) giữ nguyên đường dẫn: sân chơi có bản chép (npm run sync).
    const duongDan = /\.[a-z0-9]{2,5}$/i.test(p) ? url.pathname : '/';
    return new Response(null, { status: 301, headers: { location: `${SAN_CHOI}${duongDan}${url.search}${hash}`, 'cache-control': 'public, max-age=3600' } });
  },
};
