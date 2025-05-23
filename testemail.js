const { sendMail } = require('./emailService');

(async () => {
    const to = "test@example.com"; // Replace with your email address for testing
    const studentNumber = "STU123";
    const tempPassword = "TempPass123";

    console.log("📧 Starting email test...");

    try {
        await sendMail(to, studentNumber, tempPassword);
        console.log("✅ Test email sent successfully!");
    } catch (error) {
        console.error("❌ Test email failed:", error);
        if (error.response) {
            console.error("❌ SendGrid Response:", error.response.body);
        }
    }
})();