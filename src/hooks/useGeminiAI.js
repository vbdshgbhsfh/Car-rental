import { useState } from 'react';
import { fetchGeminiConsultant } from '../services/geminiService';

export const useGeminiAI = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const askAI = async (budget, preference) => {
    setLoading(true);
    setResponse('');
    const result = await fetchGeminiConsultant(budget, preference);
    setResponse(result);
    setLoading(false);
  };

  return { askAI, loading, response };
};