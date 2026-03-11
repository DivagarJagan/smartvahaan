import api from "./api";

const emailService = {
  /**
   * Send welcome email to user
   * @param {string} email - User email
   * @param {string} name - User name
   * @returns {Promise} API response
   */
  async sendWelcomeEmail(email, name) {
    try {
      const response = await api.post("/email/send-welcome", { email, name });
      return response.data;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      // Don't throw error to avoid blocking login flow
      return { success: false, error: error.message };
    }
  },

  /**
   * Test email service configuration
   * @returns {Promise} API response
   */
  async testEmailService() {
    try {
      const response = await api.get("/email/test");
      return response.data;
    } catch (error) {
      console.error("Error testing email service:", error);
      throw error;
    }
  },
};

export default emailService;
