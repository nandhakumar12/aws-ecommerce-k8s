package com.ecommerce.products.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import jakarta.validation.constraints.DecimalMin;

@DynamoDbBean
public class ProductDimensions {
    
    private Double length;
    private Double width;
    private Double height;
    private String unit; // cm, inch, etc.

    public ProductDimensions() {
        this.unit = "cm";
    }

    public ProductDimensions(Double length, Double width, Double height, String unit) {
        this.length = length;
        this.width = width;
        this.height = height;
        this.unit = unit;
    }

    @DynamoDbAttribute("length")
    @DecimalMin(value = "0.0", message = "Length cannot be negative")
    public Double getLength() {
        return length;
    }

    public void setLength(Double length) {
        this.length = length;
    }

    @DynamoDbAttribute("width")
    @DecimalMin(value = "0.0", message = "Width cannot be negative")
    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    @DynamoDbAttribute("height")
    @DecimalMin(value = "0.0", message = "Height cannot be negative")
    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    @DynamoDbAttribute("unit")
    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getFormattedDimensions() {
        if (length == null || width == null || height == null) {
            return "N/A";
        }
        return String.format("%.1f x %.1f x %.1f %s", length, width, height, unit);
    }

    @Override
    public String toString() {
        return "ProductDimensions{" +
                "length=" + length +
                ", width=" + width +
                ", height=" + height +
                ", unit='" + unit + '\'' +
                '}';
    }
}
