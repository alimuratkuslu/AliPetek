package com.game.alipetek.exception;

public class InvalidGameException extends Exception {

    private String message;

    public InvalidGameException(String message) {
        this.message = message;
    }

    public String getMessage(String message) {
        return message;
    }
}
