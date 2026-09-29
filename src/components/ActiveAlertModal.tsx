import { AlertCircle } from 'lucide-react';
import { GameData } from '../types';

interface ActiveAlertModalProps {
  isOpen: boolean;
  activeGame: GameData | null;
  onClose: () => void;
  onEnterActiveGame: () => void;
}

export default function ActiveAlertModal({
  isOpen,
  activeGame,
  onClose,
  onEnterActiveGame,
}: ActiveAlertModalProps) {
  if (!isOpen || !activeGame) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#F0EADF] max-h-[90vh] overflow-y-auto">
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
            onClick={onClose}
            className="flex-1 py-3 bg-[#EFE8DD] text-[#5A5248] rounded-full text-xs font-bold active:scale-95 transition-all"
          >
            留在首页
          </button>
          <button
            onClick={onEnterActiveGame}
            className="flex-1 py-3 bg-[#0E5C4E] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#0A473C] active:scale-95 transition-all"
          >
            进入当前牌局
          </button>
        </div>
      </div>
    </div>
  );
}
