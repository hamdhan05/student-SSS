import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';
// import { teachers, students } from '../mockData'; // Deprecated for auth queries

export type UserRole = 'headmaster' | 'teacher' | 'student' | null;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// Mock authentication hook with role-based access
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for user session
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    let role: UserRole = null;
    let name = '';
    let id = '';

    // Check for Headmaster (Hardcoded for now as per original design)
    if (email === 'headmaster@school.com') {
      role = 'headmaster';
      name = 'Headmaster Admin';
      id = 'headmaster_1';
    }
    else {
      // 1. Check Students Table
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, name, email')
        .eq('email', email)
        .maybeSingle();

      if (student) {
        role = 'student';
        name = student.name;
        id = student.id;
      }
      else {
        // 2. Check Teachers Table
        const { data: teacher, error: teacherError } = await supabase
          .from('teachers')
          .select('id, name, email')
          .eq('email', email)
          .maybeSingle();

        if (teacher) {
          role = 'teacher';
          name = teacher.name;
          id = teacher.id;
        }
      }
    }

    if (!role) {
      throw new Error('Invalid credentials. User not found.');
    }

    const authUser: AuthUser = { id, email, name, role };
    localStorage.setItem('authUser', JSON.stringify(authUser));
    setUser(authUser);

    // Redirect based on role
    if (role === 'headmaster') {
      router.push('/headmaster');
    } else if (role === 'teacher') {
      router.push('/teacher');
    } else if (role === 'student') {
      router.push('/student');
    }

    return authUser;
  };

  const signOut = () => {
    localStorage.removeItem('authUser');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, signIn, signOut };
}

// Hook to protect routes based on role
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to user's home page if not authorized
      if (user.role === 'headmaster') router.push('/headmaster');
      else if (user.role === 'teacher') router.push('/teacher');
      else if (user.role === 'student') router.push('/student');
      else router.push('/login');
    }
  }, [user, loading, allowedRoles, router]);

  return { user, loading };
}
