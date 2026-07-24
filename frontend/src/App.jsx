import React, { useState, useEffect } from 'react';
import BaseballField from './components/BaseballField';
import PlayInputPanel from './components/PlayInputPanel';
import Dashboard from './components/Dashboard';

const initialPositions = {
  P: { x: 250, y: 340 },
  C: { x: 250, y: 460 },
  '1B': { x: 360, y: 320 },
  '2B': { x: 300, y: 220 },
  '3B': { x: 140, y: 320 },
  SS: { x: 200, y: 220 },
  LF: { x: 120, y: 140 },
  CF: { x: 250, y: 90 },
  RF: { x: 380, y: 140 }
};

// KBO 주요 구단별 디폴트 수비 라인업 데이터
const teamLineups = {
  LG: {
    P: { name: '임찬규', team: 'LG' },
    C: { name: '박동원', team: 'LG' },
    '1B': { name: '오스틴', team: 'LG' },
    '2B': { name: '신민재', team: 'LG' },
    '3B': { name: '문보경', team: 'LG' },
    SS: { name: '오지환', team: 'LG' },
    LF: { name: '문성주', team: 'LG' },
    CF: { name: '박해민', team: 'LG' },
    RF: { name: '홍창기', team: 'LG' }
  },
  KIA: {
    P: { name: '양현종', team: 'KIA' },
    C: { name: '김태군', team: 'KIA' },
    '1B': { name: '이우성', team: 'KIA' },
    '2B': { name: '김선빈', team: 'KIA' },
    '3B': { name: '김도영', team: 'KIA' },
    SS: { name: '박찬호', team: 'KIA' },
    LF: { name: '소크라테스', team: 'KIA' },
    CF: { name: '최원준', team: 'KIA' },
    RF: { name: '나성범', team: 'KIA' }
  },
  두산: {
    P: { name: '곽빈', team: '두산' },
    C: { name: '양의지', team: '두산' },
    '1B': { name: '양석환', team: '두산' },
    '2B': { name: '강승호', team: '두산' },
    '3B': { name: '허경민', team: '두산' },
    SS: { name: '박준영', team: '두산' },
    LF: { name: '김재환', team: '두산' },
    CF: { name: '정수빈', team: '두산' },
    RF: { name: '조수행', team: '두산' }
  },
  삼성: {
    P: { name: '원태인', team: '삼성' },
    C: { name: '강민호', team: '삼성' },
    '1B': { name: '디아즈', team: '삼성' },
    '2B': { name: '안주형', team: '삼성' },
    '3B': { name: '김영웅', team: '삼성' },
    SS: { name: '이재현', team: '삼성' },
    LF: { name: '구자욱', team: '삼성' },
    CF: { name: '김지찬', team: '삼성' },
    RF: { name: '윤정빈', team: '삼성' }
  },
  SSG: {
    P: { name: '김광현', team: 'SSG' },
    C: { name: '이지영', team: 'SSG' },
    '1B': { name: '오태곤', team: 'SSG' },
    '2B': { name: '박지환', team: 'SSG' },
    '3B': { name: '최정', team: 'SSG' },
    SS: { name: '박성한', team: 'SSG' },
    LF: { name: '에레디아', team: 'SSG' },
    CF: { name: '최지훈', team: 'SSG' },
    RF: { name: '한유섬', team: 'SSG' }
  },
  한화: {
    P: { name: '류현진', team: '한화' },
    C: { name: '최재훈', team: '한화' },
    '1B': { name: '채은성', team: '한화' },
    '2B': { name: '황영묵', team: '한화' },
    '3B': { name: '노시환', team: '한화' },
    SS: { name: '이도윤', team: '한화' },
    LF: { name: '페라자', team: '한화' },
    CF: { name: '장진혁', team: '한화' },
    RF: { name: '김태연', team: '한화' }
  },
  KT: {
    P: { name: '고영표', team: 'KT' },
    C: { name: '장성우', team: 'KT' },
    '1B': { name: '오재일', team: 'KT' },
    '2B': { name: '신본기', team: 'KT' },
    '3B': { name: '황재균', team: 'KT' },
    SS: { name: '김상수', team: 'KT' },
    LF: { name: '로하스', team: 'KT' },
    CF: { name: '배정대', team: 'KT' },
    RF: { name: '김민혁', team: 'KT' }
  },
  롯데: {
    P: { name: '박세웅', team: '롯데' },
    C: { name: '유강남', team: '롯데' },
    '1B': { name: '나승엽', team: '롯데' },
    '2B': { name: '고승민', team: '롯데' },
    '3B': { name: '손호영', team: '롯데' },
    SS: { name: '박승욱', team: '롯데' },
    LF: { name: '레이예스', team: '롯데' },
    CF: { name: '황성빈', team: '롯데' },
    RF: { name: '윤동희', team: '롯데' }
  },
  NC: {
    P: { name: '신민혁', team: 'NC' },
    C: { name: '김형준', team: 'NC' },
    '1B': { name: '데이비슨', team: 'NC' },
    '2B': { name: '박민우', team: 'NC' },
    '3B': { name: '서호철', team: 'NC' },
    SS: { name: '김주원', team: 'NC' },
    LF: { name: '권희동', team: 'NC' },
    CF: { name: '박건우', team: 'NC' },
    RF: { name: '손아섭', team: 'NC' }
  },
  키움: {
    P: { name: '헤이수스', team: '키움' },
    C: { name: '김재현', team: '키움' },
    '1B': { name: '최주환', team: '키움' },
    '2B': { name: '김혜성', team: '키움' },
    '3B': { name: '송성문', team: '키움' },
    SS: { name: '이재상', team: '키움' },
    LF: { name: '박수종', team: '키움' },
    CF: { name: '이주형', team: '키움' },
    RF: { name: '도슨', team: '키움' }
  }
};

