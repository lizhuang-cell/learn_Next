import "./ui/global.css";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: {
      template: '%s | Acme',
      default: 'Acme',
    },
    description: "Acme",
    metadataBase: new URL("http://localhost:3000"),
}
// import { inter } from "@/app/ui/fonts"; 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
