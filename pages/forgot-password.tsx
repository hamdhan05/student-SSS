import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            setIsSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[url('/school-bg.jpg')] bg-cover bg-center flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>

            <div className="relative w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl border border-white border-opacity-20 shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-gray-300">Enter your email to receive reset instructions</p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            variant="glass"
                            className="bg-white bg-opacity-15 text-white placeholder-gray-300 border-white border-opacity-30 rounded-full"
                        />

                        <Button type="submit" fullWidth>
                            Send Reset Link
                        </Button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
                            <p className="text-green-300">
                                If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
                            </p>
                        </div>
                        <Button onClick={() => window.location.href = '/login'} fullWidth>
                            Return to Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
