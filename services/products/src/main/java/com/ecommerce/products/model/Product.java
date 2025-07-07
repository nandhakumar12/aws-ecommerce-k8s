package com.ecommerce.products.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*;
import jakarta.validation.constraints.*;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.ArrayList;

@DynamoDbBean
@Document(indexName = "products")
public class Product {
    
    private String productId;
    private String name;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String category;
    private String brand;
    private String sku;
    private Integer stockQuantity;
    private Integer minStockLevel;
    private Boolean active;
    private Boolean featured;
    private Double rating;
    private Integer reviewCount;
    private List<String> imageUrls;
    private Set<String> tags;
    private ProductDimensions dimensions;
    private Double weight;
    private String color;
    private String size;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    public Product() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.active = true;
        this.featured = false;
        this.rating = 0.0;
        this.reviewCount = 0;
        this.imageUrls = new ArrayList<>();
        this.tags = new HashSet<>();
        this.stockQuantity = 0;
        this.minStockLevel = 5;
    }

    @DynamoDbPartitionKey
    @DynamoDbAttribute("productId")
    @Field(type = FieldType.Keyword)
    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = {"category-index", "name-index"})
    @DynamoDbAttribute("name")
    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
    @Field(type = FieldType.Text, analyzer = "standard")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @DynamoDbAttribute("description")
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    @Field(type = FieldType.Text, analyzer = "standard")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @DynamoDbAttribute("shortDescription")
    @Size(max = 500, message = "Short description cannot exceed 500 characters")
    @Field(type = FieldType.Text)
    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    @DynamoDbAttribute("price")
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Field(type = FieldType.Double)
    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    @DynamoDbAttribute("originalPrice")
    @Field(type = FieldType.Double)
    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = "category-index")
    @DynamoDbAttribute("category")
    @NotBlank(message = "Category is required")
    @Field(type = FieldType.Keyword)
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @DynamoDbAttribute("brand")
    @Field(type = FieldType.Keyword)
    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    @DynamoDbAttribute("sku")
    @NotBlank(message = "SKU is required")
    @Field(type = FieldType.Keyword)
    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    @DynamoDbAttribute("stockQuantity")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Field(type = FieldType.Integer)
    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    @DynamoDbAttribute("minStockLevel")
    @Field(type = FieldType.Integer)
    public Integer getMinStockLevel() {
        return minStockLevel;
    }

    public void setMinStockLevel(Integer minStockLevel) {
        this.minStockLevel = minStockLevel;
    }

    @DynamoDbAttribute("active")
    @Field(type = FieldType.Boolean)
    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @DynamoDbAttribute("featured")
    @Field(type = FieldType.Boolean)
    public Boolean getFeatured() {
        return featured;
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    @DynamoDbAttribute("rating")
    @DecimalMin(value = "0.0", message = "Rating cannot be negative")
    @DecimalMax(value = "5.0", message = "Rating cannot exceed 5.0")
    @Field(type = FieldType.Double)
    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    @DynamoDbAttribute("reviewCount")
    @Min(value = 0, message = "Review count cannot be negative")
    @Field(type = FieldType.Integer)
    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    @DynamoDbAttribute("imageUrls")
    @Field(type = FieldType.Keyword)
    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    @DynamoDbAttribute("tags")
    @Field(type = FieldType.Keyword)
    public Set<String> getTags() {
        return tags;
    }

    public void setTags(Set<String> tags) {
        this.tags = tags;
    }

    @DynamoDbAttribute("dimensions")
    public ProductDimensions getDimensions() {
        return dimensions;
    }

    public void setDimensions(ProductDimensions dimensions) {
        this.dimensions = dimensions;
    }

    @DynamoDbAttribute("weight")
    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    @Field(type = FieldType.Double)
    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    @DynamoDbAttribute("color")
    @Field(type = FieldType.Keyword)
    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    @DynamoDbAttribute("size")
    @Field(type = FieldType.Keyword)
    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    @DynamoDbAttribute("createdAt")
    @Field(type = FieldType.Date)
    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @DynamoDbAttribute("updatedAt")
    @Field(type = FieldType.Date)
    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @DynamoDbAttribute("createdBy")
    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    @DynamoDbAttribute("updatedBy")
    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    // Helper methods
    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }

    public boolean isLowStock() {
        return stockQuantity != null && stockQuantity <= minStockLevel;
    }

    public boolean isOnSale() {
        return originalPrice != null && originalPrice.compareTo(price) > 0;
    }

    public BigDecimal getDiscountPercentage() {
        if (!isOnSale()) return BigDecimal.ZERO;
        return originalPrice.subtract(price)
                .divide(originalPrice, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public void addTag(String tag) {
        if (this.tags == null) {
            this.tags = new HashSet<>();
        }
        this.tags.add(tag);
    }

    public void removeTag(String tag) {
        if (this.tags != null) {
            this.tags.remove(tag);
        }
    }

    public void addImageUrl(String imageUrl) {
        if (this.imageUrls == null) {
            this.imageUrls = new ArrayList<>();
        }
        this.imageUrls.add(imageUrl);
    }

    public String getPrimaryImageUrl() {
        return imageUrls != null && !imageUrls.isEmpty() ? imageUrls.get(0) : null;
    }

    @Override
    public String toString() {
        return "Product{" +
                "productId='" + productId + '\'' +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", category='" + category + '\'' +
                ", brand='" + brand + '\'' +
                ", sku='" + sku + '\'' +
                ", stockQuantity=" + stockQuantity +
                ", active=" + active +
                ", rating=" + rating +
                '}';
    }
}
