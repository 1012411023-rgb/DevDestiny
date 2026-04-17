const API_BASE_URL = `http://${window.location.hostname}:5005`;

export const billingService = {
  /**
   * Fetches the user's billing history from the backend.
   * Compatible with future DB implementation.
   */
  async getBillingHistory() {
    try {
      const token = localStorage.getItem('devdestany_token');
      const response = await fetch(`${API_BASE_URL}/api/billing/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        // If 404, we can assume the endpoint isn't ready yet and return empty list
        if (response.status === 404) return [];
        throw new Error('Failed to fetch billing history');
      }
      return await response.json();
    } catch (error) {
      console.error('Billing History API Error:', error);
      // Return empty array instead of failing, to prevent UI crash
      return [];
    }
  },

  /**
   * Sends the successful Razorpay transaction details to the backend.
   * @param {Object} paymentData - The response from Razorpay (razorpay_payment_id, etc.)
   */
  async saveTransaction(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devdestany_token')}`
        },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error('Failed to save transaction to database');
      return await response.json();
    } catch (error) {
      console.error('Save Transaction API Error:', error);
      throw error;
    }
  },

  /**
   * Creates a new Razorpay order on the backend.
   * @param {number} amount - Amount in INR (not paise)
   */
  async createOrder(amount = 5000) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/billing/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devdestany_token')}`
        },
        body: JSON.stringify({ amount, currency: 'INR' }),
      });
      if (!response.ok) throw new Error('Failed to create Razorpay order');
      return await response.json();
    } catch (error) {
      console.error('Create Order API Error:', error);
      throw error;
    }
  }
};
