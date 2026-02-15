import React, { useState } from 'react';
import useCreatePoll from '../hooks/useCreatePoll';
import Layout from '../../../components/layout/Layout';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import styles from './CreatePoll.module.css';

const CreatePoll = () => {
  const {
    question,
    pollOptions,
    error: submitError,
    loading,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    removeOption,
    submitPoll,
    MAX_QUESTION_LENGTH,
    MAX_OPTION_LENGTH,
    MAX_OPTIONS
  } = useCreatePoll();

  const [touched, setTouched] = useState({ question: false, options: [] });

  const handleBlur = (field, index = null) => {
    if (field === 'question') {
      setTouched(prev => ({ ...prev, question: true }));
    } else if (field === 'option' && index !== null) {
      setTouched(prev => {
        const newOptions = [...(prev.options || [])];
        newOptions[index] = true;
        return { ...prev, options: newOptions };
      });
    }
  };

  const getQuestionError = () => {
    if (touched.question && !question.trim()) return 'Question is required';
    if (question.length >= MAX_QUESTION_LENGTH) return 'Question is too long';
    return null;
  };

  const getOptionError = (index) => {
      // Only show error if touched or if submitting
      if (touched.options?.[index] && !pollOptions[index]?.trim()) {
          return 'Option text is required';
      }
      return null;
  }

  return (
    <Layout>
      <Card>
        <h2 className={styles.title}>Create a New Poll</h2>
        
        {submitError && (
          <div className="error-message" role="alert">
            {submitError}
          </div>
        )}
        
        <form onSubmit={submitPoll} className={styles.form}>
          <Input 
            label="Question"
            id="question"
            placeholder="What would you like to ask?"
            value={question}
            onChange={handleQuestionChange}
            onBlur={() => handleBlur('question')}
            disabled={loading}
            maxLength={MAX_QUESTION_LENGTH}
            showCount
            error={getQuestionError()}
          />

          <div>
             <div className={styles.sectionTitle}>
                <span>Options ({pollOptions.length}/{MAX_OPTIONS})</span>
             </div>
             
             <div className={styles.optionsList}>
                {pollOptions.map((option, index) => (
                  <div key={index} className={styles.optionRow}>
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      onBlur={() => handleBlur('option', index)}
                      disabled={loading}
                      maxLength={MAX_OPTION_LENGTH}
                      showCount
                      containerClassName="flex-1"
                      error={getOptionError(index)}
                    />
                    
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={styles.removeBtn}
                        onClick={() => removeOption(index)}
                        disabled={loading}
                        aria-label="Remove option"
                        title="Remove option"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={addOption}
              disabled={loading || pollOptions.length >= MAX_OPTIONS}
              fullWidth
            >
              + Add Option
            </Button>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            size="lg"
            isLoading={loading}
            disabled={!question.trim() || pollOptions.some(opt => !opt.trim())}
          >
            Create Poll
          </Button>
        </form>
      </Card>
    </Layout>
  );
};

export default CreatePoll;
