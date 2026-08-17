import { AdminAuthProvider } from "@/lib/admin/admin-auth-context";
import { AdminCustomersProvider } from "@/lib/admin/admin-customers-context";
import { AdminPromotionsProvider } from "@/lib/admin/admin-promotions-context";
import { AdminReviewsProvider } from "@/lib/admin/admin-reviews-context";
import { AdminAuditProvider } from "@/lib/admin/admin-audit-context";
import { AdminNotificationsProvider } from "@/lib/admin/admin-notifications-context";
import { AdminShell } from "@/components/admin/AdminShell";

// Product/variant/stock data now lives in the root-level InventoryProvider
// (lib/inventory/inventory-context.tsx) so the admin portal and the
// storefront read and write the exact same state — no separate admin-only
// product context anymore (see IMPLEMENTATION_LOG.md, Phase 4 refinement).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
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
    </AdminAuthProvider>
  );
}

