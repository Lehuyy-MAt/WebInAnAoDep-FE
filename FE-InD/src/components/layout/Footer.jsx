import { useState } from 'react';
// logo removed as requested

const ABOUT_LINKS = [
  { href: '#', label: 'Câu hỏi thường gặp' },
  { href: '#', label: 'Hướng dẫn thiết kế sản phẩm' },
  { href: '#', label: 'Chính sách và hỗ trợ' },
];

const SOCIAL = [
  { href: '#', label: 'f',  hoverBg: 'hover:bg-blue-600' },
  { href: '#', label: 'ig', hoverBg: 'hover:bg-pink-600' },
  { href: '#', label: 'tt', hoverBg: 'hover:bg-black' },
];

const Footer = () => {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-[#0f1923] text-gray-400 pt-12 pb-6 mt-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">

        {/* Brand (logo removed) */}
        <div className="space-y-3">
          <div className="text-white font-bold text-lg">IN.T</div>
          <p className="text-gray-400 leading-relaxed text-xs">
            Chuyên in áo theo yêu cầu - Thiết kế &amp; In Online
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">Liên hệ</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Điện thoại: 0399.599.188<br />
            Email: int.auar@gmail.com<br />
            Địa chỉ: Đại Học FPT - Hà Nội
          </p>
        </div>

        {/* About */}
        <div className="space-y-2">
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">Về chúng tôi</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            {ABOUT_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter + Social */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">Kết nối với chúng tôi</h4>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-gray-800 text-xs text-gray-300 px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => setEmail('')}
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-2 rounded-lg transition-colors font-semibold"
            >
              Đăng ký
            </button>
          </div>
          <div className="flex gap-3">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className={`w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center ${s.hoverBg} hover:text-white transition-all text-xs`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto px-6 mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-400">
        © 2026 IN.T - Thời Trang &amp; In Áo Theo Yêu Cầu. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
