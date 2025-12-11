import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface DashboardStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  attendanceRate: number;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  classes: string[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: 0,
  });
  const [recentTeachers, setRecentTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - replace with real API calls later
      await new Promise(resolve => setTimeout(resolve, 500));

      setStats({
        totalTeachers: 15,
        totalStudents: 450,
        totalClasses: 12,
        attendanceRate: 92.5,
      });

      // Mock recent teachers
      const mockTeachers = [
        { id: '1', name: 'John Smith', email: 'john@school.com', subject: 'Mathematics', classes: ['10A', '10B'] },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@school.com', subject: 'English', classes: ['9A'] },
        { id: '3', name: 'Michael Brown', email: 'michael@school.com', subject: 'Science', classes: ['11A', '11B'] },
      ];

      setRecentTeachers(mockTeachers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Headmaster Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon="👨‍🏫"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="🎓"
          color="bg-green-500"
        />
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon="🏫"
          color="bg-purple-500"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate.toFixed(1)}%`}
          icon="📊"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Teachers Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Teachers</h2>
          <button
            onClick={() => router.push('/headmaster/teachers')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {recentTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{teacher.name}</p>
                <p className="text-sm text-gray-600">{teacher.subject}</p>
              </div>
              <button
                onClick={() => router.push(`/teachers/${teacher.id}`)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-full text-2xl`}>{icon}</div>
      </div>
    </div>
  );
}
