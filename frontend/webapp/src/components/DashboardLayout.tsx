import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Calendar03Icon,
  UserGroupIcon,
  Activity01Icon,
  Task01Icon,
  Settings01Icon,
  ShoppingCart01Icon,
  Money03Icon,
  StickyNote01Icon,
  ShippingTruck01Icon,
  PackageIcon,
  Archive01Icon,
  Grid02Icon,
  ChartBarLineIcon,
  ChartLineData01Icon,
  TaskDone01Icon,
  UserSettings01Icon,
  UserShield01Icon,
  Notification03Icon,
  Logout01Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
  Menu01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Estimate01Icon,
  Briefcase01Icon,
  WarehouseIcon,
  Exchange01Icon,
  Building03Icon,
  Analytics01Icon,
  DocumentValidationIcon,
  Package01Icon,
  PackageReceive01Icon,
  UserGroup02Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import trufitLogo from "@/assets/trufit_logo.webp";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface NavItem {
  label: string;
  icon: any;
  path?: string;
  roles?: string[];
  children?: {
    label: string;
    path: string;
    icon: any;
    roles?: string[];
  }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: DashboardSquare01Icon,
    path: "/webapp/dashboard",
  },
  { label: "Appointments", icon: Calendar03Icon, path: "/webapp/appointments" },
  { label: "Customers", path: "/webapp/customers", icon: UserGroupIcon },
  {
    label: "Services",
    icon: Activity01Icon,
    children: [
      {
        label: "Job Orders",
        path: "/webapp/services/job-orders",
        icon: Task01Icon,
      },
      {
        label: "Service Catalog",
        path: "/webapp/services/service-catalog",
        icon: Settings01Icon,
      },
    ],
  },
  {
    label: "Sales",
    icon: Money03Icon,
    children: [
      {
        label: "Sales Orders",
        path: "/webapp/sales/sales-orders",
        icon: DocumentValidationIcon,
      },
      {
        label: "Estimates",
        path: "/webapp/sales/estimates",
        icon: Estimate01Icon,
      },
    ],
  },
  {
    label: "Purchasing",
    icon: ShoppingCart01Icon,
    children: [
      {
        label: "Purchase Orders",
        path: "/webapp/purchasing/purchase-orders",
        icon: PackageReceive01Icon,
      },
      {
        label: "Suppliers",
        path: "/webapp/purchasing/suppliers",
        icon: Briefcase01Icon,
      },
    ],
  },
  {
    label: "Products",
    icon: PackageIcon,
    children: [
      {
        label: "Product Catalog",
        path: "/webapp/products/product-catalog",
        icon: Package01Icon,
      },
      {
        label: "Inventory",
        path: "/webapp/products/inventory",
        icon: WarehouseIcon,
      },
      {
        label: "Stock Movement",
        path: "/webapp/products/stock-movement",
        icon: Exchange01Icon,
      },
      {
        label: "Warehouse",
        path: "/webapp/products/warehouse",
        icon: Building03Icon,
      },
    ],
  },
  {
    label: "Reports",
    icon: ChartBarLineIcon,
    children: [
      {
        label: "Sales Summary",
        path: "/webapp/reports/sales-summary",
        icon: Analytics01Icon,
      },
      {
        label: "Sales Order List",
        path: "/webapp/reports/sales-orders",
        icon: DocumentValidationIcon,
      },
      {
        label: "Reorder & Forecast",
        path: "/webapp/reports/reorder-forecast",
        icon: ChartBarLineIcon,
      },
      {
        label: "Audit Log",
        path: "/webapp/reports/audit-log",
        icon: Activity01Icon,
      },
    ],
  },
  {
    label: "Manage Employees",
    icon: UserSettings01Icon,
    children: [
      {
        label: "Current Employees",
        path: "/webapp/employee-management/current-employees",
        icon: UserGroup02Icon,
      },
      {
        label: "Onboarding",
        path: "/webapp/employee-management/onboarding-employees",
        icon: UserAdd01Icon,
      },
      {
        label: "Roles and Permissions",
        path: "/webapp/settings/roles-and-permissions",
        icon: UserShield01Icon,
        roles: ["admin"],
      },
    ],
  },
];

