import React from 'react';
import useCreatePoll from '../hooks/useCreatePoll';

const CreatePoll = () => {
  const {
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
  } = useCreatePoll();

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create a New Poll</h2>
      
      {error && <div className="error-message" role="alert">{error}</div>}
      
      <form onSubmit={submitPoll}>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="question">Question</label>
            <span style={{ fontSize: '0.8rem', color: question.length > MAX_QUESTION_LENGTH ? 'red' : '#666' }}>
                {question.length}/{MAX_QUESTION_LENGTH}
            </span>
          </div>
          <input
            type="text"
            id="question"
            placeholder="What would you like to ask?"
            value={question}
            onChange={handleQuestionChange}
            disabled={loading}
            className={error && !question.trim() ? 'input-error' : ''}
          />
        </div>

        <div className="form-group">
          <label>Options ({pollOptions.length}/{MAX_OPTIONS})</label>
          {pollOptions.map((option, index) => (
            <div key={index} style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex' }}>
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                      aria-label="Remove option"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#888', marginTop: '2px' }}>
                    {option.length}/{MAX_OPTION_LENGTH}
                </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={addOption}
            style={{ width: '100%' }}
            disabled={loading || pollOptions.length >= MAX_OPTIONS}
          >
            + Add Option
          </button>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
};

export default CreatePoll;
