package com.game.alipetek.repository;

import com.game.alipetek.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.score DESC")
    List<User> findAllUsersOrderByScore();

    Optional<User> findByVerificationCode(String verificationCode);
}
