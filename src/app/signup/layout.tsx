import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free Stratega account and start studying smarter with AI.",
};
export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
