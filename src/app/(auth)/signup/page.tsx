import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Create account — DeflectAI" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
