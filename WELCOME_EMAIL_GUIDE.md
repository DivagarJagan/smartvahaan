# Welcome Email System Documentation

## Overview

SmartVahan automatically sends a welcome email to users when they log in for the first time. The email contains a greeting, app details, and an overview of all features.

## Implementation Details

### Backend Components

#### 1. Email Service (`backend/app/services/email_service.py`)

- **Purpose**: Handles email sending functionality
- **Key Features**:
  - HTML and plain text email versions
  - Professional email template with SmartVahan branding
  - Detailed feature descriptions
  - Getting started guide
  - SMTP configuration support

- **Configuration**: Uses environment variables for SMTP settings:

  ```env
  SMTP_HOST=smtp.gmail.com          # SMTP server (default: Gmail)
  SMTP_PORT=587                     # SMTP port (default: 587)
  SMTP_USER=your-email@gmail.com    # Your email address
  SMTP_PASSWORD=your-app-password   # App-specific password
  FROM_EMAIL=your-email@gmail.com   # Sender email
  FROM_NAME=SmartVahan Team         # Sender name
  ```

- **Development Mode**: When SMTP is not configured, the service logs the email to console instead of sending it.


#### 2. Email Routes (`backend/app/routes/email_routes.py`)

- **Endpoints**:
  - `POST /email/send-welcome`: Send welcome email
  - `GET /email/test`: Test email service configuration

### Frontend Components

#### 1. Email Service (`frontend/src/services/emailService.js`)

- **Methods**:
  - `sendWelcomeEmail(email, name)`: Sends welcome email
  - `testEmailService()`: Tests if email service is configured

#### 2. Auth Context Integration (`frontend/src/context/AuthContext.jsx`)

- Automatically sends welcome email on first login
- Detects first login by checking if `memberSince` exists in localStorage
- Non-blocking: Email failures don't prevent login

## Email Content

### Email Includes

1. **Personalized Greeting**: Uses user's name
2. **App Introduction**: What SmartVahan is and why it's useful
3. **Key Features**:
   - 🔍 AI-Powered Predictive Maintenance
   - 🛠️ Personalized Maintenance Recommendations
   - 📊 Health Score Tracking
   - 🇮🇳 Indian Road Conditions Analysis
   - 💰 Cost Estimation
   - 📱 Easy-to-Use Interface

4. **Getting Started Guide**: 4-step process to begin using the app
5. **Why SmartVahan is Essential**: Value propositions
6. **Call to Action**: Link to start using the app

### Email Design

- Professional blue gradient header matching app theme
- Feature boxes with icons and descriptions
- Responsive HTML layout
- Plain text fallback for email clients without HTML support
- Consistent branding with SmartVahan colors

## Setup Instructions

### For Development (No Email Sending)

By default, emails are logged to console when SMTP is not configured. No setup needed!

### For Production (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password**:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password

3. **Set Environment Variables**:

   ```bash
   # Create .env file in backend folder
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-smartvahan-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=your-smartvahan-email@gmail.com
   FROM_NAME=SmartVahan Team
   ```

4. **Install python-dotenv** (if not already installed):

   ```bash
   pip install python-dotenv
   ```

5. **Load environment variables in backend**:

   Update `backend/app/main.py` to load .env:

   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

### For Other Email Providers

#### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@smartvahaan.com
```

#### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
FROM_EMAIL=noreply@smartvahan.com
```

## Testing

### 1. Test Email Service Configuration

```bash
# Backend should be running
curl http://localhost:8000/email/test
```

Expected response:

```json
{
  "status": "ok",
  "message": "Email service is running",
  "smtp_configured": true
}
```

### 2. Test Welcome Email Send

```bash
curl -X POST http://localhost:8000/email/send-welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

### 3. Test via Frontend

1. Clear localStorage to simulate first login:

   ```javascript
   localStorage.clear();
   ```

2. Log in to the app
3. Check console for "Welcome email sent successfully"
4. Check recipient email inbox (if SMTP configured)

## Troubleshooting

### Email Not Sending?

1. **Check environment variables**:

   ```python
   import os
   print(os.getenv('SMTP_USER'))
   print(os.getenv('SMTP_PASSWORD'))
   ```

2. **Check Gmail settings**:

   - 2FA enabled?
   - App password generated correctly?
   - "Less secure app access" not needed with app passwords

3. **Check firewall/network**:
   - Port 587 (TLS) should be open
   - Some networks block SMTP ports

4. **Check backend logs**:
   - Look for email service errors in console
   - Email will be logged to console if SMTP not configured

### Email Goes to Spam?

- Add SPF records to your domain
- Set up DKIM signing
- Use a verified sending domain
- Consider using dedicated email service (SendGrid, AWS SES)

### Testing Without SMTP?

The system automatically logs emails to console when SMTP is not configured. Perfect for development!

## Future Enhancements

Potential improvements:

- Email templates system for different types of emails
- Email verification on signup
- Password reset emails
- Maintenance reminder emails
- Weekly/monthly usage summary emails
- Promotional emails for new features
- Email preferences/unsubscribe functionality

## File Structure

```text
backend/
├── app/
│   ├── services/
│   │   └── email_service.py      # Email sending logic
│   └── routes/
│       └── email_routes.py       # Email endpoints

frontend/
├── src/
│   ├── services/
│   │   └── emailService.js       # Email API client
│   └── context/
│       └── AuthContext.jsx       # Integrated welcome email
```

## Security Considerations

1. **Never commit credentials**: Use environment variables
2. **Use app-specific passwords**: Not your actual email password
3. **Rate limiting**: Consider adding rate limits to prevent abuse
4. **Email validation**: Validate email addresses before sending
5. **GDPR compliance**: Include privacy policy and unsubscribe links for production

## API Reference

### POST /email/send-welcome

Send welcome email to user.

**Request Body**:

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response**:

```json
{
  "message": "Welcome email sent successfully",
  "email": "user@example.com"
}
```

### GET /email/test

Test email service configuration.

**Response**:

```json
{
  "status": "ok",
  "message": "Email service is running",
  "smtp_configured": true
}
```

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: ✅ Fully Implemented
