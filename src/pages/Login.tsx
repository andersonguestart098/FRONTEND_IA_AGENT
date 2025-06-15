import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/login', { email, senha });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('session_id', res.data.session_id);
      navigate('/chat');
    } catch (error) {
      alert('Login inválido.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} /><br />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default Login;
