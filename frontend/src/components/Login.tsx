import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { login } from '../services/api';
import { AuthState } from '../types';
import { Register } from './Register';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  setAuth: (auth: AuthState) => void;
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setAuth, addNotification }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, username: user } = await login(username, password);
      localStorage.setItem('token', token);
      localStorage.setItem('username', user);
      setAuth({ isAuthenticated: true, user });
      addNotification('success', '登录成功');
      navigate('/');
    } catch (err: any) {
      addNotification('error', err.response?.data?.error || '登录失败');
    }
  };

  if (showRegister) {
    return <Register onToggleForm={() => setShowRegister(false)} addNotification={addNotification} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#01D8B6]/5 backdrop-blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-[#01D8B6] to-[#00f5d4] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#01D8B6]/20">
              <span className="text-white text-3xl font-bold">N</span>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900">公司导航门户</h1>
          <p className="mt-2 text-gray-600">登录以访问您的工作空间</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/80"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                用户名或邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01D8B6]/50 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01D8B6]/50 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full bg-gradient-to-r from-[#01D8B6] to-[#00f5d4] text-white py-3 rounded-xl font-medium shadow-lg shadow-[#01D8B6]/25 hover:shadow-[#01D8B6]/40 transition-all duration-200"
            >
              登录
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowRegister(true)}
              className="text-[#01D8B6] hover:text-[#00f5d4] transition-colors text-sm font-medium"
            >
              还没有账号？立即注册
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};