import { Calendar, Crown } from 'lucide-react';
import { StatsData } from '../../types';

interface StatsViewProps {
  statsYear: number;
  statsMonth: number;
  statsData: StatsData;
  onOpenMonthPicker: () => void;
}

export default function StatsView({
  statsYear,
  statsMonth,
  statsData,
  onOpenMonthPicker,
}: StatsViewProps) {
  return (
    <div className="flex-1 flex flex-col pb-safe-content">
      {/* 1. 顶部标题栏 */}
      <div className="px-6 header-safe-top pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0E5C4E] tracking-tight">
              数据统计
            </h1>
            <p className="text-xs text-[#8C857B] mt-1 font-medium tracking-wide">
              月度雀神排行榜与出牌频次
            </p>
          </div>
          {/* 右侧国风装饰短线 */}
          <div className="flex items-center space-x-1 mt-2">
            <span className="w-5 h-1.5 bg-[#C86328] rounded-full inline-block"></span>
            <span className="w-3 h-1.5 bg-[#0E5C4E] rounded-full inline-block"></span>
          </div>
        </div>
      </div>

      {/* 2. 月份筛选栏 */}
      <div className="px-5 mb-4 flex justify-between items-center">
        <h2 className="text-base font-extrabold text-[#0E5C4E]">
          {statsYear}年{statsMonth}月统计
        </h2>
        <button
          onClick={onOpenMonthPicker}
          className="bg-white text-[#0E5C4E] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center border border-[#E8DFC8] shadow-2xs hover:bg-[#FAF7F2] active:scale-95 transition-all"
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#0E5C4E]" />
          <span>切换月份</span>
        </button>
      </div>

      {/* 3. 本月核心数据统计三卡片 */}
      <div className="px-5 grid grid-cols-3 gap-2.5 mb-4">
        {/* 本月场次 */}
        <div className="bg-white rounded-2xl p-3.5 text-center border border-[#F0EADF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#8C857B] font-medium">本月场次</div>
          <div className="text-lg font-black text-[#0E5C4E] mt-1.5 tracking-tight">
            {statsData.totalMatches}场
          </div>
        </div>

        {/* 总局数 */}
        <div className="bg-white rounded-2xl p-3.5 text-center border border-[#F0EADF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#8C857B] font-medium">总局数</div>
          <div className="text-lg font-black text-[#0E5C4E] mt-1.5 tracking-tight">
            {statsData.totalRounds}局
          </div>
        </div>

        {/* 最大赢家 */}
        <div className="bg-white rounded-2xl p-3.5 text-center border border-[#F0EADF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs text-[#8C857B] font-medium">最大赢家</div>
          <div className="text-lg font-black text-[#0E5C4E] mt-1.5 tracking-tight truncate">
            {statsData.topWinner}
          </div>
        </div>
      </div>

      {/* 4. 每周游戏场数柱状图卡片 */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-[#F0EADF] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="text-xs font-bold text-[#5A5248] mb-4">
            每周游戏场数
          </div>
          <div className="flex justify-around items-end h-[95px] px-2 pb-1">
            {statsData.weeklyGames.map((w) => (
              <div key={w.week} className="flex flex-col items-center w-12 group">
                {/* 柱子高度区域 */}
                <div className="w-full flex justify-center items-end h-[68px]">
                  {w.games > 0 ? (
                    <div
                      style={{ height: `${w.percentage}%` }}
                      className="w-6 bg-[#0E5C4E] rounded-t-md transition-all duration-300 relative group-hover:bg-[#0A473C]"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#0E5C4E] whitespace-nowrap bg-white/90 px-1 rounded shadow-2xs">
                        {w.games}场
                      </span>
                    </div>
                  ) : (
                    <div className="w-6 h-1 bg-[#E8DFC8]/60 rounded-full mb-0.5" />
                  )}
                </div>
                {/* 底部周标签 */}
                <span className="text-xs text-[#8C857B] font-medium mt-2">
                  {w.week}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. 国风小花纹分割线 */}
      <div className="px-5 my-3 relative flex items-center justify-center">
        <div className="border-t border-[#EFE8DD] w-full"></div>
        <div className="absolute bg-[#F8F3EB] px-2.5 flex items-center justify-center">
          <span className="text-[#C86328] text-sm select-none">🀄</span>
        </div>
      </div>

      {/* 6. 雀友大盘排行 */}
      <div className="px-5 pb-6">
        <h3 className="text-base font-extrabold text-[#0E5C4E] mb-3">
          雀友大盘排行
        </h3>
        {statsData.rankingList.length > 0 ? (
          <div className="space-y-2.5">
            {statsData.rankingList.map((player, idx) => {
              const isWinner = player.score > 0;
              const isLoser = player.score < 0;
              return (
                <div
                  key={player.name}
                  className={`rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-50/40 via-white to-white border border-[#FDE68A]'
                      : idx === 1
                      ? 'bg-gradient-to-r from-slate-50/50 via-white to-white border border-[#E2E8F0]'
                      : idx === 2
                      ? 'bg-gradient-to-r from-orange-50/30 via-white to-white border border-[#FED7AA]'
                      : 'bg-white border border-[#F0EADF]'
                  }`}
                >
                  {/* 左侧：排名专属徽标 + 姓名 + 胜负场次 */}
                  <div className="flex items-center space-x-3">
                    {idx === 0 ? (
                      /* 冠军专属徽标：金牌 + 皇冠 */
                      <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
                        <Crown className="w-3.5 h-3.5 text-[#F59E0B] fill-[#FDE047] absolute -top-2.5 left-1/2 -translate-x-1/2 drop-shadow-xs z-10" />
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FDE047] via-[#F59E0B] to-[#D97706] text-white font-black text-xs flex items-center justify-center shadow-[0_2px_8px_rgba(217,119,6,0.35)] ring-2 ring-[#FEF08A]/80">
                          1
                        </div>
                      </div>
                    ) : idx === 1 ? (
                      /* 亚军专属徽标：白金银牌 */
                      <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F1F5F9] via-[#94A3B8] to-[#475569] text-white font-black text-xs flex items-center justify-center shadow-[0_2px_8px_rgba(71,85,105,0.3)] ring-2 ring-[#E2E8F0]">
                          2
                        </div>
                      </div>
                    ) : idx === 2 ? (
                      /* 季军专属徽标：赤铜铜牌 */
                      <div className="relative shrink-0 flex items-center justify-center w-7 h-7">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FED7AA] via-[#EA580C] to-[#9A3412] text-white font-black text-xs flex items-center justify-center shadow-[0_2px_8px_rgba(154,52,18,0.3)] ring-2 ring-[#FFEDD5]">
                          3
                        </div>
                      </div>
                    ) : (
                      /* 第4名及以后：常规素雅米灰徽标 */
                      <div className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#8C857B] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#EFE8DD]">
                        {idx + 1}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-extrabold text-[#2C3531]">
                        {player.name}
                      </div>
                      <div className="text-[11px] text-[#8C857B] font-medium mt-0.5">
                        {player.wins}胜 / {player.matches}场
                      </div>
                    </div>
                  </div>

                  {/* 右侧：得分（根据用户确认的“红赢绿输”规则） */}
                  <div
                    className={`text-base font-black tracking-tight ${
                      isWinner
                        ? 'text-[#DC2626]'
                        : isLoser
                        ? 'text-[#16A34A]'
                        : 'text-[#8C857B]'
                    }`}
                  >
                    {player.score > 0 ? `+${player.score}` : player.score}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-[#F0EADF] text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="text-2xl mb-2 select-none">🀄</div>
            <div className="text-xs font-bold text-[#5A5248]">本月暂无牌局排行数据</div>
            <div className="text-[11px] text-[#8C857B] mt-1">牌局结算后，将自动在此生成雀友大盘战绩与排行</div>
          </div>
        )}
      </div>
    </div>
  );
}
