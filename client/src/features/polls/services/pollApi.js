import api from '../../../shared/api/axios';

const pollApi = {
  create: async (pollData) => {
    return await api.post('/polls', pollData);
  },
  getById: async (pollId) => {
    return await api.get(`/polls/${pollId}`);
  },
  submitVote: async (pollId, voteData) => {
    return await api.post(`/polls/${pollId}/vote`, voteData);
  }
};

export default pollApi;