// [NEW] KBO 주요 구단별 디폴트 1번~9번 타순 데이터 상품 매핑
const teamBattingOrders = {
  LG: [
    { order: 1, name: '홍창기', position: 'RF' },
    { order: 2, name: '신민재', position: '2B' },
    { order: 3, name: '김현수', position: 'DH' },
    { order: 4, name: '오스틴', position: '1B' },
    { order: 5, name: '문보경', position: '3B' },
    { order: 6, name: '박동원', position: 'C' },
    { order: 7, name: '오지환', position: 'SS' },
    { order: 8, name: '박해민', position: 'CF' },
    { order: 9, name: '문성주', position: 'LF' }
  ],
  KIA: [
    { order: 1, name: '박찬호', position: 'SS' },
    { order: 2, name: '최원준', position: 'CF' },
    { order: 3, name: '김도영', position: '3B' },
    { order: 4, name: '최형우', position: 'DH' },
    { order: 5, name: '나성범', position: 'RF' },
    { order: 6, name: '소크라테스', position: 'LF' },
    { order: 7, name: '이우성', position: '1B' },
    { order: 8, name: '김선빈', position: '2B' },
    { order: 9, name: '김태군', position: 'C' }
  ],
  두산: [
    { order: 1, name: '정수빈', position: 'CF' },
    { order: 2, name: '허경민', position: '3B' },
    { order: 3, name: '양의지', position: 'C' },
    { order: 4, name: '양석환', position: '1B' },
    { order: 5, name: '김재환', position: 'LF' },
    { order: 6, name: '강승호', position: '2B' },
    { order: 7, name: '라모스', position: 'RF' },
    { order: 8, name: '박준영', position: 'SS' },
    { order: 9, name: '조수행', position: 'LF' }
  ],
  삼성: [
    { order: 1, name: '김지찬', position: 'CF' },
    { order: 2, name: '윤정빈', position: 'RF' },
    { order: 3, name: '구자욱', position: 'LF' },
    { order: 4, name: '디아즈', position: '1B' },
    { order: 5, name: '박병호', position: 'DH' },
    { order: 6, name: '김영웅', position: '3B' },
    { order: 7, name: '이재현', position: 'SS' },
    { order: 8, name: '류지혁', position: '2B' },
    { order: 9, name: '이병헌', position: 'C' }
  ],
  SSG: [
    { order: 1, name: '최지훈', position: 'CF' },
    { order: 2, name: '추신수', position: 'DH' },
    { order: 3, name: '에레디아', position: 'LF' },
    { order: 4, name: '최정', position: '3B' },
    { order: 5, name: '한유섬', position: 'RF' },
    { order: 6, name: '박성한', position: 'SS' },
    { order: 7, name: '고명준', position: '1B' },
    { order: 8, name: '이지영', position: 'C' },
    { order: 9, name: '박지환', position: '2B' }
  ],
  한화: [
    { order: 1, name: '페라자', position: 'LF' },
    { order: 2, name: '장진혁', position: 'CF' },
    { order: 3, name: '김태연', position: 'RF' },
    { order: 4, name: '노시환', position: '3B' },
    { order: 5, name: '채은성', position: '1B' },
    { order: 6, name: '안치홍', position: 'DH' },
    { order: 7, name: '황영묵', position: '2B' },
    { order: 8, name: '최재훈', position: 'C' },
    { order: 9, name: '이도윤', position: 'SS' }
  ],
  KT: [
    { order: 1, name: '로하스', position: 'LF' },
    { order: 2, name: '황재균', position: '3B' },
    { order: 3, name: '강백호', position: 'DH' },
    { order: 4, name: '장성우', position: 'C' },
    { order: 5, name: '오재일', position: '1B' },
    { order: 6, name: '배정대', position: 'CF' },
    { order: 7, name: '김민혁', position: 'RF' },
    { order: 8, name: '신본기', position: '2B' },
    { order: 9, name: '심우준', position: 'SS' }
  ],
  롯데: [
    { order: 1, name: '황성빈', position: 'CF' },
    { order: 2, name: '윤동희', position: 'RF' },
    { order: 3, name: '전준우', position: 'LF' },
    { order: 4, name: '레이예스', position: 'DH' },
    { order: 5, name: '나승엽', position: '1B' },
    { order: 6, name: '손호영', position: '3B' },
    { order: 7, name: '고승민', position: '2B' },
    { order: 8, name: '유강남', position: 'C' },
    { order: 9, name: '박승욱', position: 'SS' }
  ],
  NC: [
    { order: 1, name: '박민우', position: '2B' },
    { order: 2, name: '권희동', position: 'LF' },
    { order: 3, name: '박건우', position: 'CF' },
    { order: 4, name: '데이비슨', position: '1B' },
    { order: 5, name: '손아섭', position: 'DH' },
    { order: 6, name: '김성욱', position: 'RF' },
    { order: 7, name: '서호철', position: '3B' },
    { order: 8, name: '김형준', position: 'C' },
    { order: 9, name: '김주원', position: 'SS' }
  ],
  키움: [
    { order: 1, name: '이주형', position: 'CF' },
    { order: 2, name: '도슨', position: 'LF' },
    { order: 3, name: '송성문', position: '3B' },
    { order: 4, name: '최주환', position: '1B' },
    { order: 5, name: '김혜성', position: '2B' },
    { order: 6, name: '이형종', position: 'RF' },
    { order: 7, name: '김휘집', position: 'SS' },
    { order: 8, name: '김재현', position: 'C' },
    { order: 9, name: '도슨', position: 'LF' }
  ]
};

