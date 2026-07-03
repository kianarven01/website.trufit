export interface GoodsReceiptItemRow {
  id: string;
  productName: string;
  ordered?: number;
  quantityReceived: number;
  quantityRejected?: number;
  notes?: string | null;
}

interface GoodsReceiptItemsTableProps {
  items: GoodsReceiptItemRow[];
}

const GoodsReceiptItemsTable = ({ items }: GoodsReceiptItemsTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Product</th>
            <th className="px-4 py-3 text-right font-semibold">Ordered</th>
            <th className="px-4 py-3 text-right font-semibold">Received</th>
            <th className="px-4 py-3 text-right font-semibold">Rejected</th>
            <th className="px-4 py-3 text-left font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                No received items found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.ordered ?? "-"}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">{item.quantityReceived}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{item.quantityRejected ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.notes || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GoodsReceiptItemsTable;
