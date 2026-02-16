import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePollRoom from '../hooks/usePollRoom';
import Layout from '../../../components/layout/Layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import styles from './PollRoom.module.css';

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

  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);

  const handleVote = async (optionIndex) => {
    setSelectedOptionIndex(optionIndex);
    await submitVote(optionIndex);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Color palette for poll options - warm colors to complement yellow theme
  const optionColors = [
    { fill: 'rgba(244, 196, 48, 0.30)', border: 'rgb(244, 196, 48)' },      // Warm Yellow (primary)
    { fill: 'rgba(251, 146, 60, 0.30)', border: 'rgb(251, 146, 60)' },      // Orange
    { fill: 'rgba(239, 68, 68, 0.30)', border: 'rgb(239, 68, 68)' },        // Red
    { fill: 'rgba(236, 72, 153, 0.30)', border: 'rgb(236, 72, 153)' },      // Pink
    { fill: 'rgba(168, 85, 247, 0.30)', border: 'rgb(168, 85, 247)' },      // Purple
    { fill: 'rgba(59, 130, 246, 0.30)', border: 'rgb(59, 130, 246)' },      // Blue
    { fill: 'rgba(20, 184, 166, 0.30)', border: 'rgb(20, 184, 166)' },      // Teal
    { fill: 'rgba(34, 197, 94, 0.30)', border: 'rgb(34, 197, 94)' },        // Green
  ];

  const getOptionColor = (index) => {
    return optionColors[index % optionColors.length];
  };

  if (loading) {
      return (
          <Layout>
              <div className={styles.loading}>
                  <Button variant="ghost" isLoading>Loading poll details...</Button>
              </div>
          </Layout>
      );
  }

  if (error) {
      return (
          <Layout>
            <Card className={styles.error}>
                <p>{error}</p>
                <Button variant="secondary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>
                    Retry Connection
                </Button>
            </Card>
          </Layout>
      );
  }

  if (!currentPoll) return null;

  const totalVotes = currentPoll.totalVotes || 0;

  return (
    <Layout>
      <Card>
        <div className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot}></span>
          {isConnected ? 'Live Connected' : 'Connecting...'}
        </div>

        <h2 className={styles.question}>{currentPoll.question}</h2>

        <div className={styles.optionsList}>
          {currentPoll.options.map((option, index) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
            
            if (!hasVotedLocally) {
                return (
                    <Button
                        key={index}
                        variant="ghost" 
                        className={styles.optionButton}
                        onClick={() => handleVote(index)}
                        disabled={!isConnected}
                        fullWidth
                    >
                        {option.text}
                    </Button>
                );
            }

            const isSelected = selectedOptionIndex === index;
            const colors = getOptionColor(index);
            
            return (
              <div 
                key={index} 
                className={`${styles.resultItem} ${isSelected ? styles.selected : ''}`}
                style={{
                  borderColor: isSelected ? colors.border : 'var(--color-border)'
                }}
              >
                <div 
                  className={styles.resultFill}
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: colors.fill
                  }}
                />
                <div className={styles.resultContent}>
                  <span className={styles.optionText}>{option.text}</span>
                  <span 
                    className={styles.percentage}
                    style={{ color: isSelected ? colors.border : 'var(--color-text-secondary)' }}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.totalVotes}>
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} recorded
        </div>

        {hasVotedLocally && (
           <div className={styles.shareSection}>
              <p className={styles.shareTitle}>Invite others to vote</p>
              <div className={styles.shareRow}>
                  <input 
                      readOnly 
                      className={styles.shareInput} 
                      value={window.location.href} 
                      onClick={(e) => e.target.select()}
                  />
                  <Button 
                    size="sm" 
                    variant={copySuccess ? "success" : "secondary"} // Ensure your Button component handles 'success' variant or map it manually
                    onClick={copyLink}
                    className={styles.copyButton}
                  >
                      {copySuccess ? 'Copied!' : 'Copy'}
                  </Button>
              </div>
           </div>
        )}
      </Card>
    </Layout>
  );
};

export default PollRoom;
