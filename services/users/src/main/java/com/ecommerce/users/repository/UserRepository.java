package com.ecommerce.users.repository;

import com.ecommerce.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class UserRepository {

    private final DynamoDbTable<User> userTable;

    @Autowired
    public UserRepository(DynamoDbTable<User> userTable) {
        this.userTable = userTable;
    }

    @Cacheable(value = "users", key = "#userId")
    public Optional<User> findById(String userId) {
        try {
            User user = userTable.getItem(Key.builder()
                    .partitionValue(userId)
                    .build());
            return Optional.ofNullable(user);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @Cacheable(value = "users", key = "#email")
    public Optional<User> findByEmail(String email) {
        try {
            var queryRequest = QueryEnhancedRequest.builder()
                    .queryConditional(QueryConditional.keyEqualTo(Key.builder()
                            .partitionValue(email)
                            .build()))
                    .build();

            var results = userTable.index("email-index").query(queryRequest);
            
            return results.stream()
                    .flatMap(page -> page.items().stream())
                    .findFirst();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    @CacheEvict(value = "users", key = "#user.userId")
    public User save(User user) {
        user.setUpdatedAt(Instant.now());
        userTable.putItem(user);
        return user;
    }

    @CacheEvict(value = "users", key = "#userId")
    public void deleteById(String userId) {
        userTable.deleteItem(Key.builder()
                .partitionValue(userId)
                .build());
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    public List<User> findAll() {
        return userTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public List<User> findByRole(String role) {
        var scanRequest = ScanEnhancedRequest.builder()
                .filterExpression(software.amazon.awssdk.enhanced.dynamodb.Expression.builder()
                        .expression("contains(#roles, :role)")
                        .putExpressionName("#roles", "roles")
                        .putExpressionValue(":role", AttributeValue.builder().s(role).build())
                        .build())
                .build();

        return userTable.scan(scanRequest)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public List<User> findByEnabled(boolean enabled) {
        var scanRequest = ScanEnhancedRequest.builder()
                .filterExpression(software.amazon.awssdk.enhanced.dynamodb.Expression.builder()
                        .expression("#enabled = :enabled")
                        .putExpressionName("#enabled", "enabled")
                        .putExpressionValue(":enabled", AttributeValue.builder().bool(enabled).build())
                        .build())
                .build();

        return userTable.scan(scanRequest)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public List<User> findRecentUsers(int limit) {
        var scanRequest = ScanEnhancedRequest.builder()
                .limit(limit)
                .build();

        return userTable.scan(scanRequest)
                .items()
                .stream()
                .sorted((u1, u2) -> u2.getCreatedAt().compareTo(u1.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "users", key = "#userId")
    public void updateLastLogin(String userId) {
        Optional<User> userOpt = findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.updateLastLogin();
            save(user);
        }
    }

    public long count() {
        return userTable.scan().items().stream().count();
    }
}
