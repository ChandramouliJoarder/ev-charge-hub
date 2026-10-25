import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, User as UserIcon, Shield, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      if (data?.user?.role === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'owner') {
      setEmail('owner@evhub.com');
      setPassword('password123');
    } else {
      setEmail('user@evhub.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#14161A]">
      <div className="w-full max-w-md hardware-panel-bordered p-8 rounded-sm">
        {/* Hardware Status Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#2E333D] mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#3FA66A]" />
            <h2 className="text-xl font-heading font-bold uppercase tracking-wider text-[#F2F3F5]">
              Station Access
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-[#1B1D22] border border-[#404754] text-[#C6CBD1]">
            SECURE PORT
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/40 border border-red-500/50 rounded-sm flex items-start space-x-2.5 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8C96A2] mb-1.5">
              Operator / Driver Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5B6B7A] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@evhub.com"
                className="w-full pl-9 pr-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-[#F2F3F5] text-sm focus:outline-none focus:border-[#3FA66A] rounded-sm transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8C96A2] mb-1.5">
              Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5B6B7A] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-[#F2F3F5] text-sm focus:outline-none focus:border-[#3FA66A] rounded-sm transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 bg-[#3FA66A] hover:bg-[#4ECB82] text-[#14161A] font-heading font-bold text-sm tracking-wider uppercase rounded-sm transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Authenticate & Enter</span>
            )}
          </button>
        </form>

        {/* Demo Fast Logins */}
        <div className="mt-6 pt-5 border-t border-[#2E333D]">
          <span className="block text-center text-[11px] font-mono text-[#8C96A2] mb-3">
            PORTFOLIO DEMO QUICK-FILL
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('user')}
              className="py-1.5 px-2 bg-[#1B1D22] border border-[#404754] text-xs font-mono text-[#C6CBD1] hover:border-[#3FA66A] hover:text-[#3FA66A] transition-colors rounded-sm"
            >
              Demo EV Driver
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('owner')}
              className="py-1.5 px-2 bg-[#1B1D22] border border-[#404754] text-xs font-mono text-[#E8A33D] hover:border-[#E8A33D] transition-colors rounded-sm"
            >
              Demo Station Owner
            </button>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-[#8C96A2]">
          Need an account?{' '}
          <Link to="/register" className="text-[#3FA66A] hover:underline font-medium">
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
}
