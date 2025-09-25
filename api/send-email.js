export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Rob Transportation <noreply@robtransportation.com>',
        to: ['info@robtransportation.com'],
        replyTo: email,
        subject: `Contact Form: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Contact Information</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1e40af;">Message</h3>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #065f46;">
                <strong>Reply directly to this email to respond to the customer.</strong>
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
