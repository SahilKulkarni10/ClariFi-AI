import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { analyticsAPI, financeAPI } from '../services/api';
import toast from 'react-hot-toast';

// Context
const DataContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_INVESTMENTS: 'SET_INVESTMENTS',
  SET_LOANS: 'SET_LOANS',
  SET_EXPENSES: 'SET_EXPENSES',
  SET_INCOME: 'SET_INCOME',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_ERROR: 'SET_ERROR',
  UPDATE_INVESTMENT: 'UPDATE_INVESTMENT',
  ADD_INVESTMENT: 'ADD_INVESTMENT',
  DELETE_INVESTMENT: 'DELETE_INVESTMENT',
  UPDATE_LOAN: 'UPDATE_LOAN',
  ADD_LOAN: 'ADD_LOAN',
  DELETE_LOAN: 'DELETE_LOAN',
  ADD_EXPENSE: 'ADD_EXPENSE',
  ADD_INCOME: 'ADD_INCOME',
};

// Initial state
const initialState = {
  loading: false,
  summary: null,
  investments: [],
  loans: [],
  expenses: [],
  income: [],
  analytics: {
    expense: null,
    investment: null,
    spending: null,
    goals: null,
  },
  error: null,
  lastUpdated: null,
};

// Reducer
const dataReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload, lastUpdated: new Date() };
    
    case ACTIONS.SET_INVESTMENTS:
      return { ...state, investments: action.payload, lastUpdated: new Date() };
    
    case ACTIONS.SET_LOANS:
      return { ...state, loans: action.payload, lastUpdated: new Date() };
    
    case ACTIONS.SET_EXPENSES:
      return { ...state, expenses: action.payload, lastUpdated: new Date() };
    
    case ACTIONS.SET_INCOME:
      return { ...state, income: action.payload, lastUpdated: new Date() };
    
    case ACTIONS.SET_ANALYTICS:
      return { 
        ...state, 
        analytics: { ...state.analytics, ...action.payload },
        lastUpdated: new Date()
      };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ACTIONS.ADD_INVESTMENT:
      return {
        ...state,
        investments: [...state.investments, action.payload],
        lastUpdated: new Date()
      };
    
    case ACTIONS.UPDATE_INVESTMENT:
      return {
        ...state,
        investments: state.investments.map(inv =>
          inv._id === action.payload._id ? action.payload : inv
        ),
        lastUpdated: new Date()
      };
    
    case ACTIONS.DELETE_INVESTMENT:
      return {
        ...state,
        investments: state.investments.filter(inv => inv._id !== action.payload),
        lastUpdated: new Date()
      };
    
    case ACTIONS.ADD_LOAN:
      return {
        ...state,
        loans: [...state.loans, action.payload],
        lastUpdated: new Date()
      };
    
    case ACTIONS.UPDATE_LOAN:
      return {
        ...state,
        loans: state.loans.map(loan =>
          loan._id === action.payload._id ? action.payload : loan
        ),
        lastUpdated: new Date()
      };
    
    case ACTIONS.DELETE_LOAN:
      return {
        ...state,
        loans: state.loans.filter(loan => loan._id !== action.payload),
        lastUpdated: new Date()
      };
    
    case ACTIONS.ADD_EXPENSE:
      return {
        ...state,
        expenses: [action.payload, ...state.expenses.slice(0, 9)], // Keep latest 10
        lastUpdated: new Date()
      };
    
    case ACTIONS.ADD_INCOME:
      return {
        ...state,
        income: [action.payload, ...state.income.slice(0, 9)], // Keep latest 10
        lastUpdated: new Date()
      };
    
    default:
      return state;
  }
};

