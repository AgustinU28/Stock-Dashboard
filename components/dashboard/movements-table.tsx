import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatNumber } from "@/lib/utils/format";
import type { StockMovementWithProduct } from "@/types/database";

export function MovementsTable({ movements }: { movements: StockMovementWithProduct[] }) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Historial de movimientos</CardTitle>
      </CardHeader>
      {movements.length === 0 ? (
        <p className="px-4 pb-6 text-sm text-muted-foreground">
          Todavia no hay movimientos de stock registrados.
        </p>
      ) : (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Fecha</th>
                <th className="pb-2 pr-4 font-medium">Producto</th>
                <th className="pb-2 pr-4 font-medium">Cantidad</th>
                <th className="pb-2 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-t border-border">
                  <td className="py-2.5 pr-4 font-mono-ticket text-muted-foreground">
                    {formatDateTime(movement.created_at)}
                  </td>
                  <td className="max-w-[220px] py-2.5 pr-4">
                    <p className="truncate text-foreground">
                      {movement.product?.name ?? "Producto"}
                    </p>
                    <p className="font-mono-ticket text-[11px] text-muted-foreground">
                      {movement.product?.sku ?? "-"}
                    </p>
                  </td>
                  <td
                    className={cn(
                      "py-2.5 pr-4 font-mono-ticket",
                      movement.change_amount > 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {movement.change_amount > 0 ? "+" : ""}
                    {formatNumber(movement.change_amount)}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{movement.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
