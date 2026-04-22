"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Store,
  ArrowLeftRight,
  Settings,
  LogOut,
  Users,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import type { ActiveRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
  { label: "Merchants", href: "/admin/merchants", icon: <Store size={20} /> },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: <ArrowLeftRight size={20} />,
  },
];

const staffNav: NavItem[] = [
  { label: "Home", href: "/staff", icon: <LayoutDashboard size={20} /> },
  { label: "Stats", href: "/staff/stats", icon: <BarChart3 size={20} /> },
  {
    label: "Transaction",
    href: "/staff/transaction",
    icon: <ArrowLeftRight size={20} />,
  },
  {
    label: "Settings",
    href: "/staff/settings",
    icon: <Settings size={20} />,
  },
];

const merchantNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/merchant",
    icon: <LayoutDashboard size={20} />,
  },
  { label: "Staff", href: "/merchant/staff", icon: <Users size={20} /> },
  {
    label: "Settings",
    href: "/merchant/settings",
    icon: <Settings size={20} />,
  },
];

const navByRole: Record<string, NavItem[]> = {
  admin: adminNav,
  staff: staffNav,
  merchant: merchantNav,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole, switchRole, logout } = useAuthStore();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const nav = navByRole[activeRole] || [];

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleRoleSwitch = (role: ActiveRole) => {
    switchRole(role);
    setRoleMenuOpen(false);
    const dest =
      role === "admin"
        ? "/admin"
        : role === "staff"
          ? "/staff"
          : role === "merchant"
            ? "/merchant"
            : "/";
    router.push(dest);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-primary">EasyPoints</h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            {activeRole} Portal
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-4 space-y-2">
          {/* Role switcher */}
          {user && user.roles.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-gray-50 hover:bg-gray-100"
              >
                <span className="capitalize">{activeRole}</span>
                <ChevronDown size={16} />
              </button>
              {roleMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                  {user.roles
                    .filter((r) => r !== "member")
                    .map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 capitalize",
                          role === activeRole && "bg-primary/10 text-primary",
                        )}
                      >
                        {role}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
