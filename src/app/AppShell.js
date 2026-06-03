"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const sellerLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Browse Products", href: "/dashboard/products", icon: Package },
  { name: "My Quotations", href: "/dashboard/quotes", icon: FileText },
  { name: "My Orders", href: "/dashboard/orders", icon: ShoppingCart },
];

const adminLinks = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Manage Products", href: "/admin/products", icon: Package },
  { name: "Quotations", href: "/admin/quotes", icon: FileText },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

export default function AppShell({ section, children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="shell-loading">
        <div className="shell-spinner"></div>
      </div>
    );
  }

  if (!session) {
    return <>{children}</>;
  }

  const navItems = section === "admin" ? adminLinks : sellerLinks;

  const renderLink = (item, isMobile = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const className = isMobile
      ? `shell-mobile-link ${isActive ? "shell-mobile-link-active" : ""}`
      : `shell-nav-link ${isActive ? "shell-nav-active" : ""}`;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={className}
      >
        <Icon size={18} />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="shell-container">
      <aside className="shell-sidebar">
        <div className="shell-logo-area">
          <span className="shell-logo-text">AasaMedChem</span>
          <span className="shell-role-badge">{session.user.role}</span>
        </div>

        <nav className="shell-nav-menu">{navItems.map((item) => renderLink(item))}</nav>

        <div className="shell-sidebar-footer">
          <div className="shell-user-email">{session.user.email}</div>
          <button onClick={() => signOut()} className="shell-logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <header className="shell-mobile-header">
        <span className="shell-logo-text">AasaMedChem</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="shell-menu-toggle"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="shell-mobile-overlay">
          <nav className="shell-mobile-nav">
            {navItems.map((item) => renderLink(item, true))}
            <div className="shell-mobile-footer">
              <div className="shell-mobile-email">{session.user.email}</div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
                className="shell-mobile-logout"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <div className="shell-main-wrapper">
        <div className="shell-main-content">{children}</div>
      </div>
    </div>
  );
}
