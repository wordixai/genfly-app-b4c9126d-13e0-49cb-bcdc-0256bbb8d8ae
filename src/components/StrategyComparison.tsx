import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, TrendingDown, Trophy } from 'lucide-react';
import { useDebtStore } from '@/store/debtStore';

export const StrategyComparison: React.FC = () => {
  const { calculateStrategy } = useDebtStore();
  
  const comparison = useMemo(() => {
    const snowballResult = calculateStrategy('snowball');
    const avalancheResult = calculateStrategy('avalanche');
    
    return {
      snowball: snowballResult,
      avalanche: avalancheResult,
      savings: {
        interest: Math.max(0, snowballResult.totalInterest - avalancheResult.totalInterest),
        months: Math.max(0, snowballResult.monthsToPayoff - avalancheResult.monthsToPayoff),
      }
    };
  }, [calculateStrategy]);

  if (comparison.snowball.schedule.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Add debts and set a budget to see strategy comparison</p>
        </CardContent>
      </Card>
    );
  }

  const strategies = [
    {
      name: 'Debt Snowball',
      key: 'snowball' as const,
      description: 'Pay smallest balances first',
      color: 'blue',
      pros: [
        'Quick psychological wins',
        'Builds momentum and motivation',
        'Simplifies debt management faster'
      ],
      cons: [
        'May cost more in interest',
        'Takes longer mathematically'
      ]
    },
    {
      name: 'Debt Avalanche',
      key: 'avalanche' as const,
      description: 'Pay highest interest rates first',
      color: 'purple',
      pros: [
        'Saves the most money',
        'Mathematically optimal',
        'Faster payoff time'
      ],
      cons: [
        'Slower initial progress',
        'Requires more discipline'
      ]
    }
  ];

  const getBestStrategy = () => {
    if (comparison.avalanche.totalInterest < comparison.snowball.totalInterest) {
      return 'avalanche';
    }
    return 'snowball';
  };

  const bestStrategy = getBestStrategy();

  return (
    <div className="space-y-6">
      {/* Savings Summary */}
      {comparison.savings.interest > 0 && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="h-5 w-5" />
              Potential Savings with Avalanche Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-green-600">Interest Savings</p>
                <p className="text-2xl font-bold text-green-800">
                  ${comparison.savings.interest.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-green-600">Time Savings</p>
                <p className="text-2xl font-bold text-green-800">
                  {Math.floor(comparison.savings.months / 12)}y {comparison.savings.months % 12}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {strategies.map((strategy) => {
          const result = comparison[strategy.key];
          const isBest = strategy.key === bestStrategy;
          
          return (
            <Card key={strategy.key} className={`relative ${isBest ? 'ring-2 ring-yellow-400' : ''}`}>
              {isBest && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-yellow-400 text-yellow-900">
                    <Trophy className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}
              
              <CardHeader className={`bg-${strategy.color}-50`}>
                <CardTitle className={`text-${strategy.color}-700 flex items-center gap-2`}>
                  <TrendingDown className="h-5 w-5" />
                  {strategy.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{strategy.description}</p>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Key Metrics */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Payoff Time</span>
                    </div>
                    <span className="font-bold">
                      {Math.floor(result.monthsToPayoff / 12)}y {result.monthsToPayoff % 12}m
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Total Interest</span>
                    </div>
                    <span className="font-bold text-red-600">
                      ${result.totalInterest.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Total Payments</span>
                    </div>
                    <span className="font-bold">
                      ${result.totalPayments.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress Comparison */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Relative Performance</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Interest Cost</span>
                        <span>vs Other Method</span>
                      </div>
                      <Progress
                        value={strategy.key === 'snowball' 
                          ? 100 
                          : (result.totalInterest / comparison.snowball.totalInterest) * 100}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Time to Pay Off</span>
                        <span>vs Other Method</span>
                      </div>
                      <Progress
                        value={strategy.key === 'snowball' 
                          ? 100 
                          : (result.monthsToPayoff / comparison.snowball.monthsToPayoff) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Pros and Cons */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Pros</h4>
                    <ul className="text-sm space-y-1">
                      {strategy.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Cons</h4>
                    <ul className="text-sm space-y-1">
                      {strategy.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};