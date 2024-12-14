package com.game.alipetek.service;

import com.game.alipetek.dto.GamePlay;
import com.game.alipetek.dto.JoinFriendsGameRequest;
import com.game.alipetek.dto.LoadQuestionRequest;
import com.game.alipetek.dto.LoadQuestionWithDiceDto;
import com.game.alipetek.exception.InvalidGameException;
import com.game.alipetek.exception.NotFoundException;
import com.game.alipetek.exception.WrongAnswerException;
import com.game.alipetek.model.*;
import com.game.alipetek.repository.GameRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class GameService {

    private final GameRepository gameRepository;
    private final QuestionService questionService;
    private final UserService userService;

    public GameService(GameRepository gameRepository, QuestionService questionService, UserService userService) {
        this.gameRepository = gameRepository;
        this.questionService = questionService;
        this.userService = userService;
    }

    @Transactional
    public Game getGameWithWrongGuesses(Long gameId) throws NotFoundException {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new NotFoundException("Game not found with id: " + gameId));
    }

    @Transactional
    public Game updateGame(Game game) {
        return gameRepository.save(game);
    }

    @Transactional
    public Game handleWrongGuess(Long gameId, String player) throws NotFoundException {
        Game game = getGameWithWrongGuesses(gameId);
        game.incrementWrongGuesses(player);
        return gameRepository.save(game);
    }

    public LoadQuestionWithDiceDto loadQuestionWithDice(LoadQuestionRequest loadQuestionRequest) {

        Random random = new Random();
        int diceRoll = random.nextInt(6) + 1;

        Optional<Game> optionalGame = gameRepository.findById(loadQuestionRequest.getGameId());
        Game game = optionalGame.get();

        QuestionDifficultyEnum difficulty = QuestionDifficultyEnum.values()[diceRoll - 1];
        List<Question> matchingQuestions = game.getQuestionList().stream()
                .filter(q -> q.getLetter().toString().equalsIgnoreCase(loadQuestionRequest.getLetter()) &&
                        q.getQuestionDifficultyEnum() == difficulty)
                .collect(Collectors.toList());

        Question selectedQuestion = null;
        if (!matchingQuestions.isEmpty()) {
            selectedQuestion = matchingQuestions.get(random.nextInt(matchingQuestions.size()));
        }

        game.setCurrentQuestion(selectedQuestion);
        game.setCurrentDice(diceRoll);
        gameRepository.save(game);

        LoadQuestionWithDiceDto loadQuestionWithDiceDto = LoadQuestionWithDiceDto.builder()
                .dice(diceRoll)
                .game(game != null ? game : null)
                .build();

        return loadQuestionWithDiceDto;
    }

    public Game createGame(String username, String sessionId) {
        User user = userService.getUserByUsername(username);

        Random random = new Random();
        int diceRoll = random.nextInt(6) + 1;

        Game game = Game.builder()
                .gameStatusEnum(GameStatusEnum.NEW)
                .firstUser(user)
                .currentLetter("A")
                .currentDice(diceRoll)
                .currentQuestion(questionService.getFirstQuestion(diceRoll))
                .questionList(questionService.loadQuestions())
                .firstSessionId(sessionId)
                .firstUserPoints(0)
                .createdDate(LocalDateTime.now())
                .build();

        gameRepository.save(game);
        return game;
    }

    public Game connectToRandomGame(String username) throws NotFoundException, InvalidGameException {
        User user = userService.getUserByUsername(username);

        Optional<Game> optionalGame = Optional.ofNullable(gameRepository.findFirstByGameStatusEnumAndSecondUserIsNull(GameStatusEnum.NEW)
                .orElseThrow(() -> new NotFoundException("Game not found")));

        Game game = optionalGame.get();
        if (game.getSecondUser() != null) {
            throw new InvalidGameException("Game is not valid anymore");
        }

        game.setSecondUser(user);
        game.setSecondUserPoints(0);
        game.setGameStatusEnum(GameStatusEnum.IN_PROGRESS);

        gameRepository.save(game);
        return game;
    }

    public Game connectToFriendsGame(JoinFriendsGameRequest request) throws InvalidGameException, NotFoundException {
        User user = userService.getUserByUsername(request.getUsername());

        Optional<Game> optionalGame = gameRepository.findById(Long.valueOf(request.getGameId()));
        if (!optionalGame.isPresent()) {
            throw new NotFoundException("Game not found");
        }
        Game game = optionalGame.get();
        if (game.getSecondUser() != null) {
            throw new InvalidGameException("Game is not valid anymore");
        }

        game.setSecondUser(user);
        game.setSecondUserPoints(0);
        game.setGameStatusEnum(GameStatusEnum.IN_PROGRESS);

        gameRepository.save(game);
        return game;
    }

    public Game gamePlay(GamePlay gamePlay) throws InvalidGameException, NotFoundException, WrongAnswerException {
        Optional<Game> optionalGame = gameRepository.findById(gamePlay.getGameId());
        if (!optionalGame.isPresent()) {
            throw new NotFoundException("Game not found");
        }
        Game game = optionalGame.get();
        Question currentQuestion = game.getCurrentQuestion();

        if (game.getGameStatusEnum().equals(GameStatusEnum.FINISHED)) {
            throw new InvalidGameException("Game is already finished");
        }

        boolean isCorrect = currentQuestion.getAnswer().equalsIgnoreCase(gamePlay.getUserAnswer());

        if (isCorrect) {

            if (game.getFirstUser().getUsername().equals(gamePlay.getUsername())) {
                game.setFirstUserPoints(game.getFirstUserPoints() + currentQuestion.getPoints());
            } else {
                game.setSecondUserPoints(game.getSecondUserPoints() + currentQuestion.getPoints());
            }

            char nextLetter = (char) (currentQuestion.getLetter() + 1);

            if (nextLetter <= 'Z') {
                game.setCurrentLetter(String.valueOf(nextLetter));
                game.resetWrongGuesses();

                Random random = new Random();
                int diceRoll = random.nextInt(6) + 1;
                game.setCurrentDice(diceRoll);

                QuestionDifficultyEnum difficulty = QuestionDifficultyEnum.values()[diceRoll - 1];
                List<Question> matchingQuestions = game.getQuestionList().stream()
                        .filter(q -> q.getLetter().toString().equalsIgnoreCase(String.valueOf(nextLetter)) &&
                                q.getQuestionDifficultyEnum() == difficulty)
                        .collect(Collectors.toList());

                Question selectedQuestion = null;
                if (!matchingQuestions.isEmpty()) {
                    selectedQuestion = matchingQuestions.get(random.nextInt(matchingQuestions.size()));
                }
                game.setCurrentQuestion(selectedQuestion);
                game.setGameStatusEnum(GameStatusEnum.IN_PROGRESS);
            } else {
                game.setFinishedDate(LocalDateTime.now());
                game.setGameStatusEnum(GameStatusEnum.FINISHED);
                game.getFirstUser().setScore(game.getFirstUser().getScore() + game.getFirstUserPoints());
                game.getSecondUser().setScore(game.getSecondUser().getScore() + game.getSecondUserPoints());

                if (game.getFirstUserPoints() >= game.getSecondUserPoints()) {
                    game.setWinner(game.getFirstUser());
                } else {
                    game.setWinner(game.getSecondUser());
                }
            }
        }
        else {
            throw new WrongAnswerException("Your answer is wrong", "wrongAnswer");
        }

        gameRepository.save(game);

        return game;
    }

    public Game getGameByPlayer(String username) {
        return gameRepository.findInProgressGameByUser(username, GameStatusEnum.IN_PROGRESS).get();
    }

    public Game getGameBySessionId(String sessionId) {
        return gameRepository.findGameBySessionId(sessionId).orElse(null);
    }

    public Game getGameById(Long id) {
        return gameRepository.findById(id).get();
    }

    public List<Game> getPreviousGamesByUsername(String username) {
        return gameRepository.findPreviousGamesByUser(username);
    }

    public void saveGame(Game game) {
        gameRepository.save(game);
    }
}
