import { useRequireAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';
import Students from '@/components/Headmaster/Students';
import Teachers from '@/components/Headmaster/Teachers';
import Notices from '@/components/Headmaster/Notices';
import Calendar from '@/components/Headmaster/Calendar';
import Fees from '@/components/Headmaster/Fees';
import Complaints from '@/components/Headmaster/Complaints';

type TabType = 'students' | 'teachers' | 'notices' | 'calendar' | 'fees' | 'complaints';

export default function HeadmasterPortal() {
  const { user, loading } = useRequireAuth(['headmaster']);
  const [activeTab, setActiveTab] = useState<TabType>('students');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'students' as TabType, label: 'Students', icon: '👨‍🎓' },
    { id: 'teachers' as TabType, label: 'Teachers', icon: '👨‍🏫' },
    { id: 'notices' as TabType, label: 'Notice Board', icon: '📢' },
    { id: 'calendar' as TabType, label: 'Calendar', icon: '📅' },
    { id: 'fees' as TabType, label: 'Fees', icon: '💰' },
    { id: 'complaints' as TabType, label: 'Complaints', icon: '📝' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'notices':
        return <Notices />;
      case 'calendar':
        return <Calendar />;
      case 'fees':
        return <Fees />;
      case 'complaints':
        return <Complaints />;
      default:
        return <Students />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black bg-opacity-80 border-r border-gray-700 flex flex-col rounded-l-lg">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Headmaster Portal</h1>
          <p className="text-gray-400 text-sm mt-1">{user.name}</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-black font-semibold'
                      : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              localStorage.removeItem('authUser');
              window.location.href = '/login';
            }}
            className="w-full px-4 py-2 bg-red-900 bg-opacity-50 text-white rounded hover:bg-opacity-70 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto rounded-r-lg">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
