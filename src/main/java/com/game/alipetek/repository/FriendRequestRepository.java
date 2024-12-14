package com.game.alipetek.repository;

import com.game.alipetek.model.FriendRequest;
import com.game.alipetek.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    List<FriendRequest> findByReceiver(User receiver);
}
