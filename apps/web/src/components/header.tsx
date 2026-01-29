import { Link } from "@tanstack/react-router";

import UserMenu from "./user-menu";
import { MegaMenu } from "./categories/MegaMenu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div className="flex items-center gap-4">
          <MegaMenu />
          <nav className="flex gap-4 text-lg">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} to={to}>
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
