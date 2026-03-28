import { ChevronLeft, Home, Grid, CheckCircle } from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed, listenedCount, total }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-title">
          {!collapsed && <h1>1001 Albums</h1>}
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={collapsed ? "rotated" : ""} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <SidebarItem icon={<Home />} label="Random" collapsed={collapsed} />
        <SidebarItem icon={<Grid />} label="Browse" collapsed={collapsed} />
        <SidebarItem
          icon={<CheckCircle />}
          label="Listened"
          collapsed={collapsed}
        />
      </nav>

      <div className="sidebar-progress">
        <div className="sidebar-progress-label">
          {!collapsed && <span>Progress</span>}
        </div>
        <div className="sidebar-progress-bar">
          <div
            className="sidebar-progress-fill"
            style={{ height: `${(listenedCount / total) * 100}%` }}
          />
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, collapsed }) {
  return (
    <div className="sidebar-item">
      {icon}
      {!collapsed && <span>{label}</span>}
    </div>
  );
}
