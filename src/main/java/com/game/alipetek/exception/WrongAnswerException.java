package com.game.alipetek.exception;

public class WrongAnswerException extends Exception {

    private String message;

    private final String field;

    public WrongAnswerException(String message, String field) {
        this.message = message;
        this.field = field;
    }

    public String getMessage(String message) {
        return message;
    }

    public String getField() {
        return field;
    }
}
