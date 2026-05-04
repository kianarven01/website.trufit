import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { services } from "@/data/services";

// Simple in-memory rate limiter to prevent spam
const rateLimit = new Map<string, { count: number; lastTime: number }>();
const MAX_REQUESTS = 5; // Max requests per hour
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  if (!record) {
    rateLimit.set(ip, { count: 1, lastTime: now });
    return true;
  }
  if (now - record.lastTime > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, lastTime: now });
    return true;
  }
  if (record.count >= MAX_REQUESTS) {
    return false;
  }
  record.count++;
  record.lastTime = now;
  return true;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, service, message, website_url } = data;

    // --- SPAM PREVENTION ---
    // 1. Honeypot check
    if (website_url) {
      console.warn("Honeypot triggered in contact form");
      // Return success so bots don't know they were caught
      return NextResponse.json({ success: true, message: "Email sent successfully" }, { status: 200 });
    }

    // 2. Rate limiting check
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }
    // -----------------------

    // Map service ID to name
    const serviceName =
      services.find((s) => s.id === service)?.name ||
      (service === "general"
        ? "General Inquiry"
        : service === "feedback"
          ? "Feedback"
          : service);

    // Create a Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        // Replace potential quotes from the env var just in case
        pass: process.env.EMAIL_PASS?.replace(/"/g, ""),
      },
    });

    // Email options for Trufit
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.EMAIL_USER, // Send to the auto center
      subject: `New Contact Request - Trufit Auto Center (Subject: ${serviceName})`,
      html: `
        <h2 style="color: #E31B23;">New Contact Form Submission</h2>
        <p style="font-size: 1.2em; font-weight: bold; color: #E31B23;">PLEASE CONTACT ME</p>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject/Service Required:</strong> ${serviceName}</p>
        <br />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <br />
        <hr />
        <p><small>This email was sent via the Trufit Website Contact Form.</small></p>
      `,
    };

    // Email options for the Customer (Confirmation)
    const customerMailOptions = {
      from: `"Trufit Auto Center" <${process.env.EMAIL_USER}>`,
      to: email, // Send to the customer
      subject: `Message Received - Trufit Auto Center`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000000ff;">Hello ${firstName},</h2>
          <p>Thank you for reaching out to Trufit Auto Center.</p>
          <p>We have received your message regarding <strong>${serviceName}</strong>. Our team is currently reviewing your inquiry and will get back to you as soon as possible at the phone number or email address you provided.</p>
          <br />
          <p><strong>Your Message:</strong></p>
          <p>${message}</p>
          <br />
          <p>If your inquiry is urgent, please feel free to call us directly at 0918-774-7788.</p>
          <p>Best regards,</p>
          <p><strong>The Trufit Auto Center Team</strong></p>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 },
    );
  }
}
