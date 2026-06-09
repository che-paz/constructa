import { LoginForm } from "@/components/shared/auth-forms";

interface Props {
  searchParams: { redirect?: string; error?: string; message?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <LoginForm
      redirectTo={searchParams.redirect}
      error={searchParams.error}
      message={searchParams.message}
    />
  );
}
