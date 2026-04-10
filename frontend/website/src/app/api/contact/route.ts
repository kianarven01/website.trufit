import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, service, message } = data;

    // Create a Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        // Replace potential quotes from the env var just in case
        pass: process.env.EMAIL_PASS?.replace(/"/g, ''),
      },
    });

    // Email options
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.EMAIL_USER, // Send to the same address
      subject: `New Contact Request - Trufit Auto Center (Subject: ${service})`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject/Service Required:</strong> ${service}</p>
        <br />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <br />
        <hr />
        <p><small>This email was sent via the Trufit Website Contact Form.</small></p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
