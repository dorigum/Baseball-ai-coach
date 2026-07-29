import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Vite 환경 변수 로드
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let googleProvider;
let isMockAuth = false;

// 필수 키가 누락되었을 경우 Mock 인증 모드로 가동 (단, 개발 빌드 환경인 경우에만 허용)
const isDev = import.meta.env.DEV;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "" || firebaseConfig.apiKey === "YOUR_API_KEY") {
  if (isDev) {
    console.warn("⚠️ [Firebase] Firebase API Key가 유효하지 않거나 설정되지 않았습니다.");
    console.warn("🚨 [Firebase] 프론트엔드가 'Mock 인증 모드'로 작동합니다. 소셜 로그인 버튼 클릭 시 가상 로그인이 수행됩니다.");
    isMockAuth = true;
  } else {
    console.error("❌ [Firebase] 프로덕션 환경에서 Firebase 설정 키가 올바르지 않습니다. 로그인이 비활성화됩니다.");
    isMockAuth = false;
  }
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    if (isDev) {
      console.error("❌ [Firebase] 초기화 중 예외 발생, Mock 모드로 전환합니다.", error);
      isMockAuth = true;
    } else {
      console.error("❌ [Firebase] 초기화 중 예외 발생. 프로덕션 환경이므로 로그인이 비활성화됩니다.", error);
      isMockAuth = false;
    }
  }
}

// 구글 로그인 함수 (Mock 모드 지원)
export const loginWithGoogle = async () => {
  if (isMockAuth) {
    // Mock 모드 동작: 가상 계정 정보 및 Mock 토큰 리턴
    return {
      user: {
        uid: "mock-user-123",
        email: "mock-user-123@baseball-mock.com",
        displayName: "Mock 테스트 주자",
        photoURL: "https://lh3.googleusercontent.com/a/mock-photo-url"
      },
      idToken: "mock-jwt-token"
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      idToken
    };
  } catch (error) {
    console.error("❌ [Firebase Auth] 구글 로그인 에러:", error);
    throw error;
  }
};

// 로그아웃 함수 (Mock 모드 지원)
export const logout = async () => {
  if (isMockAuth) {
    return true;
  }
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("❌ [Firebase Auth] 로그아웃 에러:", error);
    throw error;
  }
};

export { auth, isMockAuth };
