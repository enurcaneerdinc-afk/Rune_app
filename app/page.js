import UserIntakeForm from "../components/UserIntakeForm";
import Link from "next/link";

const navLinkStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  color: "var(--verdigris)",
  textDecoration: "none",
};

export default function Home() {
  return (
    <main>
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "1.5rem 1.5rem 0",
          display: "flex",
          justifyContent: "flex-end",
          gap: "1.5rem",
        }}
      >
        <Link href="/hakkinda" style={navLinkStyle}>
          Rune nedir? →
        </Link>
        <Link href="/gecmis" style={navLinkStyle}>
          Geçmiş çekimlerim →
        </Link>
      </div>
      <UserIntakeForm />
    </main>
  );
}
