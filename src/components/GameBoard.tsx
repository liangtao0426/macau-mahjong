import { useState, useMemo } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { PLAYER_AVATARS } from './Avatars';

export interface Player {
  seat: string; // '东' | '南' | '西' | '北' 或者 '1' | '2' | '3' | '4'
  name: string;
}

export interface RoundRecord {
  roundNumber: number;
  winnerName: string;
  winScore: number;
  playerScores: {
    seat: string;
    name: string;
    score: number;
  }[];
}

export interface GameData {
  id: string;
  name: string;
  rule: '杭州麻将' | '诸暨麻将';
  status: '进行中' | '已结束';
  players: Player[];
  rounds: RoundRecord[];
  startTime?: number;
  endTime?: number;
}

interface GameBoardProps {
  game: GameData;
  onBack: () => void;
  onAddRound: (round: RoundRecord) => void;
  onEndGame: () => void;
}

export default function GameBoard({ game, onBack, onAddRound, onEndGame }: GameBoardProps) {
  // 控制记录新一轮弹窗显隐
  const [showRecordModal, setShowRecordModal] = useState(false);
  // 控制结束对局确认弹窗显隐
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);

  // 4位玩家的本轮自定义分值输入（正负号 + 分值数值）
  const [playerRoundScores, setPlayerRoundScores] = useState<Record<string, { sign: '+' | '-'; score: string }>>({});

  // 计算每位玩家的总累计得分
  const cumulativeScores = useMemo(() => {
    const scoreMap: Record<string, number> = {};
    game.players.forEach((p) => {
      scoreMap[p.name] = 0;
    });

    game.rounds.forEach((round) => {
      round.playerScores.forEach((ps) => {
        scoreMap[ps.name] = (scoreMap[ps.name] || 0) + ps.score;
      });
    });

    return scoreMap;
  }, [game.players, game.rounds]);

  // 下一轮的编号
  const nextRoundNumber = game.rounds.length + 1;

  // 打开记分弹窗并初始化状态
  const handleOpenRecordModal = () => {
    const initial: Record<string, { sign: '+' | '-'; score: string }> = {};
    game.players.forEach((p) => {
      initial[p.name] = { sign: '+', score: '' };
    });
    setPlayerRoundScores(initial);
    setShowRecordModal(true);
  };

  // 切换某位玩家的正负号
  const handleToggleSign = (playerName: string) => {
    setPlayerRoundScores((prev) => {
      const current = prev[playerName] || { sign: '+', score: '' };
      return {
        ...prev,
        [playerName]: {
          ...current,
          sign: current.sign === '+' ? '-' : '+',
        },
      };
    });
  };

  // 修改某位玩家的输入分值
  const handleScoreChange = (playerName: string, val: string) => {
    setPlayerRoundScores((prev) => {
      const current = prev[playerName] || { sign: '+', score: '' };
      return {
        ...prev,
        [playerName]: {
          ...current,
          score: val,
        },
      };
    });
  };

  // 提交记录新一轮
  const handleSaveRound = () => {
    // 解析4位玩家的具体得失分
    const parsedScores = game.players.map((p) => {
      const item = playerRoundScores[p.name] || { sign: '+', score: '' };
      const num = Math.abs(Number(item.score)) || 0;
      const net = (item.sign === '-' ? -1 : 1) * num;
      return {
        seat: p.seat,
        name: p.name,
        score: net,
      };
    });

    const hasAnyScore = parsedScores.some((p) => p.score !== 0);
    if (!hasAnyScore) {
      alert('请至少输入一位玩家的得分');
      return;
    }

    // 自动判定赢家（分值大于0者为胡牌/赢牌玩家）
    const winners = parsedScores.filter((p) => p.score > 0);
    let winnerName = '荒牌 / 平局';
    let winScore = 0;

    if (winners.length > 0) {
      winnerName = winners.map((w) => w.name).join('、');
      winScore = Math.max(...winners.map((w) => w.score));
    }

    const newRound: RoundRecord = {
      roundNumber: nextRoundNumber,
      winnerName,
      winScore,
      playerScores: parsedScores,
    };

    onAddRound(newRound);
    setShowRecordModal(false);
  };

  return (
    <div className="flex flex-col flex-1 px-5 pt-7 pb-24">
      {/* 1. 顶部标题栏 & 返回 */}
      <div className="flex justify-between items-start mb-5">
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
              {game.rule}
            </h1>
          </div>
          <p className="text-xs text-[#8C857B] mt-1.5 ml-11 font-medium">
            {game.name} · 当前已进行 {game.rounds.length} 轮
          </p>
        </div>

        {/* 右上角结束牌局按钮与装饰短线 */}
        <div className="flex items-center space-x-2.5 mt-1">
          <button
            onClick={() => setShowEndConfirmModal(true)}
            className="px-3 py-1 bg-[#FAF0E6] text-[#C86328] hover:bg-[#F2D7C4] border border-[#F2D7C4] rounded-full text-xs font-bold transition-all active:scale-95 shadow-2xs"
          >
            结束牌局
          </button>
          <div className="flex items-center space-x-1">
            <span className="w-5 h-1.5 bg-[#C86328] rounded-full inline-block"></span>
            <span className="w-3 h-1.5 bg-[#0E5C4E] rounded-full inline-block"></span>
          </div>
        </div>
      </div>

      {/* 2. 牌局 A · 累计统计大卡片 (4人平铺带头像展示) */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF] mb-6">
        {/* 卡片头部 */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-[#0E5C4E]">
            {game.name} · 累计统计
          </h2>
          <span className="text-xs text-[#8C857B] font-medium">
            已完成 {game.rounds.length} 轮
          </span>
        </div>

        {/* 4 位玩家直接平铺展示（无需左右滑动），带上卡通头像 */}
        <div className="grid grid-cols-4 gap-2">
          {game.players.map((p, idx) => {
            const totalScore = cumulativeScores[p.name] || 0;
            return (
              <div
                key={p.name}
                className="bg-[#FAF7F2] rounded-xl p-2.5 flex flex-col items-center justify-center border border-[#F2ECE1] shadow-2xs"
              >
                {/* 对应卡通头像 */}
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-2xs border border-[#E8DFC8] mb-1.5 shrink-0 bg-white">
                  {PLAYER_AVATARS[idx % PLAYER_AVATARS.length]}
                </div>
                <span className="text-[11px] text-[#5A5248] font-bold truncate max-w-full leading-tight">
                  {p.seat} · {p.name}
                </span>
                <span
                  className={`text-base font-black my-0.5 tracking-tight ${
                    totalScore > 0
                      ? 'text-[#16A34A]'
                      : totalScore < 0
                      ? 'text-[#DC2626]'
                      : 'text-[#2C3531]'
                  }`}
                >
                  {totalScore > 0 ? `+${totalScore}` : totalScore}
                </span>
                <span className="text-[10px] text-[#A0988C] font-medium scale-90">本场累计</span>
              </div>
            );
          })}
        </div>

        {/* 卡片底部状态行 */}
        <div className="flex justify-between items-center mt-3.5 pt-3 border-t border-[#F5EFE6] text-xs">
          <span className="text-[#8C857B] truncate mr-2">
            当前状态：已完成 {game.rounds.length} 轮，下一步记录第 {nextRoundNumber} 轮
          </span>
          <span className="bg-[#E2F1ED] text-[#0E5C4E] px-2 py-0.5 rounded-md font-semibold text-[11px] shrink-0">
            {game.status}
          </span>
        </div>
      </div>

      {/* 3. 每轮输赢明细板块 */}
      <section className="flex-1">
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-base font-bold text-[#0E5C4E]">
            每轮输赢明细
          </h2>
          <span className="text-xs text-[#8C857B] font-medium">
            按时间顺序展示
          </span>
        </div>

        {/* 轮次卡片列表 */}
        {game.rounds.length > 0 ? (
          <div className="space-y-3.5">
            {game.rounds.map((round) => (
              <div
                key={round.roundNumber}
                className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF]"
              >
                {/* 轮次头部：轮次名称 + 胡牌者 + 赢分角标 */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[#2C3531]">
                      第 {round.roundNumber} 轮
                    </h3>
                    <p className="text-xs text-[#8C857B] mt-0.5 font-medium">
                      胡牌者：{round.winnerName}
                    </p>
                  </div>
                  <span className="bg-[#D1FAE5] text-[#059669] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    +{round.winScore}
                  </span>
                </div>

                {/* 内部玩家得失分明细浅色框 */}
                <div className="bg-[#FAF7F2] rounded-xl p-3.5 mt-3 space-y-2 border border-[#F3ECE0]">
                  {round.playerScores.map((ps) => (
                    <div
                      key={ps.name}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-[#3A4440] font-medium">
                        {ps.seat} · {ps.name}
                      </span>
                      <span
                        className={`font-bold ${
                          ps.score > 0
                            ? 'text-[#16A34A]'
                            : ps.score < 0
                            ? 'text-[#DC2626]'
                            : 'text-[#8C857B]'
                        }`}
                      >
                        {ps.score > 0 ? `+${ps.score}` : ps.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/60 border border-dashed border-[#E5DCD0] rounded-2xl p-8 text-center text-xs text-[#8C857B]">
            暂无轮次记录，点击下方“记录第 1 轮”开始记分！
          </div>
        )}
      </section>

      {/* 4. 底部居中操作大按钮 */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto px-5 pt-2 pb-3 bg-gradient-to-t from-[#F8F3EB] via-[#F8F3EB]/90 to-transparent z-40">
        <button
          onClick={handleOpenRecordModal}
          className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all hover:bg-[#0A473C]"
        >
          <span>记录第 {nextRoundNumber} 轮</span>
        </button>
      </div>

      {/* 5. 记录本轮明细弹窗 (Modal) - z-[80]层级且带pb-12，保证不被底部Tab遮挡 */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 z-[80] flex items-end justify-center transition-opacity">
          <div className="w-full max-w-md bg-[#FAF7F2] rounded-t-3xl p-6 pb-12 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0E5C4E]">
                  记录第 {nextRoundNumber} 轮
                </h3>
                <p className="text-xs text-[#8C857B] mt-0.5 font-medium">
                  直接输入每位牌友本轮的自定义得失分
                </p>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="w-8 h-8 rounded-full bg-[#EAE2D5] flex items-center justify-center text-[#5A5248] active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4位牌友列表：直接全部展示，包含对应卡通头像、正负号切换与自定义分值输入 */}
            <div className="space-y-3 mb-6">
              {game.players.map((p, idx) => {
                const item = playerRoundScores[p.name] || { sign: '+', score: '' };
                const isPositive = item.sign === '+';
                return (
                  <div
                    key={p.name}
                    className="bg-white rounded-2xl p-3 border border-[#F0EADF] flex items-center justify-between shadow-2xs"
                  >
                    {/* 左侧头像与玩家信息 */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#E8DFC8] bg-white shadow-2xs">
                        {PLAYER_AVATARS[idx % PLAYER_AVATARS.length]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#2C3531]">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#8C857B] font-medium">
                          座位 {p.seat}
                        </div>
                      </div>
                    </div>

                    {/* 右侧正负切换与自定义分值输入框 */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSign(p.name)}
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all active:scale-90 select-none shadow-2xs ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                        }`}
                        title="点击切换赢(+)或输(-)"
                      >
                        {item.sign}
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        value={item.score}
                        onChange={(e) => handleScoreChange(p.name, e.target.value)}
                        className={`w-24 bg-[#FAF7F2] border border-[#E8E0D2] rounded-xl px-3 py-2 text-center text-base font-extrabold outline-none focus:border-[#0E5C4E] focus:bg-white transition-all ${
                          item.score && isPositive
                            ? 'text-emerald-600'
                            : item.score && !isPositive
                            ? 'text-rose-600'
                            : 'text-[#2C3531]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 确认保存按钮 (置于pb-12内且z-[80]，完全高于底部Tab，绝不遮挡) */}
            <div className="pt-1">
              <button
                onClick={handleSaveRound}
                className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center active:scale-[0.98] transition-all hover:bg-[#0A473C]"
              >
                保存此轮记分
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 结束对局确认弹窗 */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[90] flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#F0EADF]">
            <h3 className="text-base font-bold text-[#0E5C4E] mb-2 text-center">
              确认结束本场牌局？
            </h3>
            <p className="text-xs text-[#8C857B] text-center mb-6 leading-relaxed">
              本场【{game.rule}】已完成 {game.rounds.length} 轮记分。<br />
              结束后将完成最终积分核算并保存到历史战绩中，无法再继续记录新轮次。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEndConfirmModal(false)}
                className="flex-1 py-3 bg-[#EFE8DD] text-[#5A5248] rounded-full text-xs font-bold active:scale-95 transition-all"
              >
                继续记分
              </button>
              <button
                onClick={() => {
                  setShowEndConfirmModal(false);
                  onEndGame();
                }}
                className="flex-1 py-3 bg-[#C86328] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#B3521B] active:scale-95 transition-all"
              >
                确认结束
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
