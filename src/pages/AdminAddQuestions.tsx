import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button, TextField, MenuItem } from '@mui/material';

export default function AdminAddQuestions() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']); // A–E
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasteImageUpload = async (html: string): Promise<string> => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const imgs = doc.querySelectorAll('img');

    for (const img of imgs) {
      if (img.src.startsWith('data:image/')) {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const fileName = `question-images/${Date.now()}-${Math.random()}.png`;

        const { data, error } = await supabase.storage
          .from('questions')
          .upload(fileName, blob, {
            contentType: 'image/png',
          });

        if (error) {
          console.error('Upload error:', error.message);
          continue;
        }

        const publicUrl = supabase.storage
          .from('questions')
          .getPublicUrl(fileName).data.publicUrl;

        img.src = publicUrl;
      }
    }

    return doc.body.innerHTML;
  };

  const handleSubmit = async () => {
    if (!question || options.slice(0, 4).some(opt => !opt) || correctAnswer === '') {
      alert('Please fill question, at least 4 options, and select the correct answer.');
      return;
    }

    setLoading(true);

    try {
      const cleanedQuestion = await handlePasteImageUpload(question);
      const cleanedOptions = await Promise.all(
        options.map(opt => handlePasteImageUpload(opt))
      );

      const finalOptions = cleanedOptions.filter(opt => opt.trim() !== '');

      const { error } = await supabase.from('mcq_questions').insert([
        {
          question: cleanedQuestion,
          options: finalOptions,
          correct_answer: parseInt(correctAnswer),
          is_selected: false,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Insert error:', error.message);
        alert('❌ Failed to add question to database.');
      } else {
        alert('✅ Question added successfully!');
        setQuestion('');
        setOptions(['', '', '', '', '']);
        setCorrectAnswer('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('❌ Unexpected error occurred.');
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h2>Add New Question</h2>

      <label>Question:</label>
      <ReactQuill value={question} onChange={setQuestion} />

      {['A', 'B', 'C', 'D', 'E'].map((label, index) => (
        <div key={index}>
          <label>Option {label}:</label>
          <ReactQuill
            value={options[index]}
            onChange={(val) => {
              const newOptions = [...options];
              newOptions[index] = val;
              setOptions(newOptions);
            }}
          />
        </div>
      ))}

      <TextField
        select
        label="Correct Option"
        value={correctAnswer}
        onChange={(e) => setCorrectAnswer(e.target.value)}
        fullWidth
        margin="normal"
      >
        {options.map((opt, idx) =>
          opt.trim() !== '' ? (
            <MenuItem key={idx} value={idx}>
              Option {String.fromCharCode(65 + idx)}
            </MenuItem>
          ) : null
        )}
      </TextField>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Add Question'}
      </Button>
    </div>
  );
}
