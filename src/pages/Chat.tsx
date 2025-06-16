import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import DeleteIcon from '@mui/icons-material/Delete';
import burger1 from '../public/menu/burger.png';
import burger2 from '../public/menu/burger2.png';
import batata from '../public/menu/batata.png';
import bebida from '../public/menu/bebida.png';
import milkshake from '../public/menu/milkshake.png';

const socket = io('http://localhost:8000');

const imagensCardapio: { [key: string]: string } = {
  'hamburguer': burger1,
  'hamburguer simples': burger1,
  'hamburguer 1 carne': burger1,
  'hamburguer duplo': burger2,
  'hamburguer 2 carnes': burger2,
  'batata': batata,
  'batata frita': batata,
  'batata pequena': batata,
  'batata media': batata,
  'batata grande': batata,
  'coca': bebida,
  'coca cola': bebida,
  'coca zero': bebida,
  'guarana': bebida,
  'refrigerante': bebida,
  'bebida': bebida,
  'milkshake': milkshake,
  'milkshake de chocolate': milkshake,
  'milkshake chocolate': milkshake
};

const normalizarTexto = (texto: string) =>
  texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const Chat = () => {
  const [resposta, setResposta] = useState('');
  const [audioPath, setAudioPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pedido, setPedido] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sessionId = localStorage.getItem('sessionId') || '';
  const userId = localStorage.getItem('userId') || '';

  const buscarPedido = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/pedido?session_id=${sessionId}`);
      setPedido(res.data.pedido || []);
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
    }
  };

useEffect(() => {
  if (!sessionId) return;

  const evento = `pedido_update_${sessionId}`;
  const handleUpdate = (novoPedido: any) => {
    if (Array.isArray(novoPedido)) setPedido(novoPedido);
  };

  buscarPedido();
  socket.on(evento, handleUpdate);

  return () => {
    socket.off(evento, handleUpdate);
  };
}, [sessionId]);

  const handleMicrofone = async () => {
    if (!sessionId || !userId) {
      alert("Sessão expirada ou inválida. Faça login novamente.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        setListening(false);
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('file', blob, 'voz.mp3');

        setLoading(true);
        try {
          const transcricaoRes = await axios.post('http://localhost:8000/escutar', formData);
          const pergunta = transcricaoRes.data.transcricao;

          if (!pergunta?.trim()) {
            setResposta('Não entendi. Pode repetir?');
            return;
          }

          const iaRes = await axios.post('http://localhost:8000/chat-com-voz', {
            question: pergunta,
            session_id: sessionId,
            user_id: userId
          });

          setResposta(iaRes.data.resposta_texto || 'Resposta vazia.');
          setAudioPath(iaRes.data.resposta_audio || '');
          setSpeaking(true);
          buscarPedido();
        } catch (e: any) {
          const msg = e?.response?.data?.detail || 'Erro ao processar sua pergunta.';
          setResposta(msg);
        } finally {
          setLoading(false);
        }
      };

      setListening(true);
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 4000);
    } catch (err) {
      alert('Não foi possível acessar o microfone.');
    }
  };

  // Agrupar pedidos por tipo reconhecido
  const itensAgrupados: { [nome: string]: number } = {};
  pedido.forEach((item) => {
    const normalizado = normalizarTexto(item);
    const nomeReconhecido = Object.keys(imagensCardapio).find(key =>
      normalizado.includes(normalizarTexto(key))
    );
    if (nomeReconhecido) {
      itensAgrupados[nomeReconhecido] = (itensAgrupados[nomeReconhecido] || 0) + 1;
    }
  });

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box textAlign="center" mb={4}>
        <img
          src="/atendente_fake.png"
          alt="Atendente"
          style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
        />
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Itens do Pedido
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
            {Object.entries(itensAgrupados).map(([nome, quantidade], idx) => (
              <Box
                key={idx}
                width="45%"
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Card sx={{ width: '100%' }}>
                  <CardContent>
                    <img
                      src={imagensCardapio[nome]}
                      alt={nome}
                      style={{ width: '100%', height: 100, objectFit: 'cover' }}
                    />
                    <Typography variant="body2" align="center" mt={1}>
                      {nome} x{quantidade}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" alignItems="center" gap={2}>
        <IconButton onClick={handleMicrofone} disabled={listening || loading}>
          <MicIcon color={listening ? 'error' : 'action'} fontSize="large" />
        </IconButton>
        {(listening || speaking) && (
          <EqualizerIcon color={listening ? 'error' : 'primary'} fontSize="large" />
        )}
        {loading && <CircularProgress size={24} />}
      </Box>

      {resposta && (
        <Box mt={4}>
          <Typography variant="subtitle1">IA respondeu:</Typography>
          <Typography sx={{ whiteSpace: 'pre-line', mb: 2 }}>{resposta}</Typography>

          {audioPath && (
            <audio
              ref={audioRef}
              src={`http://localhost:8000${audioPath}`}
              controls
              autoPlay
              onPlay={() => setSpeaking(true)}
              onEnded={() => setSpeaking(false)}
            />
          )}
        </Box>
      )}
    </Container>
  );
};

export default Chat;
