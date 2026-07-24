import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = ({ 
  pitchLogs, 
  aiAdvice,
  defenders = {}, 
  onDefenderUpdate, 
  defendingTeam,
  battingOrder = [], // [NEW] 타순 데이터 수용
  onBattingOrderUpdate, // [NEW] 타순 편집 함수 수용
  attackingTeam, // [NEW] 공격팀 정보 수용
  currentBatterName // [NEW] 현재 타석 타자명 수용
}) => {
  // 구종별 색상 정의
  const COLORS = {
    Fastball: '#ef4444',
    Slider: '#3b82f6',
    Curve: '#f59e0b',
    Changeup: '#a855f7',
    Splitter: '#14b8a6',
    Cutter: '#ec4899'
  };

  // 수비진 라인업 수동 편집기 로컬 상태
  const [editingPos, setEditingPos] = useState(null);
  const [tempName, setTempName] = useState('');

  // [NEW] 공격 타순 수동 편집기 로컬 상태
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempBatterName, setTempBatterName] = useState('');

  const handleStartEdit = (pos, currentName) => {
    setEditingPos(pos);
    setTempName(currentName);
  };

  const handleSaveEdit = (pos) => {
    if (tempName.trim()) {
      onDefenderUpdate(pos, tempName.trim(), defendingTeam);
    }
    setEditingPos(null);
  };

  const handleKeyDown = (e, pos) => {
    if (e.key === 'Enter') {
      handleSaveEdit(pos);
    } else if (e.key === 'Escape') {
      setEditingPos(null);
    }
  };

  // [NEW] 타순 에디터 핸들러
  const handleStartBatterEdit = (idx, currentName) => {
    setEditingIndex(idx);
    setTempBatterName(currentName);
  };

  const handleSaveBatterEdit = (idx) => {
    if (tempBatterName.trim()) {
      onBattingOrderUpdate(idx, tempBatterName.trim());
    }
    setEditingIndex(null);
  };

  const handleBatterKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      handleSaveBatterEdit(idx);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const posLabels = {
    P: '투수', C: '포수', '1B': '1루수', '2B': '2루수', '3B': '3루수', 
    SS: '유격수', LF: '좌익수', CF: '중견수', RF: '우익수'
  };

  // 구종 카운트 통계 계산
  const getPitchTypeStats = () => {
    const stats = {};
    pitchLogs.forEach((log) => {
      stats[log.pitchType] = (stats[log.pitchType] || 0) + 1;
    });

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value
    }));
  };

  // 타격 결과 통계 계산
  const getPlayResultStats = () => {
    const stats = {};
    pitchLogs
      .filter((log) => log.pitchResult === 'InPlay' && log.playResult)
      .forEach((log) => {
        stats[log.playResult] = (stats[log.playResult] || 0) + 1;
      });

    return Object.entries(stats).map(([name, count]) => ({
      name,
      count
    }));
  };

  const pitchStatsData = getPitchTypeStats();
  const playStatsData = getPlayResultStats();

  // 타구 위치 데이터 (Scatter Chart용)
  const getHitLocations = () => {
    return pitchLogs
      .filter((log) => log.hitLocation)
      .map((log) => ({
        x: log.hitLocation.x,
        y: 500 - log.hitLocation.y,
        result: log.playResult || '타격',
        pitchType: log.pitchType,
        color: COLORS[log.pitchType] || '#8884d8'
      }));
  };

  const hitLocationsData = getHitLocations();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. AI 전술 분석 코치 패널 */}
      <div className="relative overflow-hidden bg-slate-900/80 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.05)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white text-lg">
            🤖
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">AI Coach Tactics Advice (실시간 AI 조언)</h3>
              <span className="text-[10px] text-emerald-500 font-bold bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-pulse">
                Gemini Live
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
              {aiAdvice || '기록을 입력하면 AI 코치가 투수/타자의 역량과 현재 상황을 종합 분석하여 구체적인 피칭 및 수비 시프트 전술을 실시간으로 추천해 드립니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* [NEW] 2. 실시간 공격 타순 설정 패널 (수동 교체 및 현재 타자 AT BAT 연동) */}
      <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            📋 실시간 공격 타순 설정 ({attackingTeam} 공격)
          </h3>
          <span className="text-[9px] text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20 select-none animate-pulse">
            타자명 클릭 시 대타/실시간 선수 교체
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {battingOrder.map((batter, idx) => {
            const isEditing = editingIndex === idx;
            // 현재 타석에 서 있는 타자인지 검사 (이름 비교)
            const isCurrentBatter = batter.name === currentBatterName;
            return (
              <div 
                key={idx} 
                className={`bg-slate-950/40 border rounded-xl p-2.5 flex flex-col gap-1 transition-all select-none ${
                  isCurrentBatter 
                    ? 'border-red-500/50 bg-red-950/15 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                    : 'border-white/5 hover:border-red-500/20 hover:bg-slate-900/40 cursor-pointer'
                } ${isEditing ? 'border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : ''}`}
                onClick={() => !isEditing && handleStartBatterEdit(idx, batter.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase font-mono">
                    {idx + 1}번 ({batter.position})
                  </span>
                  {isCurrentBatter ? (
                    <span className="text-[8px] bg-red-950 text-red-400 px-1 py-0.2 rounded font-bold border border-red-500/30 animate-pulse">
                      AT BAT
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-600">✏️</span>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    className="w-full bg-slate-900 border border-red-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none font-bold"
                    value={tempBatterName}
                    onChange={(e) => setTempBatterName(e.target.value)}
                    onBlur={() => handleSaveBatterEdit(idx)}
                    onKeyDown={(e) => handleBatterKeyDown(e, idx)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className={`text-xs font-extrabold truncate ${isCurrentBatter ? 'text-red-400' : 'text-slate-200'}`}>
                    {batter.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 실시간 수비 라인업 설정 패널 (수동 교체 지원) */}
      <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2.5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">📋 실시간 수비 라인업 설정 ({defendingTeam} 수비)</h3>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 select-none">
            선수명 클릭 시 대수비/투수 실시간 교체
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(defenders).map(([pos, info]) => {
            const isEditing = editingPos === pos;
            return (
              <div 
                key={pos} 
                className={`bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col gap-1 transition-all select-none ${
                  isEditing ? 'border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'hover:border-emerald-500/20 hover:bg-slate-900/40 cursor-pointer'
                }`}
                onClick={() => !isEditing && handleStartEdit(pos, info.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-500 font-extrabold uppercase font-mono">{pos} ({posLabels[pos]})</span>
                  <span className="text-[8px] text-slate-500">✏️</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    autoFocus
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none font-bold"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleSaveEdit(pos)}
                    onKeyDown={(e) => handleKeyDown(e, pos)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="text-xs font-extrabold text-slate-200 truncate">
                    {info.name} <span className="text-[9px] text-slate-500 font-semibold">({info.team})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 대시보드 시각화 차트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 구종 분포 파이 차트 */}
        <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider self-start mb-4">⚾ 구종 비율 분석 (Pitch Types)</h3>
          {pitchStatsData.length > 0 ? (
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pitchStatsData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pitchStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-300 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-56 text-xs text-slate-500 font-semibold">
              투구 기록이 쌓이면 파이 차트가 생성됩니다.
            </div>
          )}
        </div>

        {/* 타구 분포 시각화 2D Scatter Chart */}
        <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🎯 타구 스프레이 차트 (Spray Chart)</h3>
          {hitLocationsData.length > 0 ? (
            <div className="w-full h-56 bg-slate-950/40 rounded-xl border border-white/5 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <XAxis type="number" dataKey="x" name="X" domain={[0, 500]} hide />
                  <YAxis type="number" dataKey="y" name="Y" domain={[0, 500]} hide />
                  <ZAxis type="category" dataKey="result" name="결과" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs shadow-lg text-slate-200">
                            <p className="font-bold text-emerald-400 mb-1">{data.result}</p>
                            <p>구종: <span className="font-semibold text-white">{data.pitchType}</span></p>
                            <p>좌표: ({Math.round(data.x)}, {Math.round(500 - data.y)})</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Hits" data={hitLocationsData}>
                    {hitLocationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-56 text-xs text-slate-500 font-semibold">
              야구장을 클릭한 타구 기록이 쌓이면 스프레이 차트가 생성됩니다.
            </div>
          )}
        </div>

        {/* 타격 결과 바 차트 */}
        <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md md:col-span-2 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">📈 타격 결과 통계 (In-Play Results)</h3>
          {playStatsData.length > 0 ? (
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playStatsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#334155' }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {playStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#06b6d4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-slate-500 font-semibold">
              인플레이 타구 기록이 존재하지 않습니다.
            </div>
          )}
        </div>
      </div>

      {/* 5. 최근 투구 로그 리스트 */}
      <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">📋 최근 투구 세션 기록 ({pitchLogs.length}건)</h3>
        {pitchLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 font-semibold">
                  <th className="py-2.5 px-2">순번</th>
                  <th className="py-2.5 px-2">경기 정보 및 이닝</th>
                  <th className="py-2.5 px-2">투수/타자 (소속팀)</th>
                  <th className="py-2.5 px-2">구종</th>
                  <th className="py-2.5 px-2">구속</th>
                  <th className="py-2.5 px-2">투구 결과</th>
                  <th className="py-2.5 px-2 text-right">최종 아웃풋</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-200">
                {[...pitchLogs].reverse().slice(0, 5).map((log, idx) => {
                  const stadiumName = log.gameInfo?.stadium?.split(' ')[0] || '미지';
                  const myT = log.gameInfo?.myTeam || '우리';
                  const oppT = log.gameInfo?.opponentTeam || '상대';
                  const inn = log.gameInfo?.inning ? `${log.gameInfo.inning}회${log.gameInfo.inningHalf || '초'}` : '';
                  return (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-2 text-slate-500">#{pitchLogs.length - idx}</td>
                      <td className="py-2.5 px-2">
                        <div className="text-[10px] text-slate-400">{log.gameInfo?.date}</div>
                        <div className="text-[9px] text-amber-500 font-medium">
                          {stadiumName} ({myT} vs {oppT}) {inn}
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <span className="text-white">{log.pitcherName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({log.pitcherTeam})</span>
                        <span className="text-slate-500 font-normal"> vs </span>
                        <span className="text-white">{log.batterName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({log.batterTeam})</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] border"
                          style={{ 
                            backgroundColor: `${COLORS[log.pitchType]}15`, 
                            borderColor: `${COLORS[log.pitchType]}40`, 
                            color: COLORS[log.pitchType] 
                          }}
                        >
                          {log.pitchType}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-emerald-400">{log.pitchSpeed} km/h</td>
                      <td className="py-2.5 px-2">{log.pitchResult === 'InPlay' ? '인플레이' : log.pitchResult}</td>
                      <td className="py-2.5 px-2 text-right text-amber-400">{log.playResult || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-500 font-semibold">
            아직 입력된 투구 이력이 없습니다. 좌측에서 첫 번째 투구를 기록해 보세요!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
