import React from 'react';
import StrikeZone from './StrikeZone';

const PlayInputPanel = ({
  gameInfo,
  setGameInfo,
  pitchInfo,
  setPitchInfo,
  count,
  onCountChange,
  runners,
  onRunnerToggle,
  onRunnerNameChange,
  hitLocation,
  onSubmitRecord,
  onTriggerAiAnalysis,
  showModal
}) => {
  const stadiums = [
    { name: '잠실 (LG/두산)', desc: '⚾ 매우 넓은 외야 (홈런 억제, 우중간 깊음)' },
    { name: '인천 SSG랜더스필드', desc: '🔥 홈런 공장 (짧은 좌우 펜스)' },
    { name: '사직 (롯데)', desc: '🧱 높은 펜스 (그린몬스터 스타일 장타 억제)' },
    { name: '고척스카이돔 (키움)', desc: '🏟️ 국내 유일 돔구장 (날씨 영향 없음, 타구 상승 억제)' },
    { name: '대구 삼성라이온즈파크', desc: '📐 팔각형 구장 (좌우중간 펜스가 짧아 홈런 다발)' },
    { name: '광주 기아챔피언스필드', desc: '⚖️ 표준형 구장 (투타 밸런스 균형)' },
    { name: '대전 한화생명이글스파크', desc: '🏹 외야 펜스 확장 (펜스 높고 보통 수준)' },
    { name: '창원 NC파크', desc: '🌟 메이저리그급 최신 설비 (보통)' },
    { name: '수원 KT위즈파크', desc: '💨 외야가 다소 짧아 홈런 발생률 보통 이상' }
  ];

  const kboTeams = ['LG', 'KIA', '두산', '삼성', 'SSG', '한화', 'KT', '롯데', 'NC', '키움', '기타'];

  const pitchTypes = [
    { label: '직구 (Fastball)', value: 'Fastball', color: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' },
    { label: '슬라이더 (Slider)', value: 'Slider', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30' },
    { label: '커브 (Curve)', value: 'Curve', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30' },
    { label: '체인지업 (Changeup)', value: 'Changeup', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40 hover:bg-purple-500/30' },
    { label: '스플리터 (Splitter)', value: 'Splitter', color: 'bg-teal-500/20 text-teal-400 border-teal-500/40 hover:bg-teal-500/30' },
    { label: '커터 (Cutter)', value: 'Cutter', color: 'bg-pink-500/20 text-pink-400 border-pink-500/40 hover:bg-pink-500/30' }
  ];

  const pitchResults = [
    { label: '헛스윙/스트라이크', value: 'Strike' },
    { label: '볼', value: 'Ball' },
    { label: '파울 (Foul)', value: 'Foul' },
    { label: '인플레이 타구', value: 'InPlay' }
  ];

  const playResults = [
    { label: '안타 (Single)', value: 'Single' },
    { label: '2루타 (Double)', value: 'Double' },
    { label: '3루타 (Triple)', value: 'Triple' },
    { label: '홈런 (Home Run)', value: 'HomeRun' },
    { label: '삼진 (Strikeout)', value: 'Strikeout' },
    { label: '볼넷 (Walk)', value: 'Walk' },
    { label: '땅볼 아웃 (Groundout)', value: 'Groundout' },
    { label: '플라이 아웃 (Flyout)', value: 'Flyout' },
    { label: '실책 (Error)', value: 'Error' }
  ];

  const handleCountToggle = (type) => {
    const maxVal = type === 'balls' ? 3 : type === 'strikes' ? 2 : 2;
    const nextVal = (count[type] + 1) % (maxVal + 1);
    onCountChange(type, nextVal);
  };

  const handleInputChange = (field, val) => {
    setPitchInfo((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'pitchResult' && val !== 'InPlay') {
        updated.playResult = '';
      }
      return updated;
    });
  };

  const handleGameInfoChange = (field, val) => {
    setGameInfo((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSave = () => {
    if (!pitchInfo.pitcherName || !pitchInfo.pitcherTeam || !pitchInfo.batterName || !pitchInfo.batterTeam) {
      showModal('⚠️ 입력 누락', '투수/타자 이름과 팀 정보를 모두 입력해주세요!', 'warning');
      return;
    }
    if (!pitchInfo.pitchType) {
      showModal('⚠️ 입력 누락', '구종을 선택해주세요!', 'warning');
      return;
    }
    if (pitchInfo.pitchZone === undefined || pitchInfo.pitchZone === null) {
      showModal('⚠️ 입력 누락', '투구 코스(스트라이크 존)를 선택해주세요!', 'warning');
      return;
    }
    if (!pitchInfo.pitchResult) {
      showModal('⚠️ 입력 누락', '투구 결과를 선택해주세요!', 'warning');
      return;
    }
    if (pitchInfo.pitchResult === 'InPlay' && !pitchInfo.playResult) {
      showModal('⚠️ 입력 누락', '인플레이 타구의 최종 결과를 선택해주세요!', 'warning');
      return;
    }

    onSubmitRecord();
  };

  const selectedStadiumDesc = stadiums.find(s => s.name === gameInfo.stadium)?.desc || '';

  // [NEW] 실시간 공수 팀 계산
  const isTop = gameInfo.inningHalf === '초';
  const attackingTeam = isTop ? gameInfo.opponentTeam : gameInfo.myTeam;
  const defendingTeam = isTop ? gameInfo.myTeam : gameInfo.opponentTeam;

  const standardTeams = ['LG', 'KIA', '두산', '삼성', 'SSG', '한화', 'KT', '롯데', 'NC', '키움'];
  const isMyTeamCustom = !standardTeams.includes(gameInfo.myTeam);
  const isOpponentTeamCustom = !standardTeams.includes(gameInfo.opponentTeam);
  const isPitcherTeamCustom = !standardTeams.includes(pitchInfo.pitcherTeam);
  const isBatterTeamCustom = !standardTeams.includes(pitchInfo.batterTeam);

  return (
    <div className="flex flex-col gap-5 w-full bg-slate-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">📊 경기 및 기록 입력기</h2>
        <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-white/5">
          실시간 피칭/배팅 분석
        </span>
      </div>

      {/* 경기 설정 섹션 */}
      <details className="bg-slate-950/40 p-4 rounded-xl border border-white/5 group" open>
        <summary className="text-xs font-bold text-emerald-400 cursor-pointer list-none flex items-center justify-between select-none">
          <span>🏟️ 경기 정보 설정 (구단 매칭 및 이닝 정보)</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-sans font-bold">
              {gameInfo.myTeam} vs {gameInfo.opponentTeam} | {gameInfo.inning}회{gameInfo.inningHalf}
            </span>
            <span className="text-[10px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
          </div>
        </summary>
        <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-white/5">
          {/* 날짜 및 구장 선택 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Date (날짜)</label>
              <input
                type="date"
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={gameInfo.date}
                onChange={(e) => handleGameInfoChange('date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Stadium (구장)</label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={gameInfo.stadium}
                onChange={(e) => handleGameInfoChange('stadium', e.target.value)}
              >
                {stadiums.map((s) => (
                  <option key={s.name} value={s.name}>{s.name.split(' ')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 우리 팀 vs 상대 팀 매칭 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">My Team (기준 구단)</label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                value={isMyTeamCustom ? '기타' : gameInfo.myTeam}
                onChange={(e) => handleGameInfoChange('myTeam', e.target.value)}
              >
                {kboTeams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {isMyTeamCustom && (
                <input
                  type="text"
                  placeholder="구단명 직접 입력"
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold mt-1.5 animate-fade-in"
                  value={gameInfo.myTeam === '기타' ? '' : gameInfo.myTeam}
                  onChange={(e) => handleGameInfoChange('myTeam', e.target.value || '기타')}
                />
              )}
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Opponent (상대 구단)</label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                value={isOpponentTeamCustom ? '기타' : gameInfo.opponentTeam}
                onChange={(e) => handleGameInfoChange('opponentTeam', e.target.value)}
              >
                {kboTeams.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {isOpponentTeamCustom && (
                <input
                  type="text"
                  placeholder="구단명 직접 입력"
                  className="w-full bg-slate-900 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold mt-1.5 animate-fade-in"
                  value={gameInfo.opponentTeam === '기타' ? '' : gameInfo.opponentTeam}
                  onChange={(e) => handleGameInfoChange('opponentTeam', e.target.value || '기타')}
                />
              )}
            </div>
          </div>

          {/* 이닝 선택 */}
          <div className="grid grid-cols-3 gap-3 items-end">
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Inning (이닝)</label>
              <select
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                value={gameInfo.inning}
                onChange={(e) => handleGameInfoChange('inning', parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>{num}이닝 (회)</option>
                ))}
              </select>
            </div>
            <div className="flex bg-slate-900 rounded-lg border border-white/10 p-0.5 h-[32px]">
              <button
                type="button"
                className={`flex-1 text-[10px] font-bold rounded ${
                  gameInfo.inningHalf === '초' 
                    ? 'bg-emerald-500 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => handleGameInfoChange('inningHalf', '초')}
              >
                초
              </button>
              <button
                type="button"
                className={`flex-1 text-[10px] font-bold rounded ${
                  gameInfo.inningHalf === '말' 
                    ? 'bg-emerald-500 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                onClick={() => handleGameInfoChange('inningHalf', '말')}
              >
                말
              </button>
            </div>
          </div>

          {/* [NEW] 공수 상태 실시간 피드백 뱃지 */}
          <div className="flex justify-between items-center bg-slate-950/80 border border-white/5 p-2.5 rounded-lg mt-1 select-none">
            <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">공수 교대 인디케이터</div>
            <div className="flex gap-2">
              <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold shadow-sm shadow-red-500/10">
                🔥 공격: {attackingTeam}
              </span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold shadow-sm shadow-emerald-500/10">
                🛡️ 수비: {defendingTeam}
              </span>
            </div>
          </div>
        </div>
        {selectedStadiumDesc && (
          <div className="mt-3 text-[10px] text-amber-400 font-medium bg-amber-950/20 px-2.5 py-1.5 rounded border border-amber-500/10">
            ℹ️ {selectedStadiumDesc}
          </div>
        )}
      </details>

      {/* 선수 입력 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Pitcher (투수)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="text"
              className="col-span-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
              placeholder="투수 이름"
              value={pitchInfo.pitcherName}
              onChange={(e) => handleInputChange('pitcherName', e.target.value)}
            />
            <select
              className="bg-slate-950/80 border border-white/10 rounded-xl px-1 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-semibold text-center font-mono"
              value={isPitcherTeamCustom ? '기타' : pitchInfo.pitcherTeam}
              onChange={(e) => handleInputChange('pitcherTeam', e.target.value)}
            >
              {kboTeams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {isPitcherTeamCustom && (
            <input
              type="text"
              placeholder="투수 팀 직접 입력"
              className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-semibold mt-1 animate-fade-in"
              value={pitchInfo.pitcherTeam === '기타' ? '' : pitchInfo.pitcherTeam}
              onChange={(e) => handleInputChange('pitcherTeam', e.target.value || '기타')}
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Batter (타자)</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="text"
              className="col-span-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
              placeholder="타자 이름"
              value={pitchInfo.batterName}
              onChange={(e) => handleInputChange('batterName', e.target.value)}
            />
            <select
              className="bg-slate-950/80 border border-white/10 rounded-xl px-1 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-semibold text-center font-mono"
              value={isBatterTeamCustom ? '기타' : pitchInfo.batterTeam}
              onChange={(e) => handleInputChange('batterTeam', e.target.value)}
            >
              {kboTeams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {isBatterTeamCustom && (
            <input
              type="text"
              placeholder="타자 팀 직접 입력"
              className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-semibold mt-1 animate-fade-in"
              value={pitchInfo.batterTeam === '기타' ? '' : pitchInfo.batterTeam}
              onChange={(e) => handleInputChange('batterTeam', e.target.value || '기타')}
            />
          )}
        </div>
      </div>

      {/* 전광판 볼카운트 및 주자 상황 */}
      <div className="grid grid-cols-2 gap-6 bg-slate-950/50 p-4 rounded-xl border border-white/5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SBO 카운트</span>
          <div className="flex flex-col gap-1.5 mt-1 font-mono font-bold text-sm">
            <div className="flex items-center gap-3">
              <span className="text-emerald-500 w-4 cursor-pointer" onClick={() => handleCountToggle('balls')}>B</span>
              <div className="flex gap-2">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => onCountChange('balls', count.balls >= idx ? idx - 1 : idx)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-all duration-200 ${
                      count.balls >= idx
                        ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-500 w-4 cursor-pointer" onClick={() => handleCountToggle('strikes')}>S</span>
              <div className="flex gap-2">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => onCountChange('strikes', count.strikes >= idx ? idx - 1 : idx)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-all duration-200 ${
                      count.strikes >= idx
                        ? 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-500 w-4 cursor-pointer" onClick={() => handleCountToggle('outs')}>O</span>
              <div className="flex gap-2">
                {[1, 2].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => onCountChange('outs', count.outs >= idx ? idx - 1 : idx)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-all duration-200 ${
                      count.outs >= idx
                        ? 'bg-red-500 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">주자 상황</span>
          <div className="flex flex-col gap-2.5 mt-1">
            {['first', 'second', 'third'].map((base, idx) => {
              const hasRunner = !!runners[base];
              return (
                <div key={base} className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer group text-slate-300 hover:text-white transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={hasRunner}
                      onChange={() => onRunnerToggle(base)}
                      className="rounded bg-slate-900 border-slate-700 text-orange-500 focus:ring-orange-500/20 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold w-11">{idx + 1}루 주자</span>
                  </label>
                  {hasRunner && (
                    <input
                      type="text"
                      placeholder="주자 이름"
                      className="bg-slate-950 border border-orange-500/30 rounded-lg px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-orange-500 font-bold w-24 placeholder-slate-700 animate-fade-in"
                      value={runners[base] === '주자' ? '' : runners[base]}
                      onChange={(e) => onRunnerNameChange(base, e.target.value || '주자')}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 구종 선택 및 구속 */}
      <div className="flex flex-col gap-3">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Pitch Type (구종)</label>
        <div className="grid grid-cols-3 gap-2">
          {(() => {
            const standardTypes = ['Fastball', 'Slider', 'Curve', 'Changeup', 'Splitter', 'Cutter'];
            const isCustomSelected = pitchInfo.pitchType && !standardTypes.includes(pitchInfo.pitchType);
            const pitchTypesExtended = [
              ...pitchTypes,
              { label: '기타 (직접 입력)', value: 'Etc', color: 'bg-slate-500/20 text-slate-400 border-slate-500/40 hover:bg-slate-500/30' }
            ];

            return pitchTypesExtended.map((p) => {
              const isSelected = p.value === 'Etc' 
                ? isCustomSelected 
                : pitchInfo.pitchType === p.value;

              return (
                <button
                  key={p.value}
                  type="button"
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                    isSelected 
                      ? 'border-emerald-400 bg-emerald-500/30 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                      : `${p.color} border-white/5`
                  }`}
                  onClick={() => {
                    if (p.value === 'Etc') {
                      handleInputChange('pitchType', '기타');
                    } else {
                      handleInputChange('pitchType', p.value);
                    }
                  }}
                >
                  {p.label.split(' ')[0]}
                </button>
              );
            });
          })()}
        </div>

        {/* 기타 구종 직접 입력 인풋 */}
        {(() => {
          const standardTypes = ['Fastball', 'Slider', 'Curve', 'Changeup', 'Splitter', 'Cutter'];
          const isCustomPitchType = pitchInfo.pitchType && !standardTypes.includes(pitchInfo.pitchType);
          
          return isCustomPitchType && (
            <input
              type="text"
              className="w-full bg-slate-950/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-xs font-semibold mt-1 animate-fade-in"
              placeholder="기타 구종 이름을 직접 입력하세요 (예: 포크볼, 싱커, 투심, 너클볼)"
              value={pitchInfo.pitchType === '기타' ? '' : pitchInfo.pitchType}
              onChange={(e) => handleInputChange('pitchType', e.target.value || '기타')}
            />
          );
        })()}

        <div className="mt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>Pitch Speed (구속)</span>
            <span className="text-emerald-400 font-bold font-mono">{pitchInfo.pitchSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="100"
            max="160"
            step="1"
            className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            value={pitchInfo.pitchSpeed}
          />
        </div>
        
        {/* [NEW] 스트라이크 존 13분할 투구 코스 선택 그리드 */}
        <StrikeZone
          selectedZone={pitchInfo.pitchZone}
          onZoneSelect={(zone) => handleInputChange('pitchZone', zone)}
        />
      </div>

      {/* 투구 결과 */}
      <div className="flex flex-col gap-3">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Pitch Result (투구 결과)</label>
        <div className="grid grid-cols-2 gap-2">
          {pitchResults.map((r) => {
            const isSelected = pitchInfo.pitchResult === r.value;
            return (
              <button
                key={r.value}
                type="button"
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 text-white shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-950/80 text-slate-400 border-white/5 hover:bg-slate-800'
                }`}
                onClick={() => handleInputChange('pitchResult', r.value)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 타격 결과 */}
      {pitchInfo.pitchResult === 'InPlay' && (
        <div className="flex flex-col gap-3 animate-fade-in">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Play Result (타석 최종 결과)</label>
            {hitLocation ? (
              <span className="text-[10px] text-amber-400 font-bold bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded">
                📍 좌표 선택됨: ({Math.round(hitLocation.x)}, {Math.round(hitLocation.y)})
              </span>
            ) : (
              <span className="text-[10px] text-rose-400 font-bold bg-rose-950/50 border border-rose-500/30 px-2 py-0.5 rounded">
                ⚠️ 야구장에서 낙하지점을 클릭하세요
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {playResults.map((pr) => {
              const isSelected = pitchInfo.playResult === pr.value;
              return (
                <button
                  key={pr.value}
                  type="button"
                  className={`py-2 px-1.5 rounded-lg border text-[11px] font-bold transition-all duration-150 ${
                    isSelected
                      ? 'border-orange-400 bg-orange-500/25 text-white shadow-[0_0_8px_rgba(249,115,22,0.2)]'
                      : 'bg-slate-950/60 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                  onClick={() => handleInputChange('playResult', pr.value)}
                >
                  {pr.label.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AI 전술 분석 실행 버튼 */}
      <button
        type="button"
        onClick={onTriggerAiAnalysis}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl border border-indigo-400/20 shadow-md hover:shadow-indigo-500/10 active:scale-[0.99] transition-all duration-150 text-sm flex items-center justify-center gap-2 mt-1"
      >
        🔮 AI 실시간 전술 분석 실행
      </button>

      {/* 저장 버튼 */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full mt-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-xl border border-emerald-400/20 shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] transition-all duration-150 text-sm flex items-center justify-center gap-2"
      >
        📥 투구 기록 추가 및 분석 반영
      </button>
    </div>
  );
};

export default PlayInputPanel;
