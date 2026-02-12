export function formatIncomingRequest(
  method: string,
  path: string,
  ip: string,
  body?: unknown,
): string {
  const lines = [
    `📨 <b>Incoming Request</b>`,
    `<b>Method:</b> ${method}`,
    `<b>Path:</b> ${path}`,
    `<b>IP:</b> <code>${ip}</code>`,
    `<b>Time:</b> ${new Date().toISOString()}`,
  ];

  if (body && Object.keys(body as object).length > 0) {
    lines.push(`<b>Body:</b> <pre>${JSON.stringify(body, null, 2)}</pre>`);
  }

  return lines.join('\n');
}
