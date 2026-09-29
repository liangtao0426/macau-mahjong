import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { Home, Edit3, Calendar, TrendingUp } from 'lucide-react';

import CreateGame from './components/CreateGame';
import GameBoard from './components/GameBoard';
import { PLAYER_AVATARS } from './components/Avatars';
import HomeView from './components/views/HomeView';
import HistoryView from './components/views/HistoryView';
import StatsView from './components/views/StatsView';
import DatePickerModal from './components/DatePickerModal';
import ActiveAlertModal from './components/ActiveAlertModal';

import {
  AppTab,
  ScoreSubView,
  GameRule,
  RuleFilter,
  MatchRecord,
  GameData,
  RoundRecord,
  StatsData,
} from './types';
import {
  START_YEAR,
  getRecordYearMonth,
  formatGameDate,
  getGameDuration,
  scrollToTop,
} from './utils/dateUtils';

// 本地存储持久化 Key
const STORAGE_ACTIVE_GAME = 'mahjong_active_game';
const STORAGE_HISTORY_GAMES = 'mahjong_history_records';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  // 记分板块内部子页面：'create' 为新建牌局，'board' 为对局记分盘
  const [scoreSubView, setScoreSubView] = useState<ScoreSubView>('create');

  // 每次进入首页、记分、历史、统计等页面或切换子视图时，均自动滚动跳转到最顶部开始
  useEffect(() => {
    scrollToTop();
    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });
    const timerId = setTimeout(() => {
      scrollToTop();
    }, 20);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [activeTab, scoreSubView]);

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
  const [historyRuleFilter, setHistoryRuleFilter] = useState<RuleFilter>('全部');
  // 历史牌局筛选：年份与月份（年份从2026年起，月份固定1~12月，默认当前年月）
  const [selectedYear, setSelectedYear] = useState<number>(() => Math.max(START_YEAR, new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);

  // 统计页面筛选：年份与月份（默认当前年份与当前月份）
  const [statsYear, setStatsYear] = useState<number>(() => Math.max(START_YEAR, new Date().getFullYear()));
  const [statsMonth, setStatsMonth] = useState<number>(() => new Date().getMonth() + 1);

  // 年月弹窗显隐与针对的目标页面：'history' | 'stats'
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'history' | 'stats'>('history');

  // 无法开启新牌局的拦截提示弹窗
  const [showActiveAlertModal, setShowActiveAlertModal] = useState(false);

  // 新建牌局时预选的玩法规则（默认为杭州麻将，首页点击对应玩法卡片时联动）
  const [selectedCreateRule, setSelectedCreateRule] = useState<GameRule>('杭州麻将');

  // 每次进入历史页面时：默认选择“全部”玩法和“当前月份”
  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryRuleFilter('全部');
      const now = new Date();
      setSelectedYear(Math.max(START_YEAR, now.getFullYear()));
      setSelectedMonth(now.getMonth() + 1);
    }
  }, [activeTab]);

  // 每次进入统计页面时：默认选择“当前年份”与“当前月份”
  useEffect(() => {
    if (activeTab === 'stats') {
      const now = new Date();
      setStatsYear(Math.max(START_YEAR, now.getFullYear()));
      setStatsMonth(now.getMonth() + 1);
    }
  }, [activeTab]);

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

  // 统计页面真实数据汇总计算（彻底去除所有模拟假数据）
  const statsData: StatsData = useMemo(() => {
    const matches: MatchRecord[] = historyList.filter((item) => {
      const { year, month } = getRecordYearMonth(item);
      return year === statsYear && month === statsMonth;
    });

    // 如果当前有进行中牌局且属于当前统计年月，实时纳入统计
    if (activeGame && activeGame.rounds.length > 0) {
      const gameDate = activeGame.startTime ? new Date(activeGame.startTime) : new Date();
      if (gameDate.getFullYear() === statsYear && (gameDate.getMonth() + 1) === statsMonth) {
        matches.push({
          id: activeGame.id,
          type: activeGame.rule,
          date: formatGameDate(activeGame.startTime),
          totalRounds: activeGame.rounds.length,
          duration: getGameDuration(activeGame.startTime, activeGame.rounds.length),
          players: activeGame.players.map((p, idx) => ({
            name: p.name,
            score: activeGameScores[p.name] || 0,
            avatarIndex: idx % PLAYER_AVATARS.length,
          })),
          timestamp: activeGame.startTime || Date.now(),
        });
      }
    }

    const totalMatches = matches.length;
    let totalRounds = 0;
    const playerStatsMap: Record<string, { wins: number; matches: number; score: number }> = {};
    const weeklyCounts = [0, 0, 0, 0];

    matches.forEach((m) => {
      totalRounds += m.totalRounds || 0;
      const matchDate = m.timestamp ? new Date(m.timestamp) : new Date();
      const day = matchDate.getDate();
      const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
      weeklyCounts[weekIndex] += 1;

      m.players.forEach((p) => {
        if (!playerStatsMap[p.name]) {
          playerStatsMap[p.name] = { wins: 0, matches: 0, score: 0 };
        }
        playerStatsMap[p.name].matches += 1;
        playerStatsMap[p.name].score += p.score || 0;
        if (p.score > 0) {
          playerStatsMap[p.name].wins += 1;
        }
      });
    });

    const rankingList = Object.entries(playerStatsMap)
      .map(([name, data]) => ({
        name,
        wins: data.wins,
        matches: data.matches,
        score: data.score,
      }))
      .sort((a, b) => b.score - a.score);

    const topWinner = rankingList.length > 0 && rankingList[0].score > 0 ? rankingList[0].name : '暂无';

    const maxWeekly = Math.max(...weeklyCounts, 1);
    const weeklyGames = [
      { week: '第1周', games: weeklyCounts[0], percentage: weeklyCounts[0] > 0 ? Math.max(15, Math.round((weeklyCounts[0] / maxWeekly) * 85)) : 0 },
      { week: '第2周', games: weeklyCounts[1], percentage: weeklyCounts[1] > 0 ? Math.max(15, Math.round((weeklyCounts[1] / maxWeekly) * 85)) : 0 },
      { week: '第3周', games: weeklyCounts[2], percentage: weeklyCounts[2] > 0 ? Math.max(15, Math.round((weeklyCounts[2] / maxWeekly) * 85)) : 0 },
      { week: '第4周', games: weeklyCounts[3], percentage: weeklyCounts[3] > 0 ? Math.max(15, Math.round((weeklyCounts[3] / maxWeekly) * 85)) : 0 },
    ];

    return {
      totalMatches,
      totalRounds,
      topWinner,
      weeklyGames,
      rankingList,
    };
  }, [historyList, activeGame, activeGameScores, statsYear, statsMonth]);

  // 前往历史页面查看全部对局战绩
  const handleViewAllHistory = () => {
    setHistoryRuleFilter('全部');
    const now = new Date();
    setSelectedYear(Math.max(START_YEAR, now.getFullYear()));
    setSelectedMonth(now.getMonth() + 1);
    setActiveTab('history');
    scrollToTop();
  };

  // 首页“最近战绩”最多展示最近3场（若有进行中牌局占1场，则取历史前2场；否则取历史前3场）
  const maxRecentHistoryCount = activeGame ? 2 : 3;
  const recentHistoryList = useMemo(() => {
    return historyList.slice(0, maxRecentHistoryCount);
  }, [historyList, maxRecentHistoryCount]);
  const totalRecentMatches = (activeGame ? 1 : 0) + historyList.length;
  const hasMoreRecentMatches = totalRecentMatches > 3;

  // 尝试前往新建牌局（如果有正在进行的牌局，则拦截）
  const handleTryCreateGame = (rule?: GameRule) => {
    if (rule) {
      setSelectedCreateRule(rule);
    }
    if (activeGame) {
      setShowActiveAlertModal(true);
    } else {
      setScoreSubView('create');
      setActiveTab('score');
      scrollToTop();
    }
  };

  // 开启新牌局回调
  const handleStartNewGame = (config: {
    rule: GameRule;
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
    scrollToTop();
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

    const roundCount = activeGame.rounds.length;
    const durationStr = getGameDuration(activeGame.startTime, roundCount);
    const dateStr = formatGameDate(activeGame.startTime);

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

    const updatedHistory = [archivedItem, ...historyList];
    setHistoryList(updatedHistory);
    try {
      localStorage.setItem(STORAGE_HISTORY_GAMES, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('保存历史记录失败', e);
    }

    setActiveGame(null);
    setScoreSubView('create');
    setActiveTab('home');
    scrollToTop();
  };

  // 删除单条历史战绩
  const handleDeleteHistory = (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    try {
      localStorage.setItem(STORAGE_HISTORY_GAMES, JSON.stringify(updated));
    } catch (err) {
      console.error('更新历史记录失败', err);
    }
  };

  // 确认年月弹窗选择
  const handleConfirmDatePicker = (year: number, month: number) => {
    if (pickerTarget === 'stats') {
      setStatsYear(year);
      setStatsMonth(month);
    } else {
      setSelectedYear(year);
      setSelectedMonth(month);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F3EB] flex justify-center selection:bg-[#0E5C4E]/20">
      {/* 模拟手机容器 (Mobile Device Shell) */}
      <div className="w-full max-w-md bg-[#F8F3EB] flex flex-col min-h-screen min-h-[100dvh] relative shadow-xl">
        {/* 根据当前 Tab 切换主视图 */}
        {activeTab === 'score' ? (
          activeGame && scoreSubView === 'board' ? (
            <GameBoard
              game={activeGame}
              onBack={() => {
                setActiveTab('home');
                scrollToTop();
              }}
              onAddRound={handleAddRound}
              onEndGame={handleEndCurrentGame}
            />
          ) : (
            <CreateGame
              initialRule={selectedCreateRule}
              onBack={() => {
                setActiveTab('home');
                scrollToTop();
              }}
              onStartGame={handleStartNewGame}
            />
          )
        ) : activeTab === 'home' ? (
          <HomeView
            activeGame={activeGame}
            activeGameScores={activeGameScores}
            recentHistoryList={recentHistoryList}
            totalRecentMatches={totalRecentMatches}
            hasMoreRecentMatches={hasMoreRecentMatches}
            historyListLength={historyList.length}
            onSelectRule={(rule) => handleTryCreateGame(rule)}
            onEnterActiveGame={() => {
              setScoreSubView('board');
              setActiveTab('score');
              scrollToTop();
            }}
            onViewAllHistory={handleViewAllHistory}
            onStartScoring={() => handleTryCreateGame()}
          />
        ) : activeTab === 'history' ? (
          <HistoryView
            historyList={historyList}
            activeGame={activeGame}
            activeGameScores={activeGameScores}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            historyRuleFilter={historyRuleFilter}
            onRuleFilterChange={setHistoryRuleFilter}
            onOpenMonthPicker={() => {
              setPickerTarget('history');
              setShowMonthPicker(true);
            }}
            onEnterActiveGame={() => {
              setScoreSubView('board');
              setActiveTab('score');
              scrollToTop();
            }}
            onDeleteHistory={handleDeleteHistory}
          />
        ) : (
          <StatsView
            statsYear={statsYear}
            statsMonth={statsMonth}
            statsData={statsData}
            onOpenMonthPicker={() => {
              setPickerTarget('stats');
              setShowMonthPicker(true);
            }}
          />
        )}

        {/* 全局最底部 Tab 导航栏 */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-sm border-t border-[#F0EADF] px-6 pt-2 pb-safe-nav flex justify-around items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
          {/* Tab 1: 首页 */}
          <button
            onClick={() => {
              setActiveTab('home');
              scrollToTop();
            }}
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
              scrollToTop();
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
              scrollToTop();
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
            onClick={() => {
              const now = new Date();
              setStatsYear(Math.max(START_YEAR, now.getFullYear()));
              setStatsMonth(now.getMonth() + 1);
              setActiveTab('stats');
              scrollToTop();
            }}
            className="flex flex-col items-center justify-center space-y-1 text-xs"
          >
            <div className={`p-1 rounded-full ${activeTab === 'stats' ? 'bg-[#EBF4F2] text-[#0E5C4E]' : 'text-[#8C857B]'}`}>
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
            <span className={`${activeTab === 'stats' ? 'font-bold text-[#0E5C4E]' : 'font-medium text-[#8C857B]'}`}>
              统计
            </span>
          </button>
        </nav>

        {/* 拦截弹窗：无法开启新牌局提示 */}
        <ActiveAlertModal
          isOpen={showActiveAlertModal}
          activeGame={activeGame}
          onClose={() => setShowActiveAlertModal(false)}
          onEnterActiveGame={() => {
            setShowActiveAlertModal(false);
            setScoreSubView('board');
            setActiveTab('score');
            scrollToTop();
          }}
        />

        {/* 年月筛选全局弹窗：历史页面与统计页面共用同一套高品质 iOS 滚轮日历组件 */}
        <DatePickerModal
          isOpen={showMonthPicker}
          target={pickerTarget}
          initialYear={pickerTarget === 'stats' ? statsYear : selectedYear}
          initialMonth={pickerTarget === 'stats' ? statsMonth : selectedMonth}
          onConfirm={handleConfirmDatePicker}
          onClose={() => setShowMonthPicker(false)}
        />
      </div>
    </div>
  );
}
