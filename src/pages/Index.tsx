import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingDown, DollarSign, Calendar, Trash2, Plus } from 'lucide-react';
import { DebtForm } from '@/components/DebtForm';
import { PaymentSchedule } from '@/components/PaymentSchedule';
import { StrategyComparison } from '@/components/StrategyComparison';
import { useDebtStore } from '@/store/debtStore';

const Index = () => {
  const { debts, totalDebt, monthlyBudget, setMonthlyBudget } = useDebtStore();
  const [showDebtForm, setShowDebtForm] = useState(false);

  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const availableExtraPayment = Math.max(0, monthlyBudget - totalMinimumPayments);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DebtWise
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Strategic debt repayment planning with snowball and avalanche methods
          </p>
        </div>

        {/* Budget Setup */}
        <Card className="mb-8 border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Monthly Budget
            </CardTitle>
            <CardDescription>
              Set your total monthly budget for debt payments
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
                  placeholder="Enter your monthly debt payment budget"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Total Debt</p>
                  <p className="font-bold text-lg">${totalDebt.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Min. Payments</p>
                  <p className="font-bold text-lg">${totalMinimumPayments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            {monthlyBudget > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800">
                  <strong>Extra Payment Available: ${availableExtraPayment.toLocaleString()}</strong>
                  {availableExtraPayment < 0 && (
                    <span className="text-red-600 ml-2">
                      (Budget insufficient for minimum payments!)
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debt Management */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-purple-600" />
                    Your Debts
                  </CardTitle>
                  <Button onClick={() => setShowDebtForm(true)} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Debt
                  </Button>
                </div>
                <CardDescription>
                  Manage your debts and see repayment strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {debts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No debts added yet. Add your first debt to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {debts.map((debt) => (
                      <DebtCard key={debt.id} debt={debt} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Debt</p>
                  <p className="text-2xl font-bold text-red-600">
                    ${totalDebt.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Number of Debts</p>
                  <p className="text-xl font-semibold">{debts.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Avg. Interest Rate</p>
                  <p className="text-xl font-semibold">
                    {debts.length > 0
                      ? (debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategy Analysis */}
        {debts.length > 0 && monthlyBudget > totalMinimumPayments && (
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Strategy Comparison</TabsTrigger>
              <TabsTrigger value="snowball">Snowball Method</TabsTrigger>
              <TabsTrigger value="avalanche">Avalanche Method</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="mt-6">
              <StrategyComparison />
            </TabsContent>
            
            <TabsContent value="snowball" className="mt-6">
              <PaymentSchedule strategy="snowball" />
            </TabsContent>
            
            <TabsContent value="avalanche" className="mt-6">
              <PaymentSchedule strategy="avalanche" />
            </TabsContent>
          </Tabs>
        )}

        {/* Debt Form Modal */}
        {showDebtForm && (
          <DebtForm onClose={() => setShowDebtForm(false)} />
        )}
      </div>
    </div>
  );
};

const DebtCard = ({ debt }) => {
  const { removeDebt } = useDebtStore();
  
  const progressPercentage = ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{debt.name}</h3>
          <Badge variant="outline" className="mt-1">
            {debt.type}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeDebt(debt.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500">Balance</p>
          <p className="font-semibold text-lg">${debt.balance.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Interest Rate</p>
          <p className="font-semibold">{debt.interestRate}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-gray-500">Min. Payment</p>
          <p className="font-semibold">${debt.minimumPayment}</p>
        </div>
        <div>
          <p className="text-gray-500">Original Balance</p>
          <p className="font-semibold">${debt.originalBalance.toLocaleString()}</p>
        </div>
      </div>

      {debt.originalBalance !== debt.balance && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default Index;