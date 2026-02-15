import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import pollApi from '../services/pollApi';

const usePollRoom = (pollId) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVotedLocally, setHasVotedLocally] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const getVoteToken = () => {
    let token = localStorage.getItem('vote_token');
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('vote_token', token);
    }
    return token;
  };

  useEffect(() => {
    if (!pollId) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });
    
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attempt) => {
        console.log(`Reconnection attempt #${attempt}`);
    });
    
    newSocket.emit('joinPoll', pollId);

    newSocket.on('updateResults', (updatedPoll) => {
        setCurrentPoll(updatedPoll);
    });

    const fetchPoll = async () => {
      try {
        setLoading(true);
        setError('');
        const apiResponse = await pollApi.getById(pollId);
        
        setCurrentPoll(apiResponse.data.poll);
        if (localStorage.getItem(`voted_${pollId}`)) {
            setHasVotedLocally(true);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) {
            setError('Poll not found. It may have been deleted.');
        } else {
            setError('Failed to load poll. Please check your connection.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();

    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };
  }, [pollId]);

  const submitVote = async (optionIndex) => {
    if (hasVotedLocally) return;

    try {
      const token = getVoteToken();
      
      await pollApi.submitVote(pollId, { 
        optionIndex,
        voteToken: token 
      });
      
      setHasVotedLocally(true);
      localStorage.setItem(`voted_${pollId}`, 'true');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit vote';
      // Alert could be handled by UI showing error state, but keeping alert for now as per original
      alert(msg);
      
      if (err.response?.status === 403) {
          setHasVotedLocally(true);
          localStorage.setItem(`voted_${pollId}`, 'true');
      }
    }
  };

  return {
    currentPoll,
    loading,
    error,
    hasVotedLocally,
    isConnected,
    submitVote
  };
};

export default usePollRoom;
