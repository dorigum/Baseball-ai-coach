import React, { useState, useEffect, useRef } from 'react';
import BaseballField from './components/BaseballField';
import PlayInputPanel from './components/PlayInputPanel';
import Dashboard from './components/Dashboard';
import { loginWithGoogle, logout, isMockAuth } from './firebase';
import { ArrowUp } from 'lucide-react';

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

const getStorageItem = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const teamLogos = {
  // LG 트윈스
  'LG': 'https://upload.wikimedia.org/wikipedia/en/b/b2/LG_Twins_logo.svg',
  'LG 트윈스': 'https://upload.wikimedia.org/wikipedia/en/b/b2/LG_Twins_logo.svg',
  'LG Twins': 'https://upload.wikimedia.org/wikipedia/en/b/b2/LG_Twins_logo.svg',
  
  // KIA 타이거즈
  'KIA': 'https://upload.wikimedia.org/wikipedia/ko/c/c9/Kia_Tigers_logo.svg',
  'KIA 타이거즈': 'https://upload.wikimedia.org/wikipedia/ko/c/c9/Kia_Tigers_logo.svg',
  'KIA Tigers': 'https://upload.wikimedia.org/wikipedia/ko/c/c9/Kia_Tigers_logo.svg',
  
  // 삼성 라이온즈
  '삼성': 'https://upload.wikimedia.org/wikipedia/en/b/b7/Samsung_Lions_logo.svg',
  '삼성 라이온즈': 'https://upload.wikimedia.org/wikipedia/en/b/b7/Samsung_Lions_logo.svg',
  'Samsung Lions': 'https://upload.wikimedia.org/wikipedia/en/b/b7/Samsung_Lions_logo.svg',
  
  // 두산 베어스
  '두산': 'https://upload.wikimedia.org/wikipedia/en/8/87/Doosan_Bears_logo.svg',
  '두산 베어스': 'https://upload.wikimedia.org/wikipedia/en/8/87/Doosan_Bears_logo.svg',
  'Doosan Bears': 'https://upload.wikimedia.org/wikipedia/en/8/87/Doosan_Bears_logo.svg',
  
  // 롯데 자이언츠
  '롯데': 'https://upload.wikimedia.org/wikipedia/en/1/1d/Lotte_Giants_logo.svg',
  '롯데 자이언츠': 'https://upload.wikimedia.org/wikipedia/en/1/1d/Lotte_Giants_logo.svg',
  'Lotte Giants': 'https://upload.wikimedia.org/wikipedia/en/1/1d/Lotte_Giants_logo.svg',
  
  // 한화 이글스
  '한화': 'https://upload.wikimedia.org/wikipedia/en/b/b6/Hanwha_Eagles_logo.svg',
  '한화 이글스': 'https://upload.wikimedia.org/wikipedia/en/b/b6/Hanwha_Eagles_logo.svg',
  'Hanwha Eagles': 'https://upload.wikimedia.org/wikipedia/en/b/b6/Hanwha_Eagles_logo.svg',
  
  // 키움 히어로즈
  '키움': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Kiwoom_Heroes_logo.svg',
  '키움 히어로즈': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Kiwoom_Heroes_logo.svg',
  'Kiwoom Heroes': 'https://upload.wikimedia.org/wikipedia/en/c/cd/Kiwoom_Heroes_logo.svg',
  
  // SSG 랜더스
  'SSG': 'https://upload.wikimedia.org/wikipedia/en/3/36/SSG_Landers_logo.svg',
  'SSG 랜더스': 'https://upload.wikimedia.org/wikipedia/en/3/36/SSG_Landers_logo.svg',
  'SSG Landers': 'https://upload.wikimedia.org/wikipedia/en/3/36/SSG_Landers_logo.svg',
  
  // KT 위즈
  'KT': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Kt_Wiz_logo.svg',
  'KT 위즈': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Kt_Wiz_logo.svg',
  'kt wiz': 'https://upload.wikimedia.org/wikipedia/en/c/ce/Kt_Wiz_logo.svg',
  
  // NC 다이노스
  'NC': 'https://upload.wikimedia.org/wikipedia/en/d/dd/NC_Dinos_logo.svg',
  'NC 다이노스': 'https://upload.wikimedia.org/wikipedia/en/d/dd/NC_Dinos_logo.svg',
  'NC Dinos': 'https://upload.wikimedia.org/wikipedia/en/d/dd/NC_Dinos_logo.svg'
};

