import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseItem } from '@/context/ExpenseContext';

type Expense = {
  id: string;
  date: string;
  store: string;
  amount: number;
  category: string;
  items?: ExpenseItem[];
};

type ExpenseTrackerProps = {
  expenses: Expense[];
  className?: string;
};

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, className }) => {
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);

  // Process data for chart
  const processDataForChart = () => {
    const dateMap = new Map<string, number>();

    // Sort expenses by date
    const sortedExpenses = [...expenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group expenses by date
    sortedExpenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      const currentAmount = dateMap.get(date) || 0;
      dateMap.set(date, currentAmount + expense.amount);
    });

    // Convert to array format for recharts
    return Array.from(dateMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
  };

  const chartData = processDataForChart();

  // Calculate total spending
  const totalSpending = expenses.reduce((total, expense) => total + expense.amount, 0);

  // Calculate average spending per transaction
  const averageSpending = expenses.length ? totalSpending / expenses.length : 0;

  // Toggle expense details
  const toggleExpenseDetails = (expenseId: string) => {
    if (expandedExpense === expenseId) {
      setExpandedExpense(null);
    } else {
      setExpandedExpense(expenseId);
    }
  };

  return (
    <Card className={cn('shadow-elegant', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-display">Expense Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Spending</p>
            <p className="text-2xl font-semibold">${totalSpending.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Avg. Transaction</p>
            <p className="text-2xl font-semibold">${averageSpending.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-64 mt-4 mb-8">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={value => `$${value}`} tick={{ fontSize: 12 }} width={50} />
                <Tooltip
                  formatter={value => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  labelFormatter={label => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#007bff"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </div>

        {/* Expense List with Item Details */}
        {expenses.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="text-sm font-medium bg-muted px-4 py-2">Recent Expenses</div>
            <div className="divide-y">
              {expenses
                .slice()
                .reverse()
                .slice(0, 5)
                .map(expense => (
                  <div key={expense.id} className="overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30"
                      onClick={() => toggleExpenseDetails(expense.id)}
                    >
                      <div>
                        <div className="font-medium">{expense.store}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">${expense.amount.toFixed(2)}</span>
                        {expandedExpense === expense.id ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Expense items */}
                    {expandedExpense === expense.id &&
                      expense.items &&
                      expense.items.length > 0 && (
                        <div className="bg-muted/20 px-4 py-2">
                          <div className="text-sm font-medium mb-2">Items</div>
                          <div className="grid gap-1">
                            {expense.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>
                                  {item.name} ({item.quantity} {item.unit})
                                </span>
                                <span>${item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
            </div>
            {expenses.length > 5 && (
              <div className="px-4 py-2 text-center">
                <Button variant="ghost" size="sm">
                  View all expenses
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseTracker;
