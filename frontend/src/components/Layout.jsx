import { Outlet, useLocation } from "react-router-dom";
import TabBar from "./TabBar";
import InitErrorBanner from "./InitErrorBanner";

export default function Layout() {
  const { pathname } = useLocation();
  const isFeed = pathname === "/";

  return (
    <div className="min-h-[100dvh] bg-graphite-900 text-ink-0 font-sans">
      <InitErrorBanner />
      <main className={isFeed ? "" : "pb-tabbar"}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
