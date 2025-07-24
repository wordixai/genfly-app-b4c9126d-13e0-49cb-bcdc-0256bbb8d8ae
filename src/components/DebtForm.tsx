import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useDebtStore } from '@/store/debtStore';

interface DebtFormProps {
  onClose: () => void;
}

export const DebtForm: React.FC<DebtFormProps> = ({ onClose }) => {
  const { addDebt } = useDebtStore();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: '',
    interestRate: '',
    minimumPayment: '',
  });

  const debtTypes = [
    'Credit Card',
    'Personal Loan',
    'Student Loan',
    'Car Loan',
    'Medical Debt',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.balance || !formData.interestRate || !formData.minimumPayment) {
      alert('Please fill in all fields');
      return;
    }

    const balance = parseFloat(formData.balance);
    const interestRate = parseFloat(formData.interestRate);
    const minimumPayment = parseFloat(formData.minimumPayment);

    if (balance <= 0 || interestRate < 0 || minimumPayment <= 0) {
      alert('Please enter valid positive numbers');
      return;
    }

    addDebt({
      name: formData.name,
      type: formData.type,
      balance,
      interestRate,
      minimumPayment,
    });

    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Debt</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Debt Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Chase Credit Card"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Debt Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select debt type" />
                </SelectTrigger>
                <SelectContent>
                  {debtTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="balance">Current Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) => handleChange('balance', e.target.value)}
                placeholder="e.g., 5000.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => handleChange('interestRate', e.target.value)}
                placeholder="e.g., 18.99"
                required
              />
            </div>

            <div>
              <Label htmlFor="minimumPayment">Minimum Payment ($)</Label>
              <Input
                id="minimumPayment"
                type="number"
                step="0.01"
                value={formData.minimumPayment}
                onChange={(e) => handleChange('minimumPayment', e.target.value)}
                placeholder="e.g., 125.00"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Add Debt
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};