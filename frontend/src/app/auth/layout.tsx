import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | OneStepIndia.in",
  description: "Sign in or create an account to access OneStepIndia.in",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