const mockNotifications = [
  {
    id: 1,
    text: "New appointment request from Juan D.",
    time: "5 min ago",
    unread: true,
  },
  {
    id: 2,
    text: "Low stock alert: Brake Pads",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 3,
    text: "Job Order #1024 completed",
    time: "3 hrs ago",
    unread: false,
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const userRole = user?.role?.toLowerCase() || "admin";

  const filteredNavItems = navItems.map((item) => {
    if (!item.children) return item;
    const filteredChildren = item.children.filter((child) => {
      if (!child.roles) return true;
      return child.roles.includes(userRole);
    });
    return { ...item, children: filteredChildren };
  });

  // Auto-expand active group on route change
  useEffect(() => {
    const activeItem = filteredNavItems.find((item) =>
      item.children?.some((child) => location.pathname === child.path),
    );
    if (activeItem && !openGroups.includes(activeItem.label)) {
      setOpenGroups((prev) => [...prev, activeItem.label]);
    }
  }, [location.pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => location.pathname === c.path);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  // Breadcrumb generator
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments
    .map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
      
      const findLabel = (items: NavItem[]): string | null => {
        for (const item of items) {
          if (item.path === path) return item.label;
          if (item.children) {
            const child = item.children.find(c => c.path === path);
            if (child) return child.label;
          }
        }
        return null;
      };
      
      const mappedLabel = findLabel(navItems);
      const label = mappedLabel || (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
      
      return { label, path };
    })
    .filter(item => item.label.toLowerCase() !== "webapp");

  /* ---- Unified Nav Item Render ---- */
  const renderNavItem = (item: NavItem) => {
    const active = item.path ? isActive(item.path) : false;
    const open = openGroups.includes(item.label);
    const groupActive = isGroupActive(item);

    // If collapsed and has children, use Popover for sub-items
    if (collapsed && item.children) {
      return (
        <Popover key={item.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-12 w-full items-center px-6 rounded-xl transition-all outline-none focus:outline-none focus-visible:ring-0 ring-0",
                    groupActive
                      ? "text-primary bg-sidebar-accent shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <HugeiconsIcon icon={item.icon} size={22} className="shrink-0" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold">
              {item.label}
            </TooltipContent>
          </Tooltip>
          <PopoverContent
            side="right"
            align="start"
            className="w-64 p-2 bg-sidebar border-sidebar-border z-50 shadow-2xl rounded-xl"
          >
            <p className="px-4 py-3 text-[12px] font-black uppercase tracking-widest text-sidebar-foreground/70 border-b border-sidebar-border/50 mb-1">
              {item.label}
            </p>
            {item.children?.map((child) => (
              <button
                key={child.path}
                type="button"
                onClick={() => handleNavigate(child.path)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg px-4 py-3 text-[15px] transition-all outline-none focus:outline-none focus-visible:ring-0 ring-0",
                  isActive(child.path)
                    ? "bg-sidebar-accent text-primary font-bold"
                    : "text-sidebar-foreground hover:bg-white/5 hover:text-sidebar-accent-foreground",
                )}
              >
                <HugeiconsIcon icon={child.icon} size={18} className="shrink-0" />
                <span>{child.label}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
      );
    }


    const navButton = (
      <button
        type="button"
        onClick={() => (item.path ? handleNavigate(item.path) : toggleGroup(item.label))}
        className={cn(
          "group relative flex w-full items-center rounded-xl px-6 py-3 text-[16px] font-semibold transition-all outline-none focus:outline-none focus-visible:ring-0 ring-0 overflow-hidden",
          (active || groupActive)
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        )}
      >
        {(active || groupActive) && !item.children && (
          <span className="absolute left-0 h-6 w-1 rounded-r-full bg-brand-red" />
        )}
        <HugeiconsIcon
          icon={item.icon}
          size={22}
          className={cn(
            "shrink-0 transition-all duration-300",
            collapsed ? "mr-0" : "mr-4",
            (active || groupActive)
              ? "text-primary"
              : "group-hover:text-sidebar-accent-foreground",
          )}
        />
        <span className={cn(
          "flex-1 text-left truncate transition-all duration-300 whitespace-nowrap overflow-hidden",
          collapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[200px]"
        )}>
          {item.label}
        </span>
        {!item.path && (
          <HugeiconsIcon
            icon={open ? ArrowDown01Icon : ArrowRight01Icon}
            size={16}
            className={cn(
              "absolute right-4 text-sidebar-foreground/50 transition-all duration-300",
              collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
            )}
          />
        )}
      </button>
    );

    return (
      <div key={item.label} className="space-y-1">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{navButton}</TooltipTrigger>
            <TooltipContent side="right" className="font-bold">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          navButton
        )}

        {open && item.children && !collapsed && (
          <div className="ml-6 mt-1 space-y-1 border-l-2 border-sidebar-border/30 pl-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {item.children.map((child) => {
              const childActive = isActive(child.path);
              return (
                <button
                  key={child.path}
                  type="button"
                  onClick={() => handleNavigate(child.path)}
                  className={cn(
                    "group flex w-full items-center gap-4 rounded-lg px-4 py-2.5 text-[15px] transition-all outline-none focus:outline-none focus-visible:ring-0 ring-0",
                    childActive
                      ? "text-primary font-bold bg-primary/5"
                      : "text-sidebar-foreground/80 hover:text-sidebar-accent-foreground hover:bg-white/5",
                  )}
                >
                  <HugeiconsIcon
                    icon={child.icon}
                    size={18}
                    className={cn(
                      "shrink-0",
                      childActive
                        ? "text-primary"
                        : "group-hover:text-sidebar-accent-foreground",
                    )}
                  />
                  <span>{child.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  /* ---- Full sidebar content (expanded) ---- */
  const sidebarContent = (
    <>
      <div
        className={cn(
          "flex items-center px-6 py-8 transition-all duration-300",
          collapsed ? "" : "justify-center",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 shrink-0",
            collapsed ? "w-10 h-10" : "w-48 h-12",
          )}
        >
          <img
            src={trufitLogo}
            alt="Trufit Auto Center"
            className={cn(
              "h-full w-auto max-w-none transition-all duration-300",
              collapsed ? "object-left" : "object-center",
            )}
            style={{ 
              objectPosition: collapsed ? 'left center' : 'center'
            }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide">
        {filteredNavItems.map(renderNavItem)}
      </nav>
    </>
  );

  /* ---- Mobile sidebar ---- */
  const mobileSidebar = (
    <>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
        <img src={trufitLogo} alt="Trufit Auto Center" className="h-8 w-auto" />
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-sidebar-accent-foreground">
            Trufit Auto
          </h2>
          <p className="truncate text-xs text-sidebar-foreground/70 capitalize">
            {user?.position || user?.role} Panel
          </p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {filteredNavItems.map(renderNavItem)}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <HugeiconsIcon icon={Logout01Icon} size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex md:flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-300 ease-in-out z-40",
            collapsed ? "md:w-24" : "md:w-72",
          )}
        >
          {sidebarContent}
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-72 flex-col bg-sidebar shadow-2xl">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-6 text-sidebar-foreground hover:text-sidebar-accent-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={24} />
              </button>
              {mobileSidebar}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-16 items-center gap-4 border-b border-border bg-card/50 backdrop-blur-md px-6 shrink-0">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-lg transition-all"
            >
              <HugeiconsIcon icon={Menu01Icon} size={22} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex text-muted-foreground hover:text-foreground p-2 hover:bg-accent rounded-lg transition-all outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <HugeiconsIcon
                icon={collapsed ? SidebarRight01Icon : SidebarLeft01Icon}
                size={22}
              />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden md:block ml-2">
              <Breadcrumb>
                <BreadcrumbList className="gap-1.5 sm:gap-2">
                  {breadcrumbItems.map((item, idx) => (
                    <React.Fragment key={item.path}>
                      {idx > 0 && <BreadcrumbSeparator className="text-muted-foreground/30" />}
                      <BreadcrumbItem>
                        {idx === breadcrumbItems.length - 1 ? (
                          <BreadcrumbPage className="text-[13px] font-semibold text-foreground/90">
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink 
                            onClick={() => navigate(item.path)}
                            className="text-[13px] text-muted-foreground/60 hover:text-foreground cursor-pointer transition-colors"
                          >
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex-1" />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button"
                  className="relative p-2.5 rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
                >
                  <HugeiconsIcon icon={Notification03Icon} size={26} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#ff0000] ring-2 ring-background shadow-[0_0_8px_rgba(255,0,0,0.6)]" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-popover border-border shadow-2xl p-1 z-50"
              >
                <DropdownMenuLabel className="px-3 py-2 font-bold flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">
                      {unreadCount} New
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mockNotifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 p-3 rounded-md cursor-pointer transition-colors"
                  >
                    <span
                      className={cn(
                        "text-sm",
                        n.unread && "font-semibold text-foreground",
                      )}
                    >
                      {n.text}
                    </span>
                    <span className="text-[11px] text-muted-foreground/70">
                      {n.time}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  type="button"
                  className="flex items-center gap-3 rounded-full px-1.5 py-1.5 hover:bg-accent transition-all group outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 ring-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm font-bold text-lg">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left pr-2">
                    <p className="text-base font-bold text-foreground leading-tight">
                      {user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground/70 font-medium capitalize">
                      {user?.position || user?.role}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-popover border-border shadow-2xl p-1.5 z-50"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/webapp/settings/account")}
                  className="cursor-pointer gap-2 p-2.5"
                >
                  <HugeiconsIcon icon={UserSettings01Icon} size={18} />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="cursor-pointer text-destructive gap-2 p-2.5 focus:bg-destructive/10 focus:text-destructive"
                >
                  <HugeiconsIcon icon={Logout01Icon} size={18} />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-hidden bg-background/50 pt-4">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
