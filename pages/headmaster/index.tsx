import { useRequireAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/UI/Layout';
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

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

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
    <Layout
      title="Headmaster Portal"
      user={{
        ...user,
        role: user.role || undefined,
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabType)}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
