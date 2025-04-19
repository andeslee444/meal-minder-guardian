import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface ExpenseItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  store: string;
  items?: ExpenseItem[];
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  clearExpenses: () => void;
}

export const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  addExpense: () => {},
  removeExpense: () => {},
  updateExpense: () => {},
  clearExpenses: () => {},
});

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use localStorage to persist expenses
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('kitchen-buddy-expenses', []);

  const addExpense = (expense: Partial<Expense>) => {
    const newExpense = {
      id: crypto.randomUUID(),
      name: expense.name || expense.store || '',
      store: expense.store || '',
      amount: expense.amount || 0,
      date: expense.date || new Date().toISOString().split('T')[0],
      category: expense.category || 'Grocery',
      items: expense.items || [],
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(
      expenses.map(expense => (expense.id === id ? { ...expense, ...updates } : expense))
    );
  };

  const clearExpenses = () => {
    setExpenses([]);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        removeExpense,
        updateExpense,
        clearExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);
