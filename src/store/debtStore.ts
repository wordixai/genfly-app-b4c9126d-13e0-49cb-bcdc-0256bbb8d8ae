import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Debt {
  id: string;
  name: string;
  type: string;
  balance: number;
  originalBalance: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: Date;
}

export interface PaymentScheduleItem {
  month: number;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  isExtra: boolean;
}

export interface StrategyResult {
  totalPayments: number;
  totalInterest: number;
  monthsToPayoff: number;
  schedule: PaymentScheduleItem[];
}

interface DebtStore {
  debts: Debt[];
  monthlyBudget: number;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  removeDebt: (id: string) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  setMonthlyBudget: (budget: number) => void;
  calculateStrategy: (strategy: 'snowball' | 'avalanche') => StrategyResult;
  clearAllDebts: () => void;
}

export const useDebtStore = create<DebtStore>()(
  persist(
    (set, get) => ({
      debts: [],
      monthlyBudget: 0,

      addDebt: (debtData) => {
        const newDebt: Debt = {
          ...debtData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          originalBalance: debtData.balance,
        };
        set((state) => ({
          debts: [...state.debts, newDebt],
        }));
      },

      removeDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        }));
      },

      updateDebt: (id, updates) => {
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id ? { ...debt, ...updates } : debt
          ),
        }));
      },

      setMonthlyBudget: (budget) => {
        set({ monthlyBudget: budget });
      },

      calculateStrategy: (strategy) => {
        const { debts, monthlyBudget } = get();
        
        if (debts.length === 0 || monthlyBudget <= 0) {
          return {
            totalPayments: 0,
            totalInterest: 0,
            monthsToPayoff: 0,
            schedule: [],
          };
        }

        // Create working copies of debts
        const workingDebts = debts.map(debt => ({ ...debt }));
        
        // Sort debts based on strategy
        if (strategy === 'snowball') {
          workingDebts.sort((a, b) => a.balance - b.balance);
        } else {
          workingDebts.sort((a, b) => b.interestRate - a.interestRate);
        }

        const totalMinimumPayments = workingDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
        const extraPayment = Math.max(0, monthlyBudget - totalMinimumPayments);

        const schedule: PaymentScheduleItem[] = [];
        let month = 0;
        let totalPayments = 0;
        let totalInterest = 0;

        // Continue until all debts are paid off
        while (workingDebts.some(debt => debt.balance > 0) && month < 600) { // 50 year max
          month++;

          // Apply payments to each debt
          workingDebts.forEach((debt, index) => {
            if (debt.balance <= 0) return;

            const monthlyInterest = (debt.balance * (debt.interestRate / 100)) / 12;
            let payment = debt.minimumPayment;
            
            // Add extra payment to the focus debt (first in sorted order)
            if (index === 0 && extraPayment > 0) {
              payment += extraPayment;
            }

            // Don't pay more than the remaining balance
            const principal = Math.min(Math.max(0, payment - monthlyInterest), debt.balance);
            payment = principal + monthlyInterest;

            if (payment > 0) {
              debt.balance = Math.max(0, debt.balance - principal);
              totalPayments += payment;
              totalInterest += monthlyInterest;

              schedule.push({
                month,
                debtName: debt.name,
                payment: Math.round(payment * 100) / 100,
                principal: Math.round(principal * 100) / 100,
                interest: Math.round(monthlyInterest * 100) / 100,
                remainingBalance: Math.round(debt.balance * 100) / 100,
                isExtra: index === 0 && extraPayment > 0,
              });
            }
          });

          // Remove paid debts and resort
          const activeDebts = workingDebts.filter(debt => debt.balance > 0);
          if (activeDebts.length !== workingDebts.length) {
            workingDebts.splice(0, workingDebts.length, ...activeDebts);
            if (strategy === 'snowball') {
              workingDebts.sort((a, b) => a.balance - b.balance);
            } else {
              workingDebts.sort((a, b) => b.interestRate - a.interestRate);
            }
          }
        }

        return {
          totalPayments: Math.round(totalPayments * 100) / 100,
          totalInterest: Math.round(totalInterest * 100) / 100,
          monthsToPayoff: month,
          schedule,
        };
      },

      clearAllDebts: () => {
        set({ debts: [] });
      },
    }),
    {
      name: 'debt-store',
    }
  )
);

// Computed values
export const useDebtStats = () => {
  const debts = useDebtStore((state) => state.debts);
  
  return {
    totalDebt: debts.reduce((sum, debt) => sum + debt.balance, 0),
    totalMinimumPayments: debts.reduce((sum, debt) => sum + debt.minimumPayment, 0),
    averageInterestRate: debts.length > 0 
      ? debts.reduce((sum, debt) => sum + debt.interestRate, 0) / debts.length 
      : 0,
    highestInterestRate: debts.length > 0 
      ? Math.max(...debts.map(debt => debt.interestRate)) 
      : 0,
    lowestBalance: debts.length > 0 
      ? Math.min(...debts.map(debt => debt.balance)) 
      : 0,
  };
};