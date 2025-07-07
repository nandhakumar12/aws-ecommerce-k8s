package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.model.Payment;
import com.ecommerce.payment.model.PaymentStatus;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripePaymentService {

    private static final Logger logger = LoggerFactory.getLogger(StripePaymentService.class);

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        logger.info("Stripe payment service initialized");
    }

    public PaymentResponse createPaymentIntent(PaymentRequest paymentRequest) {
        try {
            // Convert amount to cents (Stripe expects amounts in smallest currency unit)
            long amountInCents = paymentRequest.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(paymentRequest.getCurrency().toLowerCase())
                    .setDescription("E-commerce order payment")
                    .putMetadata("orderId", paymentRequest.getOrderId())
                    .putMetadata("userId", paymentRequest.getUserId())
                    .putMetadata("customerEmail", paymentRequest.getCustomerEmail())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            logger.info("Created payment intent: {} for order: {}", 
                       paymentIntent.getId(), paymentRequest.getOrderId());

            return PaymentResponse.builder()
                    .paymentIntentId(paymentIntent.getId())
                    .clientSecret(paymentIntent.getClientSecret())
                    .status(PaymentStatus.PENDING)
                    .amount(paymentRequest.getAmount())
                    .currency(paymentRequest.getCurrency())
                    .orderId(paymentRequest.getOrderId())
                    .userId(paymentRequest.getUserId())
                    .createdAt(Instant.now())
                    .build();

        } catch (StripeException e) {
            logger.error("Error creating payment intent for order: {}", paymentRequest.getOrderId(), e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }

    public PaymentResponse confirmPayment(String paymentIntentId, String paymentMethodId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod(paymentMethodId)
                    .setReturnUrl("https://your-website.com/return")
                    .build();

            PaymentIntent confirmedPayment = paymentIntent.confirm(confirmParams);

            PaymentStatus status = mapStripeStatusToPaymentStatus(confirmedPayment.getStatus());

            logger.info("Payment confirmed: {} with status: {}", paymentIntentId, status);

            return PaymentResponse.builder()
                    .paymentIntentId(confirmedPayment.getId())
                    .status(status)
                    .amount(BigDecimal.valueOf(confirmedPayment.getAmount()).divide(BigDecimal.valueOf(100)))
                    .currency(confirmedPayment.getCurrency().toUpperCase())
                    .orderId(confirmedPayment.getMetadata().get("orderId"))
                    .userId(confirmedPayment.getMetadata().get("userId"))
                    .stripeChargeId(confirmedPayment.getLatestCharge())
                    .updatedAt(Instant.now())
                    .build();

        } catch (StripeException e) {
            logger.error("Error confirming payment: {}", paymentIntentId, e);
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage(), e);
        }
    }

    public PaymentResponse getPaymentStatus(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            PaymentStatus status = mapStripeStatusToPaymentStatus(paymentIntent.getStatus());

            return PaymentResponse.builder()
                    .paymentIntentId(paymentIntent.getId())
                    .status(status)
                    .amount(BigDecimal.valueOf(paymentIntent.getAmount()).divide(BigDecimal.valueOf(100)))
                    .currency(paymentIntent.getCurrency().toUpperCase())
                    .orderId(paymentIntent.getMetadata().get("orderId"))
                    .userId(paymentIntent.getMetadata().get("userId"))
                    .stripeChargeId(paymentIntent.getLatestCharge())
                    .build();

        } catch (StripeException e) {
            logger.error("Error retrieving payment status: {}", paymentIntentId, e);
            throw new RuntimeException("Failed to retrieve payment status: " + e.getMessage(), e);
        }
    }

    public PaymentResponse refundPayment(String paymentIntentId, BigDecimal refundAmount) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new IllegalStateException("Cannot refund payment that hasn't succeeded");
            }

            // Create refund
            Map<String, Object> refundParams = new HashMap<>();
            refundParams.put("charge", paymentIntent.getLatestCharge());
            
            if (refundAmount != null) {
                long refundAmountInCents = refundAmount.multiply(BigDecimal.valueOf(100)).longValue();
                refundParams.put("amount", refundAmountInCents);
            }

            com.stripe.model.Refund refund = com.stripe.model.Refund.create(refundParams);

            logger.info("Refund created: {} for payment: {}", refund.getId(), paymentIntentId);

            return PaymentResponse.builder()
                    .paymentIntentId(paymentIntentId)
                    .status(PaymentStatus.REFUNDED)
                    .amount(refundAmount != null ? refundAmount : 
                           BigDecimal.valueOf(paymentIntent.getAmount()).divide(BigDecimal.valueOf(100)))
                    .currency(paymentIntent.getCurrency().toUpperCase())
                    .orderId(paymentIntent.getMetadata().get("orderId"))
                    .userId(paymentIntent.getMetadata().get("userId"))
                    .stripeRefundId(refund.getId())
                    .updatedAt(Instant.now())
                    .build();

        } catch (StripeException e) {
            logger.error("Error processing refund for payment: {}", paymentIntentId, e);
            throw new RuntimeException("Failed to process refund: " + e.getMessage(), e);
        }
    }

    public boolean validateWebhookSignature(String payload, String sigHeader, String endpointSecret) {
        try {
            com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                    payload, sigHeader, endpointSecret);
            return true;
        } catch (Exception e) {
            logger.error("Invalid webhook signature", e);
            return false;
        }
    }

    private PaymentStatus mapStripeStatusToPaymentStatus(String stripeStatus) {
        return switch (stripeStatus) {
            case "requires_payment_method" -> PaymentStatus.PENDING;
            case "requires_confirmation" -> PaymentStatus.PENDING;
            case "requires_action" -> PaymentStatus.PENDING;
            case "processing" -> PaymentStatus.PROCESSING;
            case "succeeded" -> PaymentStatus.COMPLETED;
            case "canceled" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.FAILED;
        };
    }

    public String getPublishableKey() {
        return stripePublishableKey;
    }
}
