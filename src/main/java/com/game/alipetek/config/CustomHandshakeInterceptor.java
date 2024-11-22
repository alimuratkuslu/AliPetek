package com.game.alipetek.config;

import com.game.alipetek.service.JwtService;
import com.game.alipetek.service.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;

    private final UserDetailsServiceImpl userDetailsService;

    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getHeader("Authorization");

            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                try {
                    String username = jwtService.extractUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (username != null && jwtService.isTokenValid(token, userDetails)) {
                        attributes.put("username", username);
                        log.info("WebSocket handshake: Added username {} to attributes", username);
                        return true;
                    }
                } catch (Exception e) {
                    log.error("Error processing token during WebSocket handshake", e);
                }
            }
        }

        log.warn("WebSocket handshake: No valid authentication token found");
        return true; // You might want to return false to reject unauthenticated connections
    }

    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception ex
    ) {
        // Do nothing
    }
}
