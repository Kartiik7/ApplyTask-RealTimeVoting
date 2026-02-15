import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pollApi from '../services/pollApi';

const MAX_QUESTION_LENGTH = 500;
const MAX_OPTION_LENGTH = 200;
const MAX_OPTIONS = 10;

const useCreatePoll = () => {
  const [question, setQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_QUESTION_LENGTH) {
      setQuestion(value);
    }
  };

  const handleOptionChange = (index, value) => {
    if (value.length > MAX_OPTION_LENGTH) return;
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    if (pollOptions.length >= MAX_OPTIONS) return;
    setPollOptions([...pollOptions, '']);
  };

  const removeOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  const submitPoll = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (question.length > MAX_QUESTION_LENGTH) {
        setError(`Question is too long (max ${MAX_QUESTION_LENGTH} characters)`);
        return;
    }

    const sanitizedOptions = pollOptions.map(optionText => optionText.trim()).filter(optionText => optionText);
    const distinctOptions = [...new Set(sanitizedOptions)];

    if (distinctOptions.length < 2) {
      setError('Please provide at least 2 unique options');
      return;
    }

    try {
      setLoading(true);
      const apiResponse = await pollApi.create({
        question,
        options: sanitizedOptions
      });
      navigate(`/poll/${apiResponse.data.poll._id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create poll. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    question,
    pollOptions,
    error,
    loading,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    removeOption,
    submitPoll,
    MAX_QUESTION_LENGTH,
    MAX_OPTION_LENGTH,
    MAX_OPTIONS
  };
};

export default useCreatePoll;
