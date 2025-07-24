import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, DollarSign, TrendingDown } from 'lucide-react';
import { useDebtStore } from '@/store/debtStore';

interface PaymentScheduleProps {
  strategy: 'snowball' | 'avalanche';
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({ strategy }) => {
  const { calculateStrategy } = useDebtStore();
  
  const result = useMemo(() => calculateStrategy(strategy), [calculateStrategy, strategy]);

  if (result.schedule.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No payment schedule available</p>
        </CardContent>
      </Card>
    );
  }

  const strategyInfo = {
    snowball: {
      title: 'Debt Snowball Method',
      description: 'Pay off smallest balances first for psychological wins',
      color: 'bg-blue-500',
    },
    avalanche: {
      title: 'Debt Avalanche Method', 
      description: 'Pay off highest interest rates first to save money',
      color: 'bg-purple-500',
    },
  };

  const info = strategyInfo[strategy];

  return (
    <div className="space-y-6">
      {/* Strategy Summary */}
      <Card className="border-2">
        <CardHeader className={`${info.color} text-white`}>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            {info.title}
          </CardTitle>
          <p className="text-white/90">{info.description}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Time to Payoff</span>
              </div>
              <p className="text-2xl font-bold">
                {Math.floor(result.monthsToPayoff / 12)}y {result.monthsToPayoff % 12}m
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Total Interest</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${result.totalInterest.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Total Payments</span>
              </div>
              <p className="text-2xl font-bold">
                ${result.totalPayments.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {/* Group payments by month */}
              {Array.from(new Set(result.schedule.map(item => item.month)))
                .sort((a, b) => a - b)
                .map(month => {
                  const monthPayments = result.schedule.filter(item => item.month === month);
                  const monthTotal = monthPayments.reduce((sum, item) => sum + item.payment, 0);
                  
                  return (
                    <div key={month} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          Month {month} 
                          <span className="text-sm text-gray-500 ml-2">
                            ({new Date(new Date().setMonth(new Date().getMonth() + month - 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})
                          </span>
                        </h4>
                        <Badge variant="outline">
                          Total: ${monthTotal.toLocaleString()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {monthPayments.map((payment, index) => (
                          <div key={index} className="bg-gray-50 rounded p-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{payment.debtName}</span>
                              {payment.isExtra && (
                                <Badge variant="secondary" className="text-xs">
                                  Extra Payment
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm text-gray-600">
                              <div>
                                <span className="text-xs">Payment</span>
                                <p className="font-medium">${payment.payment}</p>
                              </div>
                              <div>
                                <span className="text-xs">Principal</span>
                                <p className="font-medium text-green-600">${payment.principal}</p>
                              </div>
                              <div>
                                <span className="text-xs">Interest</span>
                                <p className="font-medium text-red-600">${payment.interest}</p>
                              </div>
                              <div>
                                <span className="text-xs">Remaining</span>
                                <p className="font-medium">${payment.remainingBalance}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};