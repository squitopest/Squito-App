const DEFAULT_WEB_ORIGIN = "https://squito-app.vercel.app";
const DEFAULT_NATIVE_APP_SCHEME = "com.squito.pestcontrol.app";

export const WEB_APP_ORIGIN =
  process.env.NEXT_PUBLIC_WEB_APP_ORIGIN || DEFAULT_WEB_ORIGIN;

export const NATIVE_APP_SCHEME =
  process.env.NEXT_PUBLIC_NATIVE_APP_SCHEME || DEFAULT_NATIVE_APP_SCHEME;

export const NATIVE_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || WEB_APP_ORIGIN;

export const APPLE_SERVICES_CLIENT_ID =
  process.env.NEXT_PUBLIC_APPLE_SERVICES_CLIENT_ID ||
  `${NATIVE_APP_SCHEME}.services`;

export function getClientOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return WEB_APP_ORIGIN;
}

export function getNativeAuthRedirectUrl(): string {
  return `${NATIVE_APP_SCHEME}://auth/callback`;
}

export function getAppleAuthRedirectUri(): string {
  return `${WEB_APP_ORIGIN}/api/auth/callback`;
}

export function getApiBase(isNative: boolean): string {
  return isNative ? NATIVE_API_BASE : "";
}

export function getNativeRouteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${NATIVE_APP_SCHEME}://${normalizedPath}`;
}

export function getCheckoutSuccessUrl(isNative: boolean): string {
  return isNative
    ? `${getNativeRouteUrl("book/success")}?session_id={CHECKOUT_SESSION_ID}`
    : `${WEB_APP_ORIGIN}/book/success?session_id={CHECKOUT_SESSION_ID}`;
}

export function getCheckoutCancelUrl(isNative: boolean): string {
  return isNative
    ? `${getNativeRouteUrl("book")}?cancelled=true`
    : `${WEB_APP_ORIGIN}/book?cancelled=true`;
}
