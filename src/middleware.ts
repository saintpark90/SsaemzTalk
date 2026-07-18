export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/feed/:path*",
    "/posts/:path*",
    "/materials/:path*",
    "/schedules/:path*",
    "/admin/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/pending/:path*",
  ],
};
