import AdminLayout from "@/components/layout/AdminLayout";

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
