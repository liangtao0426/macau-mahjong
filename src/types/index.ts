import { RoundRecord, Player, GameData } from '../components/GameBoard';

export type GameRule = '杭州麻将' | '诸暨麻将';
export type RuleFilter = '全部' | '杭州' | '诸暨';
export type AppTab = 'home' | 'score' | 'history' | 'stats';
export type ScoreSubView = 'create' | 'board';

export interface PlayerScore {
  name: string;
  score: number;
  seat?: string;
  avatarIndex?: number;
}

export interface MatchRecord {
  id: string;
  type: GameRule;
  date: string;
  totalRounds: number;
  duration: string;
  players: PlayerScore[];
  rounds?: RoundRecord[];
  timestamp?: number;
}

export interface WeeklyGameStat {
  week: string;
  games: number;
  percentage: number;
}

export interface PlayerRankStat {
  name: string;
  wins: number;
  matches: number;
  score: number;
}

export interface StatsData {
  totalMatches: number;
  totalRounds: number;
  topWinner: string;
  weeklyGames: WeeklyGameStat[];
  rankingList: PlayerRankStat[];
}

export type { RoundRecord, Player, GameData };
