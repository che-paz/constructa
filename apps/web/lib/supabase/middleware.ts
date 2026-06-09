import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const PUBLIC_PREFIXES = ["/client"];
const AUTH_ROUTES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const setAll: SetAllCookies = (cookiesToSet) => {
    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
    supabaseResponse = NextResponse.next({ request });
    cookiesToSet.forEach(({ name, value, options }) =>
      supabaseResponse.cookies.set(name, value, options),
    );
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll,
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isOnboarding = pathname === "/onboarding";
  const isProtected =
    pathname.startsWith("/projects") || pathname.startsWith("/dashboard");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/projects";
    return NextResponse.redirect(url);
  }

  if (user && (isProtected || isOnboarding)) {
    const { data: membership } = await supabase
      .from("user_organizations")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    const hasOrganization = Boolean(membership);

    if (!hasOrganization && !isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (hasOrganization && isOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = "/projects";
      return NextResponse.redirect(url);
    }
  }

  if (!user && isOnboarding) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user && !isPublicRoute && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
