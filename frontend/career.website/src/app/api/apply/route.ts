import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const position = formData.get('position') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const location = formData.get('location') as string;
    
    const q1 = formData.get('q1') as string;
    const q2 = formData.get('q2') as string;
    const q3 = formData.get('q3') as string;
    const q4 = formData.get('q4') as string;
    
    const resume = formData.get('resume') as File | null;
    const recaptchaToken = formData.get('g-recaptcha-response') as string;

    if (!name || !email || !phone || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'reCAPTCHA verification failed. Please try again.' }, { status: 400 });
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
      });
      
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed. Please try again.' }, { status: 400 });
      }
    }

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, //||'trufitautocenterdaet@gmail.com',
        pass: process.env.EMAIL_PASS?.replace(/"/g, ""), 
      },
    });

    // Prepare attachments
    const attachments = [];
    if (resume) {
      const arrayBuffer = await resume.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      attachments.push({
        filename: resume.name,
        content: buffer,
      });
    }

    // 1. Email to HR / Admin
    const adminMailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER || 'trufitautocenterdaet@gmail.com'}>`, // Send via authenticated email to prevent spoofing rejection, but use applicant name
      replyTo: email,
      to: process.env.EMAIL_USER || 'trufitautocenterdaet@gmail.com',
      subject: `New Job Application: ${position} - ${name}`,
      text: `
You have received a new job application!

---
POSITION DETAILS
---
Position Applied For: ${position}

---
APPLICANT DETAILS
---
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location || 'Not provided'}

---
QUESTIONNAIRE ANSWERS
---
Q1:
${q1 || 'No answer provided.'}

Q2:
${q2 || 'No answer provided.'}

Q3:
${q3 || 'No answer provided.'}

Q4 (Start Date):
${q4 || 'No answer provided.'}

---
RESUME
---
The applicant's resume is attached to this email.
      `,
      attachments,
    };

    // 2. Email to Applicant (Confirmation)
    const applicantMailOptions = {
      from: `"Trufit Auto Center Careers" <${process.env.EMAIL_USER || 'trufitautocenterdaet@gmail.com'}>`,
      to: email,
      subject: `Application Received - ${position} at Trufit Auto Center`,
      text: `
Hi ${name},

Thank you for applying for the ${position} position at Trufit Auto Center! 

This email is to confirm that we have successfully received your application and resume. Our hiring team is currently reviewing applications and will reach out to you directly via email or phone (${phone}) if your qualifications are a match for the role.

Best regards,
The Trufit Auto Center Team
1042 Brgy. Gahonon, Vinzons Ave, Daet, Camarines Norte
0918-774-7788
      `,
    };

    // Actually send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(applicantMailOptions);
    
    console.log("Emails sent successfully for application:", name);

    return NextResponse.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
