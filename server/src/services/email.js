import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@flowbites.com';
const FROM_NAME = process.env.FROM_NAME || 'Flowbites';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

function from() {
  return `${FROM_NAME} <${FROM_EMAIL}>`;
}

async function send({ to, subject, html }) {
  if (!resend) {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL STUB] Body preview: ${html.substring(0, 200)}...`);
    return { success: true, stub: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from(),
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[EMAIL ERROR]', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Layout wrapper ──────────────────────────────────────────────────────────

function layout(title, content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; color: #18181b; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .logo { font-size: 24px; font-weight: 700; color: #0ea5e9; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 600; margin: 0 0 16px; color: #18181b; }
    p { font-size: 15px; line-height: 1.6; color: #3f3f46; margin: 0 0 16px; }
    .btn { display: inline-block; padding: 12px 28px; background: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; }
    .btn:hover { background: #0284c7; }
    .footer { text-align: center; padding: 24px 0 0; font-size: 13px; color: #a1a1aa; }
    .footer a { color: #71717a; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
    .code { display: inline-block; padding: 12px 24px; background: #f4f4f5; border-radius: 8px; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #18181b; font-family: monospace; }
    .muted { font-size: 13px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Flowbites</div>
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Flowbites. All rights reserved.</p>
      <p><a href="${CLIENT_URL}">flowbites.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to, name) {
  const html = layout('Welcome to Flowbites', `
    <h1>Welcome to Flowbites, ${name}!</h1>
    <p>We're excited to have you on board. Flowbites is your go-to marketplace for premium website templates built with Webflow, Framer, and Wix.</p>
    <p>Here's what you can do next:</p>
    <p>
      <strong>Browse Templates</strong> — Find the perfect template for your next project.<br>
      <strong>Hire a Creator</strong> — Get custom work from verified creators.<br>
    </p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/templates" class="btn">Browse Templates</a>
    </p>
  `);

  return send({ to, subject: 'Welcome to Flowbites!', html });
}

export async function sendEmailVerification(to, name, token) {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;
  const html = layout('Verify Your Email', `
    <h1>Verify your email address</h1>
    <p>Hi ${name}, please verify your email to get full access to Flowbites.</p>
    <p style="margin-top: 24px;">
      <a href="${verifyUrl}" class="btn">Verify Email</a>
    </p>
    <hr class="divider">
    <p class="muted">If the button doesn't work, copy and paste this link into your browser:</p>
    <p class="muted" style="word-break: break-all;">${verifyUrl}</p>
    <p class="muted">This link expires in 24 hours.</p>
  `);

  return send({ to, subject: 'Verify your email — Flowbites', html });
}

export async function sendPasswordResetEmail(to, name, token) {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;
  const html = layout('Reset Your Password', `
    <h1>Reset your password</h1>
    <p>Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.</p>
    <p style="margin-top: 24px;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <hr class="divider">
    <p class="muted">If the button doesn't work, copy and paste this link into your browser:</p>
    <p class="muted" style="word-break: break-all;">${resetUrl}</p>
    <p class="muted">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `);

  return send({ to, subject: 'Reset your password — Flowbites', html });
}

export async function sendPurchaseConfirmation(to, name, order) {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">${item.title}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = layout('Purchase Confirmation', `
    <h1>Thank you for your purchase!</h1>
    <p>Hi ${name}, your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #e4e4e7; font-size: 13px; color: #71717a;">Item</th>
          <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #e4e4e7; font-size: 13px; color: #71717a;">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td style="padding: 12px 0; font-weight: 600;">Total</td>
          <td style="padding: 12px 0; font-weight: 600; text-align: right;">$${order.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/buyer" class="btn">View Your Templates</a>
    </p>
  `);

  return send({ to, subject: `Order confirmed — ${order.orderNumber}`, html });
}

export async function sendTemplateApproved(to, creatorName, templateTitle) {
  const html = layout('Template Approved', `
    <h1>Your template has been approved!</h1>
    <p>Hi ${creatorName}, great news! Your template <strong>"${templateTitle}"</strong> has been approved and is now live on the marketplace.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator" class="btn">View Dashboard</a>
    </p>
  `);

  return send({ to, subject: `Template approved — "${templateTitle}"`, html });
}

export async function sendTemplateRejected(to, creatorName, templateTitle, reason) {
  const html = layout('Template Needs Changes', `
    <h1>Your template needs some changes</h1>
    <p>Hi ${creatorName}, your template <strong>"${templateTitle}"</strong> was reviewed but needs some updates before it can go live.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>Please update your template and resubmit it for review.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator" class="btn">Edit Template</a>
    </p>
  `);

  return send({ to, subject: `Template needs changes — "${templateTitle}"`, html });
}

export async function sendCreatorApproved(to, creatorName) {
  const html = layout('Creator Account Approved', `
    <h1>You're officially a Flowbites Creator!</h1>
    <p>Hi ${creatorName}, congratulations! Your creator account has been verified and approved. You can now start uploading templates and offering services.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator" class="btn">Go to Creator Dashboard</a>
    </p>
  `);

  return send({ to, subject: 'Creator account approved — Flowbites', html });
}

export async function sendCreatorRejected(to, creatorName, reason) {
  const html = layout('Creator Application Update', `
    <h1>Update on your creator application</h1>
    <p>Hi ${creatorName}, thank you for applying to become a Flowbites creator. Unfortunately, your application was not approved at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>You're welcome to update your information and re-apply.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator/onboarding" class="btn">Update Application</a>
    </p>
  `);

  return send({ to, subject: 'Creator application update — Flowbites', html });
}

export async function sendServiceOrderUpdate(to, buyerName, serviceName, status) {
  const statusMessages = {
    accepted: 'Your service order has been accepted and work will begin soon.',
    rejected: 'Your service order was not accepted by the creator.',
    in_progress: 'Work has started on your service order.',
    delivered: 'Your service order has been delivered! Please review it.',
    completed: 'Your service order has been marked as completed.',
    cancelled: 'Your service order has been cancelled.',
    revision_requested: 'A revision has been requested for your service order.',
  };

  const message = statusMessages[status] || `Your service order status changed to: ${status}`;

  const html = layout('Service Order Update', `
    <h1>Service Order Update</h1>
    <p>Hi ${buyerName}, here's an update on your service order for <strong>"${serviceName}"</strong>:</p>
    <p>${message}</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/buyer" class="btn">View Order</a>
    </p>
  `);

  return send({ to, subject: `Service order update — "${serviceName}"`, html });
}

export async function sendRefundApproved(to, buyerName, orderNumber, amount) {
  const html = layout('Refund Approved', `
    <h1>Your refund has been approved</h1>
    <p>Hi ${buyerName}, your refund request for order <strong>${orderNumber}</strong> has been approved.</p>
    <p><strong>Refund amount:</strong> $${amount.toFixed(2)}</p>
    <p>The refund will be processed to your original payment method within 5-10 business days.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/buyer" class="btn">View Dashboard</a>
    </p>
  `);

  return send({ to, subject: `Refund approved — Order ${orderNumber}`, html });
}

export async function sendRefundRejected(to, buyerName, orderNumber, reason) {
  const html = layout('Refund Request Update', `
    <h1>Refund request update</h1>
    <p>Hi ${buyerName}, your refund request for order <strong>${orderNumber}</strong> was reviewed but could not be approved at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have questions, please contact our support team.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/buyer" class="btn">View Dashboard</a>
    </p>
  `);

  return send({ to, subject: `Refund update — Order ${orderNumber}`, html });
}

export async function sendReviewReceived(to, creatorName, templateTitle, rating) {
  const stars = '\u2605'.repeat(rating) + '\u2606'.repeat(5 - rating);
  const html = layout('New Review Received', `
    <h1>You received a new review!</h1>
    <p>Hi ${creatorName}, someone left a review on your template <strong>"${templateTitle}"</strong>.</p>
    <p style="font-size: 24px; color: #f59e0b; margin: 16px 0;">${stars}</p>
    <p>Head to your dashboard to see the full review.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator" class="btn">View Review</a>
    </p>
  `);

  return send({ to, subject: `New ${rating}-star review on "${templateTitle}"`, html });
}

export async function sendNewFollower(to, creatorName, followerName) {
  const html = layout('New Follower', `
    <h1>You have a new follower!</h1>
    <p>Hi ${creatorName}, <strong>${followerName}</strong> just started following you on Flowbites.</p>
    <p>Keep creating amazing templates to grow your audience!</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator" class="btn">View Dashboard</a>
    </p>
  `);

  return send({ to, subject: `${followerName} is now following you`, html });
}

// ─── Withdrawal Emails ──────────────────────────────────────────────────────

export async function sendWithdrawalApproved(to, creatorName, amount) {
  const html = layout('Withdrawal Approved', `
    <h1>Your withdrawal has been approved</h1>
    <p>Hi ${creatorName}, your withdrawal request of <strong>$${amount.toFixed(2)}</strong> has been approved and is being processed.</p>
    <p>The funds will be transferred to your payout account within 3-5 business days.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator/earnings" class="btn">View Earnings</a>
    </p>
  `);

  return send({ to, subject: `Withdrawal approved — $${amount.toFixed(2)}`, html });
}

export async function sendWithdrawalRejected(to, creatorName, amount, reason) {
  const html = layout('Withdrawal Update', `
    <h1>Withdrawal request update</h1>
    <p>Hi ${creatorName}, your withdrawal request of <strong>$${amount.toFixed(2)}</strong> could not be processed at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have questions, please contact our support team.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator/earnings" class="btn">View Earnings</a>
    </p>
  `);

  return send({ to, subject: 'Withdrawal update — Flowbites', html });
}

export async function sendPayoutProcessed(to, creatorName, amount) {
  const html = layout('Payout Sent', `
    <h1>Your payout has been sent!</h1>
    <p>Hi ${creatorName}, <strong>$${amount.toFixed(2)}</strong> has been sent to your connected payout account.</p>
    <p>Please allow 1-3 business days for the funds to appear in your bank account.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/creator/earnings" class="btn">View Earnings</a>
    </p>
  `);

  return send({ to, subject: `Payout sent — $${amount.toFixed(2)}`, html });
}

// ─── Ticket Emails ──────────────────────────────────────────────────────────

export async function sendTicketReply(to, userName, staffName, ticketSubject) {
  const html = layout('New Reply on Your Ticket', `
    <h1>New reply on your support ticket</h1>
    <p>Hi ${userName}, <strong>${staffName}</strong> has replied to your ticket: <strong>"${ticketSubject}"</strong></p>
    <p>Please log in to view the response and continue the conversation.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/dashboard/tickets" class="btn">View Ticket</a>
    </p>
  `);

  return send({ to, subject: `Reply on your ticket — "${ticketSubject}"`, html });
}

// ─── Report Emails ──────────────────────────────────────────────────────────

export async function sendReportResolved(to, userName, actionTaken) {
  const html = layout('Report Reviewed', `
    <h1>Your report has been reviewed</h1>
    <p>Hi ${userName}, thank you for reporting content that may violate our guidelines.</p>
    <p>Our team has reviewed your report and taken the following action: <strong>${actionTaken || 'No action needed'}</strong></p>
    <p>We appreciate you helping keep Flowbites safe for everyone.</p>
    <p style="margin-top: 24px;">
      <a href="${CLIENT_URL}/templates" class="btn">Browse Templates</a>
    </p>
  `);

  return send({ to, subject: 'Your report has been reviewed — Flowbites', html });
}
