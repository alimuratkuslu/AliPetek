package com.game.alipetek.controller;

import com.game.alipetek.dto.CreateGameRequest;
import com.game.alipetek.dto.GamePlay;
import com.game.alipetek.dto.JoinFriendsGameRequest;
import com.game.alipetek.exception.InvalidGameException;
import com.game.alipetek.exception.NotFoundException;
import com.game.alipetek.exception.WrongAnswerException;
import com.game.alipetek.model.*;
import com.game.alipetek.service.GameService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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

    @GetMapping("/{id}")
    public ResponseEntity<Game> getGame(@PathVariable Long id) throws NotFoundException {
        Game game = gameService.getGameById(id);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/create")
    public ResponseEntity<Game> createGame(@RequestBody CreateGameRequest createGameRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        log.info("create game request: {} with sessionId: {}", currentUser.getUsername(), createGameRequest.getSessionId());
        Game game = gameService.createGame(currentUser.getUsername(), createGameRequest.getSessionId());

        broadcastGameUpdate(game, null);
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
            GameStateUpdate update = new GameStateUpdate(game, System.currentTimeMillis() + 5000);
            broadcastGameUpdate(game, update.getStartTimestamp());
        } else {
            broadcastGameUpdate(game, null);
        }
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
            GameStateUpdate update = new GameStateUpdate(game, System.currentTimeMillis() + 5000);
            broadcastGameUpdate(game, update.getStartTimestamp());
        } else {
            broadcastGameUpdate(game, null);
        }
        return ResponseEntity.ok(game);
    }

    @PostMapping("/gameplay")
    public ResponseEntity<Game> gamePlay(@RequestBody GamePlay gamePlay) throws InvalidGameException, NotFoundException, WrongAnswerException {
        try {
            Game game = gameService.gamePlay(gamePlay);

            if (game.getGameStatusEnum() == GameStatusEnum.FINISHED) {
                simpMessagingTemplate.convertAndSend("/topic/game-progress/" + game.getId(), game);
            } else {
                simpMessagingTemplate.convertAndSend("/topic/dice-rolled/" + game.getId(), game);
            }

            return ResponseEntity.ok(game);
        } catch (InvalidGameException | NotFoundException e) {
            return ResponseEntity.badRequest().build();
        } catch (WrongAnswerException e) {
            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
        }
    }

    @MessageMapping("/update-game/{gameId}")
    @SendTo("/topic/game-progress/{gameId}")
    public Game updateGameAfterDice(@DestinationVariable Long gameId) throws NotFoundException {
        return gameService.getGameById(gameId);
    }

    @MessageMapping("/wrong-guess/{gameId}")
    @SendTo("/topic/wrong-guesses/{gameId}")
    public Map<String, Integer> handleWrongGuess(@DestinationVariable Long gameId, WrongGuessMessage message) {
        try {
            log.info("Handling wrong guess for game {} from player {}", gameId, message.getPlayer());

            if (message.getPlayer() == null || message.getPlayer().trim().isEmpty()) {
                log.error("Invalid player in wrong guess message");
                return new HashMap<String, Integer>() {{
                    put("firstUser", 0);
                    put("secondUser", 0);
                }};
            }

            Game game = gameService.getGameById(gameId);
            game.incrementWrongGuesses(message.getPlayer().trim());
            game = gameService.updateGame(game);

            Map<String, Integer> wrongGuesses = game.getWrongGuesses();
            log.info("Updated wrong guesses for game {}: {}", gameId, wrongGuesses);
            return wrongGuesses;

        } catch (Exception e) {
            log.error("Error handling wrong guess for game {}: {}", gameId, e.getMessage(), e);
            return new HashMap<String, Integer>() {{
                put("firstUser", 0);
                put("secondUser", 0);
            }};
        }
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
