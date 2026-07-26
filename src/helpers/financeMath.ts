/**
 * Core Financial Math Helpers
 * All calculations for loans, outstanding balances, and revenue should be handled here
 * to ensure a single source of truth across the application.
 */

// ==========================================
// 1. Basic Summation Helpers
// ==========================================

export interface ActiveMember {
  loan_amount: string | number;
  interest_rate: string | number;
}

export interface MemberInstallment {
  amount_paid?: string | number | null;
  penalty_amount?: string | number | null;
  received_date?: string | null;
  members?: ActiveMember | ActiveMember[];
}

export function calculateTotalPaid(installments: MemberInstallment[] = []): number {
  if (!installments || installments.length === 0) return 0;
  return installments.reduce((sum, inst) => sum + Number(inst.amount_paid || 0), 0);
}

export function calculateTotalPenalties(installments: MemberInstallment[] = []): number {
  if (!installments || installments.length === 0) return 0;
  return installments.reduce((sum, inst) => sum + Number(inst.penalty_amount || 0), 0);
}

// ==========================================
// 2. Member Balances
// ==========================================

export function calculateOutstandingBalance(
  totalExpectedRepayment: number | string,
  totalPaid: number,
  totalPenalties: number = 0
): number {
  const total = Number(totalExpectedRepayment) || 0;
  const balance = total - totalPaid + totalPenalties;
  // Outstanding balance shouldn't be negative, though in some extreme overpayment cases it might be.
  // Standardizing to return at least 0.
  return Math.max(0, balance);
}

// ==========================================
// 3. Dashboard Metrics
// ==========================================

export function calculateTotalActiveLoans(activeMembers: ActiveMember[] = []): number {
  if (!activeMembers || activeMembers.length === 0) return 0;
  return activeMembers.reduce((sum, member) => {
    return sum + calculateTotalRepayment(member.loan_amount, member.interest_rate);
  }, 0);
}

export function calculateDailyCashCollected(installments: MemberInstallment[] = [], date: Date): number {
  if (!installments || installments.length === 0) return 0;
  
  return installments
    .filter(inst => {
      if (!inst.received_date) return false;
      const paymentDate = new Date(inst.received_date);
      return (
        paymentDate.getDate() === date.getDate() &&
        paymentDate.getMonth() === date.getMonth() &&
        paymentDate.getFullYear() === date.getFullYear()
      );
    })
    .reduce((sum, inst) => sum + Number(inst.amount_paid || 0), 0);
}

export function calculateMonthlyNetProfit(installments: MemberInstallment[] = [], monthIndex: number, year: number): number {
  if (!installments || installments.length === 0) return 0;
  
  return installments
    .filter(inst => {
      if (!inst.received_date) return false;
      const paymentDate = new Date(inst.received_date);
      return paymentDate.getMonth() === monthIndex && paymentDate.getFullYear() === year;
    })
    .reduce((sum, inst) => {
      const amountPaid = Number(inst.amount_paid || 0);
      if (amountPaid === 0) return sum;

      const penalty = Number(inst.penalty_amount || 0);
      const member = Array.isArray(inst.members) ? inst.members[0] : inst.members;
      
      if (!member || !member.loan_amount) return sum;

      const loanAmount = Number(member.loan_amount || 0);
      const interestRate = Number(member.interest_rate || 0);
      const expectedRepayment = calculateTotalRepayment(loanAmount, interestRate);
      
      const totalInterest = expectedRepayment - loanAmount;
      const interestRatio = expectedRepayment > 0 ? (totalInterest / expectedRepayment) : 0;
      
      const basePayment = Math.max(0, amountPaid - penalty);
      const profitFromBase = basePayment * interestRatio;
      
      return sum + profitFromBase + penalty;
    }, 0);
}

// ==========================================
// 4. Form Calculations (New Loan Generation)
// ==========================================

export function calculateTotalRepayment(loanAmount: number | string, interestRate: number | string): number {
  const loan = Number(loanAmount) || 0;
  const rate = Number(interestRate) || 0;
  return loan + (loan * (rate / 100));
}

export function calculateTotalInstallmentsCount(totalRepayment: number, installmentAmount: number | string): number {
  const instAmt = Number(installmentAmount) || 0;
  if (instAmt <= 0) return 0;
  
  // Math.ceil ensures that any fractional remainder requires one final (smaller) installment
  return Math.ceil(totalRepayment / instAmt);
}
