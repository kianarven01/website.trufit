import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export interface GoodsReceiptItemRow {
  id: string;
  productName: string;
  sku?: string | null;
  ordered?: number;
  quantityReceived: number;
  quantityRejected?: number;
  quantityReturned?: number;
  notes?: string | null;
}

interface GoodsReceiptItemsTableProps {
  items: GoodsReceiptItemRow[];
}

const GoodsReceiptItemsTable = ({ items }: GoodsReceiptItemsTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background px-3">
      <Table className="table-fixed w-full border-separate border-spacing-y-2">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Product</TableHead>
            <TableHead className="w-[12%] text-right">Ordered</TableHead>
            <TableHead className="w-[12%] text-right">Received</TableHead>
            <TableHead className="w-[12%] text-right">Rejected</TableHead>
            <TableHead className="w-[12%] text-right">Returned</TableHead>
            <TableHead className="w-[17%]">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                No received items found.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                className="transition-all rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:bg-accent/30"
              >
                <TableCell className="py-2.5">
                  <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                  {item.sku && <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{item.sku}</p>}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{item.ordered ?? "-"}</TableCell>
                <TableCell className="text-right font-semibold text-green-700 dark:text-green-400">{item.quantityReceived}</TableCell>
                <TableCell className="text-right text-muted-foreground">{item.quantityRejected ?? 0}</TableCell>
                <TableCell className="text-right font-semibold text-red-700 dark:text-red-400">{item.quantityReturned ?? 0}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{item.notes || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default GoodsReceiptItemsTable;
