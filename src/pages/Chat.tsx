import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import EqualizerIcon from '@mui/icons-material/Equalizer';

const Chat = () => {
  const [question, setQuestion] = useState('');
  const [resposta, setResposta] = useState('');
  const [audioPath, setAudioPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleEnviar = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/chat-atendente', {
        question
      });
      setResposta(res.data.answer);
      setAudioPath(res.data.audio_path);
      setSpeaking(true);
    } catch (err) {
      setResposta('❌ Erro ao enviar pergunta.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrofone = async () => {
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
          const res = await axios.post('http://localhost:8000/escutar', formData);
          setQuestion(res.data.transcricao);
        } catch (e) {
          console.error('Erro ao transcrever:', e);
          alert('Erro ao transcrever o áudio. Tente novamente.');
        } finally {
          setLoading(false);
        }
      };

      setListening(true);
      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 4000); // escuta por 4 segundos

    } catch (err) {
      console.error('❌ Permissão negada ou dispositivo indisponível:', err);
      alert('Não foi possível acessar o microfone. Verifique as permissões e o dispositivo.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        🤖 Chat com a IA Cemear
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <TextField
          label="Digite sua pergunta"
          multiline
          fullWidth
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <IconButton onClick={handleMicrofone} disabled={listening || loading}>
          <MicIcon color={listening ? 'error' : 'action'} />
        </IconButton>
      </Box>

      <Box mt={2} display="flex" gap={2} alignItems="center">
        <Button variant="contained" onClick={handleEnviar} disabled={loading || !question.trim()}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'ENVIAR'}
        </Button>
        {(listening || speaking) && (
          <EqualizerIcon color={listening ? 'error' : 'primary'} fontSize="large" />
        )}
      </Box>

      {resposta && (
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            Resposta da IA:
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-line', mb: 2 }}>{resposta}</Typography>

          {audioPath && (
            <Box>
              <audio
                ref={audioRef}
                src={`http://localhost:8000/${audioPath}`}
                controls
                autoPlay
                onPlay={() => setSpeaking(true)}
                onEnded={() => setSpeaking(false)}
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Chat;
