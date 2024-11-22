package com.game.alipetek.model;

public enum QuestionDifficultyEnum {
    ONE(1), TWO(2), THREE(3), FOUR(4), FIVE(5), SIX(6);

    private int difficulty;

    QuestionDifficultyEnum(int difficulty) {
        this.difficulty = difficulty;
    }

    public int getDifficulty() {
        return difficulty;
    }
}
