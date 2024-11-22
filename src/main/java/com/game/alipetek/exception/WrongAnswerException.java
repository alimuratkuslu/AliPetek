package com.game.alipetek.exception;

public class WrongAnswerException extends Exception {

    private String message;

    public WrongAnswerException(String message) {
        this.message = message;
    }

    public String getMessage(String message) {
        return message;
    }
}
