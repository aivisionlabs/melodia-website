"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({
  className = "",
}: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: "home",
      label: "Home",
      isActive: pathname === "/",
    },
    {
      href: "/best-songs",
      icon: "stars",
      label: "Best Songs",
      isActive: pathname === "/best-songs",
    },
    {
      href: "/my-songs",
      icon: "music_note",
      label: "My Songs",
      isActive: pathname === "/my-songs",
    },
    {
      href: "/profile",
      icon: "person",
      label: "Profile",
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav className={`bottom-nav ${className}`}>
      <div className="flex justify-around items-center h-20 text-melodia-teal">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${item.isActive ? "active" : ""}`}
          >
            <span
              className={`material-symbols-outlined ${
                item.isActive ? "filled" : ""
              }`}
              style={{ fontSize: "24px" }}
            >
              {item.icon}
            </span>
            <span className="nav-text">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
