"use client";

import { Box, Button, Stack, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Rating, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { translateText } from './translate';
import { auth, firestore } from '@/firebase'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import * as React from 'react';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
          "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);


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
    if (!message.trim()) return; // Don't send empty messages
    setIsLoading(true);

    const newMessages = [...messages, { role: "user", content: message }];

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...newMessages]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }

      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, {
          chatHistory: arrayUnion({ role: "user", content: message }),
        });
      }

    } catch (error) {
      console.error("Error fetching API:", error);
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }

    setIsLoading(false);
    setReviewDialogOpen(true); // Open the review popup after session ends
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
    console.log("Review submitted:", review);
    console.log("Rating submitted:", rating);

    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      await updateDoc(userDocRef, {
        chatHistory: arrayUnion({ role: "assistant", content: "Review submitted", review, rating }),
      });
    }

    setReviewDialogOpen(false);
    setReview(""); // Clear the review input
    setRating(0);  // Reset the rating
  };

  const [outputLang, setOutputLang] = React.useState('en');
  const outputLangChange = (event) => {
    setOutputLang(event.target.value);
  };

  const handleTranslate = async () => {
    const latestAssistantMessage = messages.filter(message => message.role === "assistant").pop();

    if (latestAssistantMessage) {
      // Get translation based on input text and output language and set the output text field
      const translatedText = await translateText(latestAssistantMessage.content, outputLang);
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: translatedText },
      ]);

      // Update chat history with the translated message
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
          width="100vw"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
      >
        <Stack
            direction={"column"}
            width="500px"
            height="700px"
            border="1px solid black"
            p={2}
            spacing={3}
        >
          <Stack
              direction={"column"}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              maxHeight="100%"
          >
            {messages.map((message, index) => (
                <Box
                    key={index}
                    display="flex"
                    justifyContent={
                      message.role === "assistant" ? "flex-start" : "flex-end"
                    }
                >
                  <Box
                      bgcolor={
                        message.role === "assistant"
                            ? "primary.main"
                            : "secondary.main"
                      }
                      color="white"
                      borderRadius={16}
                      p={3}
                  >
                    {message.content}
                  </Box>
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
            <Button variant="contained" onClick={handleTranslate}>Translate</Button>
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