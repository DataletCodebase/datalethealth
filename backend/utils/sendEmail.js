import nodemailer from "nodemailer";


export const sendWelcomeEmail = async (to, name) => {


if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials are missing!");
    return;
  }

  // 🔹 Create transporter INSIDE the function so env is already loaded
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // now guaranteed to exist
      pass: process.env.EMAIL_PASS,
    },
  });

  // 🔹 Send the email
  try { 
  const info = await transporter.sendMail({
    from: `"Datalet Healthcare™ Chat Assist" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to Datalet Healthcare™ 🎉",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for choosing <strong>Datalet Healthcare™ Chat Assist System</strong>.</p>
      <p>Your account has been successfully created, and you can now securely access your personalized healthcare dashboard.</p>
      <p>With our AI-powered assistance, you can:</p>
      <ul>
        <li>View and manage your medical records</li>
        <li>Access real-time health insights</li>
        <li>Chat with our intelligent healthcare assistant</li>
        <li>Receive smart recommendations</li>
      </ul>
      <br/>
      <p>We are committed to providing you with a secure, reliable, and intelligent healthcare experience.</p>
      <p>🚀 Welcome aboard!</p>
      <br/>
      <p>Warm regards,</p>
      <p><strong>Datalet Healthcare™ Team</strong></p>
    `,
  });

    console.log("✅ Welcome email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Welcome email failed:", err);
  }
};
