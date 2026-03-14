import twilio from "twilio";

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  return twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(to: string, body: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  return client.messages.create({
    from,
    to: toFormatted,
    body,
  });
}

export async function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): Promise<boolean> {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return false;

  const { validateRequest } = await import("twilio");
  return (validateRequest as (token: string, sig: string, url: string, params: Record<string, string>) => boolean)(authToken, signature, url, params);
}
