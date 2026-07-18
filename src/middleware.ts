export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/feed/:path*",
    "/posts/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/pending/:path*",
  ],
};
