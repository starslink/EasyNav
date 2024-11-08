import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { register } from '../services/api';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

interface RegisterProps {
  onToggleForm: () => void;
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onToggleForm, addNotification }) => {
  const [formData, setFormData] = useState({
    username: '',
    emailPrefix: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (password.length < minLength) {
      return '密码长度不能少于8位';
    }
    if (!hasUpperCase) {
      return '密码必须包含大写字母';
    }
    if (!hasLowerCase) {
      return '密码必须包含小写字母';
    }
    if (!hasNumbers) {
      return '密码必须包含数字';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!formData.emailPrefix) {
      setError('请输入邮箱前缀');
      return;
    }

    const email = `${formData.emailPrefix}@company.com`;

    try {
      await register(formData.username, email, formData.password);
      setSuccess('注册成功！请检查邮箱进行验证。');
      setTimeout(onToggleForm, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败，请稍后重试');
    }
  };

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
          <p className="mt-2 text-gray-600">创建您的账号</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/80"
        >
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-500 p-4 rounded-xl mb-6 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01D8B6]/50 transition-all duration-200"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                邮箱
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineMail className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={formData.emailPrefix}
                    onChange={(e) => setFormData({ ...formData, emailPrefix: e.target.value })}
                    className="flex-1 pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-[#01D8B6]/50 transition-all duration-200"
                    required
                    placeholder="请输入邮箱前缀"
                  />
                  <span className="inline-flex items-center px-4 bg-gray-100 text-gray-500 text-sm rounded-r-xl border-l border-gray-200">
                    @company.com
                  </span>
                </div>
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
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#01D8B6]/50 transition-all duration-200"
                  required
                  placeholder="至少8位，包含大小写字母和数字"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                确认密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
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
              注册
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onToggleForm}
              className="text-[#01D8B6] hover:text-[#00f5d4] transition-colors text-sm font-medium"
            >
              已有账号？返回登录
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
