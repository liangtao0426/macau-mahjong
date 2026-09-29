import { useMemo, useState, useEffect, MouseEvent } from 'react';
import { Calendar, ChevronDown, Trash2 } from 'lucide-react';
import { GameData, MatchRecord, RuleFilter } from '../../types';
import { getRecordYearMonth, formatGameDate } from '../../utils/dateUtils';

interface HistoryViewProps {
  historyList: MatchRecord[];
  activeGame: GameData | null;
  activeGameScores: Record<string, number>;
  selectedYear: number;
  selectedMonth: number;
  historyRuleFilter: RuleFilter;
  onRuleFilterChange: (rule: RuleFilter) => void;
  onOpenMonthPicker: () => void;
  onEnterActiveGame: () => void;
  onDeleteHistory: (id: string, e?: MouseEvent) => void;
}

export default function HistoryView({
  historyList,
  activeGame,
  activeGameScores,
  selectedYear,
  selectedMonth,
  historyRuleFilter,
  onRuleFilterChange,
  onOpenMonthPicker,
  onEnterActiveGame,
  onDeleteHistory,
}: HistoryViewProps) {
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

  // 计算历史页面第一张卡片的 ID（若有包含轮数明细的进行中对局则优先作为第一张，否则为当前筛选出的第一场历史对局）
  const firstHistoryCardId = useMemo(() => {
    if (isActiveGameMatching && activeGame && activeGame.rounds && activeGame.rounds.length > 0) {
      return activeGame.id;
    }
    const firstWithRounds = filteredHistory.find((item) => item.rounds && item.rounds.length > 0);
    return firstWithRounds ? firstWithRounds.id : (filteredHistory[0]?.id || null);
  }, [isActiveGameMatching, activeGame, filteredHistory]);

  // 控制历史页面中各对局卡片明细的展开/折叠状态（默认第一张卡片展开，其余卡片收起）
  const [expandedHistoryCardIds, setExpandedHistoryCardIds] = useState<Record<string, boolean>>({});

  // 当在历史页面中切换玩法或年月筛选时，重置展开状态使当前筛选结果的第一张卡片默认展开
  useEffect(() => {
    setExpandedHistoryCardIds({});
  }, [historyRuleFilter, selectedYear, selectedMonth]);

  // 判断指定卡片当前是否处于展开状态（未手动操作过的卡片：仅第一张默认展开，其余默认收起）
  const isCardExpanded = (id: string) => {
    if (expandedHistoryCardIds[id] !== undefined) {
      return expandedHistoryCardIds[id];
    }
    return id === firstHistoryCardId;
  };

  // 切换指定卡片的明细展开/收起
  const toggleHistoryCard = (id: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const currentExpanded = isCardExpanded(id);
    setExpandedHistoryCardIds((prev) => ({
      ...prev,
      [id]: !currentExpanded,
    }));
  };

  return (
    <div className="flex-1 flex flex-col pb-safe-content">
      {/* 顶部标题区 */}
      <div className="px-6 header-safe-top pb-3">
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
          onClick={onOpenMonthPicker}
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
                onClick={() => onRuleFilterChange(tab)}
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
            onClick={onEnterActiveGame}
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
                    <span>{isCardExpanded(activeGame.id) ? '收起明细' : '展开明细'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${
                        isCardExpanded(activeGame.id) ? 'rotate-180 text-[#0E5C4E]' : ''
                      }`}
                    />
                  </button>
                </div>

                {isCardExpanded(activeGame.id) && (
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
                  onClick={(e) => onDeleteHistory(item.id, e)}
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
                    <span>{isCardExpanded(item.id) ? '收起明细' : '展开明细'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${
                        isCardExpanded(item.id) ? 'rotate-180 text-[#0E5C4E]' : ''
                      }`}
                    />
                  </button>
                </div>

                {isCardExpanded(item.id) && (
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
    </div>
  );
}
