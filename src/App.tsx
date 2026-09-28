import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Home, 
  Edit3, 
  Calendar, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import CreateGame from './components/CreateGame';
import GameBoard, { GameData, RoundRecord } from './components/GameBoard';

// 本地存储持久化 Key
const STORAGE_ACTIVE_GAME = 'mahjong_active_game';
const STORAGE_HISTORY_GAMES = 'mahjong_history_records';

// 历史对局数据结构
interface PlayerScore {
  name: string;
  score: number;
}

interface MatchRecord {
  id: string;
  type: '杭州麻将' | '诸暨麻将';
  date: string;
  totalRounds: number;
  duration: string;
  players: PlayerScore[];
}

const defaultHistoryData: MatchRecord[] = [
  {
    id: '1',
    type: '杭州麻将',
    date: '今天 15:42',
    totalRounds: 8,
    duration: '约2小时',
    players: [
      { name: '阿强', score: 84 },
      { name: '小美', score: -12 },
      { name: '老陈', score: -48 },
      { name: '我', score: -24 },
    ],
  },
  {
    id: '2',
    type: '诸暨麻将',
    date: '昨天 21:10',
    totalRounds: 12,
    duration: '约3小时',
    players: [
      { name: '桃子', score: -30 },
      { name: '老陈', score: 120 },
      { name: '小美', score: -50 },
      { name: '我', score: -40 },
    ],
  },
  {
    id: '3',
    type: '杭州麻将',
    date: '03月02日',
    totalRounds: 6,
    duration: '约1.5小时',
    players: [
      { name: '阿强', score: 12 },
      { name: '桃子', score: -18 },
      { name: '小美', score: 24 },
      { name: '我', score: -18 },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'score' | 'history' | 'stats'>('home');
  // 记分板块内部子页面：'create' 为新建牌局，'board' 为对局记分盘
  const [scoreSubView, setScoreSubView] = useState<'create' | 'board'>('create');
  
  // 当前正在进行的对局（持久化保存在本地）
  const [activeGame, setActiveGame] = useState<GameData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_GAME);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.status === '进行中') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('读取进行中对局失败', e);
    }
    return null;
  });

  // 历史战绩列表（持久化保存在本地）
  const [historyList, setHistoryList] = useState<MatchRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_GAMES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('读取历史战绩失败', e);
    }
    return defaultHistoryData;
  });

  // 无法开启新牌局的拦截提示弹窗
  const [showActiveAlertModal, setShowActiveAlertModal] = useState(false);

  // 每次 activeGame 变化时持久化到 LocalStorage
  useEffect(() => {
    try {
      if (activeGame) {
        localStorage.setItem(STORAGE_ACTIVE_GAME, JSON.stringify(activeGame));
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_GAME);
      }
    } catch (e) {
      console.error('保存进行中对局失败', e);
    }
  }, [activeGame]);

  // 计算进行中对局各个玩家的累计总分
  const activeGameScores = useMemo(() => {
    if (!activeGame) return {};
    const map: Record<string, number> = {};
    activeGame.players.forEach((p) => {
      map[p.name] = 0;
    });
    activeGame.rounds.forEach((round) => {
      round.playerScores.forEach((ps) => {
        map[ps.name] = (map[ps.name] || 0) + ps.score;
      });
    });
    return map;
  }, [activeGame]);

  // 尝试前往新建牌局（如果有正在进行的牌局，则拦截）
  const handleTryCreateGame = () => {
    if (activeGame) {
      setShowActiveAlertModal(true);
    } else {
      setScoreSubView('create');
      setActiveTab('score');
    }
  };

  // 开启新牌局回调
  const handleStartNewGame = (config: {
    rule: '杭州麻将' | '诸暨麻将';
    players: { seat: string; name: string }[];
  }) => {
    const newGame: GameData = {
      id: `game_${Date.now()}`,
      name: '牌局 A',
      rule: config.rule,
      status: '进行中',
      players: config.players,
      rounds: [],
      startTime: Date.now(),
    };
    setActiveGame(newGame);
    setScoreSubView('board');
  };

  // 添加一轮记分
  const handleAddRound = (newRound: RoundRecord) => {
    if (!activeGame) return;
    const updatedGame: GameData = {
      ...activeGame,
      rounds: [...activeGame.rounds, newRound],
    };
    setActiveGame(updatedGame);
  };

  // 结束当前牌局并归档到历史战绩
  const handleEndCurrentGame = () => {
    if (!activeGame) return;

    // 格式化当前时间
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // 计算估算时长
    const roundCount = activeGame.rounds.length;
    const durationStr = roundCount > 0 ? `约${Math.max(1, Math.round(roundCount * 0.25))}小时` : '约0.5小时';

    // 生成历史记录项
    const archivedItem: MatchRecord = {
      id: activeGame.id,
      type: activeGame.rule,
      date: `今天 ${timeStr}`,
      totalRounds: roundCount,
      duration: durationStr,
      players: activeGame.players.map((p) => ({
        name: p.name,
        score: activeGameScores[p.name] || 0,
      })),
    };

    // 保存到历史列表头部
    const updatedHistory = [archivedItem, ...historyList];
    setHistoryList(updatedHistory);
    try {
      localStorage.setItem(STORAGE_HISTORY_GAMES, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('保存历史记录失败', e);
    }

    // 清空进行中的牌局
    setActiveGame(null);
    setScoreSubView('create');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#F8F3EB] flex justify-center selection:bg-[#0E5C4E]/20">
      {/* 模拟手机容器 (Mobile Device Shell) */}
      <div className="w-full max-w-md bg-[#F8F3EB] flex flex-col min-h-screen relative pb-20 shadow-xl">
        
        {/* 根据当前 Tab 切换主视图 */}
        {activeTab === 'score' ? (
          /* 【记分】板块：如有进行中对局直接展示记分盘，否则展示新建牌局 */
          activeGame && scoreSubView === 'board' ? (
            <GameBoard
              game={activeGame}
              onBack={() => setActiveTab('home')}
              onAddRound={handleAddRound}
              onEndGame={handleEndCurrentGame}
            />
          ) : (
            <CreateGame 
              onBack={() => setActiveTab('home')}
              onStartGame={handleStartNewGame}
            />
          )
        ) : activeTab === 'home' ? (
          /* 【首页】视图 */
          <>
            {/* 顶部 APP 标题与 Slogan */}
            <div className="px-6 pt-7 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#0E5C4E] tracking-tight">
                    麻雀记
                  </h1>
                  <p className="text-xs text-[#8C857B] mt-1 font-medium tracking-wide">
                    记录每一场，回味每一局
                  </p>
                </div>
                {/* 右侧装饰短线 */}
                <div className="flex items-center space-x-1 mt-2">
                  <span className="w-5 h-1.5 bg-[#C86328] rounded-full inline-block"></span>
                  <span className="w-3 h-1.5 bg-[#0E5C4E] rounded-full inline-block"></span>
                </div>
              </div>
            </div>

            {/* 主体内容区 */}
            <main className="flex-1 px-5 space-y-5">

              {/* 核心业务状态：如果当前有进行中的牌局，在首页最醒目位置展示！ */}
              {activeGame && (
                <section className="bg-gradient-to-br from-[#0E5C4E] to-[#145348] text-white rounded-3xl p-5 shadow-[0_8px_24px_rgba(14,92,78,0.22)] border border-[#237062] animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      {/* 呼吸进行中绿点 */}
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                      </span>
                      <span className="text-xs font-bold tracking-wider text-emerald-200">
                        正在进行中的牌局
                      </span>
                      <span className="bg-white/15 text-white text-[11px] px-2 py-0.5 rounded-full font-medium border border-white/10">
                        {activeGame.rule}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-200 font-medium">
                      已进行 {activeGame.rounds.length} 轮
                    </span>
                  </div>

                  {/* 4 位玩家即时累计比分盘 */}
                  <div className="grid grid-cols-4 gap-2 my-3 bg-black/20 rounded-2xl p-3 border border-white/10 text-center">
                    {activeGame.players.map((p) => {
                      const score = activeGameScores[p.name] || 0;
                      return (
                        <div key={p.name} className="truncate">
                          <div className="text-[11px] text-emerald-100/80 font-medium truncate">
                            {p.name}
                          </div>
                          <div className={`text-base font-extrabold mt-0.5 ${
                            score > 0 ? 'text-emerald-300' : score < 0 ? 'text-rose-300' : 'text-white/90'
                          }`}>
                            {score > 0 ? `+${score}` : score}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 进入当前记分盘主按钮 */}
                  <button 
                    onClick={() => {
                      setScoreSubView('board');
                      setActiveTab('score');
                    }}
                    className="w-full py-2.5 bg-[#FAF0E6] text-[#0E5C4E] hover:bg-white text-xs font-extrabold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <span>进入当前记分盘继续记录</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </section>
              )}

              {/* 2. 选择牌局规则板块 */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-bold text-[#0E5C4E]">
                    选择牌局规则
                  </h2>
                  {activeGame && (
                    <span className="text-[11px] text-[#C86328] font-bold bg-[#FAF0E6] px-2 py-0.5 rounded-md border border-[#F2D7C4]">
                      当前牌局进行中
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* 卡片1：杭州麻将 */}
                  <div 
                    onClick={handleTryCreateGame}
                    className={`bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer ${
                      activeGame ? 'border-[#F0EADF] opacity-90' : 'border-[#F0EADF] hover:border-[#0E5C4E]/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#EBF4F2] border border-[#BFDAD5] flex items-center justify-center text-[#0E5C4E] font-bold text-lg shrink-0 shadow-inner">
                        杭
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#2C3531]">杭州麻将</h3>
                        <p className="text-xs text-[#8C857B] mt-0.5">三摊承包，飞子爆头，刺激多变</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#B0A89C] shrink-0" />
                  </div>

                  {/* 卡片2：诸暨麻将 */}
                  <div 
                    onClick={handleTryCreateGame}
                    className={`bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer ${
                      activeGame ? 'border-[#F0EADF] opacity-90' : 'border-[#F0EADF] hover:border-[#C86328]/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF0E6] border border-[#F2D7C4] flex items-center justify-center text-[#C86328] font-bold text-lg shrink-0 shadow-inner">
                        诸
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#2C3531]">诸暨麻将</h3>
                        <p className="text-xs text-[#8C857B] mt-0.5">双百带碰，半合全清，本地原味</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#B0A89C] shrink-0" />
                  </div>
                </div>

                {/* 中间麻将分隔装饰图标 */}
                <div className="flex items-center justify-center my-4">
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

              {/* 3. 最近战绩板块 */}
              <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-bold text-[#0E5C4E]">
                    最近战绩
                  </h2>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-[#8C857B] hover:text-[#0E5C4E] font-medium transition-colors"
                  >
                    查看全部
                  </button>
                </div>

                {/* 历史对局列表 */}
                <div className="space-y-3.5">
                  {historyList.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF]"
                    >
                      {/* 第一行：玩法标签 + 时间 + 共N局 */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                            item.type === '杭州麻将' 
                              ? 'border-[#0E5C4E] text-[#0E5C4E] bg-[#0E5C4E]/5' 
                              : 'border-[#C86328] text-[#C86328] bg-[#C86328]/5'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-[#8C857B]">
                            {item.date}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#C86328]">
                          共{item.totalRounds}局
                        </span>
                      </div>

                      {/* 第二行：本场时长 */}
                      <div className="flex justify-between items-center mt-2.5 text-xs">
                        <span className="text-[#8C857B]">本场时长</span>
                        <span className="font-semibold text-[#2C3531]">{item.duration}</span>
                      </div>

                      {/* 分隔线 */}
                      <div className="border-t border-[#F5EFE6] my-2.5"></div>

                      {/* 4位玩家输赢得分列表 */}
                      <div className="space-y-1.5">
                        {item.players.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-[#3A4440] font-medium">{p.name}</span>
                            <span className={`font-bold text-sm ${
                              p.score > 0 ? 'text-[#16A34A]' : 'text-[#2C3531]'
                            }`}>
                              {p.score > 0 ? `+${p.score}` : p.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </main>

            {/* 页面底部居中大按钮 */}
            <div className="sticky bottom-16 left-0 right-0 px-5 pt-2 pb-3 bg-gradient-to-t from-[#F8F3EB] via-[#F8F3EB]/90 to-transparent z-40">
              {activeGame ? (
                <button 
                  onClick={() => {
                    setScoreSubView('board');
                    setActiveTab('score');
                  }}
                  className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all hover:bg-[#0A473C]"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>进入进行中牌局 (第 {activeGame.rounds.length + 1} 轮)</span>
                </button>
              ) : (
                <button 
                  onClick={handleTryCreateGame}
                  className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all hover:bg-[#0A473C]"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>+ 开始记分</span>
                </button>
              )}
            </div>
          </>
        ) : (
          /* 【历史 / 统计】占位页面 */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#8C857B]">
            <p className="text-base font-bold text-[#0E5C4E] mb-2">
              {activeTab === 'history' ? '历史战绩页面' : '数据统计页面'}
            </p>
            <p className="text-xs">功能开发中，敬请期待...</p>
          </div>
        )}

        {/* 全局最底部 Tab 导航栏 */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#F0EADF] px-6 py-2 flex justify-around items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          {/* Tab 1: 首页 */}
          <button 
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-center justify-center space-y-1 text-xs"
          >
            <div className={`p-1 rounded-full ${activeTab === 'home' ? 'bg-[#EBF4F2] text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              <Home className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className={`font-bold ${activeTab === 'home' ? 'text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              首页
            </span>
          </button>

          {/* Tab 2: 记分 */}
          <button 
            onClick={() => {
              if (activeGame) {
                setScoreSubView('board');
              } else {
                setScoreSubView('create');
              }
              setActiveTab('score');
            }}
            className="flex flex-col items-center justify-center space-y-1 text-xs"
          >
            <div className={`p-1 rounded-full ${activeTab === 'score' ? 'bg-[#EBF4F2] text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              <Edit3 className="w-5 h-5 stroke-[2]" />
            </div>
            <span className={`font-bold ${activeTab === 'score' ? 'text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              记分
            </span>
          </button>

          {/* Tab 3: 历史 */}
          <button 
            onClick={() => setActiveTab('history')}
            className="flex flex-col items-center justify-center space-y-1 text-xs"
          >
            <div className={`p-1 rounded-full ${activeTab === 'history' ? 'bg-[#EBF4F2] text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
            <span className={`font-medium ${activeTab === 'history' ? 'text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              历史
            </span>
          </button>

          {/* Tab 4: 统计 */}
          <button 
            onClick={() => setActiveTab('stats')}
            className="flex flex-col items-center justify-center space-y-1 text-xs"
          >
            <div className={`p-1 rounded-full ${activeTab === 'stats' ? 'bg-[#EBF4F2] text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
            <span className={`font-medium ${activeTab === 'stats' ? 'text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              统计
            </span>
          </button>
        </nav>

        {/* 拦截弹窗：无法开启新牌局提示 */}
        {showActiveAlertModal && activeGame && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#F0EADF]">
              <div className="w-12 h-12 rounded-full bg-[#FAF0E6] border border-[#F2D7C4] text-[#C86328] flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-[#0E5C4E] mb-2 text-center">
                已有进行中的牌局
              </h3>
              <p className="text-xs text-[#8C857B] text-center mb-6 leading-relaxed">
                当前有一场【{activeGame.rule}】正在进行中（已记录 {activeGame.rounds.length} 轮）。<br />
                按照规则，必须先在记分盘中点击【结束牌局】完成最终结算，方可开启新的牌局。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowActiveAlertModal(false)}
                  className="flex-1 py-3 bg-[#EFE8DD] text-[#5A5248] rounded-full text-xs font-bold active:scale-95 transition-all"
                >
                  留在首页
                </button>
                <button
                  onClick={() => {
                    setShowActiveAlertModal(false);
                    setScoreSubView('board');
                    setActiveTab('score');
                  }}
                  className="flex-1 py-3 bg-[#0E5C4E] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#0A473C] active:scale-95 transition-all"
                >
                  进入当前牌局
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
