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

export function calculateTotalRepayment(
  loanAmount: number | string,
  interestRate: number | string,
  interestType: string = 'Flat',
  installmentType: string = 'Monthly',
  totalInstallments: number | string = 0
): number {
  const loan = Number(loanAmount) || 0;
  const rate = Number(interestRate) || 0;
  const installments = Number(totalInstallments) || 0;

  let periodsPerYear = 12;
  if (installmentType === 'Daily') periodsPerYear = 365;
  else if (installmentType === 'Weekly') periodsPerYear = 52;

  const years = installments / periodsPerYear;

  if (interestType === 'Compound') {
    const total = loan * Math.pow(1 + rate / 100, years);
    return Number(total.toFixed(2));
  }

  // Flat (Simple) Interest
  const total = loan * ((100 + (rate * years)) / 100);
  return Number(total.toFixed(2));
}

export function calculateTotalInstallmentsCount(
  installmentAmount: number | string,
  loanAmount: number | string,
  interestRate: number | string,
  interestType: string = 'Flat',
  installmentType: string = 'Monthly'
): number {
  const instAmt = Number(installmentAmount) || 0;
  const loan = Number(loanAmount) || 0;
  const rate = Number(interestRate) || 0;
  if (instAmt <= 0 || loan <= 0) return 0;

  let periodsPerYear = 12;
  if (installmentType === 'Daily') periodsPerYear = 365;
  else if (installmentType === 'Weekly') periodsPerYear = 52;

  if (interestType === 'Compound') {
    // Solve N * I = P * (1 + R/100)^(N / Py) iteratively
    let n = 1;
    let currentInstAmt = (loan * Math.pow(1 + rate / 100, n / periodsPerYear)) / n;

    while (currentInstAmt > instAmt && n < 10000) {
      n++;
      currentInstAmt = (loan * Math.pow(1 + rate / 100, n / periodsPerYear)) / n;
    }

    // If the interest alone exceeds the installment amount, it's a debt trap
    if (n >= 10000) return 0;

    return n;
  }

  // Flat (Simple) Interest
  // Solve N * I = P + (P * R * N) / (100 * Py)
  // N = P / (I - (P * R) / (100 * Py))
  const interestPerPeriod = (loan * rate) / (100 * periodsPerYear);

  if (instAmt <= interestPerPeriod) {
    // Installment doesn't even cover the interest per period!
    return 0;
  }

  const n = loan / (instAmt - interestPerPeriod);
  return Math.ceil(n);
}
