import AdminLayout from "@/components/layout/AdminLayout";

export default function NetworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
