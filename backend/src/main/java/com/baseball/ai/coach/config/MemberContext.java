package com.baseball.ai.coach.config;

import com.baseball.ai.coach.domain.Member;

public class MemberContext {
    private static final ThreadLocal<Member> CURRENT_MEMBER = new ThreadLocal<>();

    public static void setMember(Member member) {
        CURRENT_MEMBER.set(member);
    }

    public static Member getMember() {
        return CURRENT_MEMBER.get();
    }

    public static void clear() {
        CURRENT_MEMBER.remove();
    }
}
