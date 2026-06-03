import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "AasaMedChem Inventory",
  description: "Hackathon-grade chemical inventory and order system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
