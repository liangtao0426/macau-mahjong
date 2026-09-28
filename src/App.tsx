import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Home, 
  Edit3, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  Clock,
  Trash2,
  X
} from 'lucide-react';
import CreateGame from './components/CreateGame';
import GameBoard, { GameData, RoundRecord } from './components/GameBoard';
import { PLAYER_AVATARS } from './components/Avatars';

// 本地存储持久化 Key
const STORAGE_ACTIVE_GAME = 'mahjong_active_game';
const STORAGE_HISTORY_GAMES = 'mahjong_history_records';

// 历史对局年份从 2026 年开始，仅包含 2026 年及以后的年份
const START_YEAR = 2026;
const currentSystemYear = new Date().getFullYear();
const END_YEAR = Math.max(2031, currentSystemYear + 1);
const AVAILABLE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i
);
// 月份固定为 12 个月
const FIXED_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 历史对局数据结构
interface PlayerScore {
  name: string;
  score: number;
  seat?: string;
  avatarIndex?: number;
}

interface MatchRecord {
  id: string;
  type: '杭州麻将' | '诸暨麻将';
  date: string;
  totalRounds: number;
  duration: string;
  players: PlayerScore[];
  rounds?: RoundRecord[];
  timestamp?: number;
}

// 获取历史记录的年份与月份
const getRecordYearMonth = (item: MatchRecord): { year: number; month: number } => {
  if (item.timestamp) {
    const d = new Date(item.timestamp);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }
  if (item.id && item.id.startsWith('game_')) {
    const ts = parseInt(item.id.replace('game_', ''), 10);
    if (!isNaN(ts) && ts > 0) {
      const d = new Date(ts);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    }
  }
  const match = item.date.match(/(\d{1,2})月/);
  const m = match ? parseInt(match[1], 10) : new Date().getMonth() + 1;
  return { year: START_YEAR, month: m };
};

// 格式化时间与日期展示（如：03月05日 14:22）
const formatGameDate = (timestamp?: number) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

