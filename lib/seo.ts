const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return DEFAULT_SITE_URL;
  }

  return trimmedValue.replace(/\/+$/, "");
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function getBaseUrl() {
  return new URL(siteUrl);
}

export function getCanonicalPath(pathname = "/") {
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
