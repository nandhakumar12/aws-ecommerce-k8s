package com.ecommerce.users.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@DynamoDbBean
public class Address {
    
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String addressType; // HOME, WORK, OTHER

    public Address() {}

    public Address(String street, String city, String state, String zipCode, String country) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
        this.addressType = "HOME";
    }

    @DynamoDbAttribute("street")
    @NotBlank(message = "Street address is required")
    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    @DynamoDbAttribute("city")
    @NotBlank(message = "City is required")
    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    @DynamoDbAttribute("state")
    @NotBlank(message = "State is required")
    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    @DynamoDbAttribute("zipCode")
    @NotBlank(message = "ZIP code is required")
    @Size(min = 5, max = 10, message = "ZIP code must be between 5 and 10 characters")
    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    @DynamoDbAttribute("country")
    @NotBlank(message = "Country is required")
    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    @DynamoDbAttribute("addressType")
    public String getAddressType() {
        return addressType;
    }

    public void setAddressType(String addressType) {
        this.addressType = addressType;
    }

    public String getFormattedAddress() {
        return String.format("%s, %s, %s %s, %s", 
                street, city, state, zipCode, country);
    }

    @Override
    public String toString() {
        return "Address{" +
                "street='" + street + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + zipCode + '\'' +
                ", country='" + country + '\'' +
                ", addressType='" + addressType + '\'' +
                '}';
    }
}
