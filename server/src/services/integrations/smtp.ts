import nodemailer from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  fromAddress: string;
  fromName?: string;
}

export interface SmtpSecrets {
  user: string;
  pass: string;
}

function transporterFor(config: SmtpConfig, secrets: SmtpSecrets) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: secrets.user, pass: secrets.pass },
  });
}

/** Real connection test — actually opens a connection to the SMTP server and authenticates. */
export async function testSmtpConnection(config: SmtpConfig, secrets: SmtpSecrets): Promise<void> {
  const transporter = transporterFor(config, secrets);
  await transporter.verify();
}

export async function sendMail(
  config: SmtpConfig,
  secrets: SmtpSecrets,
  opts: { to: string; subject: string; text: string; html?: string }
): Promise<void> {
  const transporter = transporterFor(config, secrets);
  await transporter.sendMail({
    from: config.fromName ? `${config.fromName} <${config.fromAddress}>` : config.fromAddress,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