function App() {
  const [showTopButton, setShowTopButton] = useState(false);
  const [positions, setPositions] = useState(() => getStorageItem('baseball_positions', initialPositions));
  const [runners, setRunners] = useState(() => getStorageItem('baseball_runners', { first: '신민재', second: '', third: '' }));
  const [count, setCount] = useState(() => getStorageItem('baseball_count', { balls: 1, strikes: 1, outs: 1 }));
  const [pitchLogs, setPitchLogs] = useState(() => getStorageItem('baseball_pitchLogs', initialLogs));
  const [scores, setScores] = useState(() => getStorageItem('baseball_scores', { myTeam: 0, opponentTeam: 0 }));
  const [hitLocation, setHitLocation] = useState(() => getStorageItem('baseball_hitLocation', null));
  const [aiAdvice, setAiAdvice] = useState('');
  const abortControllerRef = useRef(null);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });
  const showModal = (title, message, type = 'warning') => {
    setModal({ isOpen: true, title, message, type });
  };
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // [NEW] 회원 인증 관련 상태 선언 및 Lazy Loading 지원
  const [user, setUser] = useState(() => getStorageItem('baseball_user', null));
  const [idToken, setIdToken] = useState(() => {
    return localStorage.getItem('baseball_idToken') || '';
  });

  // [NEW] 내 프로필 정보 및 선호 구단 패치 API 연동
  const fetchMyProfile = async (token, currentUser = user) => {
    if (!token) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/api/members/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Mock-UID': currentUser?.uid || ''
        }
      });
      if (response.ok) {
        const memberData = await response.json();
        if (memberData.myTeam) {
          setGameInfo(prev => {
            if (prev.myTeam !== memberData.myTeam) {
              return {
                ...prev,
                myTeam: memberData.myTeam
              };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error("내 프로필 데이터 획득 실패:", err);
    }
  };

  // [NEW] 구글 로그인 처리 함수 (Mock 모드 투명 지원)
  const handleLogin = async () => {
    try {
      const authData = await loginWithGoogle();
      setUser(authData.user);
      setIdToken(authData.idToken);
      localStorage.setItem('baseball_user', JSON.stringify(authData.user));
      localStorage.setItem('baseball_idToken', authData.idToken);
      
      const welcomeMsg = isMockAuth 
        ? `${authData.user.displayName}님 환영합니다! (Mock 가상 로그인 가동 중)` 
        : `${authData.user.displayName}님 환영합니다!`;
        
      showModal('🔓 로그인 성공', welcomeMsg, 'info');
      
      // 내 프로필 및 동기화 실행
      await fetchMyProfile(authData.idToken, authData.user);
    } catch (err) {
      console.error("소셜 로그인 에러:", err);
      const isUserCancellation = err && (
        err.code === 'auth/popup-closed-by-user' || 
        err.code === 'auth/cancelled-popup-request' ||
        (err.message && err.message.includes('popup-closed-by-user'))
      );
      if (!isUserCancellation) {
        showModal('🚨 로그인 실패', '소셜 로그인 처리에 실패하였습니다.', 'error');
      }
    }
  };

  // [NEW] 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIdToken('');
      localStorage.removeItem('baseball_user');
      localStorage.removeItem('baseball_idToken');
      showModal('🔒 로그아웃', '정상적으로 로그아웃되었습니다.', 'info');
      
      // 로그아웃 시 로컬 데이터 초기화 및 세션 리셋
      setScores({ myTeam: 0, opponentTeam: 0 });
      setPitchLogs(initialLogs);
      setRunners({ first: '', second: '', third: '' });
      setCount({ balls: 0, strikes: 0, outs: 0 });
    } catch (err) {
      console.error("로그아웃 실패:", err);
      showModal('🚨 로그아웃 실패', '로그아웃 도중 에러가 발생했습니다.', 'error');
    }
  };

  // 경기 설정 상태
  const [gameInfo, setGameInfo] = useState(() => getStorageItem('baseball_gameInfo', {
    date: new Date().toISOString().split('T')[0],
    stadium: '잠실 (LG/두산)',
    myTeam: 'LG',
    opponentTeam: 'KIA',
    inning: 3,
    inningHalf: '말'
  }));

  // 현재 수비 팀/공격 팀 계산
  const isTop = gameInfo.inningHalf === '초';
  const defendingTeam = isTop ? gameInfo.myTeam : gameInfo.opponentTeam;
  const attackingTeam = isTop ? gameInfo.opponentTeam : gameInfo.myTeam;

  // 투수/타자 입력 폼 정보
  const [pitchInfo, setPitchInfo] = useState(() => getStorageItem('baseball_pitchInfo', {
    pitcherName: '양현종',
    pitcherTeam: 'KIA',
    batterName: '김현수',
    batterTeam: 'LG',
    pitchType: 'Fastball',
    pitchSpeed: 142,
    pitchResult: 'Strike',
    playResult: ''
  }));

  // 수비진 라인업 상태 (현재 수비 팀의 기본 라인업으로 연동)
  const [defenders, setDefenders] = useState(() => getStorageItem('baseball_defenders', teamLineups.KIA));

  // [NEW] 공격 타순 라인업 상태 (현재 공격 팀의 기본 타순으로 연동)
  const [battingOrder, setBattingOrder] = useState(() => getStorageItem('baseball_battingOrder', teamBattingOrders.LG));

  const prevDefendingTeamRef = useRef(null);
  const prevAttackingTeamRef = useRef(null);

  // 1. 수비 구단(defendingTeam) 및 공격 구단(attackingTeam)이 바뀔 때 기본 명단 자동 갱신
  useEffect(() => {
    const hasLocalData = localStorage.getItem('baseball_defenders') || localStorage.getItem('baseball_battingOrder');
    
    // 최초 마운트 시 로컬스토리지에 기존 값이 저장되어 있다면 덮어쓰기를 건너뜁니다.
    if (hasLocalData && prevDefendingTeamRef.current === null && prevAttackingTeamRef.current === null) {
      prevDefendingTeamRef.current = defendingTeam;
      prevAttackingTeamRef.current = attackingTeam;
      return;
    }

    const isDefendingTeamChanged = prevDefendingTeamRef.current !== null && prevDefendingTeamRef.current !== defendingTeam;
    const isAttackingTeamChanged = prevAttackingTeamRef.current !== null && prevAttackingTeamRef.current !== attackingTeam;

    prevDefendingTeamRef.current = defendingTeam;
    prevAttackingTeamRef.current = attackingTeam;

    if (!hasLocalData || isDefendingTeamChanged || isAttackingTeamChanged) {
      const matchedLineup = teamLineups[defendingTeam];
      const matchedOrder = teamBattingOrders[attackingTeam];

      if (matchedLineup) {
        setDefenders({ ...matchedLineup });
      } else {
        // 커스텀 구단일 때 기본 템플릿 생성
        setDefenders({
          P: { name: '투수', team: defendingTeam },
          C: { name: '포수', team: defendingTeam },
          '1B': { name: '1루수', team: defendingTeam },
          '2B': { name: '2루수', team: defendingTeam },
          '3B': { name: '3루수', team: defendingTeam },
          SS: { name: '유격수', team: defendingTeam },
          LF: { name: '좌익수', team: defendingTeam },
          CF: { name: '중견수', team: defendingTeam },
          RF: { name: '우익수', team: defendingTeam }
        });
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
      } else {
        // 커스텀 구단일 때 기본 템플릿 생성
        const customOrder = [
          { order: 1, name: '타자1', position: 'DH' },
          { order: 2, name: '타자2', position: 'LF' },
          { order: 3, name: '타자3', position: 'CF' },
          { order: 4, name: '타자4', position: '1B' },
          { order: 5, name: '타자5', position: '3B' },
          { order: 6, name: '타자6', position: 'RF' },
          { order: 7, name: '타자7', position: 'SS' },
          { order: 8, name: '타자8', position: '2B' },
          { order: 9, name: '타자9', position: 'C' }
        ];
        setBattingOrder(customOrder);
        setPitchInfo((prev) => ({
          ...prev,
          pitcherName: matchedLineup ? matchedLineup.P.name : '투수',
          pitcherTeam: defendingTeam,
          batterName: '타자3',
          batterTeam: attackingTeam
        }));
      }

      // [요구사항 반영] 팀 교대/변경 시 진루 정보(주자) 및 볼카운트 초기화
      setRunners({ first: '', second: '', third: '' });
      setCount({ balls: 0, strikes: 0, outs: 0 });
    }
  }, [defendingTeam, attackingTeam]);

  // [NEW] 내 선호 구단(myTeam)이 변경되었을 때 백엔드 회원 프로필 정보 동기화 (디바운스 & 에러 제어 탑재)
  useEffect(() => {
    if (!idToken || !gameInfo.myTeam) return;

    const delayDebounceId = setTimeout(() => {
      const updateMemberTeam = async () => {
        try {
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(`${apiBaseUrl}/api/members/me/team`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
              'X-Mock-UID': user?.uid || ''
            },
            body: JSON.stringify({ myTeam: gameInfo.myTeam }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error("선호 구단 정보 백엔드 동기화 실패 (HTTP status):", response.status);
          }
        } catch (err) {
          console.error("선호 구단 정보 백엔드 동기화 실패:", err);
        }
      };
      updateMemberTeam();
    }, 500); // 500ms 디바운스

    return () => clearTimeout(delayDebounceId);
  }, [gameInfo.myTeam, idToken, user?.uid]);

  // 로컬 스토리지 상태 저장 Effect들 (각 상태별 독립 분리하여 직렬화 병목 방지)
  useEffect(() => {
    localStorage.setItem('baseball_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('baseball_runners', JSON.stringify(runners));
  }, [runners]);

  useEffect(() => {
    localStorage.setItem('baseball_count', JSON.stringify(count));
  }, [count]);

  useEffect(() => {
    localStorage.setItem('baseball_pitchLogs', JSON.stringify(pitchLogs));
  }, [pitchLogs]);

  useEffect(() => {
    localStorage.setItem('baseball_scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    localStorage.setItem('baseball_hitLocation', JSON.stringify(hitLocation));
  }, [hitLocation]);

  useEffect(() => {
    localStorage.setItem('baseball_gameInfo', JSON.stringify(gameInfo));
  }, [gameInfo]);

  useEffect(() => {
    localStorage.setItem('baseball_pitchInfo', JSON.stringify(pitchInfo));
  }, [pitchInfo]);

  useEffect(() => {
    localStorage.setItem('baseball_defenders', JSON.stringify(defenders));
  }, [defenders]);

  useEffect(() => {
    localStorage.setItem('baseball_battingOrder', JSON.stringify(battingOrder));
  }, [battingOrder]);

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
    const targetTeam = newTeam || defenders[position]?.team || '';
    
    setDefenders((prev) => ({
      ...prev,
      [position]: { name: newName, team: targetTeam }
    }));
    
    if (position === 'P') {
      setPitchInfo((prevPitch) => ({
        ...prevPitch,
        pitcherName: newName,
        pitcherTeam: targetTeam
      }));
    }
  };

  // [NEW] 우측 섹션 라인업 에디터에서 수비진의 포지션을 변경할 때 두 수비수를 스왑하고 투수 교체를 연동하는 핸들러
  const handleDefenderPositionSwap = (posA, posB, newNameForA) => {
    if (posA === posB) return;

    let newPitcher = null;
    setDefenders((prev) => {
      const pA = { ...prev[posA], name: newNameForA };
      const pB = prev[posB];
      newPitcher = posA === 'P' ? pB : (posB === 'P' ? pA : null);
      return {
        ...prev,
        [posA]: pB,
        [posB]: pA
      };
    });

    if (newPitcher) {
      setPitchInfo((prevPitch) => ({
        ...prevPitch,
        pitcherName: newPitcher.name,
        pitcherTeam: newPitcher.team
      }));
    }
  };

  // [NEW] 우측 타순 에디터에서 개별 타자명을 수동 수정할 때 연동하는 핸들러
  const handleBattingOrderUpdate = (index, newName, position) => {
    const prevName = battingOrder[index]?.name;
    const targetPos = position || battingOrder[index]?.position || '';

    setBattingOrder((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        name: newName,
        position: targetPos
      };
      return updated;
    });

    if (pitchInfo.batterName === prevName) {
      setPitchInfo((prevPitch) => ({
        ...prevPitch,
        batterName: newName
      }));
    }
  };

  // 수비 위치 변경 핸들러
  const handlePositionChange = (playerKey, newPos) => {
    setPositions((prev) => ({
      ...prev,
      [playerKey]: newPos
    }));
  };

  // 주자 변경 핸들러 (이름 문자열 기반)
  const handleRunnerToggle = (base) => {
    setRunners((prev) => ({
      ...prev,
      [base]: prev[base] ? '' : '주자'
    }));
  };

  // 주자 이름 수동 수정 핸들러
  const handleRunnerNameChange = (base, newName) => {
    setRunners((prev) => ({
      ...prev,
      [base]: newName
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
    const diff2B = positions['2B'].x - initialPositions['2B'].x;
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

  // [수정] 로컬 백업 룰 폴백 조언 생성기 (공수 상황별 분기 및 구장 특징 정합성 강화)
  const triggerLocalFallback = () => {
    const stadiumName = gameInfo.stadium;
    const activeBases = [
      runners.first && '1루',
      runners.second && '2루',
      runners.third && '3루'
    ].filter(Boolean);
    const runnerLabel = activeBases.join(', ') || '없음';

    const isTop = gameInfo.inningHalf === '초';
    const attackingTeam = isTop ? gameInfo.opponentTeam : gameInfo.myTeam;
    const isMyTeamOffense = gameInfo.myTeam === attackingTeam;
    
    let localAdvice = `🏟️ [로컬 백업 엔진 조언] 현재 카운트(${count.balls}B-${count.strikes}S, ${count.outs}O, 주자 ${runnerLabel}) 상황입니다.\n`;
    
    if (isMyTeamOffense) {
      // 아군(myTeam) 공격 시
      const hasRunners = runners.first || runners.second || runners.third;
      localAdvice += `👉 [공격 전략] `;
      
      // 1. 구장별 맞춤 조언 분기
      if (stadiumName.includes('잠실')) {
        localAdvice += `${gameInfo.myTeam} 타선은 잠실구장과 같이 외야가 넓은 야구장에서는 큰 스윙보다는 정교한 컨택으로 빈 공간을 공략하는 라인드라이브 타격이 효과적입니다. `;
      } else if (stadiumName.includes('인천') || stadiumName.includes('대구')) {
        localAdvice += `특히 ${stadiumName.split(' ')[0]}구장은 홈런 펜스가 매우 가까워 피장타율이 높으므로, 어퍼스윙을 가미한 장타 지향 타격이 승리에 유리합니다. `;
      } else {
        localAdvice += '표준 규격 구장이므로 무리하지 않고 상황에 맞춘 중단거리 스프레이 히팅 전략을 권장합니다. ';
      }

      // 2. 주자 상황별 조언 분기
      if (hasRunners) {
        localAdvice += '현재 주자가 루상에 포진해 있으므로 진루타를 생산하기 위한 팀 배팅과 작전 주루에 집중하십시오.';
      } else {
        localAdvice += '루상에 주자가 없으므로 조급한 타격보다는 타자 개개인의 출루율을 높이기 위해 차분한 선구안으로 출루 기회를 노리는 것이 좋습니다.';
      }
    } else {
      // 아군(myTeam) 수비 시
      localAdvice += `👉 [수비 전략] ${gameInfo.myTeam} 투수/수비진은 `;
      if (stadiumName.includes('잠실')) {
        localAdvice += '광활한 잠실구장의 특징을 활용하여 피장타 부담 없이 한가운데 스트라이크존을 높이고, 외야진은 플라이볼 맞춰잡기 형태로 넓은 전술 수비 간격을 유지해야 합니다.';
      } else if (stadiumName.includes('인천') || stadiumName.includes('대구')) {
        localAdvice += '피홈런 펜스가 가까우므로 종무브먼트 구종(스플리터, 체인지업)으로 가라앉히는 로우존 투구를 하고, 내야진은 땅볼 수비 병살에 대비해야 합니다.';
      } else {
        localAdvice += '초구 스트라이크 선점으로 볼카운트 주도권을 쥐고, 주자 진루를 차단하는 기본 수비 포메이션 유지를 권장합니다.';
      }
    }
    setAiAdvice(localAdvice);
  };

  // [NEW] 백엔드 DB 연동 대시보드 통계 패치 함수
  const fetchBackendDashboard = async (token = idToken, currentUser = user) => {
    if (!token) return;
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${apiBaseUrl}/api/coach/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Mock-UID': currentUser?.uid || ''
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (!data || !Array.isArray(data.pitchLogs)) {
          return;
        }
        
        // 백엔드로부터 가져온 15개의 투구 기록을 기존 pitchLogs에 매핑 동기화
        const mappedLogs = data.pitchLogs.map(log => ({
          id: `log-${log.id}`,
          gameInfo: {
            date: log.gameInfo?.date || '',
            stadium: log.gameInfo?.stadium || '',
            myTeam: log.gameInfo?.myTeam || '',
            opponentTeam: log.gameInfo?.opponentTeam || '',
            inning: log.gameInfo?.inning || 1,
            inningHalf: log.gameInfo?.inningHalf || '초'
          },
          pitcherName: log.pitcherName,
          pitcherTeam: log.pitcherTeam,
          batterName: log.batterName,
          batterTeam: log.batterTeam,
          pitchType: log.pitchType,
          pitchSpeed: log.pitchSpeed,
          pitchResult: log.pitchResult,
          playResult: log.playResult,
          hitLocation: log.hitLocationX !== null && log.hitLocationY !== null ? { x: log.hitLocationX, y: log.hitLocationY } : null
        }));
        
        setPitchLogs(mappedLogs);
        
        // 스코어보드 득점 자동 패치 (최근 로그 기준 점수 동기화)
        if (mappedLogs.length > 0) {
          // 백엔드는 Game 정보를 직접 관리하므로 Game의 스코어가 있으면 연계
          // H2 DB 상에 저장된 Game 스코어가 있다면 동기화 수행
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error("백엔드 대시보드 데이터 동기화 타임아웃 발생 (8s)");
      } else {
        console.error("백엔드 대시보드 데이터 동기화 에러:", err);
      }
    }
  };

  // [NEW] 비회원 기간 동안 저장된 로컬 로그를 로그인 시 백엔드 서버에 마이그레이션(동기화)하는 함수
  const migrateLocalLogsToServer = async (token, currentUser) => {
    const localLogs = getStorageItem('baseball_pitchLogs', []);
    if (!localLogs || localLogs.length === 0) return;

    // 타임스탬프 형태로 임시 생성된 비회원 기록만 필터링 (id 예: log-1718294819284)
    const unsyncedLogs = localLogs.filter(log => /^log-\d{10,}$/.test(log.id));
    if (unsyncedLogs.length === 0) return;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const migrated = new Set(getStorageItem('baseball_migratedLogIds', []));
    
    // 순차적으로 백엔드 서버에 저장 API 호출
    for (const logItem of unsyncedLogs) {
      if (migrated.has(logItem.id)) continue;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`${apiBaseUrl}/api/coach/pitch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Mock-UID': currentUser?.uid || ''
          },
          body: JSON.stringify({
            gameDate: logItem.gameInfo.date,
            stadium: logItem.gameInfo.stadium,
            myTeam: logItem.gameInfo.myTeam,
            opponentTeam: logItem.gameInfo.opponentTeam,
            pitcherName: logItem.pitcherName,
            pitcherTeam: logItem.pitcherTeam,
            batterName: logItem.batterName,
            batterTeam: logItem.batterTeam,
            pitchType: logItem.pitchType,
            pitchSpeed: logItem.pitchSpeed,
            pitchResult: logItem.pitchResult,
            playResult: logItem.playResult,
            hitLocationX: logItem.hitLocation ? logItem.hitLocation.x : null,
            hitLocationY: logItem.hitLocation ? logItem.hitLocation.y : null,
            inning: logItem.gameInfo.inning,
            inningHalf: logItem.gameInfo.inningHalf,
            outs: logItem.outs !== undefined ? logItem.outs : 0
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          migrated.add(logItem.id);
          localStorage.setItem('baseball_migratedLogIds', JSON.stringify([...migrated]));
        }
      } catch (err) {
        console.error("로컬 로그 마이그레이션 실패:", err);
      }
    }
  };

  // [NEW] 로그인 성공 후 최초 1회 & 갱신 시 대시보드 데이터 패치 및 로컬 데이터 마이그레이션 훅
  useEffect(() => {
    if (idToken) {
      const syncAndFetch = async () => {
        await migrateLocalLogsToServer(idToken, user);
        await fetchBackendDashboard(idToken, user);
        await fetchMyProfile(idToken, user);
      };
      syncAndFetch();
    }
  }, [idToken, user]);

  // [NEW] 수동 AI 전술 분석 실행 함수 (입력 정합성 검증 & AbortController 탑재)
  const handleTriggerAiAnalysis = async () => {
    const isTop = gameInfo.inningHalf === '초';
    const attackingTeam = isTop ? gameInfo.opponentTeam : gameInfo.myTeam;
    const defendingTeam = isTop ? gameInfo.myTeam : gameInfo.opponentTeam;

    const cleanPitcherTeam = (pitchInfo.pitcherTeam || '').trim();
    const cleanBatterTeam = (pitchInfo.batterTeam || '').trim();
    const cleanPitcherName = (pitchInfo.pitcherName || '').trim();
    const cleanBatterName = (pitchInfo.batterName || '').trim();

    // 1. 투수 소속 구단 검증
    if (cleanPitcherTeam !== defendingTeam) {
      alert(`⚠️ 수비팀 오류: 현재 수비 중인 구단은 [${defendingTeam}]입니다.\n투수의 소속 구단명을 [${defendingTeam}]로 정확하게 기입해 주세요.`);
      return;
    }

    // 2. 타자 소속 구단 검증
    if (cleanBatterTeam !== attackingTeam) {
      alert(`⚠️ 공격팀 오류: 현재 공격 중인 구단은 [${attackingTeam}]입니다.\n타자의 소속 구단명을 [${attackingTeam}]로 정확하게 기입해 주세요.`);
      return;
    }

    // 3. 선수 한글 이름 정규식 검증 (영어 오타 유효성 검사)
    const KOREAN_NAME_REGEX = /^[가-힣\s.·]+$/;
    if (!cleanPitcherName || !KOREAN_NAME_REGEX.test(cleanPitcherName)) {
      alert('⚠️ 입력 오류: 투수 이름은 올바른 한글 이름(한글, 공백, 점)으로 입력해 주세요. (영어/숫자 오타가 없는지 확인해 주세요.)');
      return;
    }
    if (!cleanBatterName || !KOREAN_NAME_REGEX.test(cleanBatterName)) {
      alert('⚠️ 입력 오류: 타자 이름은 올바른 한글 이름(한글, 공백, 점)으로 입력해 주세요. (영어/숫자 오타가 없는지 확인해 주세요.)');
      return;
    }

    // 4. 구종 선택 및 기타 미입력 검증
    if (!pitchInfo.pitchType) {
      alert('⚠️ 입력 오류: 전술 분석을 시작하기 위해 구종(Pitch Type)을 먼저 선택해 주세요.');
      return;
    }
    if (pitchInfo.pitchType === '기타' || pitchInfo.pitchType.trim() === '') {
      alert('⚠️ 입력 오류: [기타 (직접 입력)]을 선택하셨습니다. 구종의 명칭(예: 포크볼, 싱커 등)을 직접 입력해 주세요.');
      return;
    }

    // 이전 비동기 통신이 완료되지 않았다면 강제 취소 (레이스컨디션 원천 차단)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setAiAdvice('🔮 AI 실시간 전술 분석을 실행하는 중입니다...');

    try {
      const shift = getShiftType();
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/api/coach/advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}),
          ...(idToken && user ? { 'X-Mock-UID': user.uid } : {})
        },
        signal, // AbortSignal 등록
        body: JSON.stringify({
          stadium: gameInfo.stadium,
          myTeam: gameInfo.myTeam,
          opponentTeam: gameInfo.opponentTeam,
          inning: gameInfo.inning,
          inningHalf: gameInfo.inningHalf,
          balls: count.balls,
          strikes: count.strikes,
          outs: count.outs,
          firstBase: !!runners.first,
          secondBase: !!runners.second,
          thirdBase: !!runners.third,
          pitcherName: cleanPitcherName,
          pitcherTeam: cleanPitcherTeam,
          batterName: cleanBatterName,
          batterTeam: cleanBatterTeam,
          pitchType: pitchInfo.pitchType,
          shiftType: shift
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAdvice(data.advice);
      } else {
        triggerLocalFallback();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        triggerLocalFallback();
      }
    }
  };

  // 컴포넌트 언마운트 시 이전 요청 클린업
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 기록 제출 시 카운트 및 주자 시뮬레이션 업데이트
  const handleSubmitRecord = () => {
    let finalPlayResult = '';
    if (pitchInfo.pitchResult === 'InPlay') {
      finalPlayResult = pitchInfo.playResult;
    } else if (pitchInfo.pitchResult === 'Strike' && count.strikes === 2) {
      finalPlayResult = 'Strikeout';
    } else if (pitchInfo.pitchResult === 'Ball' && count.balls === 3) {
      finalPlayResult = 'Walk';
    }

    let nextCount = { ...count };
    let nextRunners = { ...runners };
    let runsScored = 0;

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
              runsScored = 1;
              nextRunners.third = nextRunners.second;
              nextRunners.second = nextRunners.first;
              nextRunners.first = pitchInfo.batterName;
            } else {
              nextRunners.third = nextRunners.second;
              nextRunners.second = nextRunners.first;
              nextRunners.first = pitchInfo.batterName;
            }
          } else {
            nextRunners.second = nextRunners.first;
            nextRunners.first = pitchInfo.batterName;
          }
        } else {
          nextRunners.first = pitchInfo.batterName;
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
        if (nextRunners.third) runsScored += 1;
        nextRunners = {
          third: nextRunners.second,
          second: nextRunners.first,
          first: pitchInfo.batterName
        };
      } else if (res === 'Double') {
        if (nextRunners.third) runsScored += 1;
        if (nextRunners.second) runsScored += 1;
        nextRunners = {
          third: nextRunners.first,
          second: pitchInfo.batterName,
          first: ''
        };
      } else if (res === 'Triple') {
        if (nextRunners.third) runsScored += 1;
        if (nextRunners.second) runsScored += 1;
        if (nextRunners.first) runsScored += 1;
        nextRunners = {
          third: pitchInfo.batterName,
          second: '',
          first: ''
        };
      } else if (res === 'HomeRun') {
        runsScored += 1; // 타자 본인
        if (nextRunners.first) runsScored += 1;
        if (nextRunners.second) runsScored += 1;
        if (nextRunners.third) runsScored += 1;
        nextRunners = { first: '', second: '', third: '' };
      } else if (res === 'Strikeout' || res === 'Groundout' || res === 'Flyout' || res === 'Error') {
        if (res !== 'Error') {
          nextCount.outs += 1;
        }
      }
    }

    if (runsScored > 0) {
      setScores((prev) => {
        if (attackingTeam === gameInfo.myTeam) {
          return { ...prev, myTeam: prev.myTeam + runsScored };
        } else {
          return { ...prev, opponentTeam: prev.opponentTeam + runsScored };
        }
      });
      showModal('🎉 득점 발생!', `${attackingTeam} 팀이 ${runsScored}점 득점하였습니다!`, 'info');
    }

    // 3아웃 리셋 이전 시점의 아웃 카운트를 보존 기록
    const recordedOuts = nextCount.outs;

    if (nextCount.outs >= 3) {
      nextCount = { balls: 0, strikes: 0, outs: 0 };
      nextRunners = { first: '', second: '', third: '' };
      showModal('🔄 3아웃 체인지', '공수가 교대되거나 다음 이닝으로 넘어갑니다.', 'info');
    }

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
      playResult: finalPlayResult,
      hitLocation: pitchInfo.pitchResult === 'InPlay' ? hitLocation : null,
      outs: recordedOuts
    };

    setPitchLogs((prev) => [...prev, newLog]);
    setCount(nextCount);
    setRunners(nextRunners);
    setHitLocation(null);

    // [NEW] 로그인 상태(idToken 존재 시) 백엔드로 투구 이력 저장 API 호출 동기화
    if (idToken) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      fetch(`${apiBaseUrl}/api/coach/pitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Mock-UID': user?.uid || ''
        },
        body: JSON.stringify({
          gameDate: gameInfo.date,
          stadium: gameInfo.stadium,
          myTeam: gameInfo.myTeam,
          opponentTeam: gameInfo.opponentTeam,
          pitcherName: pitchInfo.pitcherName,
          pitcherTeam: pitchInfo.pitcherTeam,
          batterName: pitchInfo.batterName,
          batterTeam: pitchInfo.batterTeam,
          pitchType: pitchInfo.pitchType,
          pitchSpeed: pitchInfo.pitchSpeed,
          pitchResult: pitchInfo.pitchResult,
          playResult: finalPlayResult,
          hitLocationX: hitLocation ? hitLocation.x : null,
          hitLocationY: hitLocation ? hitLocation.y : null,
          inning: gameInfo.inning,
          inningHalf: gameInfo.inningHalf,
          outs: recordedOuts
        }),
        signal: controller.signal
      }).then(res => {
        clearTimeout(timeoutId);
        if (res.ok) {
          // 백엔드 저장이 정상 처리되면 데이터베이스 기준으로 리포트 동기화
          fetchBackendDashboard();
        } else {
          showModal('💾 서버 저장 실패', '서버 데이터베이스에 기록을 보존하지 못했습니다. 기록은 로컬 브라우저에 임시 보관됩니다.', 'warning');
        }
      }).catch(err => {
        clearTimeout(timeoutId);
        console.error("백엔드 투구 저장 API 호출 에러:", err);
        showModal('🔌 네트워크 오류', '서버와의 통신이 원활하지 않아 기록이 로컬 스토리지에만 저장됩니다.', 'warning');
      });
    }
  };

  const handleResetPositions = () => {
    setPositions(initialPositions);
  };

  const handleResetGameData = () => {
    if (window.confirm('🚨 경기의 모든 데이터(점수, 투구 로그, 라인업 등)를 초기화하고 처음부터 다시 시작하시겠습니까?')) {
      const keysToRemove = [
        'baseball_positions',
        'baseball_runners',
        'baseball_count',
        'baseball_pitchLogs',
        'baseball_scores',
        'baseball_hitLocation',
        'baseball_gameInfo',
        'baseball_pitchInfo',
        'baseball_defenders',
        'baseball_battingOrder',
        'baseball_migratedLogIds'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-12">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <img 
            src="/favicon_baseball_ai.jpg" 
            alt="Baseball AI Coach Logo" 
            className="w-9 h-9 rounded-lg object-cover shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-500/20"
          />
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              Baseball AI Coach <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-normal whitespace-nowrap">v1.6-beta</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">데이터 기반 야구 전술 의사결정 서포터</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
          {/* [NEW] 소셜 로그인 / 사용자 정보 표시 UI */}
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 rounded-xl py-1 px-3 shadow-inner">
              <img 
                src={user.photoURL || "https://lh3.googleusercontent.com/a/mock-photo-url"} 
                alt={user.displayName}
                className="w-7 h-7 rounded-full border border-emerald-500/30 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold leading-tight">{user.displayName}</span>
                <span className="text-[8px] text-slate-500 font-semibold leading-tight">{isMockAuth ? "Mock 회원" : "구글 로그인"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold py-1 px-2 rounded-md transition-all ml-1.5"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold py-2 px-3.5 rounded-lg shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all"
            >
              🔑 Google 로그인
            </button>
          )}
          
          <div className="h-6 w-px bg-white/10" />

          <button
            onClick={handleResetPositions}
            className="text-xs bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-bold py-2 px-3.5 rounded-lg transition-all"
          >
            🔄 수비 위치 초기화
          </button>
          <button
            onClick={handleResetGameData}
            className="text-xs bg-red-950/30 border border-red-500/30 hover:bg-red-900/40 hover:border-red-500 text-red-400 font-bold py-2 px-3.5 rounded-lg transition-all"
          >
            🧹 경기 데이터 초기화
          </button>
          <div className="hidden sm:block h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-slate-400">AI 실시간 연동 중</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto px-6 mt-8 flex flex-col gap-8">
        {/* [NEW] 비회원 테스트 화면 배너 알림 */}
        {!user && (
          <div className="w-full bg-amber-500/5 border border-amber-500/20 px-5 py-3 rounded-2xl flex items-center justify-between gap-4 shadow-[0_0_15px_rgba(245,158,11,0.02)]">
            <div className="flex items-center gap-2.5">
              <span className="text-sm">⚠️</span>
              <span className="text-xs font-extrabold text-amber-400/90">비회원 테스트 화면입니다. (작성한 전술 및 경기 기록은 브라우저에 임시 보관되며, 로그인 완료 시 서버에 안전하게 영구 저장됩니다.)</span>
            </div>
            <button 
              onClick={handleLogin}
              className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500 text-amber-300 font-extrabold py-1.5 px-3 rounded-lg transition-all whitespace-nowrap"
            >
              🔑 간편 로그인
            </button>
          </div>
        )}

        {/* 스코어보드 섹션 */}
        <div className="w-full bg-slate-900/80 border border-white/10 p-5 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* My Team Score */}
          <div className="flex items-center gap-4">
            {teamLogos[gameInfo.myTeam] ? (
              <img 
                src={teamLogos[gameInfo.myTeam]} 
                alt={`${gameInfo.myTeam} Logo`} 
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg shadow-indigo-500/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/20 font-mono">
                {gameInfo.myTeam[0] || 'M'}
              </div>
            )}
            <div>
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">우리 팀 (MY TEAM)</div>
              <div className="text-base font-black text-white">{gameInfo.myTeam}</div>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 border border-white/5 rounded-xl p-1.5 ml-4">
              <button 
                onClick={() => setScores(prev => ({ ...prev, myTeam: Math.max(0, prev.myTeam - 1) }))}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-all text-xs"
              >
                -
              </button>
              <span className="w-8 text-center text-xl font-mono font-black text-emerald-400">{scores.myTeam}</span>
              <button 
                onClick={() => setScores(prev => ({ ...prev, myTeam: prev.myTeam + 1 }))}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-all text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Inning & Count Status */}
          <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-2 border-y lg:border-y-0 lg:border-x border-white/5 flex-1 min-w-[200px]">
            <span className="text-xs font-mono font-black tracking-widest text-amber-500 bg-amber-950/40 border border-amber-500/20 px-3.5 py-1 rounded-full">
              {gameInfo.inning}회 {gameInfo.inningHalf}
            </span>
            <div className="flex items-center gap-6 mt-1 text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>B <span className="font-mono text-emerald-400">{count.balls}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>S <span className="font-mono text-amber-400">{count.strikes}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>O <span className="font-mono text-red-400">{count.outs}</span></span>
              </div>
            </div>
          </div>

          {/* Opponent Score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-white/5 rounded-xl p-1.5 mr-4">
              <button 
                onClick={() => setScores(prev => ({ ...prev, opponentTeam: Math.max(0, prev.opponentTeam - 1) }))}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-all text-xs"
              >
                -
              </button>
              <span className="w-8 text-center text-xl font-mono font-black text-rose-400">{scores.opponentTeam}</span>
              <button 
                onClick={() => setScores(prev => ({ ...prev, opponentTeam: prev.opponentTeam + 1 }))}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-all text-xs"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">상대 팀 (OPPONENT)</div>
              <div className="text-base font-black text-white">{gameInfo.opponentTeam}</div>
            </div>
            {teamLogos[gameInfo.opponentTeam] ? (
              <img 
                src={teamLogos[gameInfo.opponentTeam]} 
                alt={`${gameInfo.opponentTeam} Logo`} 
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-lg shadow-rose-500/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-rose-500/20 font-mono">
                {gameInfo.opponentTeam[0] || 'O'}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          <div className="lg:col-span-6 flex flex-col gap-6 items-center w-full">
            {/* 상단 분리형 가이드 및 전광판 정보 카드 */}
            <div className="w-full bg-slate-900/80 border border-white/10 p-5 rounded-2xl flex justify-between items-center text-xs backdrop-blur-md shadow-xl">
              <div className="text-slate-300 leading-relaxed font-semibold">
                📢 <span className="text-emerald-400 font-bold">수비수</span> 드래그 시프트 조절<br/>
                🏟️ <span className="text-amber-400 font-bold">필드</span> 클릭 타구 좌표 지정
              </div>
              <div className="flex flex-col items-end gap-1.5 border-l border-white/10 pl-4">
                <span className="text-[10px] text-emerald-400 font-extrabold font-sans tracking-wider">
                  🏟️ {gameInfo.stadium.split(' ')[0]} | {gameInfo.inning}회{gameInfo.inningHalf}
                </span>
                <div className="flex gap-1.5 text-[9px] font-bold">
                  <span className="bg-red-950/80 text-red-400 px-2 py-0.5 rounded border border-red-500/20 shadow-sm">
                    🔥 공격: {attackingTeam}
                  </span>
                  <span className="bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 shadow-sm">
                    🛡️ 수비: {defendingTeam}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full aspect-square shrink-0 bg-slate-900/80 border border-white/10 p-2 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col items-center justify-center overflow-hidden">
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
            </div>
            <PlayInputPanel
              gameInfo={gameInfo}
              setGameInfo={setGameInfo}
              pitchInfo={pitchInfo}
              setPitchInfo={setPitchInfo}
              count={count}
              onCountChange={handleCountChange}
              runners={runners}
              onRunnerToggle={handleRunnerToggle}
              onRunnerNameChange={handleRunnerNameChange}
              hitLocation={hitLocation}
              onSubmitRecord={handleSubmitRecord}
              onTriggerAiAnalysis={handleTriggerAiAnalysis}
              showModal={showModal}
            />
          </div>

          <div className="lg:col-span-6 w-full">
            <Dashboard 
              pitchLogs={pitchLogs} 
              aiAdvice={aiAdvice} 
              defenders={defenders}
              onDefenderUpdate={handleDefenderUpdate}
              onDefenderPositionSwap={handleDefenderPositionSwap}
              defendingTeam={defendingTeam}
              battingOrder={battingOrder}
              onBattingOrderUpdate={handleBattingOrderUpdate}
              attackingTeam={attackingTeam}
              currentBatterName={pitchInfo.batterName}
            />
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-white/10 bg-slate-950/80 px-6 py-10 text-center">
        <p className="text-sm font-semibold text-slate-400">
          © 2026 Doyeon · Built with <span className="text-amber-300">⚾</span> using React & Vite. All rights reserved.
        </p>
        <a
          href="https://github.com/dorigum/Baseball-ai-coach"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 transition-colors hover:text-emerald-300"
        >
          <svg aria-hidden="true" className="h-3.5 w-3.5 fill-current">
            <use href="/icons.svg#github-icon" />
          </svg>
          Developer Polar bear 빼꼼🐻‍❄️_GitHub Repo.
        </a>
      </footer>

      <button
        type="button"
        onClick={handleScrollTop}
        aria-label="맨 위로 이동"
        className={`fixed bottom-7 right-7 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950 ${
          showTopButton ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-3'
        }`}
      >
        <ArrowUp size={22} strokeWidth={2.4} />
      </button>
      {/* 커스텀 다크 모드 Glassmorphism 알림 모달 */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl backdrop-blur-md transform transition-all scale-100 flex flex-col">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                modal.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                modal.type === 'info' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {modal.type === 'error' ? '🚨' : modal.type === 'info' ? '🔄' : '⚠️'}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1.5">{modal.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium">{modal.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all border border-indigo-400/20 shadow-md active:scale-95"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
