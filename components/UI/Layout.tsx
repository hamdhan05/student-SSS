import { useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import SettingsModal from '@/components/Modals/SettingsModal';

interface Tab {
  id: string;
  label: string;
  icon: string | ReactNode;
  onClick?: () => void;
}

interface LayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    role?: string;
    [key: string]: any;
  };
  title: string;
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onLogout: () => void;
  extraSidebarContent?: ReactNode;
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
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden bg-black bg-opacity-90 p-4 flex items-center justify-between border-b border-gray-700 sticky top-0 z-40">
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <button
          onClick={toggleSidebar}
          className="text-white p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay (Mobile only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-40 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky z-50
          top-0 left-0 h-screen w-64
          bg-white dark:bg-black dark:bg-opacity-95 md:bg-gray-100 md:dark:bg-opacity-60 backdrop-blur-xl
          border-r border-gray-200 dark:border-gray-700
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center md:block">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white hidden md:block">{title}</h1>
            {user && (
              <div className="flex items-center gap-3 mb-6 md:mb-0">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-400 dark:border-gray-600 flex items-center justify-center">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="md:hidden text-xl font-bold text-black dark:text-white mb-1">{title} Menu</div>
                  <p className="text-black dark:text-gray-300 text-sm font-medium">{user.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {extraSidebarContent && (
          <div className="px-6 pb-2 pt-2">
            {extraSidebarContent}
          </div>
        )}

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    if (onTabChange && !tab.onClick) {
                      onTabChange(tab.id);
                    } else if (tab.onClick) {
                      tab.onClick();
                    }
                    closeSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${activeTab === tab.id
                    ? 'bg-black text-white font-bold dark:bg-white dark:bg-opacity-20 dark:text-white shadow-inner'
                    : 'text-black dark:text-gray-400 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-10'
                    }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <SettingsModal isOpen={isSidebarOpen && false} onClose={() => { }} /> {/* Hack to ensure import usage if needed, but real logic below */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          {user && <button // Only show settings if user is logged in
            onClick={() => setIsSettingsOpen(true)}
            className="w-full mb-3 px-4 py-2 bg-gray-200 dark:bg-gray-800 dark:bg-opacity-50 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-opacity-70 transition-colors flex items-center justify-center gap-2"
          >
            <span>Settings</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>}

          <button
            onClick={onLogout}
            className="w-full px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-50 dark:text-white rounded hover:bg-red-200 dark:hover:bg-opacity-70 transition-colors flex items-center justify-center gap-2"
          >
            <span>Log Out</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white bg-opacity-60 dark:bg-black dark:bg-opacity-50 min-h-[calc(100vh-64px)] md:min-h-screen w-full transition-colors duration-300">
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
