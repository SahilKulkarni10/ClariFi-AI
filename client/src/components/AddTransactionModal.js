import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useData } from '../contexts/DataContext';

const AddTransactionModal = ({ open, onClose, onSuccess }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Use DataContext for real-time updates
  const { addExpense, addIncome, addInvestment } = useData();

  // Form states for different transaction types
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: '',
    date: dayjs(),
    merchant: '',
  });

  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: '',
    description: '',
    date: dayjs(),
    frequency: 'monthly',
  });

  const [investmentForm, setInvestmentForm] = useState({
    type: '',
    name: '',
    amount: '',
    date: dayjs(),
    current_value: '',
    goal: '',
  });

  const expenseCategories = [
    'food', 'rent', 'transport', 'utilities', 'entertainment',
    'shopping', 'healthcare', 'education', 'other'
  ];

  const incomeSources = [
    'salary', 'freelance', 'rental', 'investment', 'business', 'other'
  ];

  const investmentTypes = [
    'sip', 'mutual_fund', 'stocks', 'bonds', 'fd', 'ppf', 'epf', 'nps', 'crypto', 'other'
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExpenseSubmit = async () => {
    try {
      setLoading(true);
      await addExpense({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date.format('YYYY-MM-DD'),
      });
      resetForms();
      onSuccess();
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeSubmit = async () => {
    try {
      setLoading(true);
      await addIncome({
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
        date: incomeForm.date.format('YYYY-MM-DD'),
      });
      resetForms();
      onSuccess();
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleInvestmentSubmit = async () => {
    try {
      setLoading(true);
      await addInvestment({
        ...investmentForm,
        amount: parseFloat(investmentForm.amount),
        current_value: investmentForm.current_value ? parseFloat(investmentForm.current_value) : null,
        date: investmentForm.date.format('YYYY-MM-DD'),
      });
      resetForms();
      onSuccess();
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setExpenseForm({
      category: '',
      amount: '',
      description: '',
      date: dayjs(),
      merchant: '',
    });
    setIncomeForm({
      source: '',
      amount: '',
      description: '',
      date: dayjs(),
      frequency: 'monthly',
    });
    setInvestmentForm({
      type: '',
      name: '',
      amount: '',
      date: dayjs(),
      current_value: '',
      goal: '',
    });
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Expense" />
              <Tab label="Income" />
              <Tab label="Investment" />
            </Tabs>
          </Box>

          {/* Expense Form */}
          {tabValue === 0 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={expenseForm.category}
                    label="Category"
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    {expenseCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={expenseForm.date}
                  onChange={(date) => setExpenseForm({ ...expenseForm, date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Merchant"
                  value={expenseForm.merchant}
                  onChange={(e) => setExpenseForm({ ...expenseForm, merchant: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {/* Income Form */}
          {tabValue === 1 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={incomeForm.source}
                    label="Source"
                    onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
                  >
                    {incomeSources.map((source) => (
                      <MenuItem key={source} value={source}>
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={incomeForm.date}
                  onChange={(date) => setIncomeForm({ ...incomeForm, date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={incomeForm.frequency}
                    label="Frequency"
                    onChange={(e) => setIncomeForm({ ...incomeForm, frequency: e.target.value })}
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="one-time">One-time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {/* Investment Form */}
          {tabValue === 2 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={investmentForm.type}
                    label="Type"
                    onChange={(e) => setInvestmentForm({ ...investmentForm, type: e.target.value })}
                  >
                    {investmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Investment Name"
                  value={investmentForm.name}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount Invested"
                  type="number"
                  value={investmentForm.amount}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
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
                  value={investmentForm.current_value}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, current_value: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Investment Date"
                  value={investmentForm.date}
                  onChange={(date) => setInvestmentForm({ ...investmentForm, date })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Goal"
                  value={investmentForm.goal}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, goal: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={loading}
            onClick={
              tabValue === 0
                ? handleExpenseSubmit
                : tabValue === 1
                ? handleIncomeSubmit
                : handleInvestmentSubmit
            }
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AddTransactionModal;
