import AdminLayout from "@/components/layout/AdminLayout";

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
