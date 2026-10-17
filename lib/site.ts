export const SITE_URL = "https://superherosantaclaus.com";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a root-relative public path (e.g. "/css/site.css") with the base path. */
export const asset = (p: string) => `${BASE_PATH}${p}`;
