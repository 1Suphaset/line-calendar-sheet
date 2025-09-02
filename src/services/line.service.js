import * as line from "@line/bot-sdk";
import { lineConfig } from "../config/index.js";

const client = new line.Client(lineConfig);

export const replyMessage = async (replyToken, message) => {
  return client.replyMessage(replyToken, {
    type: "text",
    text: message,
  });
};

export const replyWithQuickReply = async (replyToken, message, quickReplyItems = []) => {
  const quickReply = quickReplyItems.length
    ? {
        items: quickReplyItems.map((item) => ({
          type: "action",
          action: { type: "message", label: item.label, text: item.text },
        })),
      }
    : undefined;

  return client.replyMessage(replyToken, {
    type: "text",
    text: message,
    quickReply,
  });
};

export const sendFlexMessage = async (replyToken, flexMessage) => {
  return client.replyMessage(replyToken, flexMessage);
};

export const sendPushMessage = async (userId, message) => {
  return client.pushMessage(userId, {
    type: "text",
    text: message,
  });
};

export const sendPushFlexMessage = async (userId, flexMessage) => {
  return client.pushMessage(userId, flexMessage);
};