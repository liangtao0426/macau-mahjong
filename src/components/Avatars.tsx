import { ReactNode } from 'react';

// 4款各具特色的卡通牌友头像
export const PLAYER_AVATARS: ReactNode[] = [
  // 头像 1：阳光短发男生
  (
    <svg key="avatar-1" viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FFE8D6" />
      {/* 头发 */}
      <path d="M12 18C12 12 15 8 20 8C25 8 28 12 28 18C28 19 27 20 26 19C25 15 23 13 20 13C17 13 15 15 14 19C13 20 12 19 12 18Z" fill="#3D2B1F" />
      {/* 脸部 */}
      <circle cx="20" cy="21" r="9" fill="#FFDFC4" />
      {/* 刘海 */}
      <path d="M13 17C15 14 18 13 22 14C25 15 27 17 27 17" stroke="#3D2B1F" strokeWidth="2.5" strokeLinecap="round" />
      {/* 眼睛 */}
      <circle cx="17" cy="20" r="1.5" fill="#2C3531" />
      <circle cx="23" cy="20" r="1.5" fill="#2C3531" />
      {/* 腮红 */}
      <circle cx="15.5" cy="23" r="1.5" fill="#F87171" opacity="0.6" />
      <circle cx="24.5" cy="23" r="1.5" fill="#F87171" opacity="0.6" />
      {/* 嘴巴微笑 */}
      <path d="M18.5 24C19 25 21 25 21.5 24" stroke="#C86328" strokeWidth="1.5" strokeLinecap="round" />
      {/* 衣服领口 */}
      <path d="M14 36C15 31 17 29 20 29C23 29 25 31 26 36" fill="#0E5C4E" />
    </svg>
  ),
  // 头像 2：甜美丸子头女生
  (
    <svg key="avatar-2" viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FCE7F3" />
      {/* 丸子发髻 */}
      <circle cx="20" cy="7.5" r="4.5" fill="#4A3525" />
      <circle cx="19" cy="7.5" r="1.8" fill="#F43F5E" />
      {/* 发冠 */}
      <circle cx="20" cy="20" r="9.5" fill="#4A3525" />
      {/* 脸蛋 */}
      <circle cx="20" cy="21" r="8" fill="#FFE3D1" />
      {/* 齐刘海 */}
      <path d="M13 18C15 16 25 16 27 18" fill="#4A3525" />
      {/* 笑眼与小眨眼 */}
      <path d="M16 20C16.5 19.5 17.5 19.5 18 20" stroke="#2C3531" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="23" cy="20" r="1.5" fill="#2C3531" />
      {/* 腮红 */}
      <circle cx="15.5" cy="22.5" r="1.8" fill="#FB7185" opacity="0.7" />
      <circle cx="24.5" cy="22.5" r="1.8" fill="#FB7185" opacity="0.7" />
      {/* 甜美微笑 */}
      <path d="M18.5 24C19 25.2 21 25.2 21.5 24" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
      {/* 衣服 */}
      <path d="M13 36C14 30.5 17 28.5 20 28.5C23 28.5 26 30.5 27 36" fill="#FB7185" />
    </svg>
  ),
  // 头像 3：复古鸭舌帽小胡子老友
  (
    <svg key="avatar-3" viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FEF3C7" />
      {/* 鸭舌帽 */}
      <path d="M12 16C12 12 15 9 20 9C25 9 28 12 28 16Z" fill="#C86328" />
      <path d="M10 16C15 15 25 15 30 16" stroke="#A04512" strokeWidth="2.5" strokeLinecap="round" />
      {/* 脸部 */}
      <circle cx="20" cy="22" r="8.5" fill="#FCD5B5" />
      {/* 眼睛 */}
      <circle cx="17" cy="21" r="1.5" fill="#2C3531" />
      <circle cx="23" cy="21" r="1.5" fill="#2C3531" />
      {/* 俏皮小胡子 */}
      <path d="M17 24.5C18 24 19.5 24.5 20 25C20.5 24.5 22 24 23 24.5" stroke="#3D2B1F" strokeWidth="1.5" strokeLinecap="round" />
      {/* 衣服 */}
      <path d="M13 36C14 31 16 29 20 29C24 29 26 31 27 36" fill="#3B82F6" />
    </svg>
  ),
  // 头像 4：潮流耳机酷酷牌友
  (
    <svg key="avatar-4" viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <circle cx="20" cy="20" r="20" fill="#E0F2FE" />
      {/* 耳机头梁 */}
      <path d="M13 18C13 13 16 10 20 10C24 10 27 13 27 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
      {/* 头发 */}
      <path d="M14 17C14 12 17 11 20 11C23 11 26 12 26 17Z" fill="#334155" />
      {/* 脸蛋 */}
      <circle cx="20" cy="21" r="8" fill="#FCE0C6" />
      {/* 耳机耳罩 */}
      <rect x="11" y="18" width="3" height="6" rx="1.5" fill="#10B981" />
      <rect x="26" y="18" width="3" height="6" rx="1.5" fill="#10B981" />
      {/* 眼睛与微笑 */}
      <circle cx="17" cy="20" r="1.5" fill="#2C3531" />
      <circle cx="23" cy="20" r="1.5" fill="#2C3531" />
      <circle cx="16" cy="22.5" r="1.5" fill="#F87171" opacity="0.6" />
      <circle cx="24" cy="22.5" r="1.5" fill="#F87171" opacity="0.6" />
      <path d="M18.5 24C19 25 21 25 21.5 24" stroke="#C86328" strokeWidth="1.5" strokeLinecap="round" />
      {/* 卫衣 */}
      <path d="M13 36C14 31 16 29 20 29C24 29 26 31 27 36" fill="#6366F1" />
    </svg>
  ),
];
