package com.game.alipetek.config;

import com.game.alipetek.model.Game;
import com.game.alipetek.model.GameStatusEnum;
import com.game.alipetek.model.User;
import com.game.alipetek.service.GameService;
import com.game.alipetek.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messageTemplate;
    private final GameService gameService;
    private final UserService userService;

    //private final SessionRegistry sessionRegistry;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String username = headerAccessor.getUser().getName();

        log.info("User {} connected with session ID: {}", username, sessionId);

        //sessionRegistry.registerSessionId(username, sessionId);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent disconnectEvent) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(disconnectEvent.getMessage());
        String sessionId = headerAccessor.getSessionId();
        String disconnectedUsername = headerAccessor.getUser().getName();

        if (disconnectedUsername != null) {
            log.info("User {} disconnected from session {}", disconnectedUsername, sessionId);
            try {
                Game game = gameService.getGameBySessionId(sessionId);
                if (game != null && game.getGameStatusEnum() != GameStatusEnum.FINISHED) {
                    User remainingUser = game.getFirstUser().getUsername().equals(disconnectedUsername)
                            ? game.getSecondUser()
                            : game.getFirstUser();

                    userService.setDisconnectScore(remainingUser);

                    game.setGameStatusEnum(GameStatusEnum.FINISHED);
                    game.setWinner(remainingUser);
                    gameService.saveGame(game);

                    messageTemplate.convertAndSend("/topic/game/" + game.getId(),
                            Map.of(
                                    "type", "PLAYER_DISCONNECTED",
                                    "game", game,
                                    "disconnectedPlayer", disconnectedUsername
                            )
                    );
                }
            } catch (Exception e) {
                log.error("Error handling disconnect for user {}: {}", disconnectedUsername, e.getMessage());
            }
            //sessionRegistry.removeSession(sessionId);
        }
    }
}
