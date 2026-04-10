import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, date, service, message } = data;

    // Create a Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        // Replace potential quotes from the env var just in case
        pass: process.env.EMAIL_PASS?.replace(/"/g, ''),
      },
    });

    // Format the date if it exists
    const formattedDate = date 
      ? new Date(date).toLocaleString('en-US', { 
          weekday: 'long', year: 'numeric', month: 'long', 
          day: 'numeric', hour: '2-digit', minute: '2-digit' 
        })
      : 'Not Specified';

    // Email options
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.EMAIL_USER, // Send to the same address
      subject: `New Appointment Request - Trufit Auto Center (${service})`,
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Requested Date & Time:</strong> ${formattedDate}</p>
        <p><strong>Service Needed:</strong> ${service}</p>
        <br />
        <p><strong>Additional Message:</strong></p>
        <p>${message || '<i>No additional message provided.</i>'}</p>
        <br />
        <hr />
        <p><small>This email was sent via the Trufit Website Appointment Form.</small></p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Appointment requested successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending appointment email:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
