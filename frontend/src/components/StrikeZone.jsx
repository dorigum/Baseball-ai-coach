import React from 'react';

const StrikeZone = ({ selectedZone, onZoneSelect }) => {
  // 스트라이크 존 3x3 정의 (번호: 1~9)
  const strikeZones = [
    { num: 1, row: 2, col: 2, label: '상좌' },
    { num: 2, row: 2, col: 3, label: '상중' },
    { num: 3, row: 2, col: 4, label: '상우' },
    { num: 4, row: 3, col: 2, label: '중좌' },
    { num: 5, row: 3, col: 3, label: '한가운데' },
    { num: 6, row: 3, col: 4, label: '중우' },
    { num: 7, row: 4, col: 2, label: '하좌' },
    { num: 8, row: 4, col: 3, label: '하중' },
    { num: 9, row: 4, col: 4, label: '하우' }
  ];

  // 외곽 볼 영역 4개 정의 (번호: 10~13)
  const ballZones = [
    { num: 10, style: { gridRow: '1', gridColumn: '2 / 5' }, label: '높은 볼' },
    { num: 11, style: { gridRow: '2 / 5', gridColumn: '5' }, label: '우측 볼' },
    { num: 12, style: { gridRow: '5', gridColumn: '2 / 5' }, label: '낮은 볼' },
    { num: 13, style: { gridRow: '2 / 5', gridColumn: '1' }, label: '좌측 볼' }
  ];

  const handleCellClick = (num) => {
    // 이미 선택된 존을 다시 누르면 해제
    if (selectedZone === num) {
      onZoneSelect(null);
    } else {
      onZoneSelect(num);
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center bg-slate-950/40 p-4 rounded-xl border border-white/5 w-full">
      <div className="flex justify-between items-center w-full mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🎯 투구 코스 선택 (Strike Zone)</span>
        <span className="text-[10px] text-emerald-400 font-bold font-sans">
          {selectedZone ? `${selectedZone}번 코스 선택됨` : '코스를 클릭하세요'}
        </span>
      </div>

      <div className="w-full max-w-[260px] aspect-square grid grid-cols-5 grid-rows-5 gap-1.5 p-1 relative select-none">
        {/* 모서리 빈 곳 데코레이션 */}
        <div className="grid-row-1 grid-column-1 flex items-center justify-center text-[9px] text-slate-700 font-extrabold uppercase font-sans">Ball</div>
        <div className="grid-row-1 grid-column-5 flex items-center justify-center text-[9px] text-slate-700 font-extrabold uppercase font-sans">Ball</div>
        <div className="grid-row-5 grid-column-1 flex items-center justify-center text-[9px] text-slate-700 font-extrabold uppercase font-sans">Ball</div>
        <div className="grid-row-5 grid-column-5 flex items-center justify-center text-[9px] text-slate-700 font-extrabold uppercase font-sans">Ball</div>

        {/* 1. 스트라이크 존 9분할 (1~9) */}
        {strikeZones.map((sz) => {
          const isSelected = selectedZone === sz.num;
          return (
            <button
              key={sz.num}
              type="button"
              style={{ gridRow: sz.row, gridColumn: sz.col }}
              onClick={() => handleCellClick(sz.num)}
              className={`flex flex-col items-center justify-center rounded border text-xs font-bold transition-all duration-150 active:scale-[0.97] ${
                isSelected
                  ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200'
              }`}
              title={`${sz.num}번: 스트라이크 (${sz.label})`}
            >
              <span className="text-[10px] font-black">{sz.num}</span>
            </button>
          );
        })}

        {/* 2. 외곽 볼 영역 4분할 (10~13) */}
        {ballZones.map((bz) => {
          const isSelected = selectedZone === bz.num;
          return (
            <button
              key={bz.num}
              type="button"
              style={bz.style}
              onClick={() => handleCellClick(bz.num)}
              className={`flex items-center justify-center rounded border text-[9px] font-extrabold transition-all duration-150 active:scale-[0.97] ${
                isSelected
                  ? 'bg-amber-500/30 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
              title={`${bz.num}번: 볼 (${bz.label})`}
            >
              <span>{bz.num}</span>
            </button>
          );
        })}
      </div>
      <div className="w-full text-center text-[9px] text-slate-500 font-semibold leading-relaxed mt-1">
        * 투수/포수 시점에서 바라보는 3x3 스트라이크 존(1~9) 및 상하좌우 볼 구역(10~13)
      </div>
    </div>
  );
};

export default StrikeZone;
