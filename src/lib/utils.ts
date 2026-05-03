export function detectPlatform(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("amazon.in")) return "Amazon India";
    if (host.includes("amazon.com")) return "Amazon US";
    if (host.includes("amazon.co.uk")) return "Amazon UK";
    if (host.includes("amazon")) return "Amazon";
    if (host.includes("flipkart")) return "Flipkart";
    if (host.includes("myntra")) return "Myntra";
    if (host.includes("snapdeal")) return "Snapdeal";
    if (host.includes("meesho")) return "Meesho";
    return "E-commerce";
  } catch {
    return "Unknown";
  }
}

export function detectCurrency(url: string): string {
  if (url.includes("amazon.in") || url.includes("flipkart")) return "₹";
  if (url.includes("amazon.com")) return "$";
  if (url.includes("amazon.co.uk")) return "£";
  return "₹";
}

export function detectProductCategory(url: string): string {
  const lower = url.toLowerCase();
  if (/headphone|earphone|airpod|earbud|wh-|xm5|buds/.test(lower)) return "headphones";
  if (/laptop|macbook|notebook|chromebook/.test(lower)) return "laptop";
  if (/phone|galaxy|iphone|pixel|oneplus|redmi|poco|realme|moto/.test(lower)) return "smartphone";
  if (/watch|smartwatch|band/.test(lower)) return "smartwatch";
  if (/tablet|ipad/.test(lower)) return "tablet";
  if (/camera|dslr|mirrorless/.test(lower)) return "camera";
  if (/tv|television|qled|oled/.test(lower)) return "television";
  if (/speaker|soundbar/.test(lower)) return "speaker";
  if (/monitor|display/.test(lower)) return "monitor";
  if (/keyboard|mouse|gaming/.test(lower)) return "gaming peripheral";
  if (/refrigerator|washing|ac |microwave/.test(lower)) return "home appliance";
  return "electronics";
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const supportedHosts = ["amazon", "flipkart", "myntra", "snapdeal", "meesho"];
    return supportedHosts.some((h) => u.hostname.includes(h));
  } catch {
    return false;
  }
}

export function formatPrice(price: number, currency = "₹"): string {
  return `${currency}${price.toLocaleString("en-IN")}`;
}
