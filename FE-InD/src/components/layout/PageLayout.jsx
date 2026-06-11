import React, { useEffect } from 'react';
import PromoBanner from './PromoBanner';
import Header from './Header';
import Footer from './Footer';

/**
 * PageLayout — bọc toàn bộ trang với Banner + Header + nội dung + Footer.
 * CartDrawer đã được mount sẵn trong App.jsx nên không cần thêm ở đây.
 *
 * Dùng:
 *   <PageLayout>
 *     <YourPageContent />
 *   </PageLayout>
 */
const PageLayout = ({ children }) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      * { font-family: 'Be Vietnam Pro', sans-serif !important; }
      h1, h2, h3, h4, .ant-typography { font-family: 'Be Vietnam Pro', sans-serif !important; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}
         className="bg-white min-h-screen text-gray-800 antialiased">
      <PromoBanner />
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
