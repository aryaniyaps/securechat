import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";
import { Inter as FontSans } from "next/font/google";
import { RoomProvider } from "~/components/room-provider";
import { Toaster } from "~/components/ui/toaster";
import "~/styles/globals.css";
import { api } from "~/utils/api";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <style jsx global>{`
				:root {
					--font-sans: ${fontSans.style.fontFamily};
				}
			}`}</style>
      <SessionProvider session={session}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RoomProvider>
            <Component {...pageProps} />
          </RoomProvider>
        </ThemeProvider>
      </SessionProvider>
      <Toaster />
    </>
  );
};

export default api.withTRPC(MyApp);
