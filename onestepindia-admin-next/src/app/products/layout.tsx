import AdminLayout from "@/components/layout/AdminLayout";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