const initialLogs = [
  {
    id: 'log-1',
    gameInfo: { date: '2026-07-24', stadium: '잠실 (LG/두산)', myTeam: 'LG', opponentTeam: 'KIA', inning: 3, inningHalf: '말' },
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '김현수',
    batterTeam: 'LG',
    pitchType: 'Fastball',
    pitchSpeed: 144,
    pitchResult: 'Strike',
    playResult: '',
    hitLocation: null
  },
  {
    id: 'log-2',
    gameInfo: { date: '2026-07-24', stadium: '잠실 (LG/두산)', myTeam: 'LG', opponentTeam: 'KIA', inning: 3, inningHalf: '말' },
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '김현수',
    batterTeam: 'LG',
    pitchType: 'Slider',
    pitchSpeed: 132,
    pitchResult: 'Ball',
    playResult: '',
    hitLocation: null
  },
  {
    id: 'log-3',
    gameInfo: { date: '2026-07-24', stadium: '잠실 (LG/두산)', myTeam: 'LG', opponentTeam: 'KIA', inning: 3, inningHalf: '말' },
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '김현수',
    batterTeam: 'LG',
    pitchType: 'Changeup',
    pitchSpeed: 128,
    pitchResult: 'InPlay',
    playResult: 'Single',
    hitLocation: { x: 160, y: 210 }
  },
  {
    id: 'log-4',
    gameInfo: { date: '2026-07-24', stadium: '잠실 (LG/두산)', myTeam: 'LG', opponentTeam: 'KIA', inning: 3, inningHalf: '말' },
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '오스틴',
    batterTeam: 'LG',
    pitchType: 'Fastball',
    pitchSpeed: 143,
    pitchResult: 'Strike',
    playResult: '',
    hitLocation: null
  },
  {
    id: 'log-5',
    gameInfo: { date: '2026-07-24', stadium: '잠실 (LG/두산)', myTeam: 'LG', opponentTeam: 'KIA', inning: 3, inningHalf: '말' },
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '오스틴',
    batterTeam: 'LG',
    pitchType: 'Curve',
    pitchSpeed: 115,
    pitchResult: 'InPlay',
    playResult: 'Flyout',
    hitLocation: { x: 390, y: 120 }
  },
  {
    id: 'log-6',
    gameInfo: { date: '2026-07-24', stadium: '인천 SSG랜더스필드', myTeam: 'SSG', opponentTeam: '두산', inning: 5, inningHalf: '초' },
    pitcherName: '곽빈',
    pitcherTeam: '두산',
    batterName: '최정',
    batterTeam: 'SSG',
    pitchType: 'Slider',
    pitchSpeed: 137,
    pitchResult: 'Strike',
    playResult: '',
    hitLocation: null
  },
  {
    id: 'log-7',
    gameInfo: { date: '2026-07-24', stadium: '인천 SSG랜더스필드', myTeam: 'SSG', opponentTeam: '두산', inning: 5, inningHalf: '초' },
    pitcherName: '곽빈',
    pitcherTeam: '두산',
    batterName: '최정',
    batterTeam: 'SSG',
    pitchType: 'Splitter',
    pitchSpeed: 133,
    pitchResult: 'InPlay',
    playResult: 'Double',
    hitLocation: { x: 260, y: 85 }
  }
];

