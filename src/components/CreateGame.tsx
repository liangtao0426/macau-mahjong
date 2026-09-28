import React, { useState, useEffect } from 'react';
import { ChevronLeft, Edit3, Check, X, Trash2 } from 'lucide-react';

interface CreateGameProps {
  onBack?: () => void;
  onStartGame?: (gameConfig: {
    rule: '杭州麻将' | '诸暨麻将';
    players: { seat: string; name: string }[];
  }) => void;
}

interface SavedFriend {
  name: string;
  updatedTime: number; // 用于倒序排序的时间戳
}

const STORAGE_KEY = 'mahjong_frequent_friends';

// 4款各具特色的卡通牌友头像
const PLAYER_AVATARS = [
  // 头像 1：阳光短发男生
  (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
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
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
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
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
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
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
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

export default function CreateGame({ onBack, onStartGame }: CreateGameProps) {
  // 选中的玩法规则（默认杭州麻将）
  const [selectedRule, setSelectedRule] = useState<'杭州麻将' | '诸暨麻将'>('杭州麻将');

  // 四个座位对应的玩家姓名（默认初始为空，每次进入清空）
  const [players, setPlayers] = useState([
    { seat: '1', name: '' },
    { seat: '2', name: '' },
    { seat: '3', name: '' },
    { seat: '4', name: '' },
  ]);

  // 常用牌友列表（按保存时间倒序）
  const [frequentFriends, setFrequentFriends] = useState<SavedFriend[]>([]);

  // 是否处于牌友删除管理模式
  const [isManagingFriends, setIsManagingFriends] = useState(false);

  // 首次加载或每次进入时读取本地存储中的常用牌友
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SavedFriend[] = JSON.parse(stored);
        // 按时间从新到旧（降序）排序
        parsed.sort((a, b) => b.updatedTime - a.updatedTime);
        setFrequentFriends(parsed);
      }
    } catch (e) {
      console.error('读取常用牌友失败', e);
    }
  }, []);

  // 修改某个座位的玩家姓名
  const handlePlayerNameChange = (index: number, newName: string) => {
    const updated = [...players];
    updated[index].name = newName;
    setPlayers(updated);
  };

  // 点击常用牌友标签进行快速选择 / 取消
  const handleFriendClick = (friendName: string) => {
    // 管理模式下点击则执行删除
    if (isManagingFriends) {
      handleDeleteFriend(friendName);
      return;
    }

    const isAlreadySelected = players.some((p) => p.name === friendName);

    if (isAlreadySelected) {
      // 如果已被选入座位，点击取消，清空相应座位
      setPlayers(
        players.map((p) => (p.name === friendName ? { ...p, name: '' } : p))
      );
    } else {
      // 如果未选入，自动填入第一个为空的座位
      const emptyIndex = players.findIndex((p) => !p.name.trim());
      if (emptyIndex !== -1) {
        handlePlayerNameChange(emptyIndex, friendName);
      } else {
        alert('4个座位已满，请先清空或编辑某个座位再选择牌友');
      }
    }
  };

  // 删除某个常用牌友
  const handleDeleteFriend = (friendName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updated = frequentFriends.filter((f) => f.name !== friendName);
    setFrequentFriends(updated);

    // 如果被删除的牌友正好在当前座位上，同步清空
    setPlayers(
      players.map((p) => (p.name === friendName ? { ...p, name: '' } : p))
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('更新常用牌友失败', err);
    }
  };

  // 点击“开启新牌局”保存常用牌友并进入对局
  const handleStart = () => {
    // 检查是否有未填写的座位
    const emptyPlayer = players.find((p) => !p.name.trim());
    if (emptyPlayer) {
      alert(`请设置【座位 ${emptyPlayer.seat}】的玩家姓名`);
      return;
    }

    // 收集所有有效输入的玩家名字并更新本地常用牌友库
    const now = Date.now();
    const currentFriends: SavedFriend[] = [...frequentFriends];

    players.forEach((p) => {
      const trimmedName = p.name.trim();
      if (!trimmedName) return;

      const existingIndex = currentFriends.findIndex((f) => f.name === trimmedName);
      if (existingIndex !== -1) {
        // 更新现有牌友的时间戳（置顶为最新使用）
        currentFriends[existingIndex].updatedTime = now;
      } else {
        // 添加新牌友
        currentFriends.push({
          name: trimmedName,
          updatedTime: now,
        });
      }
    });

    // 重新按最新保存/使用时间降序排序
    currentFriends.sort((a, b) => b.updatedTime - a.updatedTime);

    // 持久化保存在 LocalStorage 中
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFriends));
      setFrequentFriends(currentFriends);
    } catch (e) {
      console.error('保存常用牌友失败', e);
    }

    // 回调外部开启对局
    if (onStartGame) {
      onStartGame({
        rule: selectedRule,
        players,
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-7 pb-4">
      {/* 顶部标题栏 & 返回 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            {/* 返回按钮 */}
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-[#EFE7DC] flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-[#0E5C4E]" />
            </button>
            <h1 className="text-2xl font-extrabold text-[#0E5C4E] tracking-tight">
              新建牌局
            </h1>
          </div>
          <p className="text-xs text-[#8C857B] mt-1.5 ml-11 font-medium">
            设置雀局规则并安排座位
          </p>
        </div>

        {/* 右上角装饰短线 */}
        <div className="flex items-center space-x-1 mt-2">
          <span className="w-5 h-1.5 bg-[#C86328] rounded-full inline-block"></span>
          <span className="w-3 h-1.5 bg-[#0E5C4E] rounded-full inline-block"></span>
        </div>
      </div>

      {/* 第一块：选择玩法 */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-[#0E5C4E] mb-3">
          选择玩法
        </h2>

        {/* 玩法 Segmented Tab 切换 */}
        <div className="bg-[#EFE8DD] p-1 rounded-2xl flex items-center">
          <button
            onClick={() => setSelectedRule('杭州麻将')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              selectedRule === '杭州麻将'
                ? 'bg-[#0E5C4E] text-white shadow-sm'
                : 'text-[#5A5248] hover:text-[#2C3531]'
            }`}
          >
            杭州麻将
          </button>
          <button
            onClick={() => setSelectedRule('诸暨麻将')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              selectedRule === '诸暨麻将'
                ? 'bg-[#0E5C4E] text-white shadow-sm'
                : 'text-[#5A5248] hover:text-[#2C3531]'
            }`}
          >
            诸暨麻将
          </button>
        </div>
      </section>

      {/* 第二块：安排座位 (头像 Icon 替代数字 1234) */}
      <section className="mb-5">
        <h2 className="text-base font-bold text-[#0E5C4E] mb-3">
          安排座位
        </h2>

        <div className="space-y-3">
          {players.map((item, index) => (
            <div key={item.seat} className="flex items-center space-x-3">
              {/* 卡通头像图标 */}
              <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8DFC8]">
                {PLAYER_AVATARS[index % PLAYER_AVATARS.length]}
              </div>

              {/* 输入框卡片 */}
              <div className="bg-white rounded-2xl px-4 py-2.5 border border-[#F0EADF] flex-1 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#0E5C4E]/40 transition-colors">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`请输入座位 ${index + 1} 玩家姓名`}
                  className="bg-transparent text-sm font-bold text-[#2C3531] outline-none w-full placeholder:text-[#B5AD9F] placeholder:font-normal"
                />
                <Edit3 className="w-4 h-4 text-[#A0988C] shrink-0 ml-2 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* 中间麻将分隔装饰图标 */}
        <div className="flex items-center justify-center my-5">
          <div className="h-[1px] bg-[#EADFD0] flex-1"></div>
          <div className="mx-3 px-2 py-1 bg-[#C86328] rounded flex items-center justify-center shadow-xs">
            <div className="w-3.5 h-4 bg-[#F8F3EB] rounded-xs border border-[#A04512] flex flex-col items-center justify-around py-0.5">
              <span className="w-1 h-1 bg-[#C86328] rounded-full inline-block"></span>
              <span className="w-1 h-1 bg-[#C86328] rounded-full inline-block"></span>
            </div>
          </div>
          <div className="h-[1px] bg-[#EADFD0] flex-1"></div>
        </div>
      </section>

      {/* 第三块：常用牌友 (支持删除与管理) */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-[#0E5C4E]">
            常用牌友
          </h2>
          {frequentFriends.length > 0 && (
            <button
              onClick={() => setIsManagingFriends(!isManagingFriends)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 transition-colors ${
                isManagingFriends
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'text-[#8C857B] hover:text-[#0E5C4E]'
              }`}
            >
              {isManagingFriends ? (
                <span>完成删除</span>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 inline-block" />
                  <span>管理</span>
                </>
              )}
            </button>
          )}
        </div>

        {frequentFriends.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {frequentFriends.map((friend) => {
              const isSelected = players.some((p) => p.name === friend.name);
              return (
                <div
                  key={friend.name}
                  onClick={() => handleFriendClick(friend.name)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
                    isManagingFriends
                      ? 'bg-red-50 border border-red-200 text-red-700 animate-pulse'
                      : isSelected
                      ? 'bg-[#E2F1ED] border border-[#B3DCD4] text-[#0E5C4E] shadow-2xs'
                      : 'bg-white border border-[#EAE3D7] text-[#5A5248] hover:border-[#0E5C4E]/30'
                  }`}
                >
                  <span>{friend.name}</span>
                  {isSelected && !isManagingFriends && (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  {/* 删除按钮 */}
                  {isManagingFriends ? (
                    <span 
                      onClick={(e) => handleDeleteFriend(friend.name, e)}
                      className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold ml-1 hover:bg-red-600"
                    >
                      ✕
                    </span>
                  ) : (
                    <span
                      onClick={(e) => handleDeleteFriend(friend.name, e)}
                      className="text-[#B0A89C] hover:text-red-500 transition-colors ml-1"
                      title="删除此牌友"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/60 border border-dashed border-[#E5DCD0] rounded-2xl p-4 text-center text-xs text-[#8C857B]">
            暂无常用牌友，开启新牌局后将自动保存牌友名字
          </div>
        )}
      </section>

      {/* 底部开启新牌局主按钮 */}
      <div className="mt-auto pt-4">
        <button
          onClick={handleStart}
          className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center active:scale-[0.98] transition-all hover:bg-[#0A473C]"
        >
          开启新牌局
        </button>
      </div>
    </div>
  );
}
