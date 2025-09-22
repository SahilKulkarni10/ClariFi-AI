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
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Warning,
  AccountBalance,
  Refresh,
  Edit,
  Delete,
  MonetizationOn,
  CreditCard,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import StabilizedChart from '../components/StabilizedChart';
import { useData } from '../contexts/DataContext';

const Loans = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  
  // Use DataContext for real-time updates
  const {
    loans,
    loading,
    fetchAllData,
    addLoan,
    updateLoan,
    deleteLoan,
  } = useData();
  
  const [form, setForm] = useState({
    type: '',
    bank_name: '',
    amount: '',
    outstanding: '',
    interest_rate: '',
    emi: '',
    date: dayjs(),
    tenure_months: '',
    description: '',
  });

  const loanTypes = [
    { value: 'home_loan', label: 'Home Loan' },
    { value: 'car_loan', label: 'Car Loan' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'education_loan', label: 'Education Loan' },
    { value: 'business_loan', label: 'Business Loan' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'other', label: 'Other' },
  ];

  const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchLoans = fetchAllData; // Alias for backward compatibility

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        amount: parseFloat(form.amount),
        outstanding: parseFloat(form.outstanding) || parseFloat(form.amount),
        interest_rate: parseFloat(form.interest_rate),
        emi: parseFloat(form.emi),
        tenure_months: parseInt(form.tenure_months),
        date: form.date.format('YYYY-MM-DD'),
      };

      if (editingLoan) {
        await updateLoan(editingLoan._id, data);
      } else {
        await addLoan(data);
      }

      handleCloseModal();
    } catch (error) {
      // Error handled in context
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setForm({
      type: loan.type,
      bank_name: loan.bank_name,
      amount: loan.amount.toString(),
      outstanding: loan.outstanding?.toString() || loan.amount.toString(),
      interest_rate: loan.interest_rate?.toString() || '',
      emi: loan.emi?.toString() || '',
      date: dayjs(loan.date),
      tenure_months: loan.tenure_months?.toString() || '',
      description: loan.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await deleteLoan(id);
      } catch (error) {
        // Error handled in context
      }
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingLoan(null);
    setForm({
      type: '',
      bank_name: '',
      amount: '',
      outstanding: '',
      interest_rate: '',
      emi: '',
      date: dayjs(),
      tenure_months: '',
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

  const calculateProgress = (loan) => {
    if (!loan.amount || !loan.outstanding) return 0;
    const paidAmount = loan.amount - loan.outstanding;
    return (paidAmount / loan.amount) * 100;
  };

  const calculateMonthsRemaining = (loan) => {
    if (!loan.emi || !loan.outstanding || loan.emi <= 0) return 'N/A';
    return Math.ceil(loan.outstanding / loan.emi);
  };

  const formatLoanTypeData = () => {
    const typeBreakdown = loans.reduce((acc, loan) => {
      const type = loan.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      acc[type] = (acc[type] || 0) + loan.outstanding;
      return acc;
    }, {});

    return Object.entries(typeBreakdown).map(([type, amount], index) => ({
      name: type,
      value: amount,
      color: COLORS[index % COLORS.length],
    }));
  };

  const getLoanPriorityRecommendation = (loan) => {
    if (loan.interest_rate > 15) return { priority: 'High', color: 'error', reason: 'High interest rate' };
    if (loan.interest_rate > 10) return { priority: 'Medium', color: 'warning', reason: 'Moderate interest rate' };
    return { priority: 'Low', color: 'success', reason: 'Low interest rate' };
  };

  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding, 0);
  const totalEMI = loans.reduce((sum, loan) => sum + (loan.emi || 0), 0);
  const weightedAvgInterest = loans.length > 0 
    ? loans.reduce((sum, loan) => sum + (loan.interest_rate || 0) * loan.outstanding, 0) / totalOutstanding
    : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading loans...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Loans & Debt Management
        </Typography>
        <Box>
          <IconButton onClick={fetchLoans} disabled={loading}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{ ml: 1 }}
          >
            Add Loan
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#ffebee', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="error" gutterBottom>
                    Total Outstanding
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalOutstanding)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Across {loans.length} loans
                  </Typography>
                </Box>
                <Warning color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e3f2fd', borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Monthly EMI
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalEMI)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Total monthly commitment
                  </Typography>
                </Box>
                <MonetizationOn color="primary" sx={{ fontSize: 40 }} />
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
                    Avg Interest Rate
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {weightedAvgInterest.toFixed(2)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Weighted average
                  </Typography>
                </Box>
                <CreditCard color="warning" sx={{ fontSize: 40 }} />
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
                    Amount Repaid
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalLoanAmount - totalOutstanding)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {totalLoanAmount > 0 ? ((totalLoanAmount - totalOutstanding) / totalLoanAmount * 100).toFixed(1) : 0}% completed
                  </Typography>
                </Box>
                <AccountBalance color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      {loans.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Outstanding by Loan Type
              </Typography>
              <StabilizedChart 
                data={formatLoanTypeData()} 
                width="100%" 
                height={300}
              >
                <PieChart>
                  <Pie
                    data={formatLoanTypeData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formatLoanTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </StabilizedChart>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Interest Rate Comparison
              </Typography>
              <StabilizedChart 
                data={loans.map(loan => ({
                  name: loan.bank_name,
                  interest_rate: loan.interest_rate || 0,
                  outstanding: loan.outstanding,
                }))} 
                width="100%" 
                height={300}
              >
                <BarChart data={loans.map(loan => ({
                  name: loan.bank_name,
                  interest_rate: loan.interest_rate || 0,
                  outstanding: loan.outstanding,
                }))}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="interest_rate" fill="#FF8042" />
                </BarChart>
              </StabilizedChart>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Debt Payoff Recommendations */}
      {loans.filter(loan => loan.interest_rate > 10).length > 0 && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Debt Optimization Recommendation
          </Typography>
          <Typography variant="body2">
            You have loans with interest rates above 10%. Consider prioritizing these for faster repayment:
            {loans
              .filter(loan => loan.interest_rate > 10)
              .sort((a, b) => b.interest_rate - a.interest_rate)
              .slice(0, 3)
              .map(loan => ` ${loan.bank_name} (${loan.interest_rate}%)`)
              .join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Loans Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Loan Details
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bank/Lender</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell align="right">Interest Rate</TableCell>
                <TableCell align="right">EMI</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="center">Priority</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => {
                const progress = calculateProgress(loan);
                const monthsRemaining = calculateMonthsRemaining(loan);
                const priority = getLoanPriorityRecommendation(loan);
                
                return (
                  <TableRow key={loan._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {loan.bank_name}
                        </Typography>
                        {loan.description && (
                          <Typography variant="body2" color="text.secondary">
                            {loan.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={loan.type.replace('_', ' ').toUpperCase()} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(loan.outstanding)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        of {formatCurrency(loan.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {loan.interest_rate?.toFixed(2) || 'N/A'}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatCurrency(loan.emi)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {monthsRemaining} months left
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={progress} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {progress.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={priority.priority}
                        size="small" 
                        color={priority.color}
                        title={priority.reason}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(loan)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(loan._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {loans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No loans found. This is great for your financial health!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Loan Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingLoan ? 'Edit Loan' : 'Add New Loan'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Loan Type</InputLabel>
                <Select
                  value={form.type}
                  label="Loan Type"
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {loanTypes.map((type) => (
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
                label="Bank/Lender Name"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                placeholder="e.g., HDFC Bank"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Loan Amount"
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
                label="Outstanding Amount"
                type="number"
                value={form.outstanding}
                onChange={(e) => setForm({ ...form, outstanding: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate"
                type="number"
                value={form.interest_rate}
                onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly EMI"
                type="number"
                value={form.emi}
                onChange={(e) => setForm({ ...form, emi: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Loan Start Date"
                  value={form.date}
                  onChange={(newValue) => setForm({ ...form, date: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tenure (Months)"
                type="number"
                value={form.tenure_months}
                onChange={(e) => setForm({ ...form, tenure_months: e.target.value })}
                placeholder="e.g., 240 for 20 years"
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
                placeholder="Additional notes about this loan"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!form.type || !form.bank_name || !form.amount}
          >
            {editingLoan ? 'Update' : 'Add'} Loan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Loans;
