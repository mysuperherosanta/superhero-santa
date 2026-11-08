import { BASE_PATH } from "@/lib/site";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#FBE8D2",
        color: "#2a1f2b",
        font: "16px/1.5 Georgia, serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <h1>The Reindeer took a wrong turn.</h1>
        <p>
          This page isn&apos;t here.{" "}
          <a href={`${BASE_PATH}/`} style={{ color: "#B4202B", fontWeight: 700 }}>
            Head back to the North Pole
          </a>
          .
        </p>
      </div>
    </main>
  );
}
