import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Glassmorphism Container Box */}
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Login</h2>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-500 text-white px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white bg-opacity-15 backdrop-blur-sm text-white placeholder-gray-300 border-white border-opacity-30 rounded-full"
            />

            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white bg-opacity-15 backdrop-blur-sm text-white placeholder-gray-300 border-white border-opacity-30 rounded-full"
            />
            <div className="flex justify-end">
              <a href="/forgot-password" className="text-sm text-gray-300 hover:text-white transition-colors">
                Forgot Password?
              </a>
            </div>
          </div>

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Signing in...' : 'Login'}
          </Button>

          <div className="mt-6 text-center text-sm text-gray-300">
            <p className="font-medium mb-2">Test Credentials:</p>
            <p className="text-xs">headmaster@school.com / teacher@school.com / student@school.com</p>
            <p className="text-xs opacity-75">Password: any</p>
          </div>
        </form>
      </div>
    </div>
  );
}
