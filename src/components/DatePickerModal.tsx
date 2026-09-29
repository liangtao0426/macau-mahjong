import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import {
  START_YEAR,
  AVAILABLE_YEARS,
  YEAR_ITEM_HEIGHT,
  FIXED_MONTHS,
} from '../utils/dateUtils';

interface DatePickerModalProps {
  isOpen: boolean;
  target: 'history' | 'stats';
  initialYear: number;
  initialMonth: number;
  onConfirm: (year: number, month: number) => void;
  onClose: () => void;
}

export default function DatePickerModal({
  isOpen,
  target,
  initialYear,
  initialMonth,
  onConfirm,
  onClose,
}: DatePickerModalProps) {
  const [pickerYear, setPickerYear] = useState<number>(initialYear);
  const [pickerMonth, setPickerMonth] = useState<number>(initialMonth);
  const yearRollerRef = useRef<HTMLDivElement>(null);

  // 弹窗打开或外部传入初值变化时同步
  useEffect(() => {
    if (isOpen) {
      setPickerYear(initialYear);
      setPickerMonth(initialMonth);
      const targetYear = initialYear || Math.max(START_YEAR, new Date().getFullYear());
      const idx = AVAILABLE_YEARS.indexOf(targetYear);
      if (idx >= 0) {
        const timer = setTimeout(() => {
          if (yearRollerRef.current) {
            yearRollerRef.current.scrollTop = idx * YEAR_ITEM_HEIGHT;
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, initialYear, initialMonth]);

  // 处理年份滚轮滚动（吸附居中选中）
  const handleYearScroll = () => {
    if (!yearRollerRef.current) return;
    const scrollTop = yearRollerRef.current.scrollTop;
    const index = Math.round(scrollTop / YEAR_ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(AVAILABLE_YEARS.length - 1, index));
    const newYear = AVAILABLE_YEARS[clampedIndex];
    if (newYear && newYear !== pickerYear) {
      setPickerYear(newYear);
    }
  };

  // 点击某一特定年份，平滑滚动至滚轮中心并选中
  const handleYearItemClick = (y: number, idx: number) => {
    setPickerYear(y);
    if (yearRollerRef.current) {
      yearRollerRef.current.scrollTo({
        top: idx * YEAR_ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  };

  // 快捷重置回“当前月”与“今年”
  const handleResetToCurrent = () => {
    const now = new Date();
    const curYear = Math.max(START_YEAR, now.getFullYear());
    const curMonth = now.getMonth() + 1;
    setPickerYear(curYear);
    setPickerMonth(curMonth);
    const idx = AVAILABLE_YEARS.indexOf(curYear);
    if (idx >= 0 && yearRollerRef.current) {
      yearRollerRef.current.scrollTo({
        top: idx * YEAR_ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">
      <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150 border border-[#F0EADF] max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#F5EFE6]">
          <div>
            <h3 className="text-sm font-bold text-[#0E5C4E]">
              {target === 'stats' ? '按年月筛选统计' : '按年月筛选对局'}
            </h3>
            <p className="text-[11px] text-[#8C857B] mt-0.5">
              {target === 'stats' ? '选择查看特定月份的数据统计' : '选择查看特定月份的历史对局'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#8C857B] hover:text-[#2C3531] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. 年份滚轮选择区（iOS 滚轮样式，从2026年开始，上下滑动滚轮拨动年份） */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#5A5248]">年份（上下滑动滚轮）</span>
            <span className="text-xs text-[#0E5C4E] font-extrabold bg-[#EDF5F3] px-2.5 py-0.5 rounded-full">
              {pickerYear}年
            </span>
          </div>

          {/* 滚轮外部视口容器（高度固定为 3 项 = 120px） */}
          <div className="relative h-[120px] rounded-2xl bg-[#FAF7F2] border border-[#F0EADF] overflow-hidden">
            {/* 中间高亮瞄准框（居中位置 top: 40px, height: 40px） */}
            <div className="pointer-events-none absolute inset-x-2 top-[40px] h-[40px] rounded-xl bg-white border border-[#0E5C4E]/20 shadow-xs z-10 flex items-center justify-between px-3">
              <span className="text-[10px] text-[#0E5C4E]/40 font-bold">▲</span>
              <span className="text-[10px] text-[#0E5C4E]/40 font-bold">▼</span>
            </div>

            {/* 顶部与底部光影遮罩渐变层，增强 3D 滚轮立体感 */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[40px] bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40px] bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/80 to-transparent z-20" />

            {/* 内部真实滚动列表 */}
            <div
              ref={yearRollerRef}
              onScroll={handleYearScroll}
              className="h-full overflow-y-auto snap-y snap-mandatory py-[40px] no-scrollbar scroll-smooth relative z-10"
            >
              {AVAILABLE_YEARS.map((y, idx) => {
                const isSelected = pickerYear === y;
                const isCurrent = new Date().getFullYear() === y;
                return (
                  <div
                    key={y}
                    onClick={() => handleYearItemClick(y, idx)}
                    className={`h-[40px] flex items-center justify-center space-x-1.5 snap-center cursor-pointer select-none transition-all duration-150 ${
                      isSelected
                        ? 'text-[#0E5C4E] font-black text-base scale-105'
                        : 'text-[#8C857B] font-medium text-xs opacity-50 hover:opacity-80'
                    }`}
                  >
                    <span>{y}年</span>
                    {isCurrent && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-[#0E5C4E] text-white shadow-2xs'
                            : 'bg-[#E5DCD0] text-[#5A5248]'
                        }`}
                      >
                        今年
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
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
                    <span
                      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-[#C86328]'
                      }`}
                      title="当前月"
                    />
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
            onClick={handleResetToCurrent}
            className="py-2.5 px-3.5 rounded-xl text-xs font-bold text-[#0E5C4E] bg-[#EDF5F3] hover:bg-[#DFECE9] transition-all shrink-0 active:scale-95"
          >
            当前月
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(pickerYear, pickerMonth);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0E5C4E] hover:bg-[#0A473C] transition-all shadow-xs active:scale-[0.98]"
          >
            确定 ({pickerYear}年{pickerMonth}月)
          </button>
        </div>
      </div>
    </div>
  );
}
