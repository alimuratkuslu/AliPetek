package com.game.alipetek.exception;

public class AuthenticationException extends RuntimeException {
    private final String field;

    public AuthenticationException(String message, String field) {
        super(message);
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
