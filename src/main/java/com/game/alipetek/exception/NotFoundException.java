package com.game.alipetek.exception;

public class NotFoundException extends Exception{

    private String message;

    public NotFoundException(String message) {
        this.message = message;
    }

    public String getMessage(String message) {
        return message;
    }
}
