import Skeleton from "./Skeleton";

type TableSkeletonProps = {
  columns?: number;
  rows?: number;
};

const TableSkeleton = ({ columns = 6, rows = 5 }: TableSkeletonProps) => {
  return (
    <div className="w-full rounded-xl border border-border overflow-hidden">
      <div
        className="grid gap-4 bg-muted/40 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </div>

      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-4 py-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={
                  columnIndex === 0
                    ? "h-4 w-28"
                    : columnIndex === columns - 1
                      ? "h-8 w-24"
                      : "h-4 w-20"
                }
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;