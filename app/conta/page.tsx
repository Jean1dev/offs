import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Icon } from "@/components/Icon";
import { PreferencesForm } from "@/components/PreferencesForm";

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { name, email, image, defaultModel, channel } = session.user;

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "var(--space-12) var(--space-6)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-12)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name ?? "Avatar"}
            width={52}
            height={52}
            style={{ borderRadius: "var(--radius-full)", flexShrink: 0 }}
          />
        ) : (
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-full)",
              background:
                "linear-gradient(135deg, var(--rose-200), var(--rose-300))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--rose-700)",
              flexShrink: 0,
            }}
          >
            <Icon name="user" size={26} />
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            className="bb-h2"
            style={{ margin: 0, color: "var(--text-primary)" }}
          >
            {name ?? "Sua conta"}
          </h1>
          <p className="bb-small" style={{ margin: 0 }}>
            {email}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
            }}
          >
            <Icon name="arrowR" size={16} />
            Sair
          </button>
        </form>
      </header>

      <PreferencesForm
        initialModel={defaultModel}
        initialChannel={channel}
      />
    </main>
  );
}
