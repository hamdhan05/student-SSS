import { useState, ReactNode } from 'react';
import SettingsModal from '@/components/Modals/SettingsModal';

export interface Tab {
  id: string;
  label: string;
  icon: string | ReactNode;
  category?: string;
  onClick?: () => void;
  subItems?: { id: string; label: string; onClick?: () => void }[];
}

interface LayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    role?: string;
    email?: string;
    photo?: string;
    [key: string]: any;
  };
  title: string;
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onLogout: () => void;
  extraSidebarContent?: ReactNode;
  breadcrumb?: string[];
}

export default function Layout({
  children,
  user,
  title,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  extraSidebarContent,
  breadcrumb,
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const activeTabObj = tabs.find((t) => t.id === activeTab);
  const currentBreadcrumb = breadcrumb || ['Dashboard', activeTabObj?.label || title];

  const getPortalLabel = () => {
    if (!user?.role) return 'School Portal';
    if (user.role.includes('headmaster') || user.role.includes('admin')) return 'Admin Portal';
    if (user.role.includes('teacher') || user.role.includes('faculty')) return 'Faculty Portal';
    return 'Student Portal';
  };

  const getRoleBadge = () => {
    const role = user?.role?.toLowerCase() || '';
    if (role.includes('headmaster') || role.includes('admin')) {
      return <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Super Admin</span>;
    }
    if (role.includes('teacher') || role.includes('faculty')) {
      return <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Faculty</span>;
    }
    return <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Student</span>;
  };

  // Group tabs by category if present
  const groupedTabs = tabs.reduce<Record<string, Tab[]>>((acc, tab) => {
    const cat = tab.category || 'Main';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tab);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 font-sans">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky z-50
          top-0 left-0 h-screen w-64
          bg-white dark:bg-slate-900
          border-r border-slate-200/80 dark:border-slate-800
          flex flex-col flex-shrink-0
          transition-transform duration-250 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">School Management</h1>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{getPortalLabel()}</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {extraSidebarContent && (
          <div className="px-4 pt-3 pb-1">{extraSidebarContent}</div>
        )}

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {Object.entries(groupedTabs).map(([category, catTabs]) => (
            <div key={category}>
              {category !== 'Main' && (
                <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {category}
                </h3>
              )}
              <ul className="space-y-1">
                {catTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const hasSubItems = tab.subItems && tab.subItems.length > 0;
                  const isSubItemActive = hasSubItems && tab.subItems!.some(sub => sub.id === activeTab);
                  const isExpanded = isActive || isSubItemActive;

                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          if (hasSubItems) {
                             // If it has subitems, we might just expand/collapse it or route to the first subitem
                             if (onTabChange && !tab.onClick) {
                               onTabChange(tab.subItems![0].id);
                             }
                          } else {
                             if (onTabChange && !tab.onClick) {
                               onTabChange(tab.id);
                             } else if (tab.onClick) {
                               tab.onClick();
                             }
                             closeSidebar();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium ${
                          isExpanded && !hasSubItems
                            ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-900/40 dark:text-blue-300'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                            <span className={`text-lg ${isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                              {tab.icon}
                            </span>
                            <span className="flex-1 text-left">{tab.label}</span>
                        </div>
                        {hasSubItems && (
                           <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                        )}
                      </button>
                      
                      {hasSubItems && isExpanded && (
                          <ul className="mt-1 ml-9 space-y-1">
                             {tab.subItems!.map((sub) => {
                                const isSubActive = activeTab === sub.id;
                                return (
                                   <li key={sub.id}>
                                     <button
                                       onClick={() => {
                                          if (onTabChange && !sub.onClick) {
                                            onTabChange(sub.id);
                                          } else if (sub.onClick) {
                                            sub.onClick();
                                          }
                                          closeSidebar();
                                       }}
                                       className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors text-sm ${
                                          isSubActive
                                            ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                                       }`}
                                     >
                                        {sub.label}
                                     </button>
                                   </li>
                                );
                             })}
                          </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar User Footer */}
        {user && (
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3 p-2 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm shadow-sm">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                </div>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Body Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              {currentBreadcrumb.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && (
                    <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  <span className={idx === currentBreadcrumb.length - 1 ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'hover:text-slate-600'}>
                    {item}
                  </span>
                </div>
              ))}
            </nav>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden lg:flex items-center relative max-w-xs w-full">
            <svg className="w-4 h-4 text-slate-400 absolute left-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-16 py-1.5 text-xs bg-slate-100/70 border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100"
            />
            <span className="absolute right-2 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
              Ctrl + K
            </span>
          </div>

          {/* Right: Notifications, Settings & User Profile Dropdown */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings Gear Icon */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Profile Avatar & Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role || 'User'}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email || 'user@school.com'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
