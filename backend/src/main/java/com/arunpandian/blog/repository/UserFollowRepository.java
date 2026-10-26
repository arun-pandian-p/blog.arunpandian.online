package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UUID> {
    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);
    long countByFollowing(User following);
    long countByFollower(User follower);
}
