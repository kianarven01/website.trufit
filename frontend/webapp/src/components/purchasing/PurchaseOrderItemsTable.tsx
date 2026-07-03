export interface PurchaseOrderItemRow {
  id: string;
  productName: string;
  sku?: string | null;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  lineTotal: number;
}

interface PurchaseOrderItemsTableProps {
  items: PurchaseOrderItemRow[];
}

const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const PurchaseOrderItemsTable = ({ items }: PurchaseOrderItemsTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Product</th>
            <th className="px-4 py-3 text-right font-semibold">Ordered</th>
            <th className="px-4 py-3 text-right font-semibold">Received</th>
            <th className="px-4 py-3 text-right font-semibold">Unit Cost</th>
            <th className="px-4 py-3 text-right font-semibold">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                No line items found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t border-border/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{item.productName}</p>
                  {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.quantityOrdered}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.quantityReceived ?? 0}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(item.unitCost)}</td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderItemsTable;
