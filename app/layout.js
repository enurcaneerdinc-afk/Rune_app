import "./globals.css";

export const metadata = {
  title: "Rune — kişisel rehberlik",
  description: "Doğum tarihinden kişisel rune profili ve günlük rune çekimi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
