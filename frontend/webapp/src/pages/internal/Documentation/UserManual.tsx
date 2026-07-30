import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scrollArea";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  ShoppingCart,
  Package,
  Settings,
  HelpCircle,
} from "lucide-react";

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string[];
}

const manualSections: ManualSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: HelpCircle,
    content: [
      "Welcome to TruFit Auto Center Management System. This guide will help you navigate and use the system effectively.",
      "Login: Use your assigned username and password to access the system. Contact your administrator if you need credentials.",
      "Dashboard: After login, you'll see the Dashboard with an overview of your shop's performance, pending tasks, and quick actions.",
      "Navigation: Use the sidebar on the left to access different modules. Items are filtered based on your role and permissions.",
    ],
  },
  {
    id: "appointments",
    title: "Managing Appointments",
    icon: Calendar,
    content: [
      "View all scheduled appointments in the calendar view. Use filters to see appointments by date, status, or technician.",
      "Create new appointments by clicking 'New Appointment' and selecting the customer, vehicle, and service type.",
      "Reschedule or cancel appointments by clicking on the appointment card and selecting the appropriate action.",
      "Appointment statuses: Pending, Confirmed, In Progress, Completed, Cancelled.",
    ],
  },
  {
    id: "customers",
    title: "Customer Management",
    icon: Users,
    content: [
      "Access the Customers module to view and manage all customer profiles and their vehicle history.",
      "Add new customers with their contact information and vehicle details.",
      "View customer history including past appointments, estimates, and invoices.",
      "Search customers by name, phone number, or vehicle plate number.",
    ],
  },
  {
    id: "services",
    title: "Services & Job Orders",
    icon: Settings,
    content: [
      "Service Catalog: Manage your service offerings including pricing, labor rates, and estimated durations.",
      "Job Orders: Track service tasks from creation to completion. Assign technicians and monitor progress.",
      "Job Order Status: Open → Assigned → In Progress → Quality Check → Completed.",
      "Link job orders to estimates and sales orders for seamless workflow.",
    ],
  },
  {
    id: "sales",
    title: "Sales & Estimates",
    icon: ShoppingCart,
    content: [
      "Estimates: Create detailed estimates with parts and labor costs. Send to customers for approval.",
      "Sales Orders: Convert approved estimates to sales orders. Track order status and fulfillment.",
      "Billing: Generate invoices from completed job orders or sales orders. Track payment status.",
      "Partial Issuance: Issue partial invoices for multi-phase jobs or deposit payments.",
    ],
  },
  {
    id: "products",
    title: "Products & Inventory",
    icon: Package,
    content: [
      "Product Catalog: Browse and manage your product inventory organized by vehicle make, model, and category.",
      "Inventory: Track stock levels, set reorder points, and manage warehouse locations.",
      "Purchasing: Create purchase orders to suppliers and track goods receipts.",
      "Stock Ledger: View complete history of stock movements including receipts, issues, and adjustments.",
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: HelpCircle,
    content: [
      "Sales Summary: View revenue trends, top services, and conversion rates.",
      "Inventory Reports: Monitor stock levels, identify fast-moving items, and low-stock alerts.",
      "Financial Reports: Track revenue vs expenses, profit margins, and outstanding balances.",
      "Audit Log: Review system activity and changes made by users.",
    ],
  },
  {
    id: "settings",
    title: "Settings & Administration",
    icon: Settings,
    content: [
      "Roles & Permissions: Administrators can create and manage user roles with granular permission controls.",
      "Employee Management: View current employees, onboard new staff, and manage access levels.",
      "Account Settings: Update your profile information, change password, and manage notifications.",
      "System Administration is restricted to users with the Admin role or Manage Roles permission.",
    ],
  },
];

const UserManual: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["getting-started"]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            User Manual
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete guide to using the TruFit Auto Center system
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Version 1.0
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {manualSections.map((section) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSections.includes(section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isExpanded
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {manualSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            return (
              <Card key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="space-y-3 ml-11">
                      {section.content.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-primary font-bold text-sm mt-0.5">{idx + 1}.</span>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}

          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Contact your system administrator for additional support or to report issues.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
