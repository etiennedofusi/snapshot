export async function sendInstagramDM(
  recipientId: string,
  message: string,
  pageAccessToken: string
) {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: "RESPONSE",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    console.error("Instagram DM error:", err);
    throw new Error("Failed to send Instagram DM");
  }

  return res.json();
}

export async function verifyMetaSignature(
  body: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) return false;

  const { createHmac, timingSafeEqual } = await import("crypto");
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return false;

  const expectedSig =
    "sha256=" + createHmac("sha256", appSecret).update(body).digest("hex");

  return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
}
