import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  AccountBalance,
  Refresh,
  ShowChart,
  PieChart,
  Timeline,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from 'recharts';
import StabilizedChart from '../components/StabilizedChart';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [expenseAnalytics, setExpenseAnalytics] = useState(null);
  const [investmentAnalytics, setInvestmentAnalytics] = useState(null);
  const [incomeAnalytics, setIncomeAnalytics] = useState(null);
  const [monthlyComparison, setMonthlyComparison] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6');
  
  const theme = useTheme();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        summaryRes,
        expenseRes,
        investmentRes,
        incomeRes,
        comparisonRes,
        goalRes,
      ] = await Promise.all([
        analyticsAPI.getFinancialSummary().catch(() => ({ data: null })),
        analyticsAPI.getExpenseAnalytics({ months: parseInt(timeRange) }).catch(() => ({ data: null })),
        analyticsAPI.getInvestmentAnalytics().catch(() => ({ data: null })),
        analyticsAPI.getIncomeAnalytics({ months: parseInt(timeRange) }).catch(() => ({ data: null })),
        analyticsAPI.getMonthlyComparison({ months: parseInt(timeRange) }).catch(() => ({ data: null })),
        analyticsAPI.getGoalProgress().catch(() => ({ data: null })),
      ]);

      setSummary(summaryRes.data);
      setExpenseAnalytics(expenseRes.data);
      setInvestmentAnalytics(investmentRes.data);
      setIncomeAnalytics(incomeRes.data);
      setMonthlyComparison(comparisonRes.data);
      setGoalProgress(goalRes.data);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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

  const formatMonthlyTrend = (data) => {
    if (!data) return [];
    return data.map(item => ({
      month: `${item.month}/${item.year}`,
      income: item.income || 0,
      expenses: item.expenses || 0,
      savings: (item.income || 0) - (item.expenses || 0),
      savingsRate: item.income > 0 ? ((item.income - item.expenses) / item.income * 100) : 0,
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Financial Analytics
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3">3 Months</MenuItem>
              <MenuItem value="6">6 Months</MenuItem>
              <MenuItem value="12">12 Months</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={fetchAnalyticsData} disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Net Worth
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(summary?.net_worth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Total assets - liabilities
                  </Typography>
                </Box>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e8', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Savings Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {summary?.savings_rate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Monthly average
                  </Typography>
                </Box>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff3e0', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    Monthly Cash Flow
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(summary?.monthly_cash_flow)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Income - Expenses
                  </Typography>
                </Box>
                <ShowChart color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#f3e5f5', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="secondary" gutterBottom>
                    Investment Growth
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {investmentAnalytics?.growth_rate?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Portfolio performance
                  </Typography>
                </Box>
                <Timeline color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Income vs Expenses Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
              Income vs Expenses Trend
            </Typography>
            {monthlyComparison && (
              <StabilizedChart 
                data={formatMonthlyTrend(monthlyComparison)} 
                width="100%" 
                height={320}
              >
                <ComposedChart data={formatMonthlyTrend(monthlyComparison)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'savingsRate' ? `${value.toFixed(1)}%` : formatCurrency(value),
                      name === 'savingsRate' ? 'Savings Rate' : name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="income" fill="#4CAF50" name="Income" />
                  <Bar yAxisId="left" dataKey="expenses" fill="#F44336" name="Expenses" />
                  <Line yAxisId="right" type="monotone" dataKey="savingsRate" stroke="#FF9800" strokeWidth={3} name="Savings Rate %" />
                </ComposedChart>
              </StabilizedChart>
            )}
          </Paper>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <PieChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Expense Categories
            </Typography>
            {formatExpenseData(expenseAnalytics?.category_breakdown).length > 0 ? (
              <StabilizedChart 
                data={formatExpenseData(expenseAnalytics?.category_breakdown)} 
                width="100%" 
                height={320}
              >
                <RechartsPieChart>
                  <Pie
                    data={formatExpenseData(expenseAnalytics?.category_breakdown)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formatExpenseData(expenseAnalytics?.category_breakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
              </StabilizedChart>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={320}>
                <Typography color="text.secondary">No expense data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Investment Portfolio */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Investment Portfolio
            </Typography>
            {investmentAnalytics?.portfolio_breakdown && 
             formatInvestmentData(investmentAnalytics.portfolio_breakdown).length > 0 ? (
              <StabilizedChart 
                data={formatInvestmentData(investmentAnalytics.portfolio_breakdown)} 
                width="100%" 
                height={320}
              >
                <RechartsPieChart>
                  <Pie
                    data={formatInvestmentData(investmentAnalytics.portfolio_breakdown)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formatInvestmentData(investmentAnalytics.portfolio_breakdown).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPieChart>
              </StabilizedChart>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={320}>
                <Typography color="text.secondary">No investment data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Monthly Spending Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Monthly Spending Trend
            </Typography>
            {expenseAnalytics?.monthly_trend && (
              <StabilizedChart 
                data={expenseAnalytics.monthly_trend} 
                width="100%" 
                height={320}
              >
                <AreaChart data={expenseAnalytics.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
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
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Income Sources and Goal Progress */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Income Sources */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Income Sources
            </Typography>
            {incomeAnalytics?.source_breakdown ? (
              <StabilizedChart 
                data={Object.entries(incomeAnalytics.source_breakdown).map(([source, amount]) => ({
                  source: source.charAt(0).toUpperCase() + source.slice(1),
                  amount: amount,
                }))} 
                width="100%" 
                height={320}
              >
                <BarChart data={Object.entries(incomeAnalytics.source_breakdown).map(([source, amount]) => ({
                  source: source.charAt(0).toUpperCase() + source.slice(1),
                  amount: amount,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#4CAF50" />
                </BarChart>
              </StabilizedChart>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={320}>
                <Typography color="text.secondary">No income data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Goal Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Financial Goals Progress
            </Typography>
            {goalProgress && goalProgress.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {goalProgress.slice(0, 5).map((goal, index) => {
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
                            backgroundColor: progress >= 100 ? '#4CAF50' : theme.palette.primary.main,
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={320}>
                <Typography color="text.secondary">No goals set</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Financial Health Summary */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Financial Health Summary
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color={summary?.savings_rate >= 20 ? 'success.main' : summary?.savings_rate >= 10 ? 'warning.main' : 'error.main'}>
                {summary?.savings_rate >= 20 ? '🟢' : summary?.savings_rate >= 10 ? '🟡' : '🔴'}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Savings Health
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary?.savings_rate >= 20 ? 'Excellent' : summary?.savings_rate >= 10 ? 'Good' : 'Needs Improvement'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color={investmentAnalytics?.growth_rate >= 10 ? 'success.main' : investmentAnalytics?.growth_rate >= 5 ? 'warning.main' : 'error.main'}>
                {investmentAnalytics?.growth_rate >= 10 ? '📈' : investmentAnalytics?.growth_rate >= 5 ? '📊' : '📉'}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Investment Performance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {investmentAnalytics?.growth_rate >= 10 ? 'Strong Growth' : investmentAnalytics?.growth_rate >= 5 ? 'Moderate Growth' : 'Review Needed'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" color={summary?.monthly_cash_flow > 0 ? 'success.main' : 'error.main'}>
                {summary?.monthly_cash_flow > 0 ? '💰' : '⚠️'}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Cash Flow
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary?.monthly_cash_flow > 0 ? 'Positive' : 'Negative'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Analytics;
