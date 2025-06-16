import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Chat from './pages/Chat';

function App() {
  const [isAutenticado, setIsAutenticado] = useState<boolean>(() => {
    const sessionId = localStorage.getItem('sessionId');
    const userId = localStorage.getItem('userId');
    return !!sessionId && !!userId;
  });

  useEffect(() => {
    const checarAutenticacao = () => {
      const sessionId = localStorage.getItem('sessionId');
      const userId = localStorage.getItem('userId');
      setIsAutenticado(!!sessionId && !!userId);
    };

    window.addEventListener('storage', checarAutenticacao);
    return () => window.removeEventListener('storage', checarAutenticacao);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAutenticado(true)} />}
        />
        <Route
          path="/chat"
          element={
            isAutenticado ? <Chat /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/"
          element={
            isAutenticado ? (
              <Navigate to="/chat" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
