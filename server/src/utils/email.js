import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Brevo SMTP credentials from environment variables
const brevoLogin = process.env.BREVO_LOGIN; // Your Brevo email
const brevoSmtpKey = process.env.BREVO_SMTP_KEY; // Your Brevo SMTP key

// Create transporter with Brevo SMTP
const createTransporter = () => {
  console.log('🔍 DEBUG - Email Configuration:');
  console.log('BREVO_LOGIN:', process.env.BREVO_LOGIN);
  console.log('BREVO_SMTP_KEY exists:', !!process.env.BREVO_SMTP_KEY);
  console.log('BREVO_SMTP_KEY length:', process.env.BREVO_SMTP_KEY?.length);
  console.log('BREVO_SMTP_KEY starts with:', process.env.BREVO_SMTP_KEY?.substring(0, 10));
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: brevoLogin,
      pass: brevoSmtpKey,
    },
  });
};

export const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HJ Events" <${process.env.SENDER_EMAIL || brevoLogin}>`, // Use verified sender
      to: email,
      subject: 'Password Reset Code — HJ Events',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding: 24px 24px 0; text-align: center;">
              <img
                src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
                alt="HJ Events Logo"
                style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
              />
            </div>
            <div style="padding: 0 24px 24px;">
              <h1 style="color: #6b2635; font-size: 22px; margin: 8px 0 12px; text-align: center;">
                Password Reset Request
              </h1>
              <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 18px;">
                You have requested to reset your password. Use the verification code below to reset your password.
              </p>
              <div style="background: #fff2f2; border-radius: 10px; padding: 18px; margin: 0 auto 20px; text-align: center; max-width: 320px;">
                <span style="font-size: 30px; letter-spacing: 8px; color: #b14d58; font-weight: 700;">${resetCode}</span>
              </div>
              <p style="color: #777; font-size: 14px; text-align: center; margin-bottom: 24px;">
                This code expires in <strong>15 minutes</strong>. If you didn't request this password reset, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
                HJ Events • Wedding coordination & planning
              </p>
              <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export const sendEmailVerificationEmail = async (email, fullName, code) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"HJ Events" <${process.env.SENDER_EMAIL || brevoLogin}>`,
      to: email,
      subject: 'Verify your email — HJ Events',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding: 24px 24px 0; text-align: center;">
              <img
                src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
                alt="HJ Events Logo"
                style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
              />
            </div>
            <div style="padding: 0 24px 24px;">
              <h1 style="color: #6b2635; font-size: 22px; margin: 8px 0 12px; text-align: center;">
                Hey ${fullName || 'there'}!
              </h1>
              <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 18px;">
                Use the verification code below to activate your HJ Events account.
              </p>
              <div style="background: #fff2f2; border-radius: 10px; padding: 18px; margin: 0 auto 20px; text-align: center; max-width: 320px;">
                <span style="font-size: 30px; letter-spacing: 8px; color: #b14d58; font-weight: 700;">${code}</span>
              </div>
              <p style="color: #777; font-size: 14px; text-align: center; margin-bottom: 24px;">
                The code expires in <strong>15 minutes</strong>. If you didn't create an account, feel free to ignore this message.
              </p>
              <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
                HJ Events • Wedding coordination & planning
              </p>
              <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HJ Events" <${process.env.SENDER_EMAIL || brevoLogin}>`,
      to: email,
      subject: 'Welcome to HJ Events — Wedding Coordination',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="padding: 24px 24px 0; text-align: center;">
          <img
          src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
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
          <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || brevoLogin}" style="color: #b76e79; text-decoration: none;">
            ${process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || brevoLogin}
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

export const sendBookingApprovalEmail = async (email, fullName, bookingId, eventDate) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HJ Events" <${process.env.SENDER_EMAIL || brevoLogin}>`,
      to: email,
      subject: 'Your Booking Has Been Approved — HJ Events',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="padding: 24px 24px 0; text-align: center;">
          <img
          src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
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
            <strong>${eventDate}</strong>. We're thrilled to begin planning your dream event.
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
            <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || brevoLogin}" style="color: #b76e79; text-decoration: none;">
              ${process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || brevoLogin}
            </a>.
          </p>

          <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
            HJ Events • Wedding coordination & planning
          </p>

          <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
            This is an automated message, please do not reply to this email.
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

