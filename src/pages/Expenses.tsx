import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import AnimatedTransition from '@/components/ui/AnimatedTransition';
import ExpenseTracker from '@/components/expenses/ExpenseTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSignIcon,
  ShoppingCartIcon,
  PlusIcon,
  CalendarIcon,
  BarChartIcon,
  Tag,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const Expenses = () => {
  const { expenses, addExpense } = useAppContext();

  // State for the add expense dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    store: '',
    amount: 0,
    category: 'Grocery',
    items: [],
  });

  // Calculate total spending
  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by store for the pie chart
  const storeData = expenses.reduce(
    (acc, expense) => {
      const existingStore = acc.find(item => item.name === expense.store);
      if (existingStore) {
        existingStore.value += expense.amount;
      } else {
        acc.push({ name: expense.store, value: expense.amount });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  // Group expenses by category
  const categoryData = expenses.reduce(
    (acc, expense) => {
      const existingCategory = acc.find(item => item.name === expense.category);
      if (existingCategory) {
        existingCategory.value += expense.amount;
      } else {
        acc.push({ name: expense.category, value: expense.amount });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DF2', '#FF6492'];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addExpense(formData);

    // Reset form and close dialog
    setFormData({
      date: new Date().toISOString().split('T')[0],
      store: '',
      amount: 0,
      category: 'Grocery',
      items: [],
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <AnimatedTransition className="flex-1 pt-16">
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-display font-semibold mb-2">Expense Tracking</h1>
                  <p className="text-muted-foreground">
                    Monitor your grocery spending and identify saving opportunities.
                  </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Expense</DialogTitle>
                      <DialogDescription>
                        Track your grocery spending by adding expense details.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="date" className="text-right">
                            Date
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="col-span-3"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="store" className="text-right">
                            Store
                          </Label>
                          <Input
                            id="store"
                            value={formData.store}
                            onChange={e => setFormData({ ...formData, store: e.target.value })}
                            className="col-span-3"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Amount ($)
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={e =>
                              setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                            }
                            className="col-span-3"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">
                            Category
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={value => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger id="category" className="col-span-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Grocery">Grocery</SelectItem>
                              <SelectItem value="Restaurant">Restaurant</SelectItem>
                              <SelectItem value="Takeout">Takeout</SelectItem>
                              <SelectItem value="Specialty Food">Specialty Food</SelectItem>
                              <SelectItem value="Farmers Market">Farmers Market</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Expense</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Across {expenses.length} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
                    <ShoppingCartIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${expenses.length ? (totalSpending / expenses.length).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">Per shopping trip</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Most Recent</CardTitle>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {expenses.length ? (
                        <span>${expenses[expenses.length - 1].amount.toFixed(2)}</span>
                      ) : (
                        <span>$0.00</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {expenses.length ? (
                        <span>
                          {new Date(expenses[expenses.length - 1].date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>No transactions yet</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <ExpenseTracker expenses={expenses} className="mb-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Spending by Store</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {storeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={storeData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              fill="#8884d8"
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                              }
                              labelLine={false}
                            >
                              {storeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">No expense data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Spending by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              fill="#8884d8"
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                              }
                              labelLine={false}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-muted-foreground">No expense data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Store</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
                            <th className="px-4 py-2 text-right text-sm font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {expenses.length > 0 ? (
                            [...expenses]
                              .sort(
                                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                              )
                              .map(expense => (
                                <tr key={expense.id} className="hover:bg-muted/50">
                                  <td className="px-4 py-3 text-sm">
                                    {new Date(expense.date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-sm">{expense.store}</td>
                                  <td className="px-4 py-3 text-sm">{expense.category}</td>
                                  <td className="px-4 py-3 text-sm text-right font-medium">
                                    ${expense.amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-6 text-center text-muted-foreground"
                              >
                                No transactions recorded yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </AnimatedTransition>

      <Footer />
    </div>
  );
};

export default Expenses;
