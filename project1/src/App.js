import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Paper, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatLog, setChatLog] = useState(() => {
    // Retrieve chat history from local storage
    const savedChatLog = localStorage.getItem('chatLog');
    return savedChatLog ? JSON.parse(savedChatLog) : [];
  });

  useEffect(() => {
    // Save chat history to local storage whenever it changes
    localStorage.setItem('chatLog', JSON.stringify(chatLog));
  }, [chatLog]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add user's message to the chat log
    setChatLog([...chatLog, { sender: 'User', message: userInput }]);

    try {
      // Make a request to the OpenAI API
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: userInput,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `https://api.openai.com/v1/audio/transcriptions`, // Replace with your OpenAI API key
          },
        }
      );

      const botMessage = response.data.choices[0].text.trim();
      // Add AI's response to the chat log
      setChatLog([...chatLog, { sender: 'User', message: userInput }, { sender: 'AI', message: botMessage }]);
    } catch (error) {
      console.error('Error fetching data from OpenAI API:', error);
    }

    // Clear the input field
    setUserInput('');
  };

  // Define the handleSpeechToText function
  const handleSpeechToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      setUserInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          AI Chatbot
        </Typography>
        <List style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          {chatLog.map((entry, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${entry.sender}: ${entry.message}`}
                style={{ textAlign: entry.sender === 'User' ? 'right' : 'left' }}
              />
            </ListItem>
          ))}
        </List>
        <Box display="flex" gap="10px">
          <TextField
            variant="outlined"
            fullWidth
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <Button variant="contained" color="primary" onClick={handleSend}>
            Send
          </Button>
          <Button variant="contained" color="secondary" onClick={handleSpeechToText}>
            🎤
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
