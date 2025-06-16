import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate(); // <-- aqui

  const handleLogin = async () => {
    try {
      const form = new FormData();
      form.append('email', email);
      form.append('senha', senha);

      const res = await axios.post('http://localhost:8000/login', form);

      localStorage.setItem('sessionId', res.data.sessionId);
      localStorage.setItem('userId', res.data.userId);

      setMensagem(`✅ ${res.data.message}`);
      onLogin(); // atualiza estado global
      navigate('/chat'); // <-- redireciona para /chat
    } catch (err: any) {
      setMensagem(`❌ ${err.response?.data?.detail || 'Erro ao fazer login.'}`);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>{mensagem}</p>
    </div>
  );
};

export default Login;
