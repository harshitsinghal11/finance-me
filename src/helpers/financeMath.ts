/**
 * Core Financial Math Helpers
 * All calculations for loans, outstanding balances, and revenue should be handled here
 * to ensure a single source of truth across the application.
 */

// ==========================================
// 1. Basic Summation Helpers
// ==========================================

export function calculateTotalPaid(installments: any[] = []): number {
  if (!installments || installments.length === 0) return 0;
  return installments.reduce((sum, inst) => sum + Number(inst.amount_paid || 0), 0);
}

export function calculateTotalPenalties(installments: any[] = []): number {
  if (!installments || installments.length === 0) return 0;
  return installments.reduce((sum, inst) => sum + Number(inst.penalty_amount || 0), 0);
}

// ==========================================
// 2. Member Balances
// ==========================================

export function calculateOutstandingBalance(
  loanAmount: number | string,
  totalPaid: number,
  totalPenalties: number = 0
): number {
  const principal = Number(loanAmount) || 0;
  const balance = principal - totalPaid + totalPenalties;
  // Outstanding balance shouldn't be negative, though in some extreme overpayment cases it might be.
  // Standardizing to return at least 0.
  return Math.max(0, balance);
}

// ==========================================
// 3. Dashboard Metrics
// ==========================================

export function calculateTotalActiveLoans(activeMembers: any[] = []): number {
  if (!activeMembers || activeMembers.length === 0) return 0;
  return activeMembers.reduce((sum, member) => sum + Number(member.loan_amount || 0), 0);
}

export function calculateMonthlyRevenue(installments: any[] = [], monthIndex: number, year: number): number {
  if (!installments || installments.length === 0) return 0;
  
  return installments
    .filter(inst => {
      if (!inst.received_date) return false;
      const paymentDate = new Date(inst.received_date);
      return paymentDate.getMonth() === monthIndex && paymentDate.getFullYear() === year;
    })
    .reduce((sum, inst) => sum + Number(inst.amount_paid || 0), 0);
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
