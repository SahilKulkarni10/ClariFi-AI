import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Fab,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Alert,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Add,
  AttachMoney,
  Assessment,
  Refresh,
  Savings,
  MonetizationOn,
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import AddTransactionModal from '../components/AddTransactionModal';
import StabilizedChart from '../components/StabilizedChart';
import { useData } from '../contexts/DataContext';

const Dashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Use DataContext for real-time updates
  const {
    summary,
    analytics,
    expenses: recentTransactions,
    loading,
    error,
    fetchAllData,
  } = useData();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatExpenseData = (categoryBreakdown) => {
    if (!categoryBreakdown) return [];
    return Object.entries(categoryBreakdown).map(([category, amount], index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      value: amount,
      color: COLORS[index % COLORS.length],
    }));
  };

  const formatInvestmentData = (portfolioBreakdown) => {
    if (!portfolioBreakdown) return [];
    return Object.entries(portfolioBreakdown).map(([type, amount], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value: amount,
      color: COLORS[index % COLORS.length],
    }));
  };

  const getSavingsRateColor = (rate) => {
    if (rate < 0) return 'error';
    if (rate < 10) return 'warning';
    if (rate < 20) return 'primary';
    return 'success';
  };

  // Get data from context with fallbacks
  const expenseAnalytics = analytics?.expense;
  const investmentAnalytics = analytics?.investment;
  const goals = analytics?.goals || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading your financial dashboard...
        </Typography>
      </Box>
    );
  }      if (error) {
        return (
          <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={fetchAllData}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Container>
        );
      }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Financial Dashboard
          </Typography>
        <Box>
          <IconButton onClick={fetchAllData} disabled={loading}>
            <Refresh />
          </IconButton>
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setModalOpen(true)}
              sx={{ ml: 1 }}
            >
              Add Transaction
            </Button>
          )}
        </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Monthly Income
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {formatCurrency(summary?.total_income)}
                      </Typography>
                      <Chip 
                        label="This Month" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card sx={{ backgroundColor: '#ffebee', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="error" gutterBottom>
                        Monthly Expenses
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {formatCurrency(summary?.total_expenses)}
                      </Typography>
                      <Chip 
                        label="This Month" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <TrendingDown color="error" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card sx={{ backgroundColor: '#e8f5e8', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color="success.main" gutterBottom>
                        Net Worth
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {formatCurrency(summary?.net_worth)}
                      </Typography>
                      <Chip 
                        label={`₹${(summary?.total_investments || 0) / 100000}L Invested`}
                        size="small" 
                        color="success" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <AccountBalance color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Card sx={{ backgroundColor: '#fff3e0', borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" color={getSavingsRateColor(summary?.savings_rate)} gutterBottom>
                        Savings Rate
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        {summary?.savings_rate?.toFixed(1) || 0}%
                      </Typography>
                      <Chip 
                        label={summary?.savings_rate >= 0 ? 'Positive' : 'Negative'}
                        size="small" 
                        color={summary?.savings_rate >= 0 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <AttachMoney color={getSavingsRateColor(summary?.savings_rate)} sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Expense Breakdown */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Expense Breakdown
              </Typography>
              {formatExpenseData(expenseAnalytics?.category_breakdown).length > 0 ? (
                <StabilizedChart 
                  data={formatExpenseData(expenseAnalytics?.category_breakdown)} 
                  width="100%" 
                  height={300}
                >
                  <PieChart>
                    <Pie
                      data={formatExpenseData(expenseAnalytics?.category_breakdown)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatExpenseData(expenseAnalytics?.category_breakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </StabilizedChart>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">No expense data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Investment Portfolio */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                <Savings sx={{ mr: 1, verticalAlign: 'middle' }} />
                Investment Portfolio
              </Typography>
              {investmentAnalytics?.portfolio_breakdown && 
               formatInvestmentData(investmentAnalytics.portfolio_breakdown).length > 0 ? (
                <StabilizedChart 
                  data={formatInvestmentData(investmentAnalytics.portfolio_breakdown)} 
                  width="100%" 
                  height={300}
                >
                  <PieChart>
                    <Pie
                      data={formatInvestmentData(investmentAnalytics.portfolio_breakdown)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {formatInvestmentData(investmentAnalytics.portfolio_breakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </StabilizedChart>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <Typography color="text.secondary">No investment data available</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Monthly Trend */}
        {expenseAnalytics?.monthly_trend && expenseAnalytics.monthly_trend.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Monthly Spending Trend
                </Typography>
                <StabilizedChart 
                  data={expenseAnalytics.monthly_trend} 
                  width="100%" 
                  height={300}
                >
                  <AreaChart data={expenseAnalytics.monthly_trend}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      strokeWidth={2}
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </StabilizedChart>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Bottom Section */}
        <Grid container spacing={3}>
          {/* Recent Transactions */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <Box
                    key={transaction._id || index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < recentTransactions.length - 1 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {transaction.description || transaction.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.date).toLocaleDateString('en-IN')} • {transaction.category}
                        {transaction.merchant && ` • ${transaction.merchant}`}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color="error"
                      sx={{ fontWeight: 600 }}
                    >
                      -{formatCurrency(transaction.amount)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <Typography color="text.secondary">No recent transactions</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Financial Goals */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Financial Goals
              </Typography>
              {goals.length > 0 ? (
                goals.map((goal, index) => {
                  const progress = goal.current_amount && goal.target_amount ? 
                    (goal.current_amount / goal.target_amount) * 100 : 0;
                  return (
                    <Box key={goal._id || index} sx={{ mb: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {goal.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progress.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: '100%',
                          height: 8,
                          backgroundColor: '#eee',
                          borderRadius: 4,
                          mt: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${Math.min(progress, 100)}%`,
                            height: '100%',
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                  <Typography color="text.secondary">No goals set</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Floating Action Button for Mobile */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
            onClick={() => setModalOpen(true)}
          >
            <Add />
          </Fab>
        )}

        {/* Add Transaction Modal */}
        <AddTransactionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchAllData}
        />
      </motion.div>
    </Container>
  );
};

export default Dashboard;
