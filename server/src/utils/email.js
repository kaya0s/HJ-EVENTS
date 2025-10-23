import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

export const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER, // use the configured sender address
      to: email,
      subject: 'Password Reset Code - Your App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You have requested to reset your password. Use the code below to reset your password:</p>
          
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${resetCode}</h1>
          </div>
          
          <p><strong>This code will expire in 15 minutes.</strong></p>
          
          <p>If you didn't request this password reset, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.response);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to HJ Events — Wedding Coordination',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="padding: 24px 24px 0; text-align: center;">
          <img
          src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/logo.png`}"
          alt="HJ Events Logo"
          style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
          />
        </div>

        <div style="padding: 0 24px 24px;">
          <h1 style="color: #6b2635; font-size: 22px; margin: 8px 0 12px; text-align: center;">
          Welcome, ${fullName}!
          </h1>

          <p style="color: #555555; line-height: 1.6; margin: 0 0 16px; text-align: center;">
          Thank you for choosing HJ Events for your wedding coordination. We're delighted to be a part of your special journey — our team will help bring your vision to life.
          </p>

          <div style="background: linear-gradient(180deg, #fff 0%, #fff8f8 100%); border-radius: 6px; padding: 18px; margin: 16px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #6b2635; font-weight: 600;">Next steps</p>
          <p style="margin: 0 0 12px; color: #666; font-size: 14px;">
            Complete your event details and we'll assign your dedicated coordinator.
          </p>
          <a href="${process.env.CLIENT_URL}/dashboard"
             style="display: inline-block; background-color: #b76e79; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
            Set Up My Event
          </a>
          </div>

          <p style="color: #666; font-size: 14px; margin: 0 0 12px;">
          If you'd like to speak with a coordinator now, email us at
          <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}" style="color: #b76e79; text-decoration: none;">
            ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}
          </a>.
          </p>

          <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
          HJ Events • Wedding coordination & planning
          </p>

          <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0 0 24px;">
          This is an automated message, please do not reply to this email.
          </p>
        </div>
        </div>
      </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking approval email
export const sendBookingApprovalEmail = async (email, fullName, bookingId, eventDate) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Booking Has Been Approved — HJ Events',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="padding: 24px 24px 0; text-align: center;">
          <img
          src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/logo.png`}"
          alt="HJ Events Logo"
          style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
          />
        </div>

        <div style="padding: 0 24px 24px;">
          <h1 style="color: #6b2635; font-size: 22px; margin: 8px 0 12px; text-align: center;">
          Congratulations, ${fullName}!
          </h1>

          <p style="color: #555; line-height: 1.6; text-align: center;">
            Your booking <strong>#${bookingId}</strong> has been <strong>approved</strong> for 
            <strong>${eventDate}</strong>. We’re thrilled to begin planning your dream event.
          </p>

          <div style="background: #fff8f8; border-radius: 6px; padding: 18px; margin: 16px 0; text-align: center;">
            <p style="margin: 0 0 8px; color: #6b2635; font-weight: 600;">Next steps</p>
            <p style="margin: 0 0 12px; color: #666; font-size: 14px;">
              Please check your dashboard for event details and coordinator contact info.
            </p>
            <a href="${process.env.CLIENT_URL}/bookings/${bookingId}"
               style="display: inline-block; background-color: #b76e79; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
              View My Booking
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin: 0 0 12px;">
            Need help? Contact us at
            <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}" style="color: #b76e79; text-decoration: none;">
              ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}
            </a>.
          </p>

          <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
            HJ Events • Wedding coordination & planning
          </p>
        </div>
        </div>
      </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking approval email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending booking approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking rejection email
export const sendBookingRejectionEmail = async (email, fullName, bookingId, reason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Booking Request — HJ Events',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="padding: 24px 24px 0; text-align: center;">
          <img
          src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/logo.png`}"
          alt="HJ Events Logo"
          style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
          />
        </div>

        <div style="padding: 0 24px 24px;">
          <h1 style="color: #b14d58; font-size: 22px; margin: 8px 0 12px; text-align: center;">
          Hi ${fullName},
          </h1>

          <p style="color: #555; line-height: 1.6; text-align: center;">
            We regret to inform you that your booking <strong>#${bookingId}</strong> could not be approved at this time.
          </p>

          ${
            reason
              ? `<div style="background: #fff8f8; border-radius: 6px; padding: 18px; margin: 16px 0; text-align: center;">
                  <p style="margin: 0 0 8px; color: #6b2635; font-weight: 600;">Reason for Rejection</p>
                  <p style="margin: 0; color: #666; font-size: 14px;">${reason}</p>
                </div>`
              : ''
          }

          <p style="color: #666; font-size: 14px; text-align: center; margin: 16px 0;">
            You can contact our support team if you'd like to discuss this decision or reschedule.
          </p>

          <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}"
             style="display: inline-block; background-color: #b76e79; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
            Contact Support
          </a>

          <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
            HJ Events • Wedding coordination & planning
          </p>
        </div>
        </div>
      </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking rejection email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending booking rejection email:', error);
    return { success: false, error: error.message };
  }
};
