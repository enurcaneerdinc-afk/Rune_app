import "./globals.css";
import { LanguageProvider } from "../components/LanguageProvider";

export const metadata = {
  title: "Rune — kişisel rehberlik",
  description: "Doğum tarihinden kişisel rune profili ve günlük rune çekimi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
