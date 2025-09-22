import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Finance API
export const financeAPI = {
  // Income
  addIncome: (data) => API.post('/finance/income', data),
  getIncome: (params) => API.get('/finance/income', { params }),
  updateIncome: (id, data) => API.put(`/finance/income/${id}`, data),
  deleteIncome: (id) => API.delete(`/finance/income/${id}`),
  
  // Expenses
  addExpense: (data) => API.post('/finance/expenses', data),
  getExpenses: (params) => API.get('/finance/expenses', { params }),
  updateExpense: (id, data) => API.put(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => API.delete(`/finance/expenses/${id}`),
  
  // Investments
  addInvestment: (data) => API.post('/finance/investments', data),
  getInvestments: (params) => API.get('/finance/investments', { params }),
  updateInvestment: (id, data) => API.put(`/finance/investments/${id}`, data),
  deleteInvestment: (id) => API.delete(`/finance/investments/${id}`),
  
  // Loans
  addLoan: (data) => API.post('/finance/loans', data),
  getLoans: (params) => API.get('/finance/loans', { params }),
  updateLoan: (id, data) => API.put(`/finance/loans/${id}`, data),
  deleteLoan: (id) => API.delete(`/finance/loans/${id}`),
  
  // Insurance
  addInsurance: (data) => API.post('/finance/insurance', data),
  getInsurance: (params) => API.get('/finance/insurance', { params }),
  updateInsurance: (id, data) => API.put(`/finance/insurance/${id}`, data),
  deleteInsurance: (id) => API.delete(`/finance/insurance/${id}`),
  
  // Budgets
  createBudget: (data) => API.post('/finance/budgets', data),
  getBudgets: (params) => API.get('/finance/budgets', { params }),
  updateBudget: (id, data) => API.put(`/finance/budgets/${id}`, data),
  deleteBudget: (id) => API.delete(`/finance/budgets/${id}`),
  
  // Goals
  createGoal: (data) => API.post('/finance/goals', data),
  getGoals: (params) => API.get('/finance/goals', { params }),
  updateGoal: (id, data) => API.put(`/finance/goals/${id}`, data),
  deleteGoal: (id) => API.delete(`/finance/goals/${id}`),
};

// Chat API
export const chatAPI = {
  sendMessage: (message) => API.post('/chat/message', { message }),
  getSuggestions: () => API.get('/chat/suggestions'),
};

// Analytics API
export const analyticsAPI = {
  getFinancialSummary: (params) => API.get('/analytics/summary', { params }),
  getExpenseAnalytics: (params) => API.get('/analytics/expenses', { params }),
  getInvestmentAnalytics: () => API.get('/analytics/investments'),
  getSpendingTrends: (params) => API.get('/analytics/spending-trends', { params }),
  getGoalProgress: () => API.get('/analytics/goal-progress'),
  getIncomeAnalytics: (params) => API.get('/analytics/income', { params }),
  getMonthlyComparison: (params) => API.get('/analytics/monthly-comparison', { params }),
};

export default API;
