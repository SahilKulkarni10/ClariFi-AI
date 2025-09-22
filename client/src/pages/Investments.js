import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Refresh,
  Edit,
  Delete,
  Assessment,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import StabilizedChart from '../components/StabilizedChart';
import { useData } from '../contexts/DataContext';

const Investments = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  
  // Use DataContext for real-time updates
  const {
    investments,
    analytics,
    loading,
    fetchAllData,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  } = useData();

  const investmentAnalytics = analytics?.investment;
  
  const [form, setForm] = useState({
    type: '',
    name: '',
    amount: '',
    current_value: '',
    date: dayjs(),
    goal: '',
    description: '',
  });

  const investmentTypes = [
    { value: 'sip', label: 'SIP' },
    { value: 'mutual_fund', label: 'Mutual Fund' },
    { value: 'stocks', label: 'Stocks' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'fd', label: 'Fixed Deposit' },
    { value: 'ppf', label: 'PPF' },
    { value: 'epf', label: 'EPF' },
    { value: 'nps', label: 'NPS' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'other', label: 'Other' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchData = fetchAllData; // Alias for backward compatibility

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount),
        current_value: parseFloat(form.current_value) || parseFloat(form.amount),
        date: form.date.format('YYYY-MM-DD'),
      };

      if (editingInvestment) {
        await updateInvestment(editingInvestment._id, data);
      } else {
        await addInvestment(data);
      }

      handleCloseModal();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setForm({
      type: investment.type,
      name: investment.name,
      amount: investment.amount.toString(),
      current_value: investment.current_value?.toString() || investment.amount.toString(),
      date: dayjs(investment.date),
      goal: investment.goal || '',
      description: investment.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await deleteInvestment(id);
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingInvestment(null);
    setForm({
      type: '',
      name: '',
      amount: '',
      current_value: '',
      date: dayjs(),
      goal: '',
      description: '',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculateGainLoss = (investment) => {
    const gain = (investment.current_value || investment.amount) - investment.amount;
    const percentage = (gain / investment.amount) * 100;
    return { gain, percentage };
  };

  const formatPortfolioData = () => {
    if (!investmentAnalytics?.portfolio_breakdown) return [];
    return Object.entries(investmentAnalytics.portfolio_breakdown).map(([type, amount], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
      value: amount,
      color: COLORS[index % COLORS.length],
    }));
  };

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.current_value || inv.amount), 0);
  const totalGain = totalCurrentValue - totalInvestment;
  const totalGainPercentage = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading investments...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Investment Portfolio
        </Typography>
        <Box>
          <IconButton onClick={fetchData} disabled={loading}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{ ml: 1 }}
          >
            Add Investment
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total Invested
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalInvestment)}
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
                    Current Value
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalCurrentValue)}
                  </Typography>
                </Box>
                <Assessment color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: totalGain >= 0 ? '#e8f5e8' : '#ffebee', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color={totalGain >= 0 ? 'success.main' : 'error'} gutterBottom>
                    Total Gain/Loss
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalGain)}
                  </Typography>
                  <Chip 
                    label={`${totalGainPercentage >= 0 ? '+' : ''}${totalGainPercentage.toFixed(2)}%`}
                    size="small" 
                    color={totalGain >= 0 ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
                {totalGain >= 0 ? (
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                ) : (
                  <TrendingDown color="error" sx={{ fontSize: 40 }} />
                )}
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
                    Total Holdings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {investments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Active Investments
                  </Typography>
                </Box>
                <Assessment color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Breakdown Chart */}
      {formatPortfolioData().length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Portfolio Breakdown
              </Typography>
              <StabilizedChart 
                data={formatPortfolioData()} 
                width="100%" 
                height={300}
              >
                <PieChart>
                  <Pie
                    data={formatPortfolioData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formatPortfolioData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </StabilizedChart>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Investments Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Investment Holdings
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Invested</TableCell>
                <TableCell align="right">Current Value</TableCell>
                <TableCell align="right">Gain/Loss</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {investments.map((investment) => {
                const { gain, percentage } = calculateGainLoss(investment);
                return (
                  <TableRow key={investment._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {investment.name}
                        </Typography>
                        {investment.description && (
                          <Typography variant="body2" color="text.secondary">
                            {investment.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={investment.type.toUpperCase()} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(investment.amount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(investment.current_value || investment.amount)}
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        <Typography 
                          variant="body2" 
                          color={gain >= 0 ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 500 }}
                        >
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={gain >= 0 ? 'success.main' : 'error.main'}
                        >
                          ({percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(investment)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(investment._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {investments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No investments found. Add your first investment to get started!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Investment Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Investment Type</InputLabel>
                <Select
                  value={form.type}
                  label="Investment Type"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {investmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Investment Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., HDFC Top 100 Fund"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount Invested"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Value"
                type="number"
                value={form.current_value}
                onChange={(e) => setForm({ ...form, current_value: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                placeholder="Leave empty to use invested amount"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Investment Date"
                  value={form.date}
                  onChange={(newValue) => setForm({ ...form, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Goal"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="e.g., Retirement, Emergency Fund"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional notes about this investment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!form.type || !form.name || !form.amount}
          >
            {editingInvestment ? 'Update' : 'Add'} Investment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Investments;
