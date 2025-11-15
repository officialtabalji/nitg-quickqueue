# How to Enable UPI in Razorpay

## Quick Steps

### 1. Log in to Razorpay Dashboard
- Go to: https://dashboard.razorpay.com
- Log in with your Razorpay account credentials

### 2. Navigate to Payment Methods
1. Click on **Settings** (⚙️ icon) in the left sidebar
2. Click on **Payment Methods** from the settings menu
3. Direct link: https://dashboard.razorpay.com/app/payment-methods

### 3. Enable UPI
1. Look for **UPI** in the list of payment methods
2. If you see a **"Request"** button or toggle, click it to enable UPI
3. If UPI is already enabled, you'll see it marked as "Active" or "Enabled"

### 4. Verify Your Account Status
- **Test Mode**: UPI should be available immediately after enabling
- **Live Mode**: You may need to complete KYC verification first

### 5. Test the Payment
1. After enabling UPI, refresh your application
2. Try making a payment
3. The UPI option should now appear in the Razorpay payment modal

## Common Issues

### Issue: "Payment Methods" option not visible in Settings
**Solution**: 
- Make sure you're logged into the correct Razorpay account
- Check if you have the necessary permissions (admin/owner access)
- Try accessing directly: https://dashboard.razorpay.com/app/payment-methods

### Issue: UPI shows "Request" but can't be enabled
**Possible Reasons**:
- Your business category doesn't support UPI (e.g., "Individual" or "Not yet Registered")
- KYC verification is incomplete (for live mode)
- Account is in restricted status

**Solution**:
- Complete your KYC verification
- Update your business category if needed
- Contact Razorpay support: https://razorpay.com/support/

### Issue: UPI is enabled but still not showing in payment modal
**Check**:
1. Clear browser cache and cookies
2. Make sure you're using the correct Razorpay Key ID (test vs live)
3. Verify the payment amount is valid (minimum ₹1)
4. Check browser console for any JavaScript errors

### Issue: Only seeing cards, not UPI
**Solution**:
- UPI might be enabled but not activated yet
- Wait a few minutes after enabling and try again
- In test mode, UPI should work immediately
- In live mode, activation can take 24-48 hours

## Test Mode UPI

When testing in **Test Mode**:
- UPI transactions are automatically marked as successful
- Use test UPI ID: `success@razorpay` for successful transactions
- Use test UPI ID: `failure@razorpay` for failed transactions
- Real UPI apps (Google Pay, PhonePe, etc.) won't open in test mode

## Still Not Working?

1. **Check Razorpay Dashboard**:
   - Go to Settings > Payment Methods
   - Verify UPI status is "Active" or "Enabled"
   - Take a screenshot if you see any errors

2. **Contact Razorpay Support**:
   - Support Portal: https://razorpay.com/support/
   - Email: support@razorpay.com
   - Provide your Merchant ID and account details

3. **Check Your Integration**:
   - Verify your Razorpay Key ID is correct
   - Check browser console for errors
   - Ensure you're using the latest Razorpay Checkout.js script

## Additional Resources

- Razorpay Payment Methods Documentation: https://razorpay.com/docs/payments/payment-methods/
- Razorpay Dashboard: https://dashboard.razorpay.com
- Payment Methods Settings: https://dashboard.razorpay.com/app/payment-methods

