package com.game.alipetek.controller;

import com.game.alipetek.dto.CreateGameRequest;
import com.game.alipetek.dto.GamePlay;
import com.game.alipetek.dto.JoinFriendsGameRequest;
import com.game.alipetek.exception.InvalidGameException;
import com.game.alipetek.exception.NotFoundException;
import com.game.alipetek.exception.WrongAnswerException;
import com.game.alipetek.model.Game;
import com.game.alipetek.model.GameStateUpdate;
import com.game.alipetek.model.GameStatusEnum;
import com.game.alipetek.model.User;
import com.game.alipetek.service.GameService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/game")
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    public GameController(GameService gameService, SimpMessagingTemplate simpMessagingTemplate) {
        this.gameService = gameService;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    /*
    @PostMapping("/loadQuestion")
    public ResponseEntity<LoadQuestionWithDiceDto> loadQuestionWithDice(@RequestBody LoadQuestionRequest loadQuestionRequest) {
        LoadQuestionWithDiceDto loadQuestionWithDiceDto = gameService.loadQuestionWithDice(loadQuestionRequest);
        Game game = gameService.getGameById(loadQuestionRequest.getGameId());
        simpMessagingTemplate.convertAndSend("/topic/dice-rolled/" + game.getId(), game);
        return ResponseEntity.ok(loadQuestionWithDiceDto);
    }
    */

    @GetMapping("/{id}")
    public ResponseEntity<Game> getGame(@PathVariable Long id) throws NotFoundException {
        Game game = gameService.getGameById(id);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/create")
    public ResponseEntity<Game> createGame(@RequestBody CreateGameRequest createGameRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        //String sessionId = sessionRegistry.getSessionId(currentUser.getUsername());
        log.info("create game request: {} with sessionId: {}", currentUser.getUsername(), createGameRequest.getSessionId());
        Game game = gameService.createGame(currentUser.getUsername(), createGameRequest.getSessionId());
        //sessionRegistry.registerGameSession(sessionId, game.getId());

        broadcastGameUpdate(game, null);
        //simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/connect/random")
    public ResponseEntity<Game> joinRandomGame(@RequestBody CreateGameRequest createGameRequest) throws InvalidGameException, NotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        log.info("join random game request: {}", currentUser.getUsername());
        Game game = gameService.connectToRandomGame(currentUser.getUsername());
        game.setSecondSessionId(createGameRequest.getSessionId());
        gameService.saveGame(game);
        if (game.getGameStatusEnum() == GameStatusEnum.IN_PROGRESS) {
            GameStateUpdate update = new GameStateUpdate(game, System.currentTimeMillis() + 5000); // 5 seconds from now
            broadcastGameUpdate(game, update.getStartTimestamp());
        } else {
            broadcastGameUpdate(game, null);
        }
        //simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/connect")
    public ResponseEntity<Game> joinFriendsGame(@RequestBody JoinFriendsGameRequest joinFriendsGameRequest) throws InvalidGameException, NotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        log.info("join friend's game request: {}", currentUser.getUsername());
        joinFriendsGameRequest.setUsername(currentUser.getUsername());
        Game game = gameService.connectToFriendsGame(joinFriendsGameRequest);
        game.setSecondSessionId(joinFriendsGameRequest.getSessionId());
        gameService.saveGame(game);
        if (game.getGameStatusEnum() == GameStatusEnum.IN_PROGRESS) {
            GameStateUpdate update = new GameStateUpdate(game, System.currentTimeMillis() + 5000); // 5 seconds from now
            broadcastGameUpdate(game, update.getStartTimestamp());
        } else {
            broadcastGameUpdate(game, null);
        }
        //simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getId(), game);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay gamePlay) throws InvalidGameException, NotFoundException, WrongAnswerException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        log.info("gameplay: {}", gamePlay);
        gamePlay.setUsername(currentUser.getUsername());
        Game game = gameService.gamePlay(gamePlay);
        broadcastGameUpdate(game, null);
        simpMessagingTemplate.convertAndSend("/topic/dice-rolled/" + game.getId(), game);
        return ResponseEntity.ok(game);
    }

    private void broadcastGameUpdate(Game game, Long startTimestamp) {
        if (game != null && game.getId() != null) {
            log.info("Broadcasting game update for game: {}, status: {}, startTimestamp: {}",
                    game.getId(), game.getGameStatusEnum(), startTimestamp);

            GameStateUpdate update = new GameStateUpdate(game, startTimestamp);
            simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getId(), update);
        }
    }
}
