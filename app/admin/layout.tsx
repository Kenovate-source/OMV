import { AdminAuthProvider } from "@/lib/admin/admin-auth-context";
import { AdminProductsProvider } from "@/lib/admin/admin-products-context";
import { AdminCustomersProvider } from "@/lib/admin/admin-customers-context";
import { AdminPromotionsProvider } from "@/lib/admin/admin-promotions-context";
import { AdminReviewsProvider } from "@/lib/admin/admin-reviews-context";
import { AdminAuditProvider } from "@/lib/admin/admin-audit-context";
import { AdminNotificationsProvider } from "@/lib/admin/admin-notifications-context";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminProductsProvider>
        <AdminCustomersProvider>
          <AdminPromotionsProvider>
            <AdminReviewsProvider>
              <AdminAuditProvider>
                <AdminNotificationsProvider>
                  <AdminShell>{children}</AdminShell>
                </AdminNotificationsProvider>
              </AdminAuditProvider>
            </AdminReviewsProvider>
          </AdminPromotionsProvider>
        </AdminCustomersProvider>
      </AdminProductsProvider>
    </AdminAuthProvider>
  );
}
