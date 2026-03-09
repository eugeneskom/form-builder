import React, { useState, useRef, useEffect } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { FieldType, FieldOptions } from '~/types';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  onAddField: (field: { type: FieldType; options: FieldOptions }) => void;
}

export function AiChat({ onAddField }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hi! I'm your AI assistant. Describe the field you want to add and I'll create it for you. For example: \"Add a required email field\" or \"Add a phone number field with min length 7\".",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('API error');

      const data = (await res.json()) as {
        field?: { type: FieldType; options: FieldOptions };
        message: string;
      };

      setMessages((prev) => [...prev, { role: 'assistant', text: data.message }]);

      if (data.field) {
        onAddField(data.field);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" p={2} pb={1}>
        <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700} flexGrow={1}>
          AI ASSISTANT
        </Typography>
      </Stack>
      <Divider />

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {messages.map((msg, i) => (
            <Stack
              key={i}
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{ flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
            >
              <Avatar sx={{ width: 28, height: 28, bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.main' }}>
                {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  maxWidth: '85%',
                  bgcolor: msg.role === 'user' ? 'rgba(255,101,132,0.15)' : 'rgba(108,99,255,0.15)',
                  border: '1px solid',
                  borderColor: msg.role === 'user' ? 'rgba(255,101,132,0.3)' : 'rgba(108,99,255,0.3)',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.text}
                </Typography>
              </Paper>
            </Stack>
          ))}
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <CircularProgress size={16} />
            </Stack>
          )}
          <div ref={bottomRef} />
        </Stack>
      </Box>

      <Divider />
      <Box p={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="e.g. Add a required phone field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={send} disabled={!input.trim() || loading} color="primary">
                  <SendIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
}
