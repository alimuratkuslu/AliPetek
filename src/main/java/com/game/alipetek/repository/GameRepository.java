package com.game.alipetek.repository;

import com.game.alipetek.model.Game;
import com.game.alipetek.model.GameStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {
    Optional<Game> findFirstByGameStatusEnumAndSecondUserIsNull(GameStatusEnum gameStatusEnum);

    @Query("SELECT g FROM Game g WHERE (g.firstUser.username = :username OR g.secondUser.username = :username) AND g.gameStatusEnum = :gameStatusEnum ORDER BY g.createdDate DESC")
    Optional<Game> findInProgressGameByUser(@Param("username") String username, @Param("gameStatusEnum") GameStatusEnum gameStatusEnum);

    @Query("SELECT g FROM Game g WHERE g.firstSessionId = :sessionId OR g.secondSessionId = :sessionId")
    Optional<Game> findGameBySessionId(@Param("sessionId") String sessionId);

    @Query("SELECT g FROM Game g WHERE (g.firstUser.username = :username OR g.secondUser.username = :username)")
    List<Game> findPreviousGamesByUser(@Param("username") String username);
}
