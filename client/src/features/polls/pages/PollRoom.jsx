import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import usePollRoom from '../hooks/usePollRoom';
import Layout from '../../../components/layout/Layout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import ProgressBar from '../../../components/ui/ProgressBar';
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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
                        onClick={() => submitVote(index)}
                        disabled={!isConnected}
                        fullWidth
                    >
                        {option.text}
                    </Button>
                );
            }

            return (
              <div key={index} className={styles.resultItem}>
                <div className={styles.resultMeta}>
                    <span>{option.text}</span>
                    <span>{percentage}%</span>
                </div>
                <ProgressBar value={percentage} variant="primary" />
                {/* Optional: Show vote count explicitly if needed, but keeping it minimal for now based on 'Notion/dribbble' style */}
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