// Provider component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });

      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000); // 15 second timeout
      });

      // Fetch all data in parallel with timeout
      const [
        summaryRes,
        investmentsRes,
        loansRes,
        expensesRes,
        incomeRes,
        expenseAnalyticsRes,
        investmentAnalyticsRes,
        goalsRes,
      ] = await Promise.race([
        Promise.allSettled([
          analyticsAPI.getFinancialSummary(),
          financeAPI.getInvestments(),
          financeAPI.getLoans(),
          financeAPI.getExpenses({ limit: 10 }),
          financeAPI.getIncome({ limit: 10 }),
          analyticsAPI.getExpenseAnalytics({ months: 6 }),
          analyticsAPI.getInvestmentAnalytics(),
          financeAPI.getGoals({ limit: 5 }),
        ]),
        timeoutPromise
      ]);

      // Update state with successful responses
      if (summaryRes.status === 'fulfilled') {
        dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.value.data });
      }
      
      if (investmentsRes.status === 'fulfilled') {
        dispatch({ type: ACTIONS.SET_INVESTMENTS, payload: investmentsRes.value.data || [] });
      }
      
      if (loansRes.status === 'fulfilled') {
        dispatch({ type: ACTIONS.SET_LOANS, payload: loansRes.value.data || [] });
      }
      
      if (expensesRes.status === 'fulfilled') {
        dispatch({ type: ACTIONS.SET_EXPENSES, payload: expensesRes.value.data || [] });
      }
      
      if (incomeRes.status === 'fulfilled') {
        dispatch({ type: ACTIONS.SET_INCOME, payload: incomeRes.value.data || [] });
      }

      // Update analytics
      const analyticsData = {};
      if (expenseAnalyticsRes.status === 'fulfilled') {
        analyticsData.expense = expenseAnalyticsRes.value.data;
      }
      if (investmentAnalyticsRes.status === 'fulfilled') {
        analyticsData.investment = investmentAnalyticsRes.value.data;
      }
      if (goalsRes.status === 'fulfilled') {
        analyticsData.goals = goalsRes.value.data;
      }
      
      dispatch({ type: ACTIONS.SET_ANALYTICS, payload: analyticsData });

      // Only show success message on manual refresh, not automatic updates
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Failed to load data' });
      // Only show error for user-initiated requests
      if (error.message !== 'Request timeout') {
        toast.error('Failed to load data');
      }
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Investment operations
  const addInvestment = useCallback(async (data) => {
    try {
      const response = await financeAPI.addInvestment(data);
      dispatch({ type: ACTIONS.ADD_INVESTMENT, payload: response.data });
      // Refresh summary to update net worth
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Investment added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add investment');
      throw error;
    }
  }, []);

  const updateInvestment = useCallback(async (id, data) => {
    try {
      const response = await financeAPI.updateInvestment(id, data);
      dispatch({ type: ACTIONS.UPDATE_INVESTMENT, payload: response.data });
      // Refresh summary to update net worth
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Investment updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update investment');
      throw error;
    }
  }, []);

  const deleteInvestment = useCallback(async (id) => {
    try {
      await financeAPI.deleteInvestment(id);
      dispatch({ type: ACTIONS.DELETE_INVESTMENT, payload: id });
      // Refresh summary to update net worth
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Investment deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete investment');
      throw error;
    }
  }, []);

  // Loan operations
  const addLoan = useCallback(async (data) => {
    try {
      const response = await financeAPI.addLoan(data);
      dispatch({ type: ACTIONS.ADD_LOAN, payload: response.data });
      // Refresh summary to update net worth
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Loan added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add loan');
      throw error;
    }
  }, []);

  const updateLoan = useCallback(async (id, data) => {
    try {
      const response = await financeAPI.updateLoan(id, data);
      dispatch({ type: ACTIONS.UPDATE_LOAN, payload: response.data });
      // Refresh summary to update net worth
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Loan updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update loan');
      throw error;
    }
  }, []);

  const deleteLoan = useCallback(async (id) => {
    try {
      await financeAPI.deleteLoan(id);
      dispatch({ type: ACTIONS.DELETE_LOAN, payload: id });
      // Refresh summary to update net worth
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Loan deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete loan');
      throw error;
    }
  }, []);

  // Transaction operations
  const addExpense = useCallback(async (data) => {
    try {
      const response = await financeAPI.addExpense(data);
      dispatch({ type: ACTIONS.ADD_EXPENSE, payload: response.data });
      // Refresh summary and analytics
      const [summaryRes, analyticsRes] = await Promise.all([
        analyticsAPI.getFinancialSummary(),
        analyticsAPI.getExpenseAnalytics({ months: 6 }),
      ]);
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      dispatch({ type: ACTIONS.SET_ANALYTICS, payload: { expense: analyticsRes.data } });
      toast.success('Expense added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add expense');
      throw error;
    }
  }, []);

  const addIncome = useCallback(async (data) => {
    try {
      const response = await financeAPI.addIncome(data);
      dispatch({ type: ACTIONS.ADD_INCOME, payload: response.data });
      // Refresh summary
      const summaryRes = await analyticsAPI.getFinancialSummary();
      dispatch({ type: ACTIONS.SET_SUMMARY, payload: summaryRes.data });
      toast.success('Income added successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to add income');
      throw error;
    }
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    fetchAllData,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addLoan,
    updateLoan,
    deleteLoan,
    addExpense,
    addIncome,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
