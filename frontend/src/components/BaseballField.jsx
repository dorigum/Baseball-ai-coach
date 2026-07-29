import React, { useRef, useState } from 'react';

const BaseballField = ({ 
  positions, 
  onPositionChange, 
  runners, 
  onRunnerToggle, 
  hitLocation, 
  onHitLocationSelect,
  defenders = {},
  recommendedShift = 'STANDARD'
}) => {
  const svgRef = useRef(null);
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [hoveredField, setHoveredField] = useState(null);



  const renderRunnerLabel = (name, x, y) => {
    if (!name) return null;
    const width = Math.max(50, name.length * 11 + 10);
    const halfWidth = width / 2;
    return (
      <g transform={`translate(${x}, ${y})`} className="select-none pointer-events-none">
        <rect 
          x={-halfWidth} 
          y="-9" 
          width={width} 
          height="18" 
          rx="5" 
          fill="rgba(15, 23, 42, 0.9)" 
          stroke="#f97316" 
          strokeWidth="1.2" 
        />
        <text 
          x="0" 
          y="3" 
          textAnchor="middle" 
          fontSize="9.5" 
          fontWeight="900" 
          fill="#ffffff"
          className="font-sans"
        >
          {name}
        </text>
      </g>
    );
  };

  // 드래그 시작 (마우스)
  const handleMouseDown = (e, playerKey) => {
    e.preventDefault();
    setHoveredPlayer(null);
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    
    const handleMouseMove = (moveEvent) => {
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
      
      const viewboxX = Math.max(10, Math.min(490, (x / rect.width) * 500));
      const viewboxY = Math.max(10, Math.min(490, (y / rect.height) * 500));
      
      onPositionChange(playerKey, { x: viewboxX, y: viewboxY });
    };
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 드래그 시작 (터치)
  const handleTouchStart = (e, playerKey) => {
    setHoveredPlayer(null);
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    
    const handleTouchMove = (moveEvent) => {
      if (moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const viewboxX = Math.max(10, Math.min(490, (x / rect.width) * 500));
      const viewboxY = Math.max(10, Math.min(490, (y / rect.height) * 500));
      
      onPositionChange(playerKey, { x: viewboxX, y: viewboxY });
    };
    
    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
    
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  };

  // 마우스 호버 이벤트 핸들러
  const handlePlayerMouseEnter = (playerKey) => {
    const info = defenders[playerKey] || { name: '미지정', team: '미지정' };
    
    const positionNames = {
      P: '투수 (Pitcher)',
      C: '포수 (Catcher)',
      '1B': '1루수 (First Baseman)',
      '2B': '2루수 (Second Baseman)',
      '3B': '3루수 (Third Baseman)',
      SS: '유격수 (Shortstop)',
      LF: '좌익수 (Left Fielder)',
      CF: '중견수 (Center Fielder)',
      RF: '우익수 (Right Fielder)'
    };
    
    setHoveredPlayer({
      key: playerKey,
      fullName: positionNames[playerKey] || playerKey,
      name: info.name,
      team: info.team
    });
  };

  const handlePlayerMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 12
    });
  };

  const handlePlayerMouseLeave = () => {
    setHoveredPlayer(null);
  };

  const handleFieldMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const viewBoxX = Math.round((x / rect.width) * 500);
    const viewBoxY = Math.round((y / rect.height) * 500);
    
    if (e.target.closest('.defender-badge') || e.target.closest('rect[transform]')) {
      setHoveredField(null);
      return;
    }

    let zone = '⚾ 페어 지역 (Fair)';
    let color = '#34d399'; // emerald-400
    if (viewBoxX < 65 || viewBoxX > 435) {
      zone = '❌ 파울 지역 (Foul)';
      color = '#f87171'; // red-400
    } else if (viewBoxY < 45) {
      zone = '🏆 홈런 지역 (Home Run)';
      color = '#fbbf24'; // amber-400
    }

    setHoveredField({
      x: viewBoxX,
      y: viewBoxY,
      zone,
      color
    });
  };

  const handleFieldMouseLeave = () => {
    setHoveredField(null);
  };

  // 필드 클릭 시 타구 위치 선택
  const handleFieldClick = (e) => {
    if (e.target.closest('.defender-badge')) {
      return;
    }
    
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const viewboxX = (x / rect.width) * 500;
    const viewboxY = (y / rect.height) * 500;
    
    // 이미 찍힌 마커 근처(20px 내)를 다시 클릭하면 마커 해제
    if (hitLocation) {
      const dx = viewboxX - hitLocation.x;
      const dy = viewboxY - hitLocation.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 20) {
        onHitLocationSelect(null);
        return;
      }
    }
    
    onHitLocationSelect({ x: viewboxX, y: viewboxY });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">


      {/* 수비수 호버 툴팁 엘리먼트 */}
      {hoveredPlayer && (
        <div 
          className="absolute z-30 pointer-events-none bg-slate-950/95 border border-emerald-500/40 p-2.5 rounded-xl shadow-2xl text-xs flex flex-col gap-0.5 min-w-[130px] transition-all duration-75"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider">
            {hoveredPlayer.fullName}
          </span>
          <span className="text-white font-extrabold text-sm flex items-center gap-1.5">
            {hoveredPlayer.name}
            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 font-semibold">
              {hoveredPlayer.team}
            </span>
          </span>
        </div>
      )}

      <svg 
        ref={svgRef}
        viewBox="0 0 500 500" 
        className="w-full h-full cursor-crosshair select-none"
        onClick={handleFieldClick}
        onMouseMove={handleFieldMouseMove}
        onMouseLeave={handleFieldMouseLeave}
      >
        <defs>
          <radialGradient id="fieldGrass" cx="50%" cy="95%" r="85%" fx="50%" fy="95%">
            <stop offset="0%" stopColor="#0d3023" />
            <stop offset="70%" stopColor="#051f15" />
            <stop offset="100%" stopColor="#02110c" />
          </radialGradient>
          <radialGradient id="dirtInfield" cx="50%" cy="85%" r="35%">
            <stop offset="0%" stopColor="#3d2a1d" />
            <stop offset="85%" stopColor="#2c1e14" />
            <stop offset="100%" stopColor="#0a0503" />
          </radialGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="neonPulse" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 외야/내야 잔디 */}
        <path 
          d="M 50 450 A 280 280 0 0 1 450 450 Z" 
          fill="url(#fieldGrass)" 
          stroke="#10b981" 
          strokeWidth="1.5" 
          opacity="0.9"
        />

        {/* 흙 내야 흙길 */}
        <path 
          d="M 120 340 A 150 150 0 0 1 380 340 L 250 460 Z" 
          fill="url(#dirtInfield)" 
          stroke="#854d0e" 
          strokeWidth="1" 
          opacity="0.85"
        />

        {/* 내야 잔디 다이아몬드 */}
        <path 
          d="M 250 250 L 360 340 L 250 430 L 140 340 Z" 
          fill="#062e1e" 
          stroke="#059669" 
          strokeWidth="1.5" 
          opacity="0.8"
        />

        {/* [NEW] 홈런 및 파울 구역 시각화 오버레이 */}
        {/* 파울 지역 (FOUL ZONE) - 좌측 세로 가이드라인 및 음영 */}
        <line 
          x1="65" 
          y1="0" 
          x2="65" 
          y2="500" 
          stroke="#f87171" 
          strokeWidth="1.5" 
          strokeDasharray="4,4" 
          opacity="0.65" 
        />
        <rect 
          x="0" 
          y="0" 
          width="65" 
          height="500" 
          fill="rgba(239, 68, 68, 0.015)" 
          className="select-none pointer-events-none"
        />
        <text 
          x="32" 
          y="250" 
          textAnchor="middle" 
          fontSize="9" 
          fontWeight="bold" 
          fill="#f87171" 
          opacity="0.6"
          className="select-none pointer-events-none tracking-widest font-sans"
          transform="rotate(-90, 32, 250)"
        >
          ❌ 파울 지역 (FOUL)
        </text>

        {/* 파울 지역 (FOUL ZONE) - 우측 세로 가이드라인 및 음영 */}
        <line 
          x1="435" 
          y1="0" 
          x2="435" 
          y2="500" 
          stroke="#f87171" 
          strokeWidth="1.5" 
          strokeDasharray="4,4" 
          opacity="0.65" 
        />
        <rect 
          x="435" 
          y="0" 
          width="65" 
          height="500" 
          fill="rgba(239, 68, 68, 0.015)" 
          className="select-none pointer-events-none"
        />
        <text 
          x="468" 
          y="250" 
          textAnchor="middle" 
          fontSize="9" 
          fontWeight="bold" 
          fill="#f87171" 
          opacity="0.6"
          className="select-none pointer-events-none tracking-widest font-sans"
          transform="rotate(90, 468, 250)"
        >
          ❌ 파울 지역 (FOUL)
        </text>

        {/* 홈런 구역 (HR ZONE) - 가로 가이드라인 및 음영 */}
        <line 
          x1="65" 
          y1="45" 
          x2="435" 
          y2="45" 
          stroke="#fbbf24" 
          strokeWidth="2" 
          strokeDasharray="5,3" 
          opacity="0.8" 
        />
        <rect 
          x="65" 
          y="0" 
          width="370" 
          height="45" 
          fill="rgba(245, 158, 11, 0.04)" 
          className="select-none pointer-events-none"
        />
        <text 
          x="250" 
          y="28" 
          textAnchor="middle" 
          fontSize="9" 
          fontWeight="bold" 
          fill="#fbbf24" 
          opacity="0.95"
          className="select-none pointer-events-none tracking-widest font-sans"
        >
          🏆 홈런 구역 (HR ZONE)
        </text>

        {/* 파울 라인 */}
        <line x1="250" y1="460" x2="35" y2="245" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
        <line x1="250" y1="460" x2="465" y2="245" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

        {/* 외야 펜스 라인 */}
        <path 
          d="M 45 440 A 285 285 0 0 1 455 440" 
          fill="none" 
          stroke="#10b981" 
          strokeWidth="3" 
          strokeDasharray="6,4" 
          opacity="0.5" 
        />

        {/* 투수 마운드 */}
        <circle cx="250" cy="340" r="14" fill="#451a03" stroke="#d97706" strokeWidth="1" opacity="0.9" />
        <rect x="242" y="338" width="16" height="4" fill="#ffffff" rx="1" opacity="0.9" />

        {/* 베이스 경로 점선 */}
        <path 
          d="M 250 430 L 360 340 L 250 250 L 140 340 Z" 
          fill="none" 
          stroke="#ffffff" 
          strokeWidth="1.5" 
          strokeDasharray="4,4" 
          opacity="0.4"
        />

        {/* 홈 플레이트 */}
        <polygon 
          points="250,453 258,460 258,467 242,467 242,460" 
          fill="#ffffff" 
          stroke="#cbd5e1" 
          strokeWidth="1.5"
        />

        {/* 베이스 (루) */}
        <rect 
          x="353" y="333" width="14" height="14" 
          transform="rotate(45, 360, 340)" 
          fill={runners.first ? '#f97316' : '#ffffff'} 
          stroke={runners.first ? '#ffedd5' : '#94a3b8'} 
          strokeWidth="1.5" 
          filter={runners.first ? 'url(#neonPulse)' : ''}
          className="cursor-pointer transition-colors duration-200"
          onClick={(e) => { e.stopPropagation(); onRunnerToggle('first'); }}
        />
        <rect 
          x="243" y="243" width="14" height="14" 
          transform="rotate(45, 250, 250)" 
          fill={runners.second ? '#f97316' : '#ffffff'} 
          stroke={runners.second ? '#ffedd5' : '#94a3b8'} 
          strokeWidth="1.5" 
          filter={runners.second ? 'url(#neonPulse)' : ''}
          className="cursor-pointer transition-colors duration-200"
          onClick={(e) => { e.stopPropagation(); onRunnerToggle('second'); }}
        />
        <rect 
          x="133" y="333" width="14" height="14" 
          transform="rotate(45, 140, 340)" 
          fill={runners.third ? '#f97316' : '#ffffff'} 
          stroke={runners.third ? '#ffedd5' : '#94a3b8'} 
          strokeWidth="1.5" 
          filter={runners.third ? 'url(#neonPulse)' : ''}
          className="cursor-pointer transition-colors duration-200"
          onClick={(e) => { e.stopPropagation(); onRunnerToggle('third'); }}
        />

        {/* 주자 이름 라벨 */}
        {renderRunnerLabel(runners?.first, 405, 340)}
        {renderRunnerLabel(runners?.second, 250, 215)}
        {renderRunnerLabel(runners?.third, 95, 340)}

        {/* 타구 낙하지점 마커 */}
        {hitLocation && (
          <g filter="url(#neonPulse)">
            <circle cx={hitLocation.x} cy={hitLocation.y} r="14" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.6">
              <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle 
              cx={hitLocation.x} 
              cy={hitLocation.y} 
              r="7" 
              fill="#f59e0b" 
              stroke="#ffffff" 
              strokeWidth="2" 
            />
            <line x1={hitLocation.x - 3} y1={hitLocation.y} x2={hitLocation.x + 3} y2={hitLocation.y} stroke="#dc2626" strokeWidth="1" />
            <line x1={hitLocation.x} y1={hitLocation.y - 3} x2={hitLocation.x} y2={hitLocation.y + 3} stroke="#dc2626" strokeWidth="1" />
          </g>
        )}

        {/* [NEW] AI 권장 수비 시프트 점선 가이드 및 지시선 오버레이 */}
        {recommendedShift !== 'STANDARD' && (() => {
          const shiftCoordinates = {
            STANDARD: {
              P: { x: 250, y: 340 },
              C: { x: 250, y: 460 },
              '1B': { x: 360, y: 320 },
              '2B': { x: 300, y: 220 },
              '3B': { x: 140, y: 320 },
              SS: { x: 200, y: 220 },
              LF: { x: 120, y: 140 },
              CF: { x: 250, y: 90 },
              RF: { x: 380, y: 140 }
            },
            PULL_LEFT: {
              P: { x: 250, y: 340 },
              C: { x: 250, y: 460 },
              '1B': { x: 370, y: 340 },
              '2B': { x: 330, y: 240 },
              SS: { x: 230, y: 220 },
              '3B': { x: 170, y: 330 },
              LF: { x: 140, y: 150 },
              CF: { x: 270, y: 100 },
              RF: { x: 400, y: 150 }
            },
            PULL_RIGHT: {
              P: { x: 250, y: 340 },
              C: { x: 250, y: 460 },
              '1B': { x: 340, y: 330 },
              '2B': { x: 270, y: 220 },
              SS: { x: 170, y: 240 },
              '3B': { x: 130, y: 340 },
              LF: { x: 100, y: 150 },
              CF: { x: 230, y: 100 },
              RF: { x: 360, y: 150 }
            },
            BUNT: {
              P: { x: 250, y: 340 },
              C: { x: 250, y: 460 },
              '1B': { x: 340, y: 380 },
              '2B': { x: 300, y: 220 },
              '3B': { x: 160, y: 380 },
              SS: { x: 200, y: 220 },
              LF: { x: 120, y: 140 },
              CF: { x: 250, y: 90 },
              RF: { x: 380, y: 140 }
            },
            DEEP: {
              P: { x: 250, y: 340 },
              C: { x: 250, y: 460 },
              '1B': { x: 360, y: 320 },
              '2B': { x: 300, y: 220 },
              '3B': { x: 140, y: 320 },
              SS: { x: 200, y: 220 },
              LF: { x: 110, y: 100 },
              CF: { x: 250, y: 55 },
              RF: { x: 390, y: 100 }
            }
          };

          const guides = shiftCoordinates[recommendedShift];
          if (!guides) return null;
          
          return Object.entries(guides).map(([key, guide]) => {
            const currentPos = positions[key];
            if (!currentPos) return null;
            
            const dx = guide.x - currentPos.x;
            const dy = guide.y - currentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const showLine = distance > 15;

            return (
              <g key={`guide-${key}`} className="select-none pointer-events-none">
                {showLine && (
                  <line 
                    x1={currentPos.x} 
                    y1={currentPos.y} 
                    x2={guide.x} 
                    y2={guide.y} 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    strokeDasharray="3,3" 
                    opacity="0.3" 
                  />
                )}
                <circle 
                  cx={guide.x} 
                  cy={guide.y} 
                  r="12" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="1.5" 
                  strokeDasharray="2,2" 
                  opacity="0.5" 
                  filter="url(#neonGlow)"
                />
                <text 
                  x={guide.x} 
                  y={guide.y + 3.5} 
                  textAnchor="middle" 
                  fontSize="8.5" 
                  fontWeight="black" 
                  fill="#10b981" 
                  opacity="0.45"
                  className="font-sans"
                >
                  {key}
                </text>
              </g>
            );
          });
        })()}

        {/* 수비수 마커 */}
        {Object.entries(positions).map(([key, pos]) => (
          <g 
            key={key} 
            className="defender-badge group cursor-grab active:cursor-grabbing select-none"
            transform={`translate(${pos.x}, ${pos.y})`}
            onMouseDown={(e) => handleMouseDown(e, key)}
            onTouchStart={(e) => handleTouchStart(e, key)}
            onMouseEnter={() => handlePlayerMouseEnter(key)}
            onMouseMove={handlePlayerMouseMove}
            onMouseLeave={handlePlayerMouseLeave}
          >
            {/* 수비수 범위 원 */}
            <circle 
              cx="0" 
              cy="0" 
              r="22" 
              fill="rgba(16, 185, 129, 0.05)" 
              stroke="rgba(16, 185, 129, 0.2)" 
              strokeWidth="1" 
              strokeDasharray="2,2"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            />
            {/* 수비수 핀 원형 배경 */}
            <circle 
              cx="0" 
              cy="0" 
              r="12" 
              fill="#0f172a" 
              stroke="#10b981" 
              strokeWidth="2" 
              filter="url(#neonGlow)"
              className="group-hover:stroke-emerald-400 group-hover:fill-slate-900 transition-all duration-150"
            />
            {/* 수비수 직함 약어 텍스트 */}
            <text 
              x="0" 
              y="4" 
              textAnchor="middle" 
              fontSize="10" 
              fontWeight="bold" 
              fill="#34d399"
              className="group-hover:fill-emerald-300 font-sans pointer-events-none"
            >
              {key}
            </text>
          </g>
        ))}

        {/* [NEW] 선택된 타구 낙하지점의 상세 KBO 판정 말풍선 */}
        {hitLocation && (() => {
          let zoneText = 'Fair (페어)';
          let zoneColor = '#10b981'; // emerald-500
          let zoneBg = 'rgba(15, 23, 42, 0.95)';
          let zoneBorder = '#10b981';
          if (hitLocation.x < 65 || hitLocation.x > 435) {
            zoneText = 'Foul (파울)';
            zoneColor = '#ef4444'; // red-500
            zoneBorder = '#ef4444';
          } else if (hitLocation.y < 45) {
            zoneText = '🏆 Home Run (홈런)';
            zoneColor = '#fbbf24'; // amber-500
            zoneBorder = '#fbbf24';
          }

          return (
            <g transform={`translate(${hitLocation.x}, ${hitLocation.y - 20})`} className="select-none pointer-events-none animate-bounce">
              {/* 말풍선 핀 꼬리 */}
              <polygon points="-4,2 4,2 0,6" fill={zoneBg} stroke={zoneColor} strokeWidth="1" />
              {/* 말풍선 본체 */}
              <rect 
                x="-55" 
                y="-14" 
                width="110" 
                height="17" 
                rx="4" 
                fill={zoneBg} 
                stroke={zoneBorder} 
                strokeWidth="1.5" 
                filter="url(#neonPulse)"
              />
              <text 
                x="0" 
                y="-2" 
                textAnchor="middle" 
                fontSize="8.5" 
                fontWeight="black" 
                fill={zoneColor}
              >
                {zoneText}
              </text>
            </g>
          );
        })()}

        {/* [NEW] 실시간 마우스 좌표 조준 가이드 및 조작 안내 패널 */}
        <g transform="translate(10, 485)" className="select-none pointer-events-none">
          {/* 가이드 바 배경 */}
          <rect 
            x="0" 
            y="-12" 
            width="480" 
            height="20" 
            rx="5" 
            fill="rgba(15, 23, 42, 0.92)" 
            stroke="rgba(255, 255, 255, 0.08)" 
            strokeWidth="1.2" 
          />
          {hoveredField ? (
            <text x="240" y="2" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ffffff" className="font-sans">
              🎯 실시간 조준점 - X: <tspan fill="#38bdf8" fontWeight="black">{hoveredField.x}</tspan> Y: <tspan fill="#38bdf8" fontWeight="black">{hoveredField.y}</tspan> | 판정: <tspan fill={hoveredField.color} fontWeight="black">{hoveredField.zone}</tspan>
            </text>
          ) : (
            <text x="240" y="2" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#94a3b8" className="font-sans">
              💡 가이드: 필드를 클릭해 <tspan fill="#fbbf24" fontWeight="black">타구 지점</tspan>을 지정하고, 수비수를 드래그해 이동시키세요.
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};

export default BaseballField;
