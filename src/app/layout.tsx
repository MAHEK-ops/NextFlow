import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextFlow",
  description: "Visual LLM workflow builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Toaster
              theme="dark"
              toastOptions={{
                style: {
                  background: "#1a1a1a",
                  border: "1px solid #272727",
                  color: "#fafafa",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
