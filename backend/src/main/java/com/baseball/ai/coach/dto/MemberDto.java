package com.baseball.ai.coach.dto;

import com.baseball.ai.coach.domain.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
public class MemberDto {
    private final String uid;
    private final String email;
    private final String displayName;
    private final String photoUrl;
    private final String myTeam;

    @Builder
    public MemberDto(String uid, String email, String displayName, String photoUrl, String myTeam) {
        this.uid = uid;
        this.email = email;
        this.displayName = displayName;
        this.photoUrl = photoUrl;
        this.myTeam = myTeam;
    }

    public static MemberDto from(Member member) {
        if (member == null) return null;
        return MemberDto.builder()
                .uid(member.getUid())
                .email(member.getEmail())
                .displayName(member.getDisplayName())
                .photoUrl(member.getPhotoUrl())
                .myTeam(member.getMyTeam())
                .build();
    }
}