function App() {
  const [positions, setPositions] = useState(initialPositions);
  const [runners, setRunners] = useState({ first: true, second: false, third: false });
  const [count, setCount] = useState({ balls: 1, strikes: 1, outs: 1 });
  const [pitchLogs, setPitchLogs] = useState(initialLogs);
  const [hitLocation, setHitLocation] = useState(null);
  const [aiAdvice, setAiAdvice] = useState('');

  // 경기 설정 상태
  const [gameInfo, setGameInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    stadium: '잠실 (LG/두산)',
    myTeam: 'LG',
    opponentTeam: 'KIA',
    inning: 3,
    inningHalf: '말'
  });

  // 현재 수비 팀/공격 팀 계산
  const isTop = gameInfo.inningHalf === '초';
  const defendingTeam = isTop ? gameInfo.myTeam : gameInfo.opponentTeam;
  const attackingTeam = isTop ? gameInfo.opponentTeam : gameInfo.myTeam;

  // 투수/타자 입력 폼 정보
  const [pitchInfo, setPitchInfo] = useState({
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '김현수',
    batterTeam: 'LG',
    pitchType: 'Fastball',
    pitchSpeed: 142,
    pitchResult: 'Strike',
    playResult: ''
  });

  // 수비진 라인업 상태 (현재 수비 팀의 기본 라인업으로 연동)
  const [defenders, setDefenders] = useState(teamLineups.KIA);

  // [NEW] 공격 타순 라인업 상태 (현재 공격 팀의 기본 타순으로 연동)
  const [battingOrder, setBattingOrder] = useState(teamBattingOrders.LG);

  // 1. 수비 구단(defendingTeam) 및 공격 구단(attackingTeam)이 바뀔 때 기본 명단 자동 갱신
  useEffect(() => {
    const matchedLineup = teamLineups[defendingTeam];
    const matchedOrder = teamBattingOrders[attackingTeam];

    if (matchedLineup) {
      setDefenders({ ...matchedLineup });
    }

    if (matchedOrder) {
      setBattingOrder([...matchedOrder]);
      // 투수(P)와 타자(Batter) 입력 폼 필드도 똑똑하게 기입 초기화
      setPitchInfo((prev) => ({
        ...prev,
        pitcherName: matchedLineup ? matchedLineup.P.name : prev.pitcherName,
        pitcherTeam: matchedLineup ? matchedLineup.P.team : prev.pitcherTeam,
        batterName: matchedOrder[2]?.name || matchedOrder[0]?.name || prev.batterName, // KBO 대표 3번 타자로 초기 연동
        batterTeam: attackingTeam
      }));
    }
  }, [defendingTeam, attackingTeam]);

  // 2. 투수 입력 폼의 투수명/투수팀이 변경될 때 수비진 P(투수)와도 실시간 연동
  useEffect(() => {
    setDefenders((prev) => {
      if (prev.P.name === pitchInfo.pitcherName && prev.P.team === pitchInfo.pitcherTeam) {
        return prev;
      }
      return {
        ...prev,
        P: { name: pitchInfo.pitcherName, team: pitchInfo.pitcherTeam }
      };
    });
  }, [pitchInfo.pitcherName, pitchInfo.pitcherTeam]);

  // [NEW] 우측 섹션 라인업 에디터에서 수비진 개별 선수명을 수동 수정할 때 연동하는 핸들러
  const handleDefenderUpdate = (position, newName, newTeam) => {
    setDefenders((prev) => {
      const updated = {
        ...prev,
        [position]: { name: newName, team: newTeam || prev[position].team }
      };
      
      if (position === 'P') {
        setPitchInfo((prevPitch) => ({
          ...prevPitch,
          pitcherName: newName,
          pitcherTeam: newTeam || prev[position].team
        }));
      }
      return updated;
    });
  };

  // [NEW] 우측 타순 에디터에서 개별 타자명을 수동 수정할 때 연동하는 핸들러
  const handleBattingOrderUpdate = (index, newName, position) => {
    setBattingOrder((prev) => {
      const updated = [...prev];
      const prevName = updated[index].name;
      updated[index] = {
        ...updated[index],
        name: newName,
        position: position || updated[index].position
      };

      // 만약 수정한 타자가 현재 타석의 타자 명과 같다면 입력 폼의 타자 정보도 동기화
      if (pitchInfo.batterName === prevName) {
        setPitchInfo((prevPitch) => ({
          ...prevPitch,
          batterName: newName
        }));
      }
      return updated;
    });
  };

  // 수비 위치 변경 핸들러
  const handlePositionChange = (playerKey, newPos) => {
    setPositions((prev) => ({
      ...prev,
      [playerKey]: newPos
    }));
  };

  // 주자 변경 핸들러
  const handleRunnerToggle = (base) => {
    setRunners((prev) => ({
      ...prev,
      [base]: !prev[base]
    }));
  };

  // 카운트 변경 핸들러
  const handleCountChange = (type, val) => {
    setCount((prev) => ({
      ...prev,
      [type]: val
    }));
  };

  // 타구 낙하지점 선택 핸들러
  const handleHitLocationSelect = (loc) => {
    setHitLocation(loc);
  };

  // 수비수 시프트 상태 텍스트로 요약
  const getShiftType = () => {
    const diff1B = positions['1B'].x - initialPositions['1B'].x;
    const diff2B = positions['2B'].x - initialPositions['2B'].x;
    const diff3B = positions['3B'].x - initialPositions['3B'].x;
    const diffSS = positions['SS'].x - initialPositions['SS'].x;

    if (diff2B < -40 && diffSS < -40) {
      return '좌타자 극단적 시프트 (Pull Shift)';
    }
    if (diff1B > 30 && diff2B > 30) {
      return '우타자 극단적 밀어치기 방지 시프트';
    }
    if (positions['3B'].y > 360 && positions['1B'].y > 360) {
      return '번트 수비 전진 시프트';
    }
    return '기본 표준 수비 포지션';
  };

  // AI 전술 룰 엔진 (구장, 팀, 이닝 맥락을 반영한 AI 전술 가이드 고도화)
  useEffect(() => {
    const shift = getShiftType();
    let advice = '';

    // 구장 분석 로직
    let stadiumAdvice = '';
    const stadiumName = gameInfo.stadium;
    if (stadiumName.includes('잠실')) {
      stadiumAdvice = '🏟️ [잠실구장]: 국내 최대 규모의 외야를 자랑합니다. 홈런 억제력이 매우 크므로, 투수는 장타 우려를 접어두고 공격적으로 스트라이크존을 공략하여 외야 플라이 아웃을 유도하는 편이 현명합니다.';
    } else if (stadiumName.includes('인천')) {
      stadiumAdvice = '🔥 [SSG랜더스필드]: 대표적인 타자 친화 구장(홈런공장)입니다. 펜스가 매우 가까워 조금만 타구 각도가 들려도 홈런이 되므로, 투수는 낮은 코스 제구와 땅볼 유도가 최우선 과제입니다.';
    } else if (stadiumName.includes('대구')) {
      stadiumAdvice = '📐 [라팍]: 좌우중간 펜스 거리가 짧아 타자에게 매우 유리한 팔각 구장입니다. 피홈런 위험이 극도로 높은 만큼, 유인구를 낮게 구사해 내야 땅볼을 타격하게 유도해야 합니다.';
    } else if (stadiumName.includes('사직')) {
      stadiumAdvice = '🧱 [사직구장]: 담장 높이가 4.8m로 매우 높습니다. 뜬공 시 펜스를 맞아 2루타가 되는 경우에 대비해 외야진(LF/RF)은 벽면 바운드 수비 커버 위치를 사전에 조정하십시오.';
    } else if (stadiumName.includes('고척')) {
      stadiumAdvice = '🏟️ [고척돔]: 바람이나 날씨 변수가 없는 실내 돔구장입니다. 타구 상승 기류가 없고 습도 유지가 일정하므로, 표준적인 전략 하에 투타 순수 전력 분석에 집중하는 것이 유리합니다.';
    } else {
      stadiumAdvice = `🏟️ [${stadiumName.split(' ')[0]}]: 표준 규격의 야구장입니다. 잔디 마찰이나 펜스 특성에 크게 구애받지 않고 평소의 전술 포메이션을 활용하면 됩니다.`;
    }

    const gameContext = `⚔️ [${gameInfo.inning}회${gameInfo.inningHalf}] ${gameInfo.myTeam} vs ${gameInfo.opponentTeam} 경기 상황 분석`;

    if (count.outs === 2 && runners.first && runners.second && runners.third) {
      advice = `${gameContext}\n${stadiumAdvice}\n\n[2사 만루 상황] 볼넷은 바로 실점으로 직결됩니다. ${pitchInfo.pitcherName}(${pitchInfo.pitcherTeam}) 투수는 초구 스트라이크 비율을 극대화해야 합니다. ${pitchInfo.batterName}(${pitchInfo.batterTeam}) 타자는 최근 높은 속구에 배트가 밀리는 경향이 있으니, 몸쪽 위협 구종 이후 바깥쪽 ${pitchInfo.pitchType === 'Fastball' ? '스플리터' : '변화구'}를 결정구로 구사하십시오.`;
    } else if (runners.first && count.outs < 2) {
      advice = `${gameContext}\n${stadiumAdvice}\n\n[무사/1사 1루 - 병살 대기] 상대는 작전 야구(번트, 히트앤런)를 취할 가능성이 75% 이상입니다. 내야진은 번트 수비에 반응할 준비를 마쳤습니다. 투수는 종무브먼트 구종으로 땅볼을 적극적으로 끌어내 병살타를 노려야 합니다.`;
    } else if (count.strikes === 2) {
      advice = `${gameContext}\n${stadiumAdvice}\n\n[2스트라이크 유리한 카운트] 타자의 눈을 속일 결정구가 필요합니다. 하이 패스트볼로 궤적을 흩트린 후, 바깥쪽 하단으로 급격하게 떨어지는 ${pitchInfo.pitchType === 'Fastball' ? '슬라이더(Slider)' : '유인구'}를 던져 헛스윙 삼진을 노리는 전술이 유효합니다.`;
    } else if (count.balls >= 2) {
      advice = `${gameContext}\n${stadiumAdvice}\n\n[투볼 이상 타자 카운트] 적극적인 스윙 카운트입니다. 실투성 속구는 여지없이 피장타로 연결됩니다. 특히 ${stadiumName.includes('인천') || stadiumName.includes('대구') ? '홈런 친화형 구장이므로 피홈런을 각별히 유의해야 하며,' : ''} 체인지업이나 커터로 타이밍을 뺏는 지능적 투구가 필요합니다.`;
    } else {
      advice = `${gameContext}\n${stadiumAdvice}\n\n[일반 전술 조언] 현재 카운트(${count.balls}B-${count.strikes}S, ${count.outs}O, 주자 ${runners.first ? '1' : ''}${runners.second ? '2' : ''}${runners.third ? '3' : '없음'}루)에서는 투수 ${pitchInfo.pitcherName}(${pitchInfo.pitcherTeam})의 구위 우위를 살려 초구에 스트라이크존 하단을 찔러넣어 유리한 볼카운트를 선점하는 것이 좋습니다.`;
    }

    setAiAdvice(advice);
  }, [positions, runners, count, pitchInfo.pitcherName, pitchInfo.pitcherTeam, pitchInfo.batterName, pitchInfo.batterTeam, pitchInfo.pitchType, gameInfo]);

  // 기록 제출 시 카운트 및 주자 시뮬레이션 업데이트
  const handleSubmitRecord = () => {
    const newLog = {
      id: `log-${Date.now()}`,
      gameInfo: { ...gameInfo },
      pitcherName: pitchInfo.pitcherName,
      pitcherTeam: pitchInfo.pitcherTeam,
      batterName: pitchInfo.batterName,
      batterTeam: pitchInfo.batterTeam,
      pitchType: pitchInfo.pitchType,
      pitchSpeed: pitchInfo.pitchSpeed,
      pitchResult: pitchInfo.pitchResult,
      playResult: pitchInfo.pitchResult === 'InPlay' ? pitchInfo.playResult : '',
      hitLocation: pitchInfo.pitchResult === 'InPlay' ? hitLocation : null
    };

    setPitchLogs((prev) => [...prev, newLog]);

    let nextCount = { ...count };
    let nextRunners = { ...runners };

    if (pitchInfo.pitchResult === 'Strike') {
      nextCount.strikes += 1;
      if (nextCount.strikes === 3) {
        nextCount.strikes = 0;
        nextCount.balls = 0;
        nextCount.outs += 1;
      }
    } else if (pitchInfo.pitchResult === 'Ball') {
      nextCount.balls += 1;
      if (nextCount.balls === 4) {
        nextCount.balls = 0;
        nextCount.strikes = 0;
        if (nextRunners.first) {
          if (nextRunners.second) {
            if (nextRunners.third) {
              // 만루 -> 득점
            } else {
              nextRunners.third = true;
            }
          } else {
            nextRunners.second = true;
          }
        } else {
          nextRunners.first = true;
        }
      }
    } else if (pitchInfo.pitchResult === 'Foul') {
      if (nextCount.strikes < 2) {
        nextCount.strikes += 1;
      }
    } else if (pitchInfo.pitchResult === 'InPlay') {
      nextCount.balls = 0;
      nextCount.strikes = 0;

      const res = pitchInfo.playResult;
      if (res === 'Single') {
        nextRunners = {
          third: nextRunners.second,
          second: nextRunners.first,
          first: true
        };
      } else if (res === 'Double') {
        nextRunners = {
          third: nextRunners.first,
          second: true,
          first: false
        };
      } else if (res === 'Triple') {
        nextRunners = {
          third: true,
          second: false,
          first: false
        };
      } else if (res === 'HomeRun') {
        nextRunners = { first: false, second: false, third: false };
      } else if (res === 'Strikeout' || res === 'Groundout' || res === 'Flyout' || res === 'Error') {
        if (res !== 'Error') {
          nextCount.outs += 1;
        }
      }
    }

    if (nextCount.outs >= 3) {
      nextCount = { balls: 0, strikes: 0, outs: 0 };
      nextRunners = { first: false, second: false, third: false };
      alert('🔄 3아웃 체인지! 공수가 교대되거나 다음 이닝으로 넘어갑니다.');
    }

    setCount(nextCount);
    setRunners(nextRunners);
    setHitLocation(null);
  };

  const handleResetPositions = () => {
    setPositions(initialPositions);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            BA
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Baseball AI Coach <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-normal">v1.6-beta</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold">데이터 기반 야구 전술 의사결정 서포터</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleResetPositions}
            className="text-xs bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-bold py-2 px-3.5 rounded-lg transition-all"
          >
            🔄 수비 위치 초기화
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-400">AI 실시간 연동 중</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6 items-center">
          <BaseballField
            positions={positions}
            onPositionChange={handlePositionChange}
            runners={runners}
            onRunnerToggle={handleRunnerToggle}
            hitLocation={hitLocation}
            onHitLocationSelect={handleHitLocationSelect}
            defenders={defenders}
            gameInfo={gameInfo}
          />
          <PlayInputPanel
            gameInfo={gameInfo}
            setGameInfo={setGameInfo}
            pitchInfo={pitchInfo}
            setPitchInfo={setPitchInfo}
            count={count}
            onCountChange={handleCountChange}
            runners={runners}
            onRunnerToggle={handleRunnerToggle}
            hitLocation={hitLocation}
            onSubmitRecord={handleSubmitRecord}
          />
        </div>

        <div className="lg:col-span-7 w-full">
          <Dashboard 
            pitchLogs={pitchLogs} 
            aiAdvice={aiAdvice} 
            defenders={defenders}
            onDefenderUpdate={handleDefenderUpdate}
            defendingTeam={defendingTeam}
            battingOrder={battingOrder} // [NEW] 실시간 공격 타순 데이터 전달
            onBattingOrderUpdate={handleBattingOrderUpdate} // [NEW] 타순 편집 핸들러 전달
            attackingTeam={attackingTeam} // [NEW] 현재 공격팀 전달
            currentBatterName={pitchInfo.batterName} // [NEW] 현재 타석 타자명 전달
          />
        </div>
      </main>
    </div>
  );
}

export default App;
