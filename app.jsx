import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import { Form, Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    // Add user's message to chat
    const userMessage = { type: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);

    try {
      const headers = { 'Content-Type': 'application/json' };
      let data = JSON.stringify({ "input_text": prompt });
      console.log("Sending:", data);
      const res = await axios.post('https://hackathon-practice2025.onrender.com/api/generate/', data, { headers });

      // Add AI's response to chat
      const aiMessage = { type: 'ai', text: res.data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <>
      <div style={{ marginBottom: '100px' }}>
        <Card style={{ width: '100%' }}>
          <Card.Body>
            <Card.Title>Hackathon Project - AI Chat</Card.Title>
            <Card.Text>
             
                {messages.map((msg, index) => (
                  <div key={index} className={bubble ${msg.type}}>
                    {msg.text}
                  </div>
                ))}
                {loading && <div className="bubble ai">Thinking...</div>}
                {error && <div className="bubble ai error">{error}</div>}
              
            </Card.Text>
          </Card.Body>
        </Card>
      </div>

      {/* Chat Input Fixed at Bottom */}
      <div className="chat-input-wrapper">
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="exampleForm.ControlInput1" className="d-flex">
            <Form.Control
              type="text"
              placeholder="Start Chatting for Brilliant Ideas"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
            <Button variant="primary" type="submit" disabled={loading} className="ms-2">
              Send
            </Button>
          </Form.Group>
        </Form>
      </div>
    </>
  );
}

export default App;