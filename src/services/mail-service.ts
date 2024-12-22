import nodemailer from "nodemailer";
import config from "@/common/app-config";

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: config.EMAIL,
        pass: config.GMAIL_PASSWORD,
    },
});

const getSignUpGmailNotify = () => {
    return `
    <h1>Welcome to Our Platform!</h1>
    <p>Thank you for registering on our platform. We’re excited to have you with us!</p>
  `;
};

const sendEmail = async (
    toEmail: string,
    subject: string,
    htmlContent: string
) => {
    const mailOptions = {
        from: config.EMAIL,
        to: toEmail,
        subject: subject,
        html: htmlContent,
    };

    console.log(config.EMAIL, config.GMAIL_PASSWORD);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
    } catch (error) {
        console.error(error);
        throw new Error("Send mail failed: " + error);
    }
};

export default {
    sendEmail,
    getSignUpGmailNotify,
};
