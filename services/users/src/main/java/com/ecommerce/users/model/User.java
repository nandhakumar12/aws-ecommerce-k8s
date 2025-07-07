package com.ecommerce.users.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.Instant;
import java.util.Set;
import java.util.HashSet;

@DynamoDbBean
public class User {
    
    private String userId;
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private Set<String> roles = new HashSet<>();
    private boolean enabled = true;
    private boolean emailVerified = false;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;
    private String profileImageUrl;
    private Address defaultAddress;

    // Default constructor required by DynamoDB
    public User() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.roles.add("USER");
    }

    public User(String email, String firstName, String lastName, String password) {
        this();
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.userId = generateUserId();
    }

    @DynamoDbPartitionKey
    @DynamoDbAttribute("userId")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = "email-index")
    @DynamoDbAttribute("email")
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @DynamoDbAttribute("firstName")
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    @DynamoDbAttribute("lastName")
    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @DynamoDbAttribute("password")
    @JsonIgnore
    @Size(min = 8, message = "Password must be at least 8 characters")
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @DynamoDbAttribute("phoneNumber")
    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @DynamoDbAttribute("roles")
    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    @DynamoDbAttribute("enabled")
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    @DynamoDbAttribute("emailVerified")
    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    @DynamoDbAttribute("createdAt")
    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @DynamoDbAttribute("updatedAt")
    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @DynamoDbAttribute("lastLoginAt")
    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    @DynamoDbAttribute("profileImageUrl")
    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    @DynamoDbAttribute("defaultAddress")
    public Address getDefaultAddress() {
        return defaultAddress;
    }

    public void setDefaultAddress(Address defaultAddress) {
        this.defaultAddress = defaultAddress;
    }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void addRole(String role) {
        this.roles.add(role);
    }

    public void removeRole(String role) {
        this.roles.remove(role);
    }

    public boolean hasRole(String role) {
        return this.roles.contains(role);
    }

    public void updateLastLogin() {
        this.lastLoginAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    private String generateUserId() {
        return "user_" + System.currentTimeMillis() + "_" + 
               email.hashCode() + "_" + (int)(Math.random() * 1000);
    }

    @Override
    public String toString() {
        return "User{" +
                "userId='" + userId + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", enabled=" + enabled +
                ", emailVerified=" + emailVerified +
                ", roles=" + roles +
                ", createdAt=" + createdAt +
                '}';
    }
}
