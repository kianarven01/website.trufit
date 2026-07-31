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

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding: 12px 18px; border-bottom: 1px solid #f0f0f0; width: 38%; vertical-align:top;">
        <span style="font-size: 12px; font-weight: 400; color: #999999; font-family: 'Barlow', Arial, sans-serif;">${label}</span>
      </td>
      <td style="padding: 12px 18px; border-bottom: 1px solid #f0f0f0;">
        <span style="font-size: 15px; color: #1a1a1a; font-weight: 400; font-family: 'Barlow', Arial, sans-serif;">${value}</span>
      </td>
    </tr>
  `;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      plateNumber,
      date,
      service,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      message,
      website_url,
    } = data;

    // --- SPAM PREVENTION ---
    // 1. Honeypot check
    if (website_url) {
      console.warn("Spam triggered in appointment form");
      // Return success so bots don't know they were caught
      return NextResponse.json(
        { success: true, message: "Appointment requested successfully!" },
        { status: 200 },
      );
    }

    // 2. Rate limiting check
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (ip !== "unknown" && !checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    // -----------------------

    const host = req.headers.get("host") || "trufitauto.com";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const logoUrl = `${baseUrl}/images/logo-dark1.webp`;

    const serviceName = services.find((s) => s.id === service)?.name || service;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS?.replace(/"/g, ""),
      },
    });

    const formattedDate = date
      ? new Date(date).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Manila",
        })
      : "Not Specified";

    const vehicleInfo =
      [vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(" ") ||
      "Not Specified";

    // ─── ADMIN EMAIL ─────────────────────────────────────────────────────────
    const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Appointment Request</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Barlow',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1115 0%,#1a1f2e 100%);padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.14em;color:#9ca3af;font-family:'Barlow',Arial,sans-serif;">Trufit Auto Center</p>
            <p style="margin:10px 0 0;font-size:18px;font-weight:600;color:#ffffff;font-family:'Barlow',Arial,sans-serif;">New Appointment Request</p>
          </td>
        </tr>

        <!-- ALERT BANNER -->
        <tr>
          <td style="background-color:#fff8f8;border-left:4px solid #E31B23;padding:14px 40px;">
            <p style="margin:0;font-size:14px;color:#c0392b;font-weight:400;font-family:'Barlow',Arial,sans-serif;">
              A new appointment request has been submitted and requires your attention.
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#ffffff;padding:32px 40px;">

            <!-- CUSTOMER INFO -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Customer Information</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              ${row("Full Name", `${firstName} ${lastName}`)}
              ${row("Email Address", email)}
              ${row("Phone Number", phone)}
            </table>

            <!-- APPOINTMENT DETAILS -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Appointment Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              ${row("Service Needed", serviceName)}
              ${row("Requested Date & Time", formattedDate)}
            </table>

            <!-- VEHICLE DETAILS -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Vehicle Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              ${row("Vehicle", vehicleInfo)}
              ${row("Plate Number", plateNumber || "Not Specified")}
            </table>

            <!-- MESSAGE -->
            ${
              message
                ? `
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Additional Message</p>
            <div style="background-color:#f9f9f9;border-radius:8px;padding:18px;border:1px solid #eeeeee;margin-bottom:28px;">
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.8;font-family:'Barlow',Arial,sans-serif;font-weight:400;">${message}</p>
            </div>
            `
                : `
            <div style="background-color:#f9f9f9;border-radius:8px;padding:16px 18px;border:1px solid #eeeeee;margin-bottom:28px;">
              <p style="margin:0;font-size:14px;color:#aaaaaa;font-style:italic;font-family:'Barlow',Arial,sans-serif;">No additional message provided.</p>
            </div>
            `
            }

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color:#0f1115;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#666666;font-family:'Barlow',Arial,sans-serif;">This notification was sent via the Trufit Auto Center website.</p>
            <p style="margin:0;font-size:13px;color:#444444;font-family:'Barlow',Arial,sans-serif;">
              <a href="https://trufitautocenter.com" style="color:#E31B23;text-decoration:none;">trufitautocenter.com</a>
              &nbsp;·&nbsp;
              <span style="color:#555555;">0918-774-7788</span>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ─── CUSTOMER EMAIL ───────────────────────────────────────────────────────
    const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Appointment Request Received</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Barlow',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f1115 0%,#1a1f2e 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.14em;color:#9ca3af;font-family:'Barlow',Arial,sans-serif;">Trufit Auto Center</p>
            <p style="margin:10px 0 4px;font-size:22px;font-weight:600;color:#ffffff;font-family:'Barlow',Arial,sans-serif;">Request Received!</p>
            <p style="margin:6px 0 0;font-size:15px;color:#9ca3af;font-weight:400;font-family:'Barlow',Arial,sans-serif;">We've got your appointment booking, ${firstName}.</p>
          </td>
        </tr>

        <!-- STATUS BAR -->
        <tr>
          <td style="background-color:#E31B23;padding:13px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:500;color:#ffffff;font-family:'Barlow',Arial,sans-serif;">
              Pending Confirmation — Our team will reach out shortly
            </p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#ffffff;padding:36px 40px;">

            <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.8;font-family:'Barlow',Arial,sans-serif;font-weight:400;">
              Thank you for choosing Trufit Auto Center. We have received your appointment request and our team is reviewing it. We will contact you at ${phone} to confirm the details.
            </p>

            <!-- APPOINTMENT SUMMARY -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Appointment Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              ${row("Service", serviceName)}
              ${row("Scheduled Date & Time", formattedDate)}
            </table>

            <!-- VEHICLE DETAILS -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Your Vehicle</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eeeeee;border-radius:8px;overflow:hidden;margin-bottom:28px;">
              ${row("Vehicle", vehicleInfo)}
              ${row("Plate Number", plateNumber || "Not Specified")}
            </table>

            ${
              message
                ? `
            <!-- YOUR MESSAGE -->
            <p style="margin:0 0 12px;font-size:13px;font-weight:500;color:#E31B23;font-family:'Barlow',Arial,sans-serif;">Your Message</p>
            <div style="background-color:#f9f9f9;border-radius:8px;padding:18px;border:1px solid #eeeeee;margin-bottom:28px;">
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.8;font-family:'Barlow',Arial,sans-serif;font-weight:400;">${message}</p>
            </div>
            `
                : ""
            }

            <!-- CONTACT CTA -->
            <div style="background:linear-gradient(135deg,#0f1115 0%,#1a1f2e 100%);border-radius:10px;padding:24px 28px;text-align:center;margin-top:8px;">
              <p style="margin:0 0 8px;font-size:14px;color:#9ca3af;font-family:'Barlow',Arial,sans-serif;font-weight:400;">Have an immediate question?</p>
              <p style="margin:0;font-size:20px;font-weight:500;color:#ffffff;font-family:'Barlow',Arial,sans-serif;">
                <a href="tel:09187747788" style="color:#E31B23;text-decoration:none;">0918-774-7788</a>
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#6b7280;font-family:'Barlow',Arial,sans-serif;font-weight:400;">Mon – Sat &nbsp;|&nbsp; 8:00 AM – 5:00 PM</p>
            </div>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color:#0f1115;padding:24px 40px;text-align:center;border-top:3px solid #E31B23;">
            <p style="margin:0 0 6px;font-size:14px;font-weight:500;color:#ffffff;font-family:'Barlow',Arial,sans-serif;">Trufit Auto Center</p>
            <p style="margin:0 0 6px;font-size:13px;color:#6b7280;font-family:'Barlow',Arial,sans-serif;font-weight:400;">1042 Brgy. Gahonon, Vinzons Ave, Daet, Camarines Norte, Philippines</p>
            <p style="margin:0;font-size:13px;color:#6b7280;font-family:'Barlow',Arial,sans-serif;font-weight:400;">
              <a href="mailto:trufitautocenter@gmail.com" style="color:#E31B23;text-decoration:none;">trufitautocenter@gmail.com</a>
              &nbsp;·&nbsp;
              <a href="https://trufitautocenter.com" style="color:#E31B23;text-decoration:none;">trufitautocenter.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Email options for Trufit
    const mailOptions = {
      from: `"${firstName} ${lastName}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New Appointment Request - Trufit Auto Center (${serviceName})`,
      html: adminHtml,
    };

    // Email options for the Customer (Confirmation)
    const customerMailOptions = {
      from: `"Trufit Auto Center" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Appointment Request Received - Trufit Auto Center`,
      html: customerHtml,
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(customerMailOptions);

    return NextResponse.json(
      { success: true, message: "Appointment requested successfully!" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error sending appointment email:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send email" },
      { status: 500 },
    );
  }
}
