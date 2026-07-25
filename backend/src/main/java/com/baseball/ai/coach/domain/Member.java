package com.baseball.ai.coach.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;

    @Column(nullable = false)
    private String email;

    private String displayName;

    private String photoUrl;

    private String myTeam;

    @Builder
    public Member(String uid, String email, String displayName, String photoUrl, String myTeam) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.photoUrl = photoUrl;
        this.myTeam = myTeam;
    }

    public void updateProfile(String displayName, String photoUrl) {
        this.displayName = displayName;
        this.photoUrl = photoUrl;
    }

    public void updateMyTeam(String myTeam) {
        this.myTeam = myTeam;
    }
}
