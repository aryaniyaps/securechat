export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/", "/rooms/:roomId", "/settings/:path", "/auth/email/change"],
};
