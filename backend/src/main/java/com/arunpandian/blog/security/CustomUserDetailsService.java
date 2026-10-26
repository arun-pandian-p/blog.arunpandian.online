package com.arunpandian.blog.security;

import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // 1. Try email or username
        java.util.Optional<User> userOpt = userRepository.findByEmailOrUsername(identifier);

        // 2. If identifier is a valid UUID, try Supabase UID or primary key ID
        if (userOpt.isEmpty()) {
            try {
                java.util.UUID uuid = java.util.UUID.fromString(identifier);
                userOpt = userRepository.findBySupabaseUid(uuid);
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findById(uuid);
                }
            } catch (IllegalArgumentException ignored) {}
        }

        User user = userOpt.orElseThrow(() ->
                new UsernameNotFoundException("User not found with identifier: " + identifier));

        String roleName = user.getRole().name();
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash() != null ? user.getPasswordHash() : "",
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}
