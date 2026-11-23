import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign in — DeflectAI" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
