import { MatchRecord } from '../types';

// 历史对局年份从 2026 年开始，仅包含 2026 年及以后的年份
export const START_YEAR = 2026;
export const currentSystemYear = new Date().getFullYear();
export const END_YEAR = Math.max(2035, currentSystemYear + 5);
export const AVAILABLE_YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, i) => START_YEAR + i
);
// 年份滚轮单项高度
export const YEAR_ITEM_HEIGHT = 40;
// 月份固定为 12 个月
export const FIXED_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 获取历史记录的年份与月份
export const getRecordYearMonth = (item: MatchRecord): { year: number; month: number } => {
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
export const formatGameDate = (timestamp?: number): string => {
  const date = timestamp ? new Date(timestamp) : new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
};

// 计算牌局时长
export const getGameDuration = (startTime?: number, roundsCount = 0): string => {
  if (startTime) {
    const minutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    if (minutes < 60) return `约${minutes}分钟`;
    const hours = (minutes / 60).toFixed(1).replace(/\.0$/, '');
    return `约${hours}小时`;
  }
  return roundsCount > 0 ? `约${Math.max(1, Math.round(roundsCount * 0.25))}小时` : '刚刚开启';
};

// 滚动到页面最顶部辅助函数（同时重置 window 与 body/documentElement，确保全机型内核兼容）
export const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
};
