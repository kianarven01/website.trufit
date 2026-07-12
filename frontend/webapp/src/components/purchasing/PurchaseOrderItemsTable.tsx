import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";
import { formatCurrency } from "@/components/purchasing/purchasingUtils";

export interface PurchaseOrderItemRow {
  id: string;
  productName: string;
  sku?: string | null;
  partNumber?: string | null;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  lineTotal: number;
}

interface PurchaseOrderItemsTableProps {
  items: PurchaseOrderItemRow[];
}

const PurchaseOrderItemsTable = ({ items }: PurchaseOrderItemsTableProps) => {
  return (
    <div className="flex flex-col flex-1 border rounded-lg mx-4 mb-4 overflow-hidden">
      <Table className="table-fixed w-full">
        <TableHeader className="bg-muted/50">
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="w-[30%] pl-4 py-3 text-center">Product</TableHead>
            <TableHead className="w-[15%] text-center py-3">Part Number</TableHead>
            <TableHead className="w-[13%] text-center py-3">Ordered</TableHead>
            <TableHead className="w-[13%] text-center py-3">Received</TableHead>
            <TableHead className="w-[14%] text-center py-3">Unit Cost</TableHead>
            <TableHead className="w-[15%] text-center py-3">Line Total</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <ScrollArea className="flex-1">
        <Table className="table-fixed w-full">
          <TableBody>
            {items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={6}>
                  No line items found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-transparent border-b last:border-b-0"
                >
                  <TableCell className="w-[30%] py-3 pl-4 text-left">
                    <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                    {item.sku && <p className="text-[11px] text-muted-foreground leading-none mt-0.5">{item.sku}</p>}
                  </TableCell>
                  <TableCell className="w-[15%] text-center text-muted-foreground py-3">{item.partNumber || "-"}</TableCell>
                  <TableCell className="w-[13%] text-center text-muted-foreground py-3">{item.quantityOrdered}</TableCell>
                  <TableCell className="w-[13%] text-center text-muted-foreground py-3">{item.quantityReceived ?? 0}</TableCell>
                  <TableCell className="w-[14%] text-center text-muted-foreground py-3">{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="w-[15%] text-center font-bold text-foreground py-3">{formatCurrency(item.lineTotal)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default PurchaseOrderItemsTable;
