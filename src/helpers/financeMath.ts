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
  interest_type?: string;
  installment_type?: string;
  total_installments?: string | number;
  member_name?: string;
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
    return sum + calculateTotalRepayment(
      member.loan_amount,
      member.interest_rate,
      member.interest_type,
      member.installment_type,
      member.total_installments
    );
  }, 0);
}

export function calculateDailyCashCollected(installments: MemberInstallment[] = [], date: Date): number {
  return getDailyCashInstallments(installments, date)
    .reduce((sum, inst) => sum + Number(inst.amount_paid || 0), 0);
}

export function getDailyCashInstallments(installments: MemberInstallment[] = [], date: Date): MemberInstallment[] {
  if (!installments || installments.length === 0) return [];
  
  return installments.filter(inst => {
    if (!inst.received_date) return false;
    const paymentDate = new Date(inst.received_date);
    return (
      paymentDate.getDate() === date.getDate() &&
      paymentDate.getMonth() === date.getMonth() &&
      paymentDate.getFullYear() === date.getFullYear()
    );
  });
}

export interface ProfitInstallment extends MemberInstallment {
  calculatedProfit: number;
}

export function calculateMonthlyNetProfit(installments: MemberInstallment[] = [], monthIndex: number, year: number): number {
  return getMonthlyProfitInstallments(installments, monthIndex, year)
    .reduce((sum, inst) => sum + inst.calculatedProfit, 0);
}

export function getMonthlyProfitInstallments(installments: MemberInstallment[] = [], monthIndex: number, year: number): ProfitInstallment[] {
  if (!installments || installments.length === 0) return [];
  
  return installments
    .filter(inst => {
      if (!inst.received_date) return false;
      const paymentDate = new Date(inst.received_date);
      return paymentDate.getMonth() === monthIndex && paymentDate.getFullYear() === year;
    })
    .map(inst => {
      const amountPaid = Number(inst.amount_paid || 0);
      let profit = 0;
      
      if (amountPaid > 0) {
        const penalty = Number(inst.penalty_amount || 0);
        const member = Array.isArray(inst.members) ? inst.members[0] : inst.members;
        
        if (member && member.loan_amount) {
          const loanAmount = Number(member.loan_amount || 0);
          const interestRate = Number(member.interest_rate || 0);
          const expectedRepayment = calculateTotalRepayment(
            loanAmount,
            interestRate,
            member.interest_type,
            member.installment_type,
            member.total_installments
          );
          
          const totalInterest = expectedRepayment - loanAmount;
          const interestRatio = expectedRepayment > 0 ? (totalInterest / expectedRepayment) : 0;
          
          const basePayment = Math.max(0, amountPaid - penalty);
          const profitFromBase = basePayment * interestRatio;
          
          profit = profitFromBase + penalty;
        }
      }
      
      return {
        ...inst,
        calculatedProfit: profit
      };
    })
    .filter(inst => inst.calculatedProfit > 0);
}

// ==========================================
// 4. Form Calculations (New Loan Generation)
// ==========================================

export function calculateEMI(
  loanAmount: number | string,
  annualInterestRate: number | string,
  totalInstallments: number | string,
  installmentType: string = 'Monthly'
): number {
  const p = Number(loanAmount) || 0;
  const annualRate = Number(annualInterestRate) || 0;
  const n = Number(totalInstallments) || 0;

  if (p <= 0 || n <= 0) return 0;
  if (annualRate <= 0) return p / n;

  let periodsPerYear = 12;
  if (installmentType === 'Daily') periodsPerYear = 365;
  if (installmentType === 'Weekly') periodsPerYear = 52;

  const r = (annualRate / 100) / periodsPerYear;
  
  // Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const factor = Math.pow(1 + r, n);
  const emi = (p * r * factor) / (factor - 1);
  return Number(emi.toFixed(2));
}

export function calculatePeriodsFromEMI(
  loanAmount: number | string,
  annualInterestRate: number | string,
  emiAmount: number | string,
  installmentType: string = 'Monthly'
): number {
  const p = Number(loanAmount) || 0;
  const annualRate = Number(annualInterestRate) || 0;
  const emi = Number(emiAmount) || 0;

  if (p <= 0 || emi <= 0) return 0;
  if (annualRate <= 0) return Math.ceil(p / emi);

  let periodsPerYear = 12;
  if (installmentType === 'Daily') periodsPerYear = 365;
  if (installmentType === 'Weekly') periodsPerYear = 52;

  const r = (annualRate / 100) / periodsPerYear;

  // Formula: n = ln(EMI / (EMI - P * r)) / ln(1 + r)
  // If EMI is too small to cover the interest, it will never be paid off.
  const interestOnly = p * r;
  if (emi <= interestOnly) {
    // EMI doesn't even cover the interest, return 0 or a very high number to indicate impossible
    return 0; 
  }

  const n = Math.log(emi / (emi - interestOnly)) / Math.log(1 + r);
  return Math.ceil(n);
}

export function calculateTotalRepayment(
  loanAmount: number | string,
  interestRate: number | string,
  interestType: string = 'Flat',
  installmentType: string = 'Monthly',
  totalInstallments: number | string = 0
): number {
  const loan = Number(loanAmount) || 0;
  const rate = Number(interestRate) || 0;

  if (interestType === 'Compound') {
    const emi = calculateEMI(loanAmount, interestRate, totalInstallments, installmentType);
    return emi * (Number(totalInstallments) || 0);
  }

  // Flat Interest
  return loan + (loan * (rate / 100));
}

export function calculateTotalInstallmentsCount(
  totalRepayment: number, 
  installmentAmount: number | string,
  interestType: string = 'Flat',
  loanAmount?: number | string,
  interestRate?: number | string,
  installmentType?: string
): number {
  const instAmt = Number(installmentAmount) || 0;
  if (instAmt <= 0) return 0;

  if (interestType === 'Compound') {
    return calculatePeriodsFromEMI(
      loanAmount || 0,
      interestRate || 0,
      instAmt,
      installmentType || 'Monthly'
    );
  }
  
  // Math.ceil ensures that any fractional remainder requires one final (smaller) installment
  return Math.ceil(totalRepayment / instAmt);
}
