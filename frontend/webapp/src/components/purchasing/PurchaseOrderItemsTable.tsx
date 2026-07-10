import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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
    <div className="overflow-hidden rounded-xl border border-border/60 bg-background px-3">
      <Table className="table-fixed w-full border-separate border-spacing-y-2">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Product</TableHead>
            <TableHead className="w-[15%] text-right">Ordered</TableHead>
            <TableHead className="w-[15%] text-right">Received</TableHead>
            <TableHead className="w-[15%] text-right">Unit Cost</TableHead>
            <TableHead className="w-[15%] text-right">Line Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                No line items found.
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
                <TableCell className="text-right text-muted-foreground">{item.quantityOrdered}</TableCell>
                <TableCell className="text-right text-muted-foreground">{item.quantityReceived ?? 0}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.unitCost)}</TableCell>
                <TableCell className="text-right font-bold text-foreground">{formatCurrency(item.lineTotal)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseOrderItemsTable;