// 计算牌局时长
const getGameDuration = (startTime?: number, roundsCount = 0) => {
  if (startTime) {
    const minutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    if (minutes < 60) return `约${minutes}分钟`;
    const hours = (minutes / 60).toFixed(1).replace(/\.0$/, '');
    return `约${hours}小时`;
  }
  return roundsCount > 0 ? `约${Math.max(1, Math.round(roundsCount * 0.25))}小时` : '刚刚开启';
};

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

  // 历史战绩列表（持久化保存在本地，默认不含模拟数据）
  const [historyList, setHistoryList] = useState<MatchRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_HISTORY_GAMES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // 彻底清除历史中可能残留的旧模拟数据（如id为1/2/3的预设数据）
          return parsed.filter(
            (item: MatchRecord) => item.id !== '1' && item.id !== '2' && item.id !== '3'
          );
        }
      }
    } catch (e) {
      console.error('读取历史战绩失败', e);
    }
    return [];
  });

  // 历史牌局筛选：玩法筛选（全部 / 杭州 / 诸暨）
  const [historyRuleFilter, setHistoryRuleFilter] = useState<'全部' | '杭州' | '诸暨'>('全部');
  // 历史牌局筛选：年份与月份（年份从2026年起，月份固定1~12月，默认当前年月）
  const [selectedYear, setSelectedYear] = useState<number>(() => Math.max(START_YEAR, new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // 弹窗内部暂存的年月选中状态
  const [pickerYear, setPickerYear] = useState<number>(selectedYear);
  const [pickerMonth, setPickerMonth] = useState<number>(selectedMonth);

  // 每次进入历史页面时：默认选择“全部”玩法和“当前月份”
  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryRuleFilter('全部');
      const now = new Date();
      setSelectedYear(Math.max(START_YEAR, now.getFullYear()));
      setSelectedMonth(now.getMonth() + 1);
    }
  }, [activeTab]);

  // 根据当前玩法与年月过滤出的历史对局
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      // 玩法筛选：全部 / 杭州 / 诸暨
      if (historyRuleFilter === '杭州' && item.type !== '杭州麻将') return false;
      if (historyRuleFilter === '诸暨' && item.type !== '诸暨麻将') return false;

      // 年月筛选
      const { year, month } = getRecordYearMonth(item);
      if (year !== selectedYear || month !== selectedMonth) {
        return false;
      }
      return true;
    });
  }, [historyList, historyRuleFilter, selectedYear, selectedMonth]);

  // 进行中对局是否符合当前历史页的玩法与年月筛选
  const isActiveGameMatching = useMemo(() => {
    if (!activeGame) return false;
    if (historyRuleFilter === '杭州' && activeGame.rule !== '杭州麻将') return false;
    if (historyRuleFilter === '诸暨' && activeGame.rule !== '诸暨麻将') return false;

    const gameDate = activeGame.startTime ? new Date(activeGame.startTime) : new Date();
    const gameYear = gameDate.getFullYear();
    const gameMonth = gameDate.getMonth() + 1;
    if (gameYear !== selectedYear || gameMonth !== selectedMonth) {
      return false;
    }
    return true;
  }, [activeGame, historyRuleFilter, selectedYear, selectedMonth]);

  // 控制历史页面中各对局卡片每轮明细的展开/折叠状态（默认展开）
  const [collapsedHistoryCardIds, setCollapsedHistoryCardIds] = useState<Record<string, boolean>>({});

  const toggleHistoryCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCollapsedHistoryCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

    // 格式化当前时间与时长
    const roundCount = activeGame.rounds.length;
    const durationStr = getGameDuration(activeGame.startTime, roundCount);
    const dateStr = formatGameDate(activeGame.startTime);

    // 生成历史记录项（真实对局联动归档）
    const archivedItem: MatchRecord = {
      id: activeGame.id,
      type: activeGame.rule,
      date: dateStr,
      totalRounds: roundCount,
      duration: durationStr,
      players: activeGame.players.map((p, idx) => ({
        name: p.name,
        seat: p.seat,
        score: activeGameScores[p.name] || 0,
        avatarIndex: idx % PLAYER_AVATARS.length,
      })),
      rounds: activeGame.rounds,
      timestamp: activeGame.startTime || Date.now(),
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

  // 删除单条历史战绩
  const handleDeleteHistory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    try {
      localStorage.setItem(STORAGE_HISTORY_GAMES, JSON.stringify(updated));
    } catch (err) {
      console.error('更新历史记录失败', err);
    }
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
                            score > 0 ? 'text-rose-300' : score < 0 ? 'text-emerald-300' : 'text-white/90'
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
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-[#0E5C4E]">
                      最近战绩
                    </h2>
                    {activeGame && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
                        实时联动中
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-[#8C857B] hover:text-[#0E5C4E] font-medium transition-colors"
                  >
                    查看全部
                  </button>
                </div>

                {/* 战绩列表：优先展示正在记录的牌局（与记分盘实时联动），其次展示历史完成牌局 */}
                <div className="space-y-3.5">
                  {/* 1. 正在记录中的牌局卡片（与记分盘实时联动） */}
                  {activeGame && (
                    <div 
                      onClick={() => {
                        setScoreSubView('board');
                        setActiveTab('score');
                      }}
                      className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(14,92,78,0.08)] border-2 border-[#0E5C4E]/30 relative cursor-pointer active:scale-[0.99] transition-all hover:border-[#0E5C4E]"
                    >
                      {/* 第一行：玩法标签 + 实时状态 + 轮次 */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                            activeGame.rule === '杭州麻将' 
                              ? 'border-[#0E5C4E] text-[#0E5C4E] bg-[#0E5C4E]/5' 
                              : 'border-[#C86328] text-[#C86328] bg-[#C86328]/5'
                          }`}>
                            {activeGame.rule}
                          </span>
                          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                            <span>进行中 · 实时联动</span>
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#C86328]">
                          已记 {activeGame.rounds.length} 轮
                        </span>
                      </div>

                      {/* 第二行：时间与进入提示 */}
                      <div className="flex justify-between items-center mt-2.5 text-xs">
                        <span className="text-[#8C857B] flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-[#A0988C]" />
                          {formatGameDate(activeGame.startTime)} · {getGameDuration(activeGame.startTime, activeGame.rounds.length)}
                        </span>
                        <span className="text-xs font-bold text-[#0E5C4E] flex items-center">
                          继续记分 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                      </div>

                      {/* 分隔线 */}
                      <div className="border-t border-[#F5EFE6] my-2.5"></div>

                      {/* 4位玩家当前实时输赢得分列表（含头像与座位） */}
                      <div className="space-y-2">
                        {activeGame.players.map((p, idx) => {
                          const score = activeGameScores[p.name] || 0;
                          return (
                            <div key={p.name} className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#E8DFC8] bg-white shadow-2xs">
                                  {PLAYER_AVATARS[idx % PLAYER_AVATARS.length]}
                                </div>
                                <span className="text-[#3A4440] font-medium">
                                  {p.seat} · {p.name}
                                </span>
                              </div>
                              <span className={`font-bold text-sm ${
                                score > 0 ? 'text-[#DC2626]' : score < 0 ? 'text-[#16A34A]' : 'text-[#8C857B]'
                              }`}>
                                {score > 0 ? `+${score}` : score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. 已结束的历史对局列表 */}
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
                        <span className="text-xs font-bold text-[#8C857B]">
                          共 {item.totalRounds} 局
                        </span>
                      </div>

                      {/* 第二行：本场时长 */}
                      <div className="flex justify-between items-center mt-2.5 text-xs">
                        <span className="text-[#8C857B]">本场用时</span>
                        <span className="font-semibold text-[#2C3531]">{item.duration}</span>
                      </div>

                      {/* 分隔线 */}
                      <div className="border-t border-[#F5EFE6] my-2.5"></div>

                      {/* 4位玩家输赢得分列表（含头像） */}
                      <div className="space-y-2">
                        {item.players.map((p, idx) => {
                          const avatarIdx = p.avatarIndex ?? (idx % PLAYER_AVATARS.length);
                          return (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#E8DFC8] bg-white shadow-2xs">
                                  {PLAYER_AVATARS[avatarIdx]}
                                </div>
                                <span className="text-[#3A4440] font-medium">
                                  {p.seat ? `${p.seat} · ` : ''}{p.name}
                                </span>
                              </div>
                              <span className={`font-bold text-sm ${
                                p.score > 0 ? 'text-[#DC2626]' : p.score < 0 ? 'text-[#16A34A]' : 'text-[#8C857B]'
                              }`}>
                                {p.score > 0 ? `+${p.score}` : p.score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* 3. 无任何对局数据时的空状态 */}
                  {!activeGame && historyList.length === 0 && (
                    <div className="bg-white/70 rounded-2xl p-7 text-center border border-dashed border-[#E5DCD0]">
                      <div className="w-11 h-11 mx-auto mb-2 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C86328]">
                        <Calendar className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <p className="text-xs font-bold text-[#5A5248]">暂无战绩记录</p>
                      <p className="text-[11px] text-[#A0988C] mt-1">
                        开启牌局并记分后，将在此实时同步战绩
                      </p>
                    </div>
                  )}
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
        ) : activeTab === 'history' ? (
          /* 【历史牌局】视图：严格按照参考设计 UI 实现 */
          <div className="flex-1 flex flex-col pb-24">
            {/* 顶部标题区 */}
            <div className="px-6 pt-7 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#0E5C4E] tracking-tight">
                    历史牌局
                  </h1>
                  <p className="text-xs text-[#8C857B] mt-1 font-medium tracking-wide">
                    过往对局记录与历史账目
                  </p>
                </div>
                {/* 右侧国风装饰短线 */}
                <div className="flex items-center space-x-1 mt-2">
                  <span className="w-5 h-1.5 bg-[#C86328] rounded-full inline-block"></span>
                  <span className="w-3 h-1.5 bg-[#0E5C4E] rounded-full inline-block"></span>
                </div>
              </div>
            </div>

            {/* 筛选栏：左侧年月选择器，右侧全部/杭州/诸暨玩法筛选 */}
            <div className="px-5 mb-4 flex justify-between items-center">
              {/* 左侧年月选择胶囊 */}
              <button
                onClick={() => {
                  setPickerYear(selectedYear);
                  setPickerMonth(selectedMonth);
                  setShowMonthPicker(true);
                }}
                className="bg-[#EDF5F3] text-[#0E5C4E] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center shadow-2xs hover:bg-[#DFECE9] active:scale-95 transition-all"
              >
                <span>{selectedYear}年{selectedMonth}月</span>
                <Calendar className="w-3.5 h-3.5 ml-1.5 text-[#0E5C4E]" />
              </button>

              {/* 右侧玩法筛选胶囊组：全部、杭州、诸暨 */}
              <div className="flex items-center space-x-1.5">
                {(['全部', '杭州', '诸暨'] as const).map((tab) => {
                  const isActive = historyRuleFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setHistoryRuleFilter(tab)}
                      className={`px-3.5 py-1 rounded-full text-xs transition-all ${
                        isActive
                          ? 'bg-[#0E5C4E] text-white font-bold shadow-xs'
                          : 'bg-white text-[#8C857B] hover:text-[#0E5C4E] border border-transparent font-medium'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 对局卡片列表 */}
            <div className="px-5 space-y-3.5 flex-1">
              {/* 正在进行中的牌局（如果符合当前玩法与年月筛选） */}
              {isActiveGameMatching && activeGame && (
                  <div
                    onClick={() => {
                      setScoreSubView('board');
                      setActiveTab('score');
                    }}
                    className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-2 border-[#0E5C4E]/40 relative cursor-pointer active:scale-[0.99] transition-all hover:border-[#0E5C4E]"
                  >
                    {/* 卡片头部：玩法标签 + 进行中状态 + 日期时间 + 轮数 */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-lg font-bold border ${
                            activeGame.rule === '杭州麻将'
                              ? 'border-[#0E5C4E] text-[#0E5C4E] bg-white'
                              : 'border-[#C86328] text-[#C86328] bg-white'
                          }`}
                        >
                          {activeGame.rule}
                        </span>
                        <span className="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                          <span>进行中</span>
                        </span>
                        <span className="text-xs text-[#8C857B] font-medium">
                          {formatGameDate(activeGame.startTime)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#C86328]">
                        {activeGame.rounds.length}局
                      </span>
                    </div>

                    {/* 分隔线 */}
                    <div className="border-t border-[#F5EFE6] my-3"></div>

                    {/* 4 位玩家当前累计总得分横向排布 */}
                    <div className="grid grid-cols-4 gap-2 text-center py-0.5">
                      {activeGame.players.map((p) => {
                        const score = activeGameScores[p.name] || 0;
                        return (
                          <div key={p.name} className="truncate">
                            <div className="text-xs text-[#8C857B] font-medium truncate">
                              {p.name}
                            </div>
                            <div
                              className={`text-sm font-extrabold mt-1.5 ${
                                score > 0
                                  ? 'text-[#DC2626]'
                                  : score < 0
                                  ? 'text-[#16A34A]'
                                  : 'text-[#2C3531]'
                              }`}
                            >
                              {score > 0 ? `+${score}` : score}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 进行中牌局：每一轮具体输赢明细 */}
                    {activeGame.rounds && activeGame.rounds.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#F5EFE6]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-[#0E5C4E] flex items-center">
                            <span>每轮具体输赢</span>
                            <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                              已记 {activeGame.rounds.length} 轮
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleHistoryCard(activeGame.id, e)}
                            className="text-[11px] font-bold text-[#8C857B] hover:text-[#0E5C4E] flex items-center transition-colors"
                          >
                            <span>{!collapsedHistoryCardIds[activeGame.id] ? '收起明细' : '展开明细'}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${
                                !collapsedHistoryCardIds[activeGame.id] ? 'rotate-180 text-[#0E5C4E]' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {!collapsedHistoryCardIds[activeGame.id] && (
                          <div className="space-y-2 mt-2">
                            {activeGame.rounds.map((round) => (
                              <div
                                key={round.roundNumber}
                                className="bg-[#FAF7F2] rounded-xl p-2.5 border border-[#F0EADF]"
                              >
                                <div className="flex justify-between items-center mb-1.5 text-xs">
                                  <span className="font-bold text-[#2C3531]">
                                    第 {round.roundNumber} 轮
                                    {round.winnerName && (
                                      <span className="text-[11px] text-[#8C857B] font-normal ml-2">
                                        胡牌：{round.winnerName}
                                      </span>
                                    )}
                                  </span>
                                  {round.winScore > 0 && (
                                    <span className="bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      +{round.winScore}
                                    </span>
                                  )}
                                </div>

                                <div className="grid grid-cols-4 gap-1.5 text-center">
                                  {round.playerScores.map((ps) => (
                                    <div key={ps.name} className="truncate">
                                      <div className="text-[10px] text-[#8C857B] truncate">
                                        {ps.name}
                                      </div>
                                      <div
                                        className={`text-xs font-extrabold mt-0.5 ${
                                          ps.score > 0
                                            ? 'text-[#DC2626]'
                                            : ps.score < 0
                                            ? 'text-[#16A34A]'
                                            : 'text-[#8C857B]'
                                        }`}
                                      >
                                        {ps.score > 0 ? `+${ps.score}` : ps.score}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* 已完成的历史对局卡片列表 */}
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF] relative group"
                >
                  {/* 第一行：玩法标签 + 时间 + 共N局 */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold border ${
                          item.type === '杭州麻将'
                            ? 'border-[#0E5C4E] text-[#0E5C4E] bg-white'
                            : 'border-[#C86328] text-[#C86328] bg-white'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs text-[#8C857B] font-medium">
                        {item.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#C86328]">
                        {item.totalRounds}局
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="text-[#D5CDC2] hover:text-[#DC2626] transition-colors p-0.5"
                        title="删除此战绩"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 分割线 */}
                  <div className="border-t border-[#F5EFE6] my-3"></div>

                  {/* 4 位玩家全场总得分横向排布：姓名在上，得分在下，红赢绿输 */}
                  <div className="grid grid-cols-4 gap-2 text-center py-0.5">
                    {item.players.map((p, idx) => (
                      <div key={idx} className="truncate">
                        <div className="text-xs text-[#8C857B] font-medium truncate">
                          {p.name}
                        </div>
                        <div
                          className={`text-sm font-extrabold mt-1.5 ${
                            p.score > 0
                              ? 'text-[#DC2626]'
                              : p.score < 0
                              ? 'text-[#16A34A]'
                              : 'text-[#2C3531]'
                          }`}
                        >
                          {p.score > 0 ? `+${p.score}` : p.score}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 每一轮具体输赢明细板块 */}
                  {item.rounds && item.rounds.length > 0 ? (
                    <div className="mt-3 pt-2.5 border-t border-[#F5EFE6]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#0E5C4E] flex items-center">
                          <span>每轮具体输赢</span>
                          <span className="ml-1.5 text-[10px] bg-[#EBF4F2] text-[#0E5C4E] px-1.5 py-0.5 rounded-full font-bold">
                            共 {item.rounds.length} 轮
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleHistoryCard(item.id, e)}
                          className="text-[11px] font-bold text-[#8C857B] hover:text-[#0E5C4E] flex items-center transition-colors"
                        >
                          <span>{!collapsedHistoryCardIds[item.id] ? '收起明细' : '展开明细'}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${
                              !collapsedHistoryCardIds[item.id] ? 'rotate-180 text-[#0E5C4E]' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {!collapsedHistoryCardIds[item.id] && (
                        <div className="space-y-2 mt-2">
                          {item.rounds.map((round) => (
                            <div
                              key={round.roundNumber}
                              className="bg-[#FAF7F2] rounded-xl p-2.5 border border-[#F0EADF]"
                            >
                              <div className="flex justify-between items-center mb-1.5 text-xs">
                                <span className="font-bold text-[#2C3531]">
                                  第 {round.roundNumber} 轮
                                  {round.winnerName && (
                                    <span className="text-[11px] text-[#8C857B] font-normal ml-2">
                                      胡牌：{round.winnerName}
                                    </span>
                                  )}
                                </span>
                                {round.winScore > 0 && (
                                  <span className="bg-[#FEE2E2] text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    +{round.winScore}
                                  </span>
                                )}
                              </div>

                              {/* 4 位玩家此轮具体得分 */}
                              <div className="grid grid-cols-4 gap-1.5 text-center">
                                {round.playerScores.map((ps) => (
                                  <div key={ps.name} className="truncate">
                                    <div className="text-[10px] text-[#8C857B] truncate">
                                      {ps.name}
                                    </div>
                                    <div
                                      className={`text-xs font-extrabold mt-0.5 ${
                                        ps.score > 0
                                          ? 'text-[#DC2626]'
                                          : ps.score < 0
                                          ? 'text-[#16A34A]'
                                          : 'text-[#8C857B]'
                                      }`}
                                    >
                                      {ps.score > 0 ? `+${ps.score}` : ps.score}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}

              {/* 空状态 */}
              {!isActiveGameMatching && filteredHistory.length === 0 && (
                <div className="bg-white/70 rounded-2xl p-8 text-center border border-dashed border-[#E5DCD0] my-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#C86328]">
                    <Calendar className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <p className="text-sm font-bold text-[#5A5248]">暂无该条件的对局记录</p>
                  <p className="text-xs text-[#A0988C] mt-1">
                    切换筛选条件或开启新牌局体验记分
                  </p>
                </div>
              )}
            </div>

            {/* 年月筛选弹窗：年份与月份分开选择 */}
            {showMonthPicker && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">
                <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#F0EADF]">
                  {/* 弹窗头部 */}
                  <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#F5EFE6]">
                    <div>
                      <h3 className="text-sm font-bold text-[#0E5C4E]">按年月筛选对局</h3>
                      <p className="text-[11px] text-[#8C857B] mt-0.5">选择查看特定月份的历史对局</p>
                    </div>
                    <button
                      onClick={() => setShowMonthPicker(false)}
                      className="p-1 rounded-full text-[#8C857B] hover:text-[#2C3531] hover:bg-[#FAF7F2] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. 年份选择区（仅展示2026年及以后的年份） */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#5A5248]">年份（26年及以后）</span>
                      <span className="text-[11px] text-[#0E5C4E] font-bold">{pickerYear}年</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {AVAILABLE_YEARS.map((y) => (
                        <button
                          key={y}
                          type="button"
                          onClick={() => setPickerYear(y)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            pickerYear === y
                              ? 'bg-[#0E5C4E] text-white shadow-2xs scale-[1.02]'
                              : 'bg-[#FAF7F2] text-[#5A5248] hover:bg-[#EFE8DD]'
                          }`}
                        >
                          {y}年
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. 月份选择区（固定12个月） */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#5A5248]">月份</span>
                      <span className="text-[11px] text-[#0E5C4E] font-bold">{pickerMonth}月</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {FIXED_MONTHS.map((m) => {
                        const isSelected = pickerMonth === m;
                        const now = new Date();
                        const isCurrentMonth = now.getFullYear() === pickerYear && (now.getMonth() + 1) === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPickerMonth(m)}
                            className={`py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                              isSelected
                                ? 'bg-[#0E5C4E] text-white shadow-2xs scale-[1.02]'
                                : 'bg-[#FAF7F2] text-[#5A5248] hover:bg-[#EFE8DD]'
                            }`}
                          >
                            <span>{m}月</span>
                            {isCurrentMonth && (
                              <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-amber-300' : 'bg-[#C86328]'
                              }`} title="当前月" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 底部按钮栏 */}
                  <div className="flex space-x-2 pt-2 border-t border-[#F5EFE6]">
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setPickerYear(Math.max(START_YEAR, now.getFullYear()));
                        setPickerMonth(now.getMonth() + 1);
                      }}
                      className="py-2.5 px-3.5 rounded-xl text-xs font-bold text-[#0E5C4E] bg-[#EDF5F3] hover:bg-[#DFECE9] transition-all shrink-0"
                    >
                      当前月
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear(pickerYear);
                        setSelectedMonth(pickerMonth);
                        setShowMonthPicker(false);
                      }}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0E5C4E] hover:bg-[#0A473C] transition-all shadow-xs active:scale-[0.98]"
                    >
                      确定 ({pickerYear}年{pickerMonth}月)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 【统计】占位页面 */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#8C857B]">
            <p className="text-base font-bold text-[#0E5C4E] mb-2">
              数据统计页面
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
            onClick={() => {
              setHistoryRuleFilter('全部');
              const now = new Date();
              setSelectedYear(Math.max(START_YEAR, now.getFullYear()));
              setSelectedMonth(now.getMonth() + 1);
              setActiveTab('history');
            }}
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
