import { getAuth } from "@firebase/auth";

export const auth = getAuth();
auth.languageCode = "it";
// To apply the default browser preference instead of explicitly setting it.
// auth.useDeviceLanguage();
