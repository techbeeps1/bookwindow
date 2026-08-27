import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle legacy PHP redirects fallback if needed
  const lowerPath = pathname.toLowerCase();

  if (lowerPath === "/terms.php") {
    const url = request.nextUrl.clone();
    url.pathname = "/terms";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (lowerPath === "/contact.php" || lowerPath === "/contact-us.php") {
    const url = request.nextUrl.clone();
    url.pathname = "/contact-us";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (lowerPath === "/about-us.php" || lowerPath === "/about.php") {
    const url = request.nextUrl.clone();
    url.pathname = "/about-us";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (lowerPath === "/tuitor.php" || lowerPath === "/tutor.php" || lowerPath === "/tuitor") {
    const url = request.nextUrl.clone();
    url.pathname = "/tutor";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (lowerPath === "/enquiry.php" || lowerPath === "/enquiry") {
    const url = request.nextUrl.clone();
    url.pathname = "/contact-us";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (lowerPath === "/category/author" || lowerPath === "/author") {
    const url = request.nextUrl.clone();
    url.pathname = "/publications";
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  if (lowerPath.startsWith("/author/")) {
    const authorSlug = pathname.slice("/author/".length);
    const url = request.nextUrl.clone();
    url.pathname = `/publication/${authorSlug}`;
    return NextResponse.redirect(url, 301);
  }

  // 2. Only process product URLs for normalization
  if (pathname.startsWith("/product/")) {
    const rawSlug = pathname.slice("/product/".length);

    try {
      const decodedSlug = decodeURIComponent(rawSlug);
      
      const hasUpperCase = /[A-Z]/.test(decodedSlug);
      const hasSpaces = /\s+/.test(decodedSlug);

      if (hasUpperCase || hasSpaces) {
        const normalizedSlug = decodedSlug
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        if (normalizedSlug && normalizedSlug !== rawSlug) {
          const url = request.nextUrl.clone();
          url.pathname = `/product/${encodeURIComponent(normalizedSlug)}`;
          return NextResponse.redirect(url, 301);
        }
      }
    } catch {
      // If URI malformed, continue request normally
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static
     * - _next/image
     * - static asset files (.png, .jpg, .ico, .svg, .css, .js, .webp, .woff, .woff2)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|svg|webp|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
