/** Open WhatsApp with a prefilled message — works on iOS Safari and Android (incl. Redmi). */
export function openWhatsAppChat(phoneDigits: string, message: string) {
  const phone = phoneDigits.replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);
  const webUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isAndroid = /Android/i.test(ua);

  // Redmi / MIUI often block window.open from async handlers; same-tab navigation is reliable.
  if (isAndroid) {
    // Intent opens the installed app; falls back to the HTTPS endpoint.
    const intent = `intent://send?phone=${phone}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
    window.location.href = intent;
    return;
  }

  // iOS + desktop: HTTPS send link opens the app or WhatsApp Web.
  window.location.href = webUrl;
}
