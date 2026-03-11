"""
Email Service for SmartVahan
Handles sending welcome emails and other notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from datetime import datetime

class EmailService:
    def __init__(self):
        # Email configuration from environment variables
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', os.getenv('SMTP_USER', ''))
        self.from_name = os.getenv('FROM_NAME', 'SmartVahan Team')
        
    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Send welcome email to new user
        
        Args:
            to_email: Recipient email address
            user_name: User's name
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            subject = "Welcome to SmartVahan - Your Smart Vehicle Maintenance Partner!"
            
            # Create HTML email body
            html_body = self._create_welcome_email_html(user_name)
            
            # Create text version as fallback
            text_body = self._create_welcome_email_text(user_name)
            
            # Send email
            return self._send_email(to_email, subject, html_body, text_body)
            
        except Exception as e:
            print(f"Error sending welcome email: {str(e)}")
            return False
    
    def _create_welcome_email_html(self, user_name: str) -> str:
        """Create HTML version of welcome email"""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }}
        .header h1 {{
            margin: 0;
            font-size: 32px;
        }}
        .content {{
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }}
        .greeting {{
            font-size: 18px;
            color: #0a1628;
            margin-bottom: 20px;
        }}
        .feature-box {{
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #3b82f6;
            border-radius: 5px;
        }}
        .feature-title {{
            color: #0a1628;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
        }}
        .feature-desc {{
            color: #666;
            font-size: 14px;
        }}
        .cta {{
            text-align: center;
            margin: 30px 0;
        }}
        .cta-button {{
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }}
        .footer {{
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🚗 SmartVahan</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Your Intelligent Vehicle Maintenance Companion</p>
    </div>
    
    <div class="content">
        <p class="greeting">Hello {user_name},</p>
        
        <p>Welcome to <strong>SmartVahan</strong>! We're thrilled to have you join our community of smart vehicle owners.</p>
        
        <p>SmartVahan is your AI-powered vehicle maintenance assistant designed specifically for Indian road conditions. We help you keep your vehicle in top condition, predict maintenance needs, and avoid costly repairs.</p>
        
        <h2 style="color: #0a1628; margin-top: 30px;">🎯 What SmartVahan Offers:</h2>
        
        <div class="feature-box">
            <div class="feature-title">🔍 AI-Powered Predictive Maintenance</div>
            <div class="feature-desc">Get intelligent predictions about your vehicle's health and potential issues before they become serious problems. Our AI analyzes your vehicle data and driving patterns to provide accurate maintenance forecasts.</div>
        </div>
        
        <div class="feature-box">
            <div class="feature-title">🛠️ Personalized Maintenance Recommendations</div>
            <div class="feature-desc">Receive detailed, easy-to-understand maintenance suggestions tailored to your specific vehicle, usage patterns, and local conditions. We explain everything in simple words so you know exactly what needs attention.</div>
        </div>
        
        <div class="feature-box">
            <div class="feature-title">📊 Health Score Tracking</div>
            <div class="feature-desc">Monitor your vehicle's overall health with our comprehensive scoring system. Track improvements over time and catch deterioration early.</div>
        </div>
        
        <div class="feature-box">
            <div class="feature-title">🇮🇳 Indian Road Conditions Analysis</div>
            <div class="feature-desc">Unlike generic apps, SmartVahan understands Indian traffic, road conditions, weather patterns, and driving environments. Get recommendations that actually work for Indian vehicles.</div>
        </div>
        
        <div class="feature-box">
            <div class="feature-title">💰 Cost Estimation</div>
            <div class="feature-desc">Know the expected costs for repairs and maintenance in advance. No more surprises at the service center!</div>
        </div>
        
        <div class="feature-box">
            <div class="feature-title">📱 Easy-to-Use Interface</div>
            <div class="feature-desc">Simple, intuitive design with light and dark modes. Track your vehicle history, view maintenance analysis, and submit feedback all in one place.</div>
        </div>
        
        <h2 style="color: #0a1628; margin-top: 30px;">🚀 Getting Started:</h2>
        
        <ol style="color: #666; line-height: 2;">
            <li><strong>Add Your Vehicle:</strong> Enter your vehicle details including make, model, mileage, and usage patterns.</li>
            <li><strong>Get Analysis:</strong> Our AI will immediately analyze your vehicle and provide maintenance recommendations.</li>
            <li><strong>Track History:</strong> Monitor your usage and see all your past activities in the User History section.</li>
            <li><strong>Stay Updated:</strong> Check back regularly for updated predictions and maintenance reminders.</li>
        </ol>
        
        <div class="cta">
            <a href="http://localhost:5173" class="cta-button">Start Using SmartVahan →</a>
        </div>
        
        <h2 style="color: #0a1628; margin-top: 30px;">💡 Why SmartVahan is Essential:</h2>
        
        <p><strong>Save Money:</strong> Prevent costly repairs by catching issues early. Our predictive maintenance can save you thousands of rupees annually.</p>
        
        <p><strong>Stay Safe:</strong> Avoid breakdowns and safety issues by knowing your vehicle's condition before problems occur.</p>
        
        <p><strong>Extend Vehicle Life:</strong> Proper maintenance based on our recommendations helps your vehicle last longer and maintain better resale value.</p>
        
        <p><strong>Peace of Mind:</strong> Drive confidently knowing your vehicle's health is monitored by intelligent AI technology.</p>
        
        <p style="margin-top: 30px;">We're here to help you every step of the way. If you have questions or feedback, please don't hesitate to reach out using our in-app feedback feature.</p>
        
        <p style="margin-top: 20px;">Happy driving!</p>
        
        <p style="margin-top: 30px;"><strong>The SmartVahan Team</strong><br>
        <em>Making vehicle maintenance intelligent and hassle-free</em></p>
    </div>
    
    <div class="footer">
        <p>This email was sent to {user_name} because you created a SmartVahan account.</p>
        <p>© {datetime.now().year} SmartVahan. All rights reserved.</p>
    </div>
</body>
</html>
"""
    
    def _create_welcome_email_text(self, user_name: str) -> str:
        """Create plain text version of welcome email"""
        return f"""
Hello {user_name},

Welcome to SmartVahan! We're thrilled to have you join our community of smart vehicle owners.

SmartVahan is your AI-powered vehicle maintenance assistant designed specifically for Indian road conditions. We help you keep your vehicle in top condition, predict maintenance needs, and avoid costly repairs.

WHAT SMARTVAHAN OFFERS:

🔍 AI-Powered Predictive Maintenance
Get intelligent predictions about your vehicle's health and potential issues before they become serious problems.

🛠️ Personalized Maintenance Recommendations
Receive detailed, easy-to-understand maintenance suggestions tailored to your specific vehicle and usage patterns.

📊 Health Score Tracking
Monitor your vehicle's overall health with our comprehensive scoring system.

🇮🇳 Indian Road Conditions Analysis
Unlike generic apps, SmartVahan understands Indian traffic, road conditions, and driving environments.

💰 Cost Estimation
Know the expected costs for repairs and maintenance in advance.

📱 Easy-to-Use Interface
Simple, intuitive design with light and dark modes.

GETTING STARTED:

1. Add Your Vehicle - Enter your vehicle details
2. Get Analysis - Our AI will analyze your vehicle
3. Track History - Monitor your usage and activities
4. Stay Updated - Check back regularly for updates

WHY SMARTVAHAN IS ESSENTIAL:

• Save Money: Prevent costly repairs by catching issues early
• Stay Safe: Avoid breakdowns and safety issues
• Extend Vehicle Life: Proper maintenance helps your vehicle last longer
• Peace of Mind: Drive confidently with AI-monitored vehicle health

Start using SmartVahan now: http://localhost:5173

We're here to help you every step of the way. If you have questions, use our in-app feedback feature.

Happy driving!

The SmartVahan Team
Making vehicle maintenance intelligent and hassle-free

---
© {datetime.now().year} SmartVahan. All rights reserved.
"""
    
    def _send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_body: str, 
        text_body: str
    ) -> bool:
        """
        Send email using SMTP
        
        Args:
            to_email: Recipient email
            subject: Email subject
            html_body: HTML version of email
            text_body: Plain text version of email
            
        Returns:
            bool: True if sent successfully
        """
        # If SMTP not configured, log and return success (for development)
        if not self.smtp_user or not self.smtp_password:
            print(f"""
╔══════════════════════════════════════════════════════════════╗
║          WELCOME EMAIL (SMTP Not Configured)                 ║
╠══════════════════════════════════════════════════════════════╣
║ To: {to_email:<55} ║
║ Subject: {subject[:48]:<48} ║
╠══════════════════════════════════════════════════════════════╣
║ NOTE: Email would be sent in production with SMTP config     ║
║                                                              ║
║ To enable email sending, set these environment variables:    ║
║   - SMTP_HOST (default: smtp.gmail.com)                     ║
║   - SMTP_PORT (default: 587)                                ║
║   - SMTP_USER (your email)                                  ║
║   - SMTP_PASSWORD (your app password)                       ║
║   - FROM_EMAIL (sender email)                               ║
╚══════════════════════════════════════════════════════════════╝
            """)
            print("\n" + "="*60)
            print("EMAIL CONTENT (Text Version):")
            print("="*60)
            print(text_body[:500] + "..." if len(text_body) > 500 else text_body)
            print("="*60 + "\n")
            return True
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Attach text and HTML versions
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"✅ Welcome email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending email to {to_email}: {str(e)}")
            return False

# Create singleton instance
email_service = EmailService()
