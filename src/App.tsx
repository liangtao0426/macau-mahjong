import { useState } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Home, 
  Edit3, 
  Calendar, 
  TrendingUp
} from 'lucide-react';
import CreateGame from './components/CreateGame';

// 历史对局数据结构
interface PlayerScore {
  name: string;
  score: number;
}

interface MatchRecord {
  id: string;
  type: '杭州麻将' | '诸暨麻将';
  date: string;
  totalRounds: number;
  duration: string;
  players: PlayerScore[];
}

const mockHistoryData: MatchRecord[] = [
  {
    id: '1',
    type: '杭州麻将',
    date: '今天 15:42',
    totalRounds: 8,
    duration: '约2小时',
    players: [
      { name: '阿强', score: 84 },
      { name: '小美', score: -12 },
      { name: '老陈', score: -48 },
      { name: '我', score: -24 },
    ],
  },
  {
    id: '2',
    type: '诸暨麻将',
    date: '昨天 21:10',
    totalRounds: 12,
    duration: '约3小时',
    players: [
      { name: '桃子', score: -30 },
      { name: '老陈', score: 120 },
      { name: '小美', score: -50 },
      { name: '我', score: -40 },
    ],
  },
  {
    id: '3',
    type: '杭州麻将',
    date: '03月02日',
    totalRounds: 6,
    duration: '约1.5小时',
    players: [
      { name: '阿强', score: 12 },
      { name: '桃子', score: -18 },
      { name: '小美', score: 24 },
      { name: '我', score: -18 },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'score' | 'history' | 'stats'>('home');

  return (
    <div className="min-h-screen bg-[#F8F3EB] flex justify-center selection:bg-[#0E5C4E]/20">
      {/* 模拟手机容器 (Mobile Device Shell) */}
      <div className="w-full max-w-md bg-[#F8F3EB] flex flex-col min-h-screen relative pb-20 shadow-xl">
        
        {/* 根据当前 Tab 切换主视图 */}
        {activeTab === 'score' ? (
          /* 【记分 / 新建牌局】视图 */
          <CreateGame 
            onBack={() => setActiveTab('home')}
            onStartGame={(config) => {
              alert(`开启新牌局成功！\n规则：${config.rule}\n东南西北：${config.players.map(p => `${p.seat}:${p.name}`).join('、')}`);
            }}
          />
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
            <main className="flex-1 px-5 space-y-6">

              {/* 2. 选择牌局规则板块 */}
              <section>
                <h2 className="text-base font-bold text-[#0E5C4E] mb-3">
                  选择牌局规则
                </h2>

                <div className="space-y-3">
                  {/* 卡片1：杭州麻将 */}
                  <div 
                    onClick={() => setActiveTab('score')}
                    className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF] flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer hover:border-[#0E5C4E]/30"
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
                    onClick={() => setActiveTab('score')}
                    className="bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#F0EADF] flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer hover:border-[#C86328]/30"
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
                <div className="flex items-center justify-center my-5">
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
                  <h2 className="text-base font-bold text-[#0E5C4E]">
                    最近战绩
                  </h2>
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-[#8C857B] hover:text-[#0E5C4E] font-medium transition-colors"
                  >
                    查看全部
                  </button>
                </div>

                {/* 历史对局列表 */}
                <div className="space-y-3.5">
                  {mockHistoryData.map((item) => (
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
                        <span className="text-xs font-bold text-[#C86328]">
                          共{item.totalRounds}局
                        </span>
                      </div>

                      {/* 第二行：本场时长 */}
                      <div className="flex justify-between items-center mt-2.5 text-xs">
                        <span className="text-[#8C857B]">本场时长</span>
                        <span className="font-semibold text-[#2C3531]">{item.duration}</span>
                      </div>

                      {/* 分隔线 */}
                      <div className="border-t border-[#F5EFE6] my-2.5"></div>

                      {/* 4位玩家输赢得分列表 */}
                      <div className="space-y-1.5">
                        {item.players.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-[#3A4440] font-medium">{p.name}</span>
                            <span className={`font-bold text-sm ${
                              p.score > 0 ? 'text-[#16A34A]' : 'text-[#2C3531]'
                            }`}>
                              {p.score > 0 ? `+${p.score}` : p.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </main>

            {/* 页面底部居中大按钮 */}
            <div className="sticky bottom-16 left-0 right-0 px-5 pt-2 pb-3 bg-gradient-to-t from-[#F8F3EB] via-[#F8F3EB]/90 to-transparent z-40">
              <button 
                onClick={() => setActiveTab('score')}
                className="w-full py-3.5 bg-[#0E5C4E] text-white font-bold text-base rounded-full shadow-[0_6px_20px_rgba(14,92,78,0.25)] flex items-center justify-center space-x-2 active:scale-[0.98] transition-all hover:bg-[#0A473C]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>开始记分</span>
              </button>
            </div>
          </>
        ) : (
          /* 【历史 / 统计】占位页面 */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[#8C857B]">
            <p className="text-base font-bold text-[#0E5C4E] mb-2">
              {activeTab === 'history' ? '历史战绩页面' : '数据统计页面'}
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
            onClick={() => setActiveTab('score')}
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
            onClick={() => setActiveTab('history')}
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

      </div>
    </div>
  );
}
