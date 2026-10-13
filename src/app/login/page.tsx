import Image from "next/image";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function authenticate(formData: FormData) {
  "use server";

  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    redirect("/login?error=CredentialsSignin");
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      redirect("/login?error=CredentialsSignin");
    }

    throw error;
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const hasLoginError = error === "CredentialsSignin";

  return (
    <main className="login-screen">
      <div className="login-glow login-glow-top" aria-hidden="true" />
      <div className="login-glow login-glow-bottom" aria-hidden="true" />

      <section className="login-content" aria-labelledby="login-title">
        <div className="login-mark">
          <Image
            src="/H_Hyris.png"
            alt="Logo Hyris"
            width={220}
            height={260}
            priority
            className="login-logo"
          />
        </div>

        <h1 id="login-title" className="login-title">
          Bienvenue sur Tosma
        </h1>

        <form action={authenticate} className="login-form">
          <label className="sr-only" htmlFor="username">
            Identifiant
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Identifiant"
            required
            className="login-input"
          />

          <label className="sr-only" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Mot de passe"
            required
            className="login-input"
          />

          {hasLoginError && (
            <p className="login-error" role="alert">
              Identifiant ou mot de passe incorrect.
            </p>
          )}

          <button type="submit" className="login-submit">
            Entrer
          </button>
        </form>
      </section>
    </main>
  );
}
