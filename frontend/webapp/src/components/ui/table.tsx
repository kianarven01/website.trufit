import * as React from "react";
import { cn } from "@/lib/utils";

  const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
  >(({ className, ...props }, ref) => (
    <div className="w-full border border-slate-200 rounded-xl overflow-hidden">
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn(
            "w-full text-sm border-separate border-spacing-y-3 bg-transparent p-3",
            className
          )}
          {...props}
        />
      </div>
    </div>
  ));
  Table.displayName = "Table";

  const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        "text-[12px] uppercase tracking-widest text-slate-400",
        className
      )}
      {...props}
    />
  ));
  TableHeader.displayName = "TableHeader";

  const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
  >(({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("align-middle", className)}
      {...props}
    />
  ));
  TableBody.displayName = "TableBody";

  const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
  >(({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        // Header row styling
        "[thead_&]:bg-transparent [thead_&]:rounded-lg",

        // Body row styling 
        "[tbody_&]:bg-white [tbody_&]:border [tbody_&]:border-slate-100",
        "[tbody_&]:rounded-lg",
        "[tbody_&]:shadow-sm [tbody_&]:hover:shadow-lg",
        "[tbody_&]:transition-all [tbody_&]:duration-200",


        className
      )}
      {...props}
    />
  ));
  TableRow.displayName = "TableRow";

  const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
  >(({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "px-5 py-3 text-left font-black bg-transparent",
        "first:rounded-l-lg last:rounded-r-lg",
        className
      )}
      {...props}
    />
  ));
  TableHead.displayName = "TableHead";

  const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
  >(({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "px-5 py-4 align-middle",
        "first:rounded-l-lg last:rounded-r-lg",
        className
      )}
      {...props}
    />
  ));
  TableCell.displayName = "TableCell";

  export {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
  };