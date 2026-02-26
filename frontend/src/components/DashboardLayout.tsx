import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  ClipboardList,
  FileText,
  Users,
  CalendarDays,
  Truck,
  Box,
  TrendingUp,
  ListOrdered,
  Activity,
  UserCog,
  Menu,
  X,
  Bell,
  PanelLeftClose,
  PanelLeft,
  UserKey,
} from "lucide-react";
import { cn } from "@/lib/utils";
import trufitLogo from "@/assets/trufit_logo.png";
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

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  roles?: string[];
  children?: {
    label: string;
    path: string;
    icon: React.ElementType;
    roles?: string[];
  }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/webapp/dashboard" },
  {
    label: "Sales",
    icon: ShoppingCart,
    children: [
      {
        label: "Job Orders",
        path: "/webapp/sales/job-orders",
        icon: ClipboardList,
      },
      { label: "Quotations", path: "/webapp/sales/quotations", icon: FileText },
      { label: "Customers", path: "/webapp/sales/customers", icon: Users },
      {
        label: "Appointments",
        path: "/webapp/sales/appointments",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Purchasing",
    icon: Truck,
    children: [
      {
        label: "Purchase Orders",
        path: "/webapp/purchasing/orders",
        icon: ClipboardList,
      },
      { label: "Suppliers", path: "/webapp/purchasing/suppliers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    icon: Box,
    children: [
      { label: "Products", path: "/webapp/inventory/products", icon: Package },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      {
        label: "Sales Summary",
        path: "/webapp/reports/sales-summary",
        icon: TrendingUp,
      },
      {
        label: "Sales Order List",
        path: "/webapp/reports/sales-orders",
        icon: ListOrdered,
      },
      {
        label: "Reorder & Forecast",
        path: "/webapp/reports/reorder-forecast",
        icon: BarChart3,
      },
      { label: "Audit Log", path: "/webapp/reports/audit-log", icon: Activity },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "Account", path: "/webapp/settings/account", icon: UserCog },
      { label: "Team", path: "/webapp/settings/team", icon: Users },
      {
        label: "Roles and Permissions",
        path: "/webapp/settings/rolesandpermissions",
        icon: UserKey,
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
  const [openGroups, setOpenGroups] = useState<string[]>(["Sales"]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const userRole = user?.role?.toLowerCase();

  const filteredNavItems = navItems.map((item) => {
    if (!item.children) return item;

    // Filter children by roles
    const filteredChildren = item.children.filter((child) => {
      if (!child.roles) return true; // No restriction
      return child.roles.includes(userRole); // Only show if role allowed
    });

    return { ...item, children: filteredChildren };
  });

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

  /* ---- Expanded sidebar nav item ---- */
  const renderExpandedItem = (item: NavItem) => {
    if (item.path) {
      return (
        <button
          key={item.label}
          onClick={() => handleNavigate(item.path!)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive(item.path)
              ? "bg-primary text-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span>{item.label}</span>
        </button>
      );
    }

    const open = openGroups.includes(item.label);
    const groupActive = isGroupActive(item);

    return (
      <div key={item.label}>
        <button
          onClick={() => toggleGroup(item.label)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            groupActive
              ? "text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        {open && item.children && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3">
            {item.children.map((child) => (
              <button
                key={child.path}
                onClick={() => handleNavigate(child.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive(child.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <child.icon className="h-3.5 w-3.5 shrink-0" />
                <span>{child.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ---- Collapsed sidebar nav item (icon only + hover popover) ---- */
  const renderCollapsedItem = (item: NavItem) => {
    if (item.path) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleNavigate(item.path!)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors mx-auto",
                isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-popover text-popover-foreground border"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    const groupActive = isGroupActive(item);

    return (
      <Popover key={item.label}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-md transition-colors mx-auto",
              groupActive
                ? "text-primary bg-sidebar-accent"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          className="w-48 p-1 bg-popover border z-50"
        >
          <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {item.label}
          </p>
          {item.children?.map((child) => (
            <button
              key={child.path}
              onClick={() => handleNavigate(child.path)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive(child.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <child.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{child.label}</span>
            </button>
          ))}
        </PopoverContent>
      </Popover>
    );
  };

  /* ---- Full sidebar content (expanded) ---- */
  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <img
          src={trufitLogo}
          alt="TruFit Auto Center"
          className="h-10 w-auto"
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filteredNavItems.map((item) =>
          collapsed ? renderCollapsedItem(item) : renderExpandedItem(item),
        )}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors mx-auto"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-popover text-popover-foreground border"
            >
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </>
  );

  /* ---- Mobile sidebar (always expanded) ---- */
  const mobileSidebar = (
    <>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <img src={trufitLogo} alt="TruFit Auto Center" className="h-8 w-auto" />
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-sidebar-accent-foreground">
            TruFit Auto
          </h2>
          <p className="truncate text-xs text-sidebar-foreground capitalize">
            {user?.role} Panel
          </p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filteredNavItems.map(renderExpandedItem)}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex md:flex-col bg-sidebar border-r border-sidebar-border shrink-0 transition-all duration-200",
            collapsed ? "md:w-16" : "md:w-60",
          )}
        >
          {sidebarContent}
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-background/80"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-64 flex-col bg-sidebar">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              {mobileSidebar}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex h-14 items-center gap-2 border-b border-border px-4 shrink-0">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex text-muted-foreground hover:text-foreground"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1" />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 bg-popover border z-50"
              >
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mockNotifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                  >
                    <span className={cn("text-sm", n.unread && "font-medium")}>
                      {n.text}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {n.time}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-foreground">
                      {user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-popover border z-50"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/settings/account")}
                  className="cursor-pointer"
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