export const sendBookingRejectionEmail = async (email, fullName, bookingId, reason) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HJ Events" <${process.env.SENDER_EMAIL || brevoLogin}>`,
      to: email,
      subject: 'Your Booking Request — HJ Events',
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        
        <div style="padding: 24px 24px 0; text-align: center;">
          <img
          src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
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

          <p style="color: #666; font-size: 14px; text-align: center; margin: 16px 0 12px;">
            You can contact our support team if you'd like to discuss this decision or reschedule.
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || brevoLogin}"
               style="display: inline-block; background-color: #b76e79; color: #fff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: 600;">
              Contact Support
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">

          <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
            HJ Events • Wedding coordination & planning
          </p>

          <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
            This is an automated message, please do not reply to this email.
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

export const sendBookingVerificationEmail = async (email, fullName, verificationCode) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"HJ Events" <${process.env.SENDER_EMAIL || brevoLogin}>`,
      to: email,
      subject: 'Booking Verification Code — HJ Events',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding: 24px 24px 0; text-align: center;">
              <img
                src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
                alt="HJ Events Logo"
                style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
              />
            </div>
            <div style="padding: 0 24px 24px;">
              <h1 style="color: #6b2635; font-size: 22px; margin: 8px 0 12px; text-align: center;">
                Verify Your Booking
              </h1>
              <p style="color: #555; line-height: 1.6; text-align: center; margin-bottom: 18px;">
                Hi ${fullName || 'there'}, please use the verification code below to confirm your booking request.
              </p>
              <div style="background: #fff2f2; border-radius: 10px; padding: 18px; margin: 0 auto 20px; text-align: center; max-width: 320px;">
                <span style="font-size: 30px; letter-spacing: 8px; color: #b14d58; font-weight: 700;">${verificationCode}</span>
              </div>
              <p style="color: #777; font-size: 14px; text-align: center; margin-bottom: 24px;">
                This code expires in <strong>15 minutes</strong>. If you didn't request this booking, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
                HJ Events • Wedding coordination & planning
              </p>
              <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking verification email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending booking verification email:', error);
    return { success: false, error: error.message };
  }
};

export const sendSupplierCredentialsEmail = async ({
  email,
  password,
  fullName,
  companyName = 'HJ Events',
  loginUrl = `${process.env.CLIENT_URL || ''}/login`,
}) => {
  try {
    const transporter = createTransporter();
    const supportEmail = process.env.SUPPORT_EMAIL || process.env.SENDER_EMAIL || brevoLogin;

    const mailOptions = {
      from: `"${companyName}" <${process.env.SENDER_EMAIL || brevoLogin}>`,
      to: email,
      subject: `${companyName} Supplier Portal Access`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fff7f7; padding: 30px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <div style="padding: 24px 24px 0; text-align: center;">
              <img
                src="${process.env.BUSINESS_LOGO_URL || `${process.env.CLIENT_URL}/assets/images/logo.png`}"
                alt="${companyName} Logo"
                style="max-width: 140px; height: auto; display: inline-block; margin-bottom: 12px;"
              />
            </div>
            <div style="padding: 0 24px 24px;">
              <h1 style="color: #6b2635; font-size: 22px; margin: 8px 0 12px; text-align: center;">
                Welcome${fullName ? `, ${fullName}` : ''}!
              </h1>
              <p style="color: #555; line-height: 1.6; text-align: center;">
                We've created your supplier account so you can collaborate with our coordination team.
              </p>
              <div style="background: #fff8f8; border-radius: 6px; padding: 18px; margin: 16px 0;">
                <p style="margin: 0 0 8px; color: #6b2635; font-weight: 600; text-align: center;">
                  Your login credentials
                </p>
                <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                  <strong>Email:</strong> ${email}<br/>
                  <strong>Temporary Password:</strong> ${password}
                </p>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a
                  href="${loginUrl}"
                  style="display: inline-block; background-color: #b76e79; color: #fff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: 600;"
                >
                  Go to Supplier Portal
                </a>
              </div>
              <p style="color: #666; font-size: 14px; text-align: center; margin: 0 0 12px;">
                For security, please sign in and update your password the first time you log in.
              </p>
              <p style="color: #666; font-size: 13px; text-align: center; margin: 0 0 12px;">
                Need help? Contact us at
                <a href="mailto:${supportEmail}" style="color: #b76e79; text-decoration: none;">
                  ${supportEmail}
                </a>.
              </p>
              <hr style="border: none; border-top: 1px solid #f0e6e6; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0 0 18px;">
                ${companyName} • Wedding coordination & planning
              </p>
              <p style="color: #aaa; font-size: 11px; text-align: center; margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Supplier credentials email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending supplier credentials email:', error);
    return { success: false, error: error.message };
  }
};
