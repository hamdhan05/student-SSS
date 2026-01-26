import { useRequireAuth } from '@/lib/hooks/useAuth';
import Layout from '@/components/UI/Layout';
import { useState, Component, ErrorInfo, ReactNode } from 'react';
import Students from '@/components/Headmaster/Students';
import Teachers from '@/components/Headmaster/Teachers';
import Notices from '@/components/Headmaster/Notices';
import Calendar from '@/components/Headmaster/Calendar';
import Fees from '@/components/Headmaster/Fees';
import Complaints from '@/components/Headmaster/Complaints';

type TabType = 'students' | 'teachers' | 'notices' | 'calendar' | 'fees' | 'complaints';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Dashboard:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default function HeadmasterPortal() {
  const { user, loading } = useRequireAuth(['headmaster']);
  const [activeTab, setActiveTab] = useState<TabType>('students');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'students' as const, label: 'Students', icon: '👨‍🎓' },
    { id: 'teachers' as const, label: 'Teachers', icon: '👨‍🏫' },
    { id: 'notices' as const, label: 'Notice Board', icon: '📢' },
    { id: 'calendar' as const, label: 'Calendar', icon: '📅' },
    { id: 'fees' as const, label: 'Fees', icon: '💰' },
    { id: 'complaints' as const, label: 'Complaints', icon: '📝' },
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
        role: user.role || 'headmaster', // Ensure role fallback
      }}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabType)}
      onLogout={handleLogout}
    >
      <ErrorBoundary
        fallback={
          <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Something went wrong</h3>
            <p className="text-red-600 dark:text-red-300">We couldn't load this section. Please try refreshing.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        }
      >
        {renderContent()}
      </ErrorBoundary>
    </Layout>
  );
}
