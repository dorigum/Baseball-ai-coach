package com.baseball.ai.coach.repository;

import com.baseball.ai.coach.domain.PitchRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PitchRecordRepository extends JpaRepository<PitchRecord, Long> {
    List<PitchRecord> findByPlateAppearanceGameId(Long gameId);
    List<PitchRecord> findByPlateAppearanceGameMemberUid(String uid);
    List<PitchRecord> findByPlateAppearanceGameMemberIsNull();
    List<PitchRecord> findByPlateAppearanceGameIdAndPlateAppearanceGameMemberUid(Long gameId, String uid);
    List<PitchRecord> findByPlateAppearanceGameIdAndPlateAppearanceGameMemberIsNull(Long gameId);
    
    @Query("SELECT pr.pitchType, COUNT(pr) FROM PitchRecord pr " +
           "JOIN pr.plateAppearance pa " +
           "WHERE pa.game.id = :gameId AND pa.pitcher.id = :pitcherId " +
           "GROUP BY pr.pitchType")
    List<Object[]> countPitchTypeByGameAndPitcher(@Param("gameId") Long gameId, @Param("pitcherId") Long pitcherId);
}
