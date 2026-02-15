import React from 'react';
import { useParams } from 'react-router-dom';
import usePollRoom from '../hooks/usePollRoom';
import './PollRoom.css';

const PollRoom = () => {
  const { id } = useParams();
  const { 
    currentPoll, 
    loading, 
    error, 
    hasVotedLocally, 
    isConnected, 
    submitVote 
  } = usePollRoom(id);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) return <div className="loading">Loading poll details...</div>;
  if (error) return (
    <div className="card poll-room-error">
        <div className="error-message poll-room-error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
    </div>
  );
  if (!currentPoll) return null;

  const totalVotes = currentPoll.totalVotes || 0;

  return (
    <div className="card">
      <div className={`poll-room-header ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className={`poll-room-status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
        {isConnected ? 'Live Connected' : 'Connecting...'}
      </div>

      <div className="poll-question">{currentPoll.question}</div>

      <div className="options-list">
        {currentPoll.options.map((option, index) => {
          const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
          
          return (
            <div key={index} className="result-bar-container">
              {!hasVotedLocally ? (
                <button
                  className="option-button"
                  onClick={() => submitVote(index)}
                  disabled={!isConnected} 
                >
                  {option.text}
                </button>
              ) : (
                <>
                  <div className="result-header">
                    <span>{option.text}</span>
                    <span>{percentage}% ({option.votes} votes)</span>
                  </div>
                  <div className="result-track">
                    <div
                      className="result-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="poll-room-total-votes">
        Total Votes: {totalVotes}
      </div>

      {hasVotedLocally && (
         <div className="share-link-container">
            <p>Share this poll:</p>
            <input 
                readOnly 
                className="share-input poll-room-share-input" 
                value={window.location.href} 
                onClick={(e) => e.target.select()}
            />
            <button onClick={copyLink} className="btn-secondary poll-room-copy-btn">
                Copy Link
            </button>
         </div>
      )}
      
    </div>
  );
};

export default PollRoom;
