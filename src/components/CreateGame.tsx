import { useState } from 'react';
import { ChevronLeft, Edit3, Check } from 'lucide-react';

interface CreateGameProps {
  onBack?: () => void;
  onStartGame?: (gameConfig: {
    rule: '杭州麻将' | '诸暨麻将';
    players: { seat: string; name: string }[];
  }) => void;
}

export default function CreateGame({ onBack, onStartGame }: CreateGameProps) {
  // 选中的玩法规则（默认杭州麻将）
  const [selectedRule, setSelectedRule] = useState<'杭州麻将' | '诸暨麻将'>('杭州麻将');

  // 四个风位对应的玩家姓名
  const [players, setPlayers] = useState([
    { seat: '东', name: '阿强' },
    { seat: '南', name: '小美' },
    { seat: '西', name: '老陈' },
    { seat: '北', name: '桃子' },
  ]);

  // 常用牌友库
  const [frequentFriends] = useState([
    '阿强',
    '小美',
    '老陈',
    '桃子',
    '大林',
    '静静',
    '王老板',
  ]);

  // 修改某个风位的玩家姓名
  const handlePlayerNameChange = (index: number, newName: string) => {
    const updated = [...players];
    updated[index].name = newName;
    setPlayers(updated);
  };

  // 点击常用牌友标签进行快速切换/选择
  const handleFriendClick = (friendName: string) => {
    const isAlreadySelected = players.some((p) => p.name === friendName);

    if (isAlreadySelected) {
      // 如果已在桌上，点击取消该玩家，清空相应座位
      setPlayers(
        players.map((p) => (p.name === friendName ? { ...p, name: '' } : p))
      );
    } else {
      // 如果未在桌上，填入第一个为空的座位
      const emptyIndex = players.findIndex((p) => !p.name.trim());
      if (emptyIndex !== -1) {
        handlePlayerNameChange(emptyIndex, friendName);
      } else {
        // 如果满员，提示用户或不处理
        alert('四个风位已满，请先点击某个座位编辑或清空再选择牌友');
      }
    }
  };

  const handleStart = () => {
    // 校验4个玩家名字是否填齐
    const emptyPlayer = players.find((p) => !p.name.trim());
    if (emptyPlayer) {
      alert(`请设置【${emptyPlayer.seat}】风位的玩家姓名`);
      return;
    }

    if (onStartGame) {
      onStartGame({
        rule: selectedRule,
        players,
      });
    } else {
      alert(`开启新牌局成功！\n规则：${selectedRule}\n玩家：${players.map((p) => `${p.seat}:${p.name}`).join('、')}`);
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
            设置雀局规则并安排风位
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

      {/* 第二块：安排座位 (风位) */}
      <section className="mb-5">
        <h2 className="text-base font-bold text-[#0E5C4E] mb-3">
          安排座位 (风位)
        </h2>

        <div className="space-y-3">
          {players.map((item, index) => (
            <div key={item.seat} className="flex items-center space-x-3">
              {/* 圆形暖黄色标签：东/南/西/北 */}
              <div className="w-11 h-11 rounded-full bg-[#FAF0E6] border border-[#F2D7C4] text-[#C86328] font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                {item.seat}
              </div>

              {/* 输入框卡片 */}
              <div className="bg-white rounded-2xl px-4 py-2.5 border border-[#F0EADF] flex-1 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus-within:border-[#0E5C4E]/40 transition-colors">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`请输入${item.seat}位玩家姓名`}
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

      {/* 第三块：常用牌友 */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-[#0E5C4E] mb-3">
          常用牌友
        </h2>

        <div className="flex flex-wrap gap-2.5">
          {frequentFriends.map((friend) => {
            const isSelected = players.some((p) => p.name === friend);
            return (
              <button
                key={friend}
                onClick={() => handleFriendClick(friend)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#E2F1ED] border border-[#B3DCD4] text-[#0E5C4E] shadow-2xs'
                    : 'bg-white border border-[#EAE3D7] text-[#5A5248] hover:border-[#0E5C4E]/30'
                }`}
              >
                <span>{friend}</span>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 底部居中开启新牌局主按钮 */}
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
