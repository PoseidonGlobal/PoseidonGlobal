require("dotenv").config(); // Load environment variables from .env
const sgMail = require("@sendgrid/mail");

// Set the SendGrid API key from the .env file
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid.
 * @param {string} to - The recipient's email address.
 * @param {string} studentNumber - The student's unique number.
 * @param {string} tempPassword - The student's temporary password.
 */
async function sendMail(to, studentNumber, tempPassword) {
    if (!to || !studentNumber || !tempPassword) {
        console.error("❌ Missing required parameters: 'to', 'studentNumber', or 'tempPassword'");
        return;
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
        console.error("❌ Invalid email address:", to);
        return;
    }

    console.log(`📧 Preparing to send email to: ${to}`);
    console.log(`📧 Using From Email: ${process.env.SENDGRID_FROM_EMAIL}`);
    console.log(`📧 Using Reply-To Email: poseidonglobal5@gmail.com`);

    const msg = {
        to: to,
        from: process.env.SENDGRID_FROM_EMAIL, // Use your verified sender email from .env
        replyTo: "poseidonglobal5@gmail.com", // Support email address for replies
        subject: "Welcome to Poseidon Global!",
        text: `Your registration was successful! Student Number: ${studentNumber}, Temporary Password: ${tempPassword}`,
        html: `<p>Your registration was successful!</p>
               <p><strong>Student Number:</strong> ${studentNumber}</p>
               <p><strong>Temporary Password:</strong> ${tempPassword}</p>
               <p><em>Please do not reply to this email. For assistance, contact us at <a href="mailto:poseidonglobal5@gmail.com">poseidonglobal5@gmail.com</a>.</em></p>`,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error(`❌ Error sending email:`, error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
}

module.exports = { sendMail };