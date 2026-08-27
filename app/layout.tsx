import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gridaboard",
  description: "공유 가능한 온라인 보드"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
