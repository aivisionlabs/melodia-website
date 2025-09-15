# 💳 Payment Integration Documentation

## 🎯 Overview
This document tracks the implementation of Razorpay payment integration for Melodia's song generation service.

## 📋 Implementation Status

### ✅ Completed
- [x] Database schema design
- [ ] Environment variables setup
- [x] TypeScript types
- [x] Razorpay configuration
- [x] Payment API endpoints
- [x] Pricing plans API
- [x] Payment UI components
- [x] Existing API updates
- [ ] Existing UI updates
- [x] Payment validation
- [x] Webhook handling
- [ ] End-to-end testing

## 🗄️ Database Schema

### New Tables
- `payments` - Track all payment transactions
- `pricing_plans` - Available pricing plans
- `payment_webhooks` - Razorpay webhook events

### Updated Tables
- `song_requests` - Added payment tracking
- `songs` - Added payment tracking

## 🔧 API Endpoints

### Payment APIs
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `GET /api/payments/status/:paymentId` - Get payment status
- `POST /api/webhooks/razorpay` - Handle Razorpay webhooks

### Pricing APIs
- `GET /api/pricing-plans` - Get available plans
- `POST /api/pricing-plans` - Create new plan (admin)

## 🎨 UI Components

### Payment Components
- `PaymentModal.tsx` - Razorpay payment popup
- `PricingPlans.tsx` - Display pricing plans
- `PaymentStatus.tsx` - Show payment status
- `PaymentRequired.tsx` - Payment required message

### Updated Components
- `page.tsx` - Add payment check before lyrics generation
- `my-songs/page.tsx` - Show payment status
- `lyrics-display/page.tsx` - Add payment check before song generation

## 🔐 Environment Variables

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Payment Settings
PAYMENT_CURRENCY=INR
PAYMENT_AMOUNT=99.00
PAYMENT_DESCRIPTION="Melodia Song Generation"
```

## 💰 Pricing Plans

### Basic Plan
- Price: ₹99
- Features: 1 song generation
- Description: "Create one personalized song"

### Premium Plan (Future)
- Price: ₹299
- Features: 5 song generations
- Description: "Create up to 5 personalized songs"

## 🔄 Payment Flow

1. User fills song request form
2. Clicks "Generate Lyrics"
3. Payment required modal appears
4. User selects plan and pays via Razorpay
5. Payment verification
6. Lyrics generation proceeds
7. User can generate song

## 🚨 Error Handling

### Payment Errors
- Payment failed
- Payment timeout
- Insufficient funds
- Card declined
- Network errors

### UI Error States
- Payment modal errors
- Retry payment option
- Contact support option
- Clear error messages

## 📊 Testing Scenarios

- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Payment timeout
- [ ] Webhook processing
- [ ] Refund processing
- [ ] Edge cases and error states

## 🔧 Development Notes

### Razorpay Integration
- Using Razorpay Checkout for payment UI
- Webhook verification for payment confirmation
- Signature verification for security
- Support for multiple payment methods

### Security Considerations
- HTTPS only for payment pages
- Razorpay signature verification
- PCI DSS compliance (handled by Razorpay)
- Secure webhook handling
- Payment data encryption

## 📝 Next Steps

1. Create database schema
2. Set up environment variables
3. Create TypeScript types
4. Set up Razorpay configuration
5. Create payment API endpoints
6. Create payment UI components
7. Update existing flows
8. Test integration
9. Deploy to production
