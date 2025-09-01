import { google } from "googleapis";
import { googleConfig } from "../config/index.js";

export const oauth2Client = new google.auth.OAuth2(
  googleConfig.clientId,
  googleConfig.clientSecret,
  googleConfig.redirectUri
);

oauth2Client.setCredentials({
  refresh_token: googleConfig.refreshToken,
});
