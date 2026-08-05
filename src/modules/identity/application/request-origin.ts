const vercelHost = /^[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i;
const localHost = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

export function resolveTrustedRequestOrigin(
  headers: Pick<Headers, "get">,
  configuredAppUrl: string,
) {
  const configured = new URL(configuredAppUrl);
  const forwardedHost = firstHeaderValue(headers.get("x-forwarded-host"));
  const host = forwardedHost || firstHeaderValue(headers.get("host"));
  const forwardedProto = firstHeaderValue(headers.get("x-forwarded-proto"));
  const protocol = forwardedProto || configured.protocol.replace(":", "");

  const trustedHost =
    host === configured.host || vercelHost.test(host) || localHost.test(host);
  const trustedProtocol = protocol === "https" || protocol === "http";

  if (
    !trustedHost ||
    !trustedProtocol ||
    host.includes("/") ||
    host.includes("@")
  ) {
    return configured.origin;
  }

  if (protocol === "http" && !localHost.test(host)) return configured.origin;
  return `${protocol}://${host}`;
}
