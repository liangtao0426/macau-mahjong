import { ChevronRight, Plus, Calendar, Clock } from 'lucide-react';
import { GameData, MatchRecord, GameRule } from '../../types';
import { PLAYER_AVATARS } from '../Avatars';
import { formatGameDate, getGameDuration } from '../../utils/dateUtils';

interface HomeViewProps {
  activeGame: GameData | null;
  activeGameScores: Record<string, number>;
  recentHistoryList: MatchRecord[];
  totalRecentMatches: number;
  hasMoreRecentMatches: boolean;
  historyListLength: number;
  onSelectRule: (rule: GameRule) => void;
  onEnterActiveGame: () => void;
  onViewAllHistory: () => void;
  onStartScoring: () => void;
}

export default function HomeView({
  activeGame,
  activeGameScores,
  recentHistoryList,
  totalRecentMatches,
  hasMoreRecentMatches,
  historyListLength,
  onSelectRule,
  onEnterActiveGame,
  onViewAllHistory,
  onStartScoring,
}: HomeViewProps) {
  return (
    <>
      {/* 顶部 APP 标题与 Slogan */}
      <div className="px-6 header-safe-top pb-4">
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

      {/* 主体内容区（留足悬浮按钮与 Tab 栏安全边距，确保滑到最底部时卡片内容完整露在悬浮按钮上方） */}
      <main className="flex-1 px-5 space-y-5 pb-safe-floating">
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
                    <div
                      className={`text-base font-extrabold mt-0.5 ${
                        score > 0
                          ? 'text-rose-300'
                          : score < 0
                          ? 'text-emerald-300'
                          : 'text-white/90'
                      }`}
                    >
                      {score > 0 ? `+${score}` : score}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 进入当前记分盘主按钮 */}
            <button
              onClick={onEnterActiveGame}
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
            <h2 className="text-base font-extrabold text-[#0E5C4E]">选择玩法</h2>
            <span className="text-xs text-[#8C857B] font-medium">地道本地雀局算法</span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* 杭州麻将卡片 */}
            <div
              onClick={() => onSelectRule('杭州麻将')}
              className="bg-white rounded-3xl p-4 border border-[#EAE3D7] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#0E5C4E]/40 cursor-pointer active:scale-95 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#E2F1ED] flex items-center justify-center text-[#0E5C4E] shadow-2xs">
                    <span className="text-xl font-black">杭</span>
                  </div>
                  <span className="text-[10px] bg-[#E2F1ED] text-[#0E5C4E] px-2 py-0.5 rounded-full font-bold">
                    主流经典
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#2C3531] mb-1 group-hover:text-[#0E5C4E] transition-colors">
                  杭州麻将
                </h3>
                <p className="text-[11px] text-[#A0988C] leading-relaxed">
                  标准杭麻 · 白板财神<br />
                  三摊承包，有财必敲，刺激多变
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-[#F5EFE6] flex items-center justify-between text-xs text-[#0E5C4E] font-bold">
                <span>立即开局</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* 诸暨麻将卡片 */}
            <div
              onClick={() => onSelectRule('诸暨麻将')}
              className="bg-white rounded-3xl p-4 border border-[#EAE3D7] shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#C86328]/40 cursor-pointer active:scale-95 transition-all group"
            >
              <div>
                <div className="flex justify-between items-start mb-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FBF0EA] flex items-center justify-center text-[#C86328] shadow-2xs">
                    <span className="text-xl font-black">诸</span>
                  </div>
                  <span className="text-[10px] bg-[#FBF0EA] text-[#C86328] px-2 py-0.5 rounded-full font-bold">
                    越地风味
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#2C3531] mb-1 group-hover:text-[#C86328] transition-colors">
                  诸暨麻将
                </h3>
                <p className="text-[11px] text-[#A0988C] leading-relaxed">
                  诸暨十三张 · 敲响包牌<br />
                  手翻财神，二台起步，小心点炮
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-[#F5EFE6] flex items-center justify-between text-xs text-[#C86328] font-bold">
                <span>立即开局</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. 最近战绩板块 */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-extrabold text-[#0E5C4E]">最近战绩</h2>
            <button
              onClick={onViewAllHistory}
              className="text-xs text-[#0E5C4E] hover:text-[#0A473C] font-semibold flex items-center transition-colors py-1 px-2 rounded-lg hover:bg-[#EBF4F2] active:scale-95"
            >
              <span>查看全部</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          {/* 战绩列表：优先展示正在记录的牌局（与记分盘实时联动），其次展示最近的历史完成牌局，最多展示3场 */}
          <div className="space-y-3.5">
            {/* 1. 正在记录中的牌局卡片（与记分盘实时联动） */}
            {activeGame && (
              <div
                onClick={onEnterActiveGame}
                className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(14,92,78,0.08)] border-2 border-[#0E5C4E]/30 relative cursor-pointer active:scale-[0.99] transition-all hover:border-[#0E5C4E]"
              >
                {/* 第一行：玩法标签 + 实时状态 + 轮次 */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                        activeGame.rule === '杭州麻将'
                          ? 'border-[#0E5C4E] text-[#0E5C4E] bg-[#0E5C4E]/5'
                          : 'border-[#C86328] text-[#C86328] bg-[#C86328]/5'
                      }`}
                    >
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
                    {formatGameDate(activeGame.startTime)} ·{' '}
                    {getGameDuration(activeGame.startTime, activeGame.rounds.length)}
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
                      <div
                        key={p.name}
                        className="flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#E8DFC8] bg-white shadow-2xs">
                            {PLAYER_AVATARS[idx % PLAYER_AVATARS.length]}
                          </div>
                          <span className="text-[#3A4440] font-medium">
                            {p.seat} · {p.name}
                          </span>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            score > 0
                              ? 'text-[#DC2626]'
                              : score < 0
                              ? 'text-[#16A34A]'
                              : 'text-[#8C857B]'
                          }`}
                        >
                          {score > 0 ? `+${score}` : score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. 最近已结束的历史对局列表（首页只展示最近三场） */}
            {recentHistoryList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF]"
              >
                {/* 第一行：玩法标签 + 时间 + 共N局 */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                        item.type === '杭州麻将'
                          ? 'border-[#0E5C4E] text-[#0E5C4E] bg-[#0E5C4E]/5'
                          : 'border-[#C86328] text-[#C86328] bg-[#C86328]/5'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-[#8C857B] font-medium">{item.date}</span>
                  </div>
                  <span className="text-xs font-bold text-[#C86328]">
                    共 {item.totalRounds} 局
                  </span>
                </div>

                {/* 分隔线 */}
                <div className="border-t border-[#F5EFE6] my-2.5"></div>

                {/* 4 位玩家全场总得分列表 */}
                <div className="space-y-2">
                  {item.players.map((p, idx) => {
                    const avatarIdx =
                      p.avatarIndex !== undefined ? p.avatarIndex : idx % PLAYER_AVATARS.length;
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-[#E8DFC8] bg-white shadow-2xs">
                            {PLAYER_AVATARS[avatarIdx % PLAYER_AVATARS.length]}
                          </div>
                          <span className="text-[#3A4440] font-medium">
                            {p.seat ? `${p.seat} · ` : ''}
                            {p.name}
                          </span>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            p.score > 0
                              ? 'text-[#DC2626]'
                              : p.score < 0
                              ? 'text-[#16A34A]'
                              : 'text-[#8C857B]'
                          }`}
                        >
                          {p.score > 0 ? `+${p.score}` : p.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 3. 查看全部更多历史战绩入口按钮（超出3场时底部显示） */}
            {hasMoreRecentMatches && (
              <button
                onClick={onViewAllHistory}
                className="w-full py-3 bg-white hover:bg-[#FAF7F2] rounded-2xl border border-[#F0EADF] text-[#0E5C4E] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs active:scale-[0.99] transition-all"
              >
                <span>查看全部历史战绩（共 {totalRecentMatches} 场）</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#0E5C4E]" />
              </button>
            )}

            {/* 4. 无任何对局数据时的空状态 */}
            {!activeGame && historyListLength === 0 && (
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

      {/* 页面底部居中大按钮：固定悬浮在底部导航栏上方，不随页面滑动发生任何位置偏移 */}
      <div className="fixed bottom-safe-action left-0 right-0 max-w-md mx-auto px-5 pt-2 pb-3 bg-gradient-to-t from-[#F8F3EB] via-[#F8F3EB]/90 to-transparent z-40 pointer-events-none">
        <div className="pointer-events-auto">
          {activeGame ? (
            <button
              onClick={onEnterActiveGame}
              className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all hover:bg-[#0A473C]"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>进入进行中牌局 (第 {activeGame.rounds.length + 1} 轮)</span>
            </button>
          ) : (
            <button
              onClick={onStartScoring}
              className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all hover:bg-[#0A473C]"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>开始记分</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
