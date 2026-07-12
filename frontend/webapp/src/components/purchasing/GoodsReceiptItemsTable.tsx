import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scrollArea";

export interface GoodsReceiptItemRow {
  id: string;
  productId?: string;
  productSupplierId?: string;
  productName: string;
  sku?: string | null;
  partNumber?: string | null;
  ordered?: number;
  quantityReceived: number;
  quantityPromo?: number;
  quantityReturned?: number;
  quantityRejected?: number;
  purchaseOrderItemId?: string;
  notes?: string | null;
}

interface GoodsReceiptItemsTableProps {
  items: GoodsReceiptItemRow[];
}

const GoodsReceiptItemsTable = ({ items }: GoodsReceiptItemsTableProps) => {
  return (
    <div className="flex flex-col flex-1 border rounded-lg mx-4 mb-4 overflow-hidden">
      <Table className="table-fixed w-full">
        <TableHeader className="bg-muted/50">
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="w-[30%] pl-4 py-3 text-center">Product</TableHead>
            <TableHead className="w-[15%] text-center py-3">Part Number</TableHead>
            <TableHead className="w-[10%] text-center py-3">Ordered</TableHead>
            <TableHead className="w-[10%] text-center py-3">Received</TableHead>
            <TableHead className="w-[10%] text-center py-3">Free / Promo</TableHead>
            <TableHead className="w-[10%] text-center py-3">Returned</TableHead>
            <TableHead className="w-[15%] text-center py-3">Notes</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
      <ScrollArea className="flex-1">
        <Table className="table-fixed w-full">
          <TableBody>
            {items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={7}>
                  No received items found.
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
                  <TableCell className="w-[10%] text-center text-muted-foreground py-3">{item.ordered ?? "-"}</TableCell>
                  <TableCell className="w-[10%] text-center font-semibold text-green-700 dark:text-green-400 py-3">{item.quantityReceived}</TableCell>
                  <TableCell className="w-[10%] text-center font-semibold text-blue-600 dark:text-blue-400 py-3">{item.quantityPromo ?? 0}</TableCell>
                  <TableCell className="w-[10%] text-center font-semibold text-red-700 dark:text-red-400 py-3">{item.quantityReturned ?? 0}</TableCell>
                  <TableCell className="w-[15%] text-center text-muted-foreground text-xs py-3">{item.notes || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default GoodsReceiptItemsTable;
