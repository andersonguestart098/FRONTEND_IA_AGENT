import React, { useState } from 'react';
import axios from 'axios';

export const Registro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleRegistro = async () => {
    try {
      const form = new FormData();
      form.append('nome', nome);
      form.append('email', email);
      form.append('senha', senha);

      const res = await axios.post('http://localhost:8000/registro', form);
      setMensagem(`✅ ${res.data.message} | ID: ${res.data.userId}`);
    } catch (err: any) {
      setMensagem(`❌ ${err.response?.data?.detail || 'Erro ao registrar.'}`);
    }
  };

  return (
    <div>
      <h2>Registro</h2>
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
      <button onClick={handleRegistro}>Registrar</button>
      <p>{mensagem}</p>
    </div>
  );
};
