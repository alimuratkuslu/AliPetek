package com.game.alipetek.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Builder
@Table(name = "games")
@AllArgsConstructor
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;
    @Enumerated(EnumType.STRING)
    private GameStatusEnum gameStatusEnum;

    @ManyToOne
    @JoinColumn(name = "first_user_id")
    private User firstUser;

    @Column(name = "first_user_points", nullable = false)
    private int firstUserPoints;
    @ManyToOne
    @JoinColumn(name = "second_user_id")
    private User secondUser;

    @Column(name = "second_user_points", nullable = false)
    private int secondUserPoints;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private User winner;

    @OneToMany(fetch = FetchType.EAGER)
    @JoinColumn(name = "game_id")
    private List<Question> questionList;

    @Column(name = "first_session_id")
    private String firstSessionId;

    @Column(name = "second_session_id")
    private String secondSessionId;

    @ManyToOne
    @JoinColumn(name = "current_question_id")
    private Question currentQuestion;

    @Column(name = "current_dice", nullable = false)
    private int currentDice;

    @Column(name = "current_letter", nullable = false)
    private String currentLetter;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "finished_date")
    private LocalDateTime finishedDate;

    public Game() {

    }

    public List<User> getPlayers() {
        List<User> players = new ArrayList<>();
        if (firstUser != null) players.add(firstUser);
        if (secondUser != null) players.add(secondUser);
        return players;
    }
}
