"use client";

import { Box, Button, Stack, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Rating, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { auth, firestore } from '@/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import * as React from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your personal support assistant. How may I be of assistance, today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);
  const [lastInteraction, setLastInteraction] = useState({ userMessage: "", botResponse: "" });
  const messagesEndRef = useRef(null);

  const botResponses = [
    "New York City is made up of five boroughs: Manhattan, Brooklyn, Queens, The Bronx, and Staten Island.",
    "Manhattan is known for landmarks like Central Park, Times Square, and the Empire State Building.",
    "Brooklyn is famous for its cultural diversity, the Brooklyn Bridge, and Coney Island.",
    "Queens is the most ethnically diverse urban area in the world, and home to Flushing Meadows and Citi Field.",
    "The Bronx is where you’ll find Yankee Stadium and the Bronx Zoo, one of the largest metropolitan zoos in the world.",
    "Staten Island is known for its suburban feel and the Staten Island Ferry, which offers views of the Statue of Liberty."
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);

    const newMessages = [...messages, { role: "user", content: message }];

    setMessage("");
    setMessages(newMessages);

    const botResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

    setMessages((messages) => [
      ...messages,
      { role: "assistant", content: botResponse },
    ]);

    setLastInteraction({ userMessage: message, botResponse });

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, {
        chatHistory: arrayUnion({
          userMessage: message,
          botResponse,
        }),
      });
    }

    setIsLoading(false);
    setReviewDialogOpen(true);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReviewClose = () => {
    setReviewDialogOpen(false);
  };

  const handleReviewSubmit = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, {
        chatHistory: arrayUnion({
          userMessage: lastInteraction.userMessage,
          botResponse: lastInteraction.botResponse,
          review,
          rating,
        }),
      });
    }

    setReviewDialogOpen(false);
    setReview("");
    setRating(0);
  };

  const [outputLang, setOutputLang] = React.useState('en');
  const outputLangChange = (event) => {
    setOutputLang(event.target.value);
  };

  const handleTranslate = async () => {
    const latestAssistantMessage = messages.filter(message => message.role === "assistant").pop();

    if (latestAssistantMessage) {
      const translatedText = await translateText(latestAssistantMessage.content, outputLang);
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: translatedText },
      ]);

      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, {
          chatHistory: arrayUnion({ role: "assistant", content: translatedText }),
        });
      }

    } else {
      console.log("No assistant messages found.");
    }
  };

  return (
      <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
          bgcolor="#e8f5e9"
      >
        <Stack
            direction={"column"}
            width="500px"
            height="700px"
            bgcolor="white"
            borderRadius="10px"
            boxShadow="0 8px 16px rgba(0, 0, 0, 0.1)"
            p={3}
            spacing={3}
        >
          <Stack
              direction={"column"}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
              borderRadius="6px"
              border="1px solid #ccc"
              p={2}
          >
            {messages.map((message, index) => (
                <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent={
                      message.role === "assistant" ? "flex-start" : "flex-end"
                    }
                >
                  {message.role === "assistant" && (
                      <FaRobot style={styles.icon} />
                  )}
                  <Box
                      bgcolor={
                        message.role === "assistant"
                            ? "#4caf50"
                            : "#388e3c"
                      }
                      color="white"
                      borderRadius={16}
                      p={2}
                      ml={message.role === "assistant" ? 2 : 0}
                      mr={message.role === "user" ? 2 : 0}
                      maxWidth="80%"
                  >
                    {message.content}
                  </Box>
                  {message.role === "user" && (
                      <FaUser style={styles.icon} />
                  )}
                </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
            />
            <Button
                variant="contained"
                onClick={sendMessage}
                disabled={isLoading}
                style={styles.button}
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="outputLang-label">Output Language</InputLabel>
              <Select
                  labelId="outputLang-label"
                  id="outputLang"
                  value={outputLang}
                  label="Output Language"
                  onChange={outputLangChange}
              >
                <MenuItem value={"en"}>English</MenuItem>
                <MenuItem value={"es"}>Spanish</MenuItem>
                <MenuItem value={"zh"}>Chinese</MenuItem>
                <MenuItem value={"ru"}>Russian</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleTranslate} style={styles.button}>Translate</Button>
          </Stack>
        </Stack>

        <Dialog open={reviewDialogOpen} onClose={handleReviewClose}>
          <DialogTitle>Review Your Experience</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please let us know how your experience was with our support assistant.
            </DialogContentText>
            <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
            />
            <TextField
                autoFocus
                margin="dense"
                label="Your Review"
                fullWidth
                multiline
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleReviewClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
}

const styles = {
  icon: {
    fontSize: '24px',
    color: '#4caf50',
  },
  button: {
    backgroundColor: '#4caf50',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    "&:hover": {
      backgroundColor: '#388e3c',
    },
  },
};