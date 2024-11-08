import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { MainLayout } from './components/MainLayout';
import { AdminLayout } from './components/AdminLayout';
import { NotificationContainer } from './components/NotificationContainer';
import { useNotification } from './hooks/useNotification';
import { AuthState } from './types';

function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    return {
      isAuthenticated: !!token,
      user: username
    };
  });

  const { notifications, addNotification, removeNotification } = useNotification();

  return (
    <BrowserRouter>
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
      {!auth.isAuthenticated ? (
        <Login setAuth={setAuth} addNotification={addNotification} />
      ) : (
        <Routes>
          <Route 
            path="/" 
            element={
              <MainLayout 
                auth={auth} 
                setAuth={setAuth} 
                addNotification={addNotification}
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              auth.user === 'admin' 
                ? <AdminLayout addNotification={addNotification} /> 
                : <Navigate to="/" replace />
            } 
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;