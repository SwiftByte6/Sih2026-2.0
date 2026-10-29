import { Resend } from "resend";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      instrumentId,
      institutionId,
      fdrReference = "FDR-2024-ND-001",
      fdrNumber = "",
      collegeEmail,
      institutionName = "Technical Institution",
      aicteInstitutionId = "—",
      authorityDetails = "Dr. Rajesh Sharma, Senior Verification Officer, Bureau of Approval, AICTE New Delhi",
      reason = "Variance noted during deterministic verification cross-check against Core Banking / Certificate extract.",
      requiredAction = "Submit verified clarification letter from the issuing bank branch manager or rectified deposit receipt within 7 working days per AICTE Approval Process Handbook Clause 1.12 / 2.25.",
    } = body;

    // Per user instruction: Route all outgoing notification emails to rohitsoneji6@gmail.com
    const targetRecipient = process.env.RESEND_TO_OVERRIDE || "rohitsoneji6@gmail.com";
    const registeredCollegeEmail = collegeEmail && collegeEmail.includes("@") ? collegeEmail : "contact@diet-delhi.edu.in";

    // Read server-side environment variables
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail =
      process.env.RESEND_FROM_NAME && process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes("<")
        ? `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`
        : process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error:
            "RESEND_API_KEY is not configured in server-side environment variables. Please set RESEND_API_KEY in your .env.local file.",
        },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const subject = `[AICTE Notice] Discrepancy Flagged for Security Deposit FDR (${fdrReference || fdrNumber || "Record"})`;

    // Construct formal plain-text body
    const plainTextBody = `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
Bureau of Approval — Security Deposit & FDR Scrutiny Cell
Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070

OFFICIAL REGULATORY NOTICE: FDR VERIFICATION EXCEPTION
Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
Instrument Reference: ${fdrReference}
Certificate Number: ${fdrNumber || "N/A"}
Institution: ${institutionName} (AICTE ID: ${aicteInstitutionId})

To,
The Principal / Registrar / Authorized Signatory,
${institutionName}

During statutory scrutiny of your security deposit submission under AICTE Approval Process Handbook (Clause 1.12 / 2.25), the council verification authority identified the following variance or missing-document exception:

REASON / VARIANCE DETAILS:
${reason}

REQUIRED ACTION:
${requiredAction}

STATUTORY COMPLIANCE WINDOW:
Within seven (7) working days from the date of dispatch of this notice.

ISSUING AUTHORITY:
${authorityDetails}

Note: This is an official communication dispatched from the AICTE Security Deposit Management Portal.`;

    // Construct professional HTML body
    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AICTE Regulatory Notice</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    
    <!-- Top Header -->
    <div style="background-color: #1e3a8a; color: #ffffff; padding: 24px; border-bottom: 3px solid #f59e0b;">
      <h1 style="font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">All India Council for Technical Education</h1>
      <p style="font-size: 12px; margin: 4px 0 0; color: #cbd5e1;">Bureau of Approval • Security Deposit & FDR Scrutiny Cell</p>
    </div>

    <!-- Notice Badge -->
    <div style="padding: 24px 28px 12px;">
      <div style="display: inline-block; background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
        Action Required • Official Notice
      </div>
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">
        Discrepancy Flagged for Security Deposit FDR
      </h2>
      <p style="font-size: 13px; color: #64748b; margin: 0;">
        Reference: <strong style="color: #0f172a; font-family: monospace;">${fdrReference}</strong> • Issued on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
      </p>
    </div>

    <!-- Case Information Table -->
    <div style="padding: 0 28px 16px;">
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; font-size: 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #64748b; padding: 4px 0; width: 140px;">Institution:</td>
            <td style="color: #0f172a; font-weight: 600; padding: 4px 0;">${institutionName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">AICTE Institute ID:</td>
            <td style="color: #0f172a; font-weight: 600; font-family: monospace; padding: 4px 0;">${aicteInstitutionId}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 4px 0;">FDR Certificate No:</td>
            <td style="color: #0f172a; font-weight: 600; font-family: monospace; padding: 4px 0;">${fdrNumber || fdrReference}</td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Discrepancy / Reason Section -->
    <div style="padding: 0 28px 16px;">
      <h3 style="font-size: 13px; font-weight: 700; color: #b45309; text-transform: uppercase; margin: 0 0 8px;">
        Identified Variance / Reason:
      </h3>
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; font-size: 13px; line-height: 1.5; color: #78350f; border-radius: 0 6px 6px 0;">
        ${reason.replace(/\n/g, "<br>")}
      </div>
    </div>

    <!-- Required Action Section -->
    <div style="padding: 0 28px 20px;">
      <h3 style="font-size: 13px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; margin: 0 0 8px;">
        Required Corrective Action:
      </h3>
      <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 14px; font-size: 13px; line-height: 1.5; color: #1e40af; border-radius: 0 6px 6px 0;">
        ${requiredAction.replace(/\n/g, "<br>")}
      </div>
      <p style="font-size: 12px; color: #dc2626; font-weight: 600; margin: 12px 0 0;">
        ⏱ Mandatory Statutory Window: Complete rectification within 7 working days.
      </p>
    </div>

    <!-- Authority Signature -->
    <div style="padding: 16px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
      <p style="margin: 0; font-weight: 600; color: #0f172a;">${authorityDetails}</p>
      <p style="margin: 2px 0 0; color: #64748b;">All India Council for Technical Education, New Delhi</p>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 28px; background-color: #ffffff; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
      This is an automated regulatory notification dispatched from the AICTE Security Deposit Portal.
    </div>

  </div>
</body>
</html>`;

    // Dispatch email via Resend to targetRecipient (rohtisoneji6@gmail.com)
    const { data, error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [targetRecipient],
      subject,
      text: plainTextBody,
      html: htmlBody,
    });

    if (sendError) {
      console.error("[Resend API Error]:", sendError);
      return Response.json(
        {
          success: false,
          error: sendError.message || "Resend email delivery failed.",
        },
        { status: 500 }
      );
    }

    // Log the email status in Supabase if supported
    try {
      const supabase = getSupabaseAdminClient();
      if (supabase) {
        // 1. Audit Log
        await supabase.from("audit_logs").insert({
          institution_id: institutionId || null,
          entity_type: "financial_instruments",
          entity_id: instrumentId || null,
          action: "EMAIL_NOTIFICATION_SENT",
          reason: `Notification sent to ${targetRecipient} (College: ${registeredCollegeEmail}) for FDR ${fdrReference}`,
          after_data: {
            resend_id: data?.id,
            recipient: targetRecipient,
            registered_college_email: registeredCollegeEmail,
            fdr_reference: fdrReference,
            status: "SENT",
          },
        });

        // 2. Lifecycle Events
        if (instrumentId) {
          await supabase.from("lifecycle_events").insert({
            instrument_id: instrumentId,
            event_type: "EMAIL_DISCREPANCY_NOTICE_SENT",
            reason: `Discrepancy notice emailed to ${targetRecipient}`,
          });
        }

        // 3. Notifications Table
        await supabase.from("notifications").insert({
          institution_id: institutionId || null,
          instrument_id: instrumentId || null,
          notification_type: "DISCREPANCY_NOTICE",
          title: subject,
          body: plainTextBody,
          channel: "EMAIL",
          status: "SENT",
          metadata: { resend_id: data?.id, recipient: targetRecipient, registered_email: registeredCollegeEmail },
        });
      }
    } catch (supaErr) {
      console.warn("[Email API] Supabase log warning (non-fatal):", supaErr.message);
    }

    return Response.json({
      success: true,
      id: data?.id,
      recipient: targetRecipient,
      registered_college_email: registeredCollegeEmail,
      message: `Notification email successfully sent to ${targetRecipient}.`,
    });
  } catch (err) {
    console.error("[Email API Handler Error]:", err);
    return Response.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while sending email.",
      },
      { status: 500 }
    );
  }
}
