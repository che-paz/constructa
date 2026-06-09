import { SignupForm } from "@/components/shared/auth-forms";

interface Props {
  searchParams: { error?: string };
}

export default function SignupPage({ searchParams }: Props) {
  return <SignupForm error={searchParams.error} />;
}
