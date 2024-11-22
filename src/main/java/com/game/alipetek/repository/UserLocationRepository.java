package com.game.alipetek.repository;

import com.game.alipetek.model.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {

    @Query("SELECT ul FROM UserLocation ul WHERE ul.user.username = :username")
    Optional<UserLocation> findUserByUsername(@Param("username") String username);
}
