"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Presentation,
  Palette,
  Receipt,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import clsx from "clsx";

const navItems = [
  { href: "/admindashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admindashboard/bookings", label: "Bookings", icon: Calendar },
  {
    href: "/admindashboard/space-manager",
    label: "Space Inventory Manager",
    icon: Presentation,
  },
  {
    href: "/admindashboard/messenger-hub",
    label: "Messenger Command Hub",
    icon: MessageSquare,
  },
  {
    href: "/admindashboard/tenant-monitoring",
    label: "Tenant Monitoring",
    icon: Users,
  },
  {
    href: "/admindashboard/ad-scheduler",
    label: "Ad Scheduler",
    icon: Presentation,
  },
  {
    href: "/admindashboard/user-management",
    label: "User Management & Blacklist",
    icon: ShieldAlert,
  },
  {
    href: "/admindashboard/public-view-cms",
    label: "Public-View CMS",
    icon: Palette,
  },
];

export const AdminSidebar = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "w-72",
        "bg-white",
        "dark:bg-zinc-950",
        "border-r",
        "border-slate-200",
        "dark:border-white/10",
        "flex",
        "flex-col",
        "h-[calc(100vh-5rem)]",
        "fixed",
        "top-20",
        "left-0",
        "z-40",
        "transition-colors",
      )}
    >
      <div
        className={clsx(
          "flex-1",
          "overflow-y-auto",
          "py-8",
          "px-5",
          "space-y-1.5",
        )}
      >
        <div className="px-5 mb-8 pb-8 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-lg">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "A"
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-charcoal dark:text-white leading-tight">
                {user?.name || "Admin"}
              </span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1">
                Portal Management
              </span>
            </div>
          </div>
        </div>

        <div className={clsx("px-5", "mb-4")}>
          <p
            className={clsx(
              "text-[10px]",
              "font-black",
              "text-slate-400",
              "dark:text-zinc-600",
              "uppercase",
              "tracking-[0.3em]",
            )}
          >
            Command Center
          </p>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all font-bold text-sm relative group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 dark:text-slate-400 dark:hover:text-white",
              )}
            >
              <div
                className={clsx(
                  "p-2 rounded-xl transition-all",
                  isActive
                    ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30"
                    : "bg-slate-50 dark:bg-zinc-900 text-slate-400 group-hover:text-charcoal dark:group-hover:text-white group-hover:scale-110 group-hover:rotate-6",
                )}
              >
                <Icon size={18} />
              </div>
              <span className="tracking-tight uppercase text-[10px] sm:text-xs">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
