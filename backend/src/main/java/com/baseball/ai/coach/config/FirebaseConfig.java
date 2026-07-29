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

    private static final String MOCK_MODE_ENV = "FIREBASE_MOCK_MODE";
    private static boolean mockMode = false;

    @PostConstruct
    public void initFirebase() {
        // [3] Mock 모드는 명시적인 환경 변수(FIREBASE_MOCK_MODE=true)가 있을 때만 활성화
        if (Boolean.parseBoolean(System.getenv(MOCK_MODE_ENV))) {
            mockMode = true;
            log.warn("[Firebase] 명시적으로 Mock 인증 모드를 활성화했습니다. (FIREBASE_MOCK_MODE=true)");
            return;
        }

        String configPath = System.getenv("FIREBASE_CONFIG_PATH");

        if (configPath == null || configPath.trim().isEmpty() || !Files.exists(Paths.get(configPath))) {
            // 설정 파일이 없으면 Mock으로 무음 전환하지 않고 즉시 애플리케이션 시작을 중단
            throw new IllegalStateException(
                "[Firebase] FIREBASE_CONFIG_PATH가 설정되지 않았거나 파일이 존재하지 않습니다. " +
                "로컬 테스트 시에는 FIREBASE_MOCK_MODE=true 환경 변수를 명시적으로 설정하세요."
            );
        }

        try (InputStream serviceAccount = new FileInputStream(configPath)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("[Firebase] Firebase Admin SDK 초기화 성공.");
            }
        } catch (IOException e) {
            // SDK 초기화 실패 시에도 Mock으로 자동 전환하지 않고 시작 중단
            throw new IllegalStateException("[Firebase] Firebase Admin SDK 초기화에 실패했습니다.", e);
        }
    }

    public static boolean isMockMode() {
        return mockMode;
    }
}
