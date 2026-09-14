import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import type { SaleWithProduct } from "@/types/database";

export function SalesTable({ sales }: { sales: SaleWithProduct[] }) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Historial de ventas</CardTitle>
      </CardHeader>
      {sales.length === 0 ? (
        <p className="px-4 pb-6 text-sm text-muted-foreground">
          Todavia no hay ventas registradas.
        </p>
      ) : (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Fecha</th>
                <th className="pb-2 pr-4 font-medium">Producto</th>
                <th className="pb-2 pr-4 font-medium">Cantidad</th>
                <th className="pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-border">
                  <td className="py-2.5 pr-4 font-mono-ticket text-muted-foreground">
                    {formatDateTime(sale.created_at)}
                  </td>
                  <td className="max-w-[220px] py-2.5 pr-4">
                    <p className="truncate text-foreground">{sale.product?.name ?? "Producto"}</p>
                    <p className="font-mono-ticket text-[11px] text-muted-foreground">
                      {sale.product?.sku ?? "-"}
                    </p>
                  </td>
                  <td className="py-2.5 pr-4 font-mono-ticket text-foreground">x{sale.quantity}</td>
                  <td className="py-2.5 font-mono-ticket text-foreground">
                    {formatCurrency(sale.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
