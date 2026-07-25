package com.baseball.ai.coach.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@Configuration
public class FirebaseConfig {

    private static boolean mockMode = false;

    @PostConstruct
    public void initFirebase() {
        String configPath = System.getenv("FIREBASE_CONFIG_PATH");
        
        if (configPath == null || configPath.trim().isEmpty() || !Files.exists(Paths.get(configPath))) {
            log.warn("⚠️ [Firebase] FIREBASE_CONFIG_PATH 환경 변수가 설정되지 않았거나 설정 파일이 존재하지 않습니다.");
            log.warn("🚨 [Firebase] 시스템이 'Mock 인증 모드'로 가동됩니다. 프론트엔드와 백엔드 간 가상 토큰을 사용해 로컬 테스트를 진행할 수 있습니다.");
            mockMode = true;
            return;
        }

        try (InputStream serviceAccount = new FileInputStream(configPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("✅ [Firebase] Firebase Admin SDK 초기화 성공 (Config: {})", configPath);
            }
        } catch (IOException e) {
            log.error("❌ [Firebase] Firebase Admin SDK 초기화 중 에러 발생, Mock 모드로 전환합니다.", e);
            mockMode = true;
        }
    }

    public static boolean isMockMode() {
        return mockMode;
    }
}
