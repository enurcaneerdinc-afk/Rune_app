import UserIntakeForm from "../components/UserIntakeForm";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "1.5rem 1.5rem 0", textAlign: "right" }}>
        <Link
          href="/gecmis"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "var(--verdigris)",
            textDecoration: "none",
          }}
        >
          Geçmiş çekimlerim →
        </Link>
      </div>
      <UserIntakeForm />
    </main>
  );
}
