import { createLogger } from "@/lib/shared/logger";

const logger = createLogger("line-notify");

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_VISITOR_GROUP_ID = process.env.LINE_VISITOR_GROUP_ID;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

function isLocalhost() {
  return (
    BASE_URL.includes("localhost") ||
    BASE_URL.includes("127.0.0.1") ||
    BASE_URL.includes("0.0.0.0")
  );
}

function getPublicImageUrl(imagePath) {
  if (!imagePath) return null;

  if (isLocalhost()) {
    logger.warn("localhost - images will not display in LINE", {
      url: BASE_URL,
    });
    return null;
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${BASE_URL}/api/uploads/${cleanPath}`;
}

function getActionUrl(path) {
  return `${BASE_URL}${path}`;
}

export async function sendFlexMessage(
  groupId,
  flexContent,
  altText = "Visitor Notification",
) {
  const url = "https://api.line.me/v2/bot/message/push";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: groupId,
      messages: [
        {
          type: "flex",
          altText,
          contents: flexContent,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    logger.error({ message: "LINE API Error Response", error });
    throw new Error(`LINE API Error: ${error.message || response.statusText}`);
  }

  return response;
}

export function buildVisitorCheckInFlex(visitor, contactUser) {
  const reasonLabels = {
    Shipping: "📦 การจัดส่ง",
    BillingChequeCollection: "💰 รับเช็ค/วางบิล",
    JobApplication: "📝 สมัครงาน",
    ProductPresentation: "📊 นำเสนอสินค้า",
    Meeting: "🤝 ประชุม",
    Other: "📋 อื่นๆ",
  };

  const contactUserName = contactUser
    ? `${contactUser.userFirstName} ${contactUser.userLastName}`
    : "-";

  const visitorFullName = `${visitor.visitorFirstName} ${visitor.visitorLastName}`;
  const carInfo = `${visitor.visitorCarRegistration} (${visitor.visitorProvince})`;
  const reasonText =
    reasonLabels[visitor.visitorContactReason] || visitor.visitorContactReason;
  const checkInTime = new Date().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const photoUrl = getPublicImageUrl(visitor.visitorPhoto);
  const detailUrl = getActionUrl(`/security/visitor/${visitor.visitorId}`);
  const checkoutUrl = getActionUrl(
    `/security/visitor/${visitor.visitorId}/quick-checkout`,
  );

  const flexContent = {
    type: "bubble",
    size: "giga",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: "#1a1a2e",
      paddingAll: "20px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              flex: 1,
              contents: [
                {
                  type: "text",
                  text: "🚨 ผู้มาติดต่อใหม่",
                  weight: "bold",
                  size: "xl",
                  color: "#ffffff",
                },
                {
                  type: "text",
                  text: checkInTime,
                  size: "sm",
                  color: "#b0b0b0",
                  margin: "sm",
                },
              ],
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "CHECK-IN",
                  size: "xs",
                  color: "#ffffff",
                  align: "center",
                  weight: "bold",
                },
              ],
              backgroundColor: "#28a745",
              paddingAll: "8px",
              cornerRadius: "md",
            },
          ],
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      spacing: "md",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: visitorFullName,
              weight: "bold",
              size: "xl",
              flex: 1,
              wrap: true,
            },
          ],
        },
        {
          type: "text",
          text: visitor.visitorCompany,
          size: "md",
          color: "#666666",
          wrap: true,
        },
        {
          type: "separator",
          margin: "lg",
        },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "🚗 ทะเบียนรถ",
                  size: "sm",
                  color: "#888888",
                  flex: 2,
                },
                {
                  type: "text",
                  text: carInfo,
                  size: "sm",
                  color: "#333333",
                  flex: 3,
                  wrap: true,
                },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "📌 เหตุผล",
                  size: "sm",
                  color: "#888888",
                  flex: 2,
                },
                {
                  type: "text",
                  text: reasonText,
                  size: "sm",
                  color: "#333333",
                  flex: 3,
                  wrap: true,
                },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "👤 ติดต่อ",
                  size: "sm",
                  color: "#888888",
                  flex: 2,
                },
                {
                  type: "text",
                  text: contactUserName,
                  size: "sm",
                  color: "#0066cc",
                  flex: 3,
                  weight: "bold",
                  wrap: true,
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "15px",
      spacing: "sm",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "✅ Checkout ผู้เยี่ยม",
            uri: checkoutUrl,
          },
          style: "primary",
          color: "#ff9800",
          height: "md",
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "📋 ดูรายละเอียด",
            uri: detailUrl,
          },
          style: "secondary",
          height: "sm",
        },
      ],
    },
  };

  if (photoUrl) {
    flexContent.hero = {
      type: "image",
      url: photoUrl,
      size: "full",
      aspectRatio: "1:1",
      aspectMode: "cover",
    };
  }

  return flexContent;
}

export function buildVisitorStatusUpdateFlex(visitor, contactUser, newStatus) {
  const statusConfig = {
    CheckIn: { emoji: "🟢", label: "Check-In", color: "#28a745" },
    Confirmed: { emoji: "🔵", label: "Confirmed", color: "#007bff" },
    CheckOut: { emoji: "⚪", label: "Check-Out", color: "#6c757d" },
  };

  const status = statusConfig[newStatus] || statusConfig.CheckIn;
  const contactUserName = contactUser
    ? `${contactUser.userFirstName} ${contactUser.userLastName}`
    : "-";
  const visitorFullName = `${visitor.visitorFirstName} ${visitor.visitorLastName}`;
  const updateTime = new Date().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const detailUrl = getActionUrl(`/security/visitor/${visitor.visitorId}`);

  const flexContent = {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "horizontal",
      backgroundColor: status.color,
      paddingAll: "15px",
      contents: [
        {
          type: "text",
          text: `${status.emoji} ${status.label}`,
          weight: "bold",
          size: "lg",
          color: "#ffffff",
          flex: 1,
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "15px",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: visitorFullName,
          weight: "bold",
          size: "lg",
          wrap: true,
        },
        {
          type: "text",
          text: visitor.visitorCompany,
          size: "sm",
          color: "#666666",
          wrap: true,
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "md",
          spacing: "xs",
          contents: [
            {
              type: "text",
              text: `🚗 ${visitor.visitorCarRegistration} (${visitor.visitorProvince})`,
              size: "sm",
              color: "#333333",
            },
            {
              type: "text",
              text: `👤 ติดต่อ: ${contactUserName}`,
              size: "sm",
              color: "#0066cc",
            },
            {
              type: "text",
              text: `🕐 ${updateTime}`,
              size: "xs",
              color: "#999999",
              margin: "sm",
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "10px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "ดูรายละเอียด",
            uri: detailUrl,
          },
          style: "secondary",
          height: "sm",
        },
      ],
    },
  };

  return flexContent;
}

export async function notifyVisitorCheckIn(visitor, contactUser) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_VISITOR_GROUP_ID) {
    logger.warn(
      "LINE credentials not configured, skipping check-in notification",
    );
    return null;
  }

  try {
    const flexMessage = buildVisitorCheckInFlex(visitor, contactUser);

    if (isLocalhost()) {
      logger.warn("localhost - images will not display in LINE Flex Message");
    }

    const result = await sendFlexMessage(
      LINE_VISITOR_GROUP_ID,
      flexMessage,
      `🚨 ผู้มาติดต่อ: ${visitor.visitorFirstName} ${visitor.visitorLastName}`,
    );

    return result;
  } catch (error) {
    logger.error({
      message: "Failed to send LINE check-in notification",
      error: error.message,
    });
    throw error;
  }
}

export async function notifyVisitorStatusUpdate(
  visitor,
  contactUser,
  newStatus,
) {
  if (!LINE_CHANNEL_ACCESS_TOKEN || !LINE_VISITOR_GROUP_ID) {
    logger.warn(
      "LINE credentials not configured, skipping status update notification",
    );
    return null;
  }

  try {
    const flexMessage = buildVisitorStatusUpdateFlex(
      visitor,
      contactUser,
      newStatus,
    );

    const result = await sendFlexMessage(
      LINE_VISITOR_GROUP_ID,
      flexMessage,
      `${visitor.visitorFirstName} ${visitor.visitorLastName} - ${newStatus}`,
    );

    return result;
  } catch (error) {
    logger.error({
      message: "Failed to send LINE status update notification",
      error: error.message,
    });
    throw error;
  }
}
