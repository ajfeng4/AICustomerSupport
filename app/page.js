"use client";

import * as React from 'react'
import { useState } from "react";
import { FormControl, InputLabel, MenuItem, Select, Grid, TextField, Button } from '@mui/material'

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const [outputLang, setOutputLang] = React.useState('en')
  const outputLangChange = (event) => {
    setOutputLang(event.target.value);
  }

  // Replace 'YOUR_PROJECT_ID' with your project ID, referencing .env file
  const projectId = 'YOUR_PROJECT_ID';

  // Imports the Google Cloud client library
  const {Translate} = require('@google-cloud/translate').v2;

  // Creates a client
  const translate = new Translate();

  async function translateText() {
    // Translates the text into the target language.
    let [translations] = await translate.translate(inputText, outputLang);
    translations = Array.isArray(translations) ? translations : [translations];
    console.log('Translations:');
    translations.forEach((translation, i) => {
      console.log(`${text[i]} => (${outputLang}) ${translation}`);
    });
    // Set the translated text to outputText
    setOutputText(translations.join('\n'));
  }

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ padding: 2 }}>
      <Grid item xs={12}>
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
      </Grid>
      <Grid item xs={6}><TextField id="input-field" label="Enter Text To Translate" variant="outlined" fullWidth multiline rows={15} value={inputText} onChange={(e) => setInputText(e.target.value)}/></Grid>
      <Grid item xs={6}><TextField id="output-field" label="Translated Text Output" variant="outlined" fullWidth multiline rows={15} value={outputText}/></Grid>
      <Grid item xs={12} container justifyContent="center"><Button variant="contained" onClick={translateText}>Translate</Button></Grid>
    </Grid>
  );
}