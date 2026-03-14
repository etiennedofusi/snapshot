import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Demo mode — skip all auth
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const { pathname } = request.nextUrl;

    // In demo mode, redirect login to /orders
    if (pathname === "/login" || pathname === "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/orders";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/auth/callback");

  if (isPublicRoute) {
    return supabaseResponse;
  }

  // Not logged in → redirect to login
  if (!user && !pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Logged in + on login page → redirect to orders
  if (user && pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/orders";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
