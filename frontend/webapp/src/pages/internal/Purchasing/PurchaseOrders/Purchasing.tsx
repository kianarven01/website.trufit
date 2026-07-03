import { ClipboardList, PackageCheck, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    title: "Purchase Orders",
    description: "Create, submit, approve, cancel, and receive supplier purchase orders.",
    path: "/webapp/purchasing/purchase-orders",
    Icon: ClipboardList,
  },
  {
    title: "Goods Receipts",
    description: "Record warehouse deliveries and approve stock receiving.",
    path: "/webapp/purchasing/goods-receipts",
    Icon: PackageCheck,
  },
  {
    title: "Stock Ledger",
    description: "Review the full audit trail of inventory movements.",
    path: "/webapp/purchasing/stock-ledger",
    Icon: ScrollText,
  },
];

const Purchasing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background px-5 py-5 text-foreground">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Purchasing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage purchase orders, goods receipts, and stock movement history.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map(({ title, description, path, Icon }) => (
          <button
            key={path}
            type="button"
            className="rounded-xl border border-border bg-background p-5 text-left transition hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-md"
            onClick={() => navigate(path)}
          >
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
              <Icon size={20} />
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Purchasing;
