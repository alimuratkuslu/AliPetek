package com.game.alipetek.service;

import com.game.alipetek.dto.CreateQuestionRequest;
import com.game.alipetek.model.Question;
import com.game.alipetek.model.QuestionDifficultyEnum;
import com.game.alipetek.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public Question createQuestion(CreateQuestionRequest createQuestionRequest) {
        if (createQuestionRequest == null) {
            // TODO: Exception Handling
            return null;
        }

        if (createQuestionRequest.getText().isBlank() || createQuestionRequest.getAnswer().isBlank()) {
            // TODO: Exception Handling
            return null;
        }

        Question question = Question.builder()
                .text(createQuestionRequest.getText())
                .answer(createQuestionRequest.getAnswer())
                .letter(createQuestionRequest.getAnswer().charAt(0))
                .questionDifficultyEnum(createQuestionRequest.getQuestionDifficultyEnum())
                .points(createQuestionRequest.getPoints())
                .build();

        questionRepository.save(question);
        return question;
    }

    public Question getFirstQuestion(int diceRoll) {
        Random random = new Random();

        QuestionDifficultyEnum difficulty = QuestionDifficultyEnum.values()[diceRoll - 1];
        List<Question> matchingQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getLetter().toString().equalsIgnoreCase("A") &&
                        q.getQuestionDifficultyEnum() == difficulty)
                .collect(Collectors.toList());

        Question selectedQuestion = null;
        if (!matchingQuestions.isEmpty()) {
            selectedQuestion = matchingQuestions.get(random.nextInt(matchingQuestions.size()));
        }

        return selectedQuestion;
    }

    public Question getQuestionById(Long id) {
        return questionRepository.findById(id).get();
    }

    public List<Question> loadQuestions() {
        List<Question> allQuestions = questionRepository.findAll();
        // Group questions by letter
        Map<Character, List<Question>> questionsByLetter = allQuestions.stream()
                .collect(Collectors.groupingBy(Question::getLetter));

        List<Question> selectedQuestions = new ArrayList<>();

        for (char letter = 'A'; letter <= 'Z'; letter++) {
            // Check for NullPointerException
            List<Question> questionsForLetter = questionsByLetter.getOrDefault(letter, Collections.emptyList());

            // Group lettered-questions by difficulty
            Map<QuestionDifficultyEnum, List<Question>> questionsByDifficulty = questionsForLetter.stream()
                    .collect(Collectors.groupingBy(Question::getQuestionDifficultyEnum));

            // Fill selectedQuestions list with same letter and different difficulties
            for (QuestionDifficultyEnum difficulty : QuestionDifficultyEnum.values()) {
                List<Question> questionsForDifficulty = questionsByDifficulty.getOrDefault(difficulty, Collections.emptyList());
                // Check if we have questions with different difficulties
                if (!questionsForDifficulty.isEmpty()) {
                    // Pick random question from difficulty
                    Question randomQuestion = questionsForDifficulty.get(new Random().nextInt(questionsForDifficulty.size()));
                    selectedQuestions.add(randomQuestion);
                }
            }
        }

        return selectedQuestions;
    }
}
