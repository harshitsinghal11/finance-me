"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, X, Calculator, Keyboard, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      // Check for Shift + ?
      if (e.key === "?") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close on Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-text/30 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-border sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-2xl font-bold text-text flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-brand" />
                  Help & Information
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-text-secondary transition-colors hover:bg-background hover:text-text focus:outline-none focus:ring-2 focus:ring-brand"
                  aria-label="Close help modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content Sections */}
              <div className="mt-6 space-y-8">

                {/* Interest Calculation */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-text mb-3">
                    <Calculator className="h-5 w-5 text-brand" />
                    Interest & Loan Calculation
                  </h3>
                  <div className="rounded-xl bg-background p-4 border border-border space-y-4">
                    <p className="text-sm text-text-secondary">
                      Finance-Me supports both <strong>Flat</strong> and <strong>Compound</strong> interest loans with exact decimal precision across all calculations.
                    </p>

                    <div>
                      <h4 className="font-semibold text-sm text-text mb-1">Flat Interest</h4>
                      <p className="text-xs text-text-secondary mb-2">Calculated on the entire principal amount for the total duration of the loan. Best for short-term, fixed-return lending.</p>
                      <div className="rounded-lg bg-surface p-3 font-mono text-xs text-brand border border-border shadow-sm">
                        Total Expected = Loan Amount + (Loan Amount × Rate / 100)
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm text-text mb-1">Compound Interest</h4>
                      <p className="text-xs text-text-secondary mb-2">Calculated based on the exact <strong>Tenure</strong> (Years and Months) of the loan. Automatically adjusts end-dates based on whether installments are Daily, Weekly, or Monthly.</p>
                      <div className="rounded-lg bg-surface p-3 font-mono text-xs text-purple-600 dark:text-purple-400 border border-border shadow-sm">
                        Total Expected = Loan Amount × (1 + Rate / 100) ^ Tenure in Years
                      </div>
                    </div>
                  </div>
                </section>

                {/* Glossary */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-text mb-3">
                    <BookOpen className="h-5 w-5 text-brand" />
                    Terminology Glossary
                  </h3>
                  <ul className="space-y-3">
                    <li className="rounded-xl border border-border p-3 flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-semibold text-text min-w-[120px]">Principal</span>
                      <span className="text-sm text-text-secondary">The original sum of money borrowed by the member.</span>
                    </li>
                    <li className="rounded-xl border border-border p-3 flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-semibold text-text min-w-[120px]">Tenure</span>
                      <span className="text-sm text-text-secondary">The total duration of the loan used to accurately calculate compound interest and schedule end dates.</span>
                    </li>
                    <li className="rounded-xl border border-border p-3 flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-semibold text-text min-w-[120px]">Penalty</span>
                      <span className="text-sm text-text-secondary">Additional charges manually applied for delayed or missed installment payments.</span>
                    </li>
                    <li className="rounded-xl border border-border p-3 flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-semibold text-text min-w-[120px]">Net Profit</span>
                      <span className="text-sm text-text-secondary">The actual pure revenue earned (Total Interest Collected + Penalties), isolating and ignoring the principal return.</span>
                    </li>
                  </ul>
                </section>

                {/* Keyboard Shortcuts */}
                <section>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-text mb-3">
                    <Keyboard className="h-5 w-5 text-brand" />
                    Keyboard Shortcuts
                  </h3>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                    <span className="text-sm font-medium text-text">Open Help Dialog</span>
                    <div className="flex gap-1">
                      <kbd className="rounded-md border border-border bg-surface px-2 py-1 font-sans text-xs font-semibold text-text shadow-sm">Shift</kbd>
                      <span className="text-text-secondary">+</span>
                      <kbd className="rounded-md border border-border bg-surface px-2 py-1 font-sans text-xs font-semibold text-text shadow-sm">?</kbd>
                    </div>
                  </div>
                </section>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
