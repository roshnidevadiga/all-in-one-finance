import React, { useState, useCallback, useEffect } from "react";

interface AmortizationEntry {
  month: number;
  displayMonthYear: string;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

interface Suggestion {
  id: string;
  description: string;
  interestSaved: number;
  tenureReducedMonths: number;
  newTotalInterest?: number;
  newTenureMonths?: number;
  score: number;
  revisedSchedule: AmortizationEntry[];
}

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EMICalculator: React.FC = () => {
  const currentJsMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();

  const [principal, setPrincipal] = useState<string>("");
  const [duration, setDuration] = useState<string>(""); // in months
  const [annualRate, setAnnualRate] = useState<string>(""); // in percentage
  const [manualEmi, setManualEmi] = useState<string>("");
  const [startMonth, setStartMonth] = useState<number>(currentJsMonth); // 0-11 for JS Date
  const [startYear, setStartYear] = useState<string>(currentYear.toString());

  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationEntry[]
  >([]);
  const [calculatedEmi, setCalculatedEmi] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [initialCalculationDone, setInitialCalculationDone] =
    useState<boolean>(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isCalculatingSuggestions, setIsCalculatingSuggestions] =
    useState(false);

  const [maxPrepaymentAmount, setMaxPrepaymentAmount] = useState<string>("");
  const [prepaymentFrequency, setPrepaymentFrequency] = useState<
    "once" | "annually" | "half-yearly"
  >("once");
  const [preferredPrepaymentMonth, setPreferredPrepaymentMonth] =
    useState<number>(currentJsMonth); // 0-11, for the recurring prepayments
  const [maxEmiIncrease, setMaxEmiIncrease] = useState<string>("");
  const [scoreWeightInterest, setScoreWeightInterest] = useState<number>(60);

  const [detailedScheduleToShow, setDetailedScheduleToShow] = useState<
    AmortizationEntry[] | null
  >(null);
  const [showDetailedScheduleModal, setShowDetailedScheduleModal] =
    useState(false);

  const clearErrorsAndMessages = () => {
    setErrorMessage("");
  };

  const handleCalculateAmortization = useCallback(() => {
    clearErrorsAndMessages();
    setInitialCalculationDone(false);

    const p = parseFloat(principal);
    const n = parseInt(duration, 10);
    const rAnnual = parseFloat(annualRate);
    const sYear = parseInt(startYear, 10);
    const sMonth = startMonth; // 0-indexed for JS Date

    if (isNaN(sYear) || sYear < 1900 || sYear > 2200) {
      setErrorMessage("Please enter a valid start year (e.g., 1900-2200).");
      setAmortizationSchedule([]);
      setCalculatedEmi(null);
      return;
    }

    if (
      isNaN(p) ||
      p <= 0 ||
      isNaN(n) ||
      n <= 0 ||
      isNaN(rAnnual) ||
      rAnnual < 0
    ) {
      // Rate can be 0
      setErrorMessage(
        "Please enter valid positive numbers for Principal and Duration, and a non-negative rate."
      );
      setAmortizationSchedule([]);
      setCalculatedEmi(null);
      return;
    }
    if (rAnnual === 0 && (!manualEmi || parseFloat(manualEmi) <= 0)) {
      if (p > 0 && n > 0) {
        const flatEmi = p / n;
        setCalculatedEmi(parseFloat(flatEmi.toFixed(2)));
        const schedule: AmortizationEntry[] = [];
        let remainingPrincipal = p;
        for (let i = 0; i < n; i++) {
          if (remainingPrincipal <= 0) break;
          const paymentDate = new Date(sYear, sMonth + i, 1);
          const displayMonthYearStr = `${
            monthNames[paymentDate.getMonth()]
          } ${paymentDate.getFullYear().toString()}`;
          const principalPaidForMonth = Math.min(flatEmi, remainingPrincipal);
          const openingBalance = remainingPrincipal;
          remainingPrincipal -= principalPaidForMonth;
          const closingBalance = Math.max(0, remainingPrincipal);
          schedule.push({
            month: i + 1,
            displayMonthYear: displayMonthYearStr,
            openingBalance: parseFloat(openingBalance.toFixed(2)),
            emi: parseFloat(flatEmi.toFixed(2)),
            principalPaid: parseFloat(principalPaidForMonth.toFixed(2)),
            interestPaid: 0,
            closingBalance: parseFloat(closingBalance.toFixed(2)),
          });
          if (closingBalance === 0) break;
        }
        setAmortizationSchedule(schedule);
        setSuggestions([]);
        setInitialCalculationDone(true);
        return;
      } else {
        setErrorMessage(
          "With 0% interest and no manual EMI, principal and duration must be positive."
        );
        setAmortizationSchedule([]);
        setCalculatedEmi(null);
        return;
      }
    }

    const rMonthly = rAnnual / 12 / 100;
    let currentEmiVal: number;

    if (manualEmi && parseFloat(manualEmi) > 0) {
      currentEmiVal = parseFloat(manualEmi);
    } else {
      if (rMonthly === 0) {
        // Should have been caught by rAnnual === 0, but as a safeguard
        currentEmiVal = p / n;
      } else {
        currentEmiVal =
          (p * rMonthly * Math.pow(1 + rMonthly, n)) /
          (Math.pow(1 + rMonthly, n) - 1);
      }
      if (isNaN(currentEmiVal) || !isFinite(currentEmiVal)) {
        setErrorMessage(
          "Could not calculate EMI. Please check inputs. Ensure duration is not too long or rate too small."
        );
        setAmortizationSchedule([]);
        setCalculatedEmi(null);
        return;
      }
    }

    setCalculatedEmi(parseFloat(currentEmiVal.toFixed(2)));

    const schedule: AmortizationEntry[] = [];
    let remainingPrincipal = p;
    let actualLoanTermMonths = 0;

    for (let i = 0; i < n; i++) {
      if (remainingPrincipal <= 0.005 && i > 0) {
        // Using a small threshold for early exit
        actualLoanTermMonths = i;
        break;
      }
      actualLoanTermMonths = i + 1;

      const paymentDate = new Date(sYear, sMonth + i, 1);
      const displayMonthYearStr = `${
        monthNames[paymentDate.getMonth()]
      } ${paymentDate.getFullYear().toString()}`;

      const interestForMonth = remainingPrincipal * rMonthly;
      let principalPaidForMonth = currentEmiVal - interestForMonth;
      let actualEmiForMonth = currentEmiVal;

      if (
        principalPaidForMonth > remainingPrincipal ||
        remainingPrincipal < currentEmiVal
      ) {
        if (
          remainingPrincipal + interestForMonth < currentEmiVal ||
          i === n - 1
        ) {
          actualEmiForMonth = remainingPrincipal + interestForMonth;
          principalPaidForMonth = remainingPrincipal;
        }
      }

      const openingBalance = remainingPrincipal;
      remainingPrincipal -= principalPaidForMonth;
      const closingBalance = Math.max(0, remainingPrincipal);

      schedule.push({
        month: i + 1,
        displayMonthYear: displayMonthYearStr,
        openingBalance: parseFloat(openingBalance.toFixed(2)),
        emi: parseFloat(actualEmiForMonth.toFixed(2)),
        principalPaid: parseFloat(principalPaidForMonth.toFixed(2)),
        interestPaid: parseFloat(interestForMonth.toFixed(2)),
        closingBalance: parseFloat(closingBalance.toFixed(2)),
      });

      if (closingBalance === 0) {
        actualLoanTermMonths = i + 1;
        if (i < n - 1 && manualEmi && parseFloat(manualEmi) > 0) {
          console.warn(
            "Loan will be paid off by month " +
              actualLoanTermMonths +
              " with the provided EMI."
          );
        }
        break;
      }
    }
    setAmortizationSchedule(schedule);
    setSuggestions([]);
    setInitialCalculationDone(true);
  }, [principal, duration, annualRate, manualEmi, startMonth, startYear]);

  const calculateNewSchedule = useCallback(
    (
      originalPrincipal: number,
      monthlyInterestRate: number,
      originalDurationMonths: number,
      baseEmi: number,
      prepayments: { month: number; amount: number }[], // 0-indexed month from loan start
      emiIncreases: { startMonth: number; newEmi: number }[], // 0-indexed month from loan start
      currentScheduleStartYear: number,
      currentScheduleStartMonth: number // 0-indexed
    ): {
      schedule: AmortizationEntry[];
      totalInterest: number;
      actualDuration: number;
    } => {
      let remainingPrincipal = originalPrincipal;
      const newSchedule: AmortizationEntry[] = [];
      let totalInterestPaid = 0;
      let currentEmi = baseEmi;
      let actualLoanDurationMonths = 0;

      for (let i = 0; i < originalDurationMonths * 2; i++) {
        // Loop longer for early payoff
        if (remainingPrincipal <= 0.01) break;
        actualLoanDurationMonths = i + 1;

        const emiIncreaseApplicable = emiIncreases.find(
          (inc) => inc.startMonth === i
        );
        if (emiIncreaseApplicable) {
          currentEmi = emiIncreaseApplicable.newEmi;
        }

        const prepaymentApplicable = prepayments.find(
          (prep) => prep.month === i
        );
        if (prepaymentApplicable) {
          remainingPrincipal -= prepaymentApplicable.amount;
          if (remainingPrincipal < 0) remainingPrincipal = 0;
        }

        const interestForMonth = remainingPrincipal * monthlyInterestRate;
        let principalPaidForMonth = currentEmi - interestForMonth;
        let actualEmiForMonth = currentEmi;

        const paymentDate = new Date(
          currentScheduleStartYear,
          currentScheduleStartMonth + i,
          1
        );
        const displayMonthYearStr = `${
          monthNames[paymentDate.getMonth()]
        } ${paymentDate.getFullYear().toString()}`;

        if (remainingPrincipal <= 0) {
          // Paid off by prepayment
          newSchedule.push({
            month: i + 1,
            displayMonthYear: displayMonthYearStr,
            openingBalance: 0,
            emi: 0,
            principalPaid: 0,
            interestPaid: 0,
            closingBalance: 0,
          });
          continue;
        }

        if (
          principalPaidForMonth > remainingPrincipal ||
          (remainingPrincipal < currentEmi && remainingPrincipal > 0)
        ) {
          principalPaidForMonth = remainingPrincipal;
          actualEmiForMonth = remainingPrincipal + interestForMonth;
        }

        totalInterestPaid += interestForMonth;
        const openingBalance = remainingPrincipal;
        remainingPrincipal -= principalPaidForMonth;
        const closingBalance = Math.max(0, remainingPrincipal);

        newSchedule.push({
          month: i + 1,
          displayMonthYear: displayMonthYearStr,
          openingBalance: parseFloat(openingBalance.toFixed(2)),
          emi: parseFloat(actualEmiForMonth.toFixed(2)),
          principalPaid: parseFloat(principalPaidForMonth.toFixed(2)),
          interestPaid: parseFloat(interestForMonth.toFixed(2)),
          closingBalance: parseFloat(closingBalance.toFixed(2)),
        });
        if (closingBalance === 0) break;
      }
      return {
        schedule: newSchedule,
        totalInterest: totalInterestPaid,
        actualDuration: actualLoanDurationMonths,
      };
    },
    [startYear, startMonth]
  ); // Added dependencies

  const handleGenerateSuggestions = useCallback(async () => {
    clearErrorsAndMessages();
    if (
      !initialCalculationDone ||
      amortizationSchedule.length === 0 ||
      !calculatedEmi
    ) {
      setErrorMessage(
        "Please calculate the initial amortization schedule first."
      );
      return;
    }

    setIsCalculatingSuggestions(true);
    setSuggestions([]);

    const p = parseFloat(principal);
    const n = amortizationSchedule.length; // Use actual original tenure
    const rAnnual = parseFloat(annualRate);

    const sYear = parseInt(startYear, 10);
    const sMonth = startMonth; // 0-indexed

    const userMaxPrep = parseFloat(maxPrepaymentAmount);
    const userPrefMonthForOnce = preferredPrepaymentMonth; // This is for "once" type, 0-11
    const userMaxEmiInc = parseFloat(maxEmiIncrease);

    const weightInt = scoreWeightInterest / 100;
    const weightTen = 1 - weightInt;

    if (p <= 0 || n <= 0 || rAnnual < 0 || calculatedEmi <= 0) {
      setErrorMessage(
        "Cannot generate suggestions with invalid initial loan parameters or zero EMI."
      );
      setIsCalculatingSuggestions(false);
      return;
    }
    const rMonthly = rAnnual / 12 / 100;
    const originalTotalInterest = amortizationSchedule.reduce(
      (acc, entry) => acc + entry.interestPaid,
      0
    );
    const originalTenure = n;

    if (originalTotalInterest <= 0 && p > 0) {
      // Loan exists but no interest (e.g. 0% rate)
      setSuggestions([
        {
          id: "no_interest_loan",
          description:
            "Loan has no interest. Prepayments will only reduce tenure.",
          interestSaved: 0,
          tenureReducedMonths: 0,
          score: 0,
          revisedSchedule: [...amortizationSchedule],
        },
      ]);
      setIsCalculatingSuggestions(false);
      return;
    }
    if (p <= 0) {
      // No loan to optimize
      setSuggestions([
        {
          id: "no_loan_to_optimize",
          description: "No loan amount to optimize.",
          interestSaved: 0,
          tenureReducedMonths: 0,
          score: 0,
          revisedSchedule: [],
        },
      ]);
      setIsCalculatingSuggestions(false);
      return;
    }

    const allIndividualSuggestions: Suggestion[] = [];

    // Scenario 1: One-time Prepayments
    const oneTimePrepaymentAmounts =
      !isNaN(userMaxPrep) && userMaxPrep > 0
        ? [userMaxPrep]
        : [calculatedEmi, calculatedEmi * 3];
    const oneTimePrepaymentMonths = new Set<number>();
    // Iterate up to min(n-1, 60 months = 5 years)
    const maxIterMonthsPrepayment = Math.min(originalTenure - 1, 60);
    if (maxIterMonthsPrepayment > 0) {
      for (let i = 0; i < 12 && i < maxIterMonthsPrepayment; i++)
        oneTimePrepaymentMonths.add(i); // Each month for 1st year
      for (let i = 12; i < maxIterMonthsPrepayment; i += 3)
        oneTimePrepaymentMonths.add(i); // Quarterly after 1st year
      if (
        userPrefMonthForOnce < originalTenure - 1 &&
        userPrefMonthForOnce >= 0
      )
        oneTimePrepaymentMonths.add(userPrefMonthForOnce); // Add user preferred if valid
      // Fallback for very short loans
      if (oneTimePrepaymentMonths.size === 0 && originalTenure > 1)
        oneTimePrepaymentMonths.add(
          Math.min(1, originalTenure - 2 >= 0 ? originalTenure - 2 : 0)
        );

      for (const amount of oneTimePrepaymentAmounts) {
        if (amount <= 0) continue;
        for (const prepMonth of Array.from(oneTimePrepaymentMonths).sort(
          (a, b) => a - b
        )) {
          // Ensure sorted
          if (prepMonth < 0 || prepMonth >= originalTenure - 1) continue; // Safety check
          const sim = calculateNewSchedule(
            p,
            rMonthly,
            originalTenure,
            calculatedEmi,
            [{ month: prepMonth, amount }],
            [],
            sYear,
            sMonth
          );
          const interestSaved = originalTotalInterest - sim.totalInterest;
          const tenureReduced = originalTenure - sim.actualDuration;
          if (interestSaved > 0.01 || tenureReduced > 0) {
            allIndividualSuggestions.push({
              id: `prep_one_${amount.toString()}_m${(
                prepMonth + 1
              ).toString()}`,
              description: `One-time prepayment of ₹${amount.toFixed(2)} in ${
                sim.schedule[prepMonth]?.displayMonthYear ||
                `Month ${(prepMonth + 1).toString()}`
              }.`,
              interestSaved: parseFloat(interestSaved.toFixed(2)),
              tenureReducedMonths: tenureReduced,
              newTotalInterest: parseFloat(sim.totalInterest.toFixed(2)),
              newTenureMonths: sim.actualDuration,
              score: 0,
              revisedSchedule: sim.schedule,
            });
          }
        }
      }
    }

    // Scenario 2: Recurring Prepayments (Annual/Half-Yearly)
    if (
      prepaymentFrequency === "annually" ||
      prepaymentFrequency === "half-yearly"
    ) {
      const recurringPrepaymentAmount =
        !isNaN(userMaxPrep) && userMaxPrep > 0 ? userMaxPrep : calculatedEmi; // Default to 1 EMI
      if (recurringPrepaymentAmount > 0) {
        const prepayments: { month: number; amount: number }[] = [];
        const interval = prepaymentFrequency === "annually" ? 12 : 6;
        // preferredPrepaymentMonth state (0-11) is used to determine the month of the year for these recurring payments.
        // Example: if loan starts Jan 2024, preferredPrepaymentMonth is Feb (1), first annual prep is Feb 2025.
        for (let i = 0; i < originalTenure; i++) {
          const currentPaymentDate = new Date(sYear, sMonth + i, 1);
          if (currentPaymentDate.getMonth() === preferredPrepaymentMonth) {
            // preferredPrepaymentMonth is 0-11
            // Check if this month is an "interval" month from the *start* of the preferred month series.
            // Find first occurrence of preferredPrepaymentMonth on or after loan start.
            let firstPrefMonthOccurrence = 0;
            const tempDateCheck = new Date(sYear, sMonth, 1); // Renamed to avoid conflict, made const
            while (tempDateCheck.getMonth() !== preferredPrepaymentMonth) {
              tempDateCheck.setMonth(tempDateCheck.getMonth() + 1);
              firstPrefMonthOccurrence++;
            }
            // Now check if 'i' is 'firstPrefMonthOccurrence' plus a multiple of 'interval'
            if (
              (i - firstPrefMonthOccurrence) % interval === 0 &&
              i - firstPrefMonthOccurrence >= 0
            ) {
              if (i > 0) {
                // Don't prepay in month 0 of loan
                prepayments.push({
                  month: i,
                  amount: recurringPrepaymentAmount,
                });
              }
            }
          }
        }
        if (prepayments.length > 0) {
          const sim = calculateNewSchedule(
            p,
            rMonthly,
            originalTenure,
            calculatedEmi,
            prepayments,
            [],
            sYear,
            sMonth
          );
          const interestSaved = originalTotalInterest - sim.totalInterest;
          const tenureReduced = originalTenure - sim.actualDuration;
          if (interestSaved > 0.01 || tenureReduced > 0) {
            allIndividualSuggestions.push({
              id: `prep_rec_${prepaymentFrequency}_${recurringPrepaymentAmount.toString()}`,
              description: `Prepay ₹${recurringPrepaymentAmount.toFixed(
                2
              )} ${prepaymentFrequency} in ${
                monthNames[preferredPrepaymentMonth]
              }.`,
              interestSaved: parseFloat(interestSaved.toFixed(2)),
              tenureReducedMonths: tenureReduced,
              newTotalInterest: parseFloat(sim.totalInterest.toFixed(2)),
              newTenureMonths: sim.actualDuration,
              score: 0,
              revisedSchedule: sim.schedule,
            });
          }
        }
      }
    }

    // Scenario 3: EMI Increase
    const emiIncreasesToConsider =
      !isNaN(userMaxEmiInc) && userMaxEmiInc > 0
        ? [calculatedEmi + userMaxEmiInc]
        : [calculatedEmi * 1.05, calculatedEmi * 1.1];
    for (const newEmi of emiIncreasesToConsider) {
      if (newEmi <= calculatedEmi) continue;
      const sim = calculateNewSchedule(
        p,
        rMonthly,
        originalTenure,
        calculatedEmi,
        [],
        [{ startMonth: 0, newEmi }],
        sYear,
        sMonth
      );
      const interestSaved = originalTotalInterest - sim.totalInterest;
      const tenureReduced = originalTenure - sim.actualDuration;
      if (interestSaved > 0.01 || tenureReduced > 0) {
        allIndividualSuggestions.push({
          id: `emi_inc_${newEmi.toFixed(0)}`,
          description: `Increase EMI to ₹${newEmi.toFixed(2)} from start.`,
          interestSaved: parseFloat(interestSaved.toFixed(2)),
          tenureReducedMonths: tenureReduced,
          newTotalInterest: parseFloat(sim.totalInterest.toFixed(2)),
          newTenureMonths: sim.actualDuration,
          score: 0,
          revisedSchedule: sim.schedule,
        });
      }
    }

    // Score all individual suggestions
    const scoredIndividualSuggestions = allIndividualSuggestions
      .map((s) => {
        const normIntSaved =
          originalTotalInterest > 0
            ? s.interestSaved / originalTotalInterest
            : s.interestSaved > 0
            ? 1
            : 0;
        const normTenReduced =
          originalTenure > 0
            ? s.tenureReducedMonths / originalTenure
            : s.tenureReducedMonths > 0
            ? 1
            : 0;
        const score =
          (weightInt * normIntSaved + weightTen * normTenReduced) * 100; // Scale score
        return { ...s, score: parseFloat(score.toFixed(2)) };
      })
      .sort((a, b) => b.score - a.score);

    const combinedSuggestions: Suggestion[] = [];

    // Attempt combined scenarios
    const bestOneTimePrep = scoredIndividualSuggestions.find(
      (s) =>
        s.id.startsWith("prep_one_") && s.interestSaved > calculatedEmi * 0.05
    );

    // C1: Best One-Time Prepayment + Modest (5%) EMI Increase
    if (bestOneTimePrep) {
      const prepDetails = bestOneTimePrep.id.split("_");
      const prepAmount = parseFloat(prepDetails[2]);
      const prepMonth = parseInt(prepDetails[3].substring(1), 10) - 1;
      const modestEmiIncreaseVal = calculatedEmi * 1.05;
      const simC1 = calculateNewSchedule(
        p,
        rMonthly,
        originalTenure,
        calculatedEmi,
        [{ month: prepMonth, amount: prepAmount }],
        [{ startMonth: 0, newEmi: modestEmiIncreaseVal }],
        sYear,
        sMonth
      );
      const intSavedC1 = originalTotalInterest - simC1.totalInterest;
      const tenRedC1 = originalTenure - simC1.actualDuration;
      if (intSavedC1 > 0.01 || tenRedC1 > 0) {
        const normIntSaved =
          originalTotalInterest > 0
            ? intSavedC1 / originalTotalInterest
            : intSavedC1 > 0
            ? 1
            : 0;
        const normTenReduced =
          originalTenure > 0 ? tenRedC1 / originalTenure : tenRedC1 > 0 ? 1 : 0;
        const score =
          (weightInt * normIntSaved + weightTen * normTenReduced) * 100;
        combinedSuggestions.push({
          id: "comb_best_prep_mod_emi",
          description: `Combine: (${
            bestOneTimePrep.description
          }) AND 5% EMI increase (to ₹${modestEmiIncreaseVal.toFixed(2)}).`,
          interestSaved: parseFloat(intSavedC1.toFixed(2)),
          tenureReducedMonths: tenRedC1,
          newTotalInterest: parseFloat(simC1.totalInterest.toFixed(2)),
          newTenureMonths: simC1.actualDuration,
          score: parseFloat(score.toFixed(2)),
          revisedSchedule: simC1.schedule,
        });
      }
    }

    // C2: User Max Prepayment (if specified) + User Max EMI Increase (if specified)
    if (
      !isNaN(userMaxPrep) &&
      userMaxPrep > 0 &&
      !isNaN(userMaxEmiInc) &&
      userMaxEmiInc > 0
    ) {
      const customPrepMonth =
        userPrefMonthForOnce < originalTenure - 1 && userPrefMonthForOnce >= 0
          ? userPrefMonthForOnce
          : Math.min(1, originalTenure - 2 >= 0 ? originalTenure - 2 : 0);
      const customNewEmi = calculatedEmi + userMaxEmiInc;
      if (customNewEmi > calculatedEmi) {
        const simC2 = calculateNewSchedule(
          p,
          rMonthly,
          originalTenure,
          calculatedEmi,
          [{ month: customPrepMonth, amount: userMaxPrep }],
          [{ startMonth: 0, newEmi: customNewEmi }],
          sYear,
          sMonth
        );
        const intSavedC2 = originalTotalInterest - simC2.totalInterest;
        const tenRedC2 = originalTenure - simC2.actualDuration;
        if (intSavedC2 > 0.01 || tenRedC2 > 0) {
          const normIntSaved =
            originalTotalInterest > 0
              ? intSavedC2 / originalTotalInterest
              : intSavedC2 > 0
              ? 1
              : 0;
          const normTenReduced =
            originalTenure > 0
              ? tenRedC2 / originalTenure
              : tenRedC2 > 0
              ? 1
              : 0;
          const score =
            (weightInt * normIntSaved + weightTen * normTenReduced) * 100;
          combinedSuggestions.push({
            id: "comb_user_max_pref",
            description: `Combine User Max: Prepay ₹${userMaxPrep.toFixed(
              2
            )} in ${
              monthNames[customPrepMonth]
            } AND increase EMI to ₹${customNewEmi.toFixed(2)}.`,
            interestSaved: parseFloat(intSavedC2.toFixed(2)),
            tenureReducedMonths: tenRedC2,
            newTotalInterest: parseFloat(simC2.totalInterest.toFixed(2)),
            newTenureMonths: simC2.actualDuration,
            score: parseFloat(score.toFixed(2)),
            revisedSchedule: simC2.schedule,
          });
        }
      }
    }

    const allSuggestions = [
      ...scoredIndividualSuggestions,
      ...combinedSuggestions,
    ].sort((a, b) => b.score - a.score);

    // Filter out suggestions that are essentially "worse" than higher-scored ones offering similar strategy
    const finalFilteredSuggestions: Suggestion[] = [];
    const addedStrategies = new Set<string>(); // e.g. "prep_one", "emi_inc", "comb"

    for (const s of allSuggestions) {
      let strategyType = s.id.split("_")[0]; // "prep", "emi", "comb"
      if (s.id.startsWith("prep_one")) strategyType = "prep_one";
      if (s.id.startsWith("prep_rec")) strategyType = "prep_rec";

      if (
        !addedStrategies.has(strategyType) ||
        s.score >
          (finalFilteredSuggestions.find((fs) => fs.id.startsWith(strategyType))
            ?.score ?? -1)
      ) {
        if (addedStrategies.has(strategyType)) {
          // if replacing, remove old one
          const indexToRemove = finalFilteredSuggestions.findIndex((fs) =>
            fs.id.startsWith(strategyType)
          );
          if (indexToRemove > -1)
            finalFilteredSuggestions.splice(indexToRemove, 1);
        }
        finalFilteredSuggestions.push(s);
        addedStrategies.add(strategyType);
      }
    }
    // Re-sort after potential replacements and ensure top 5 overall unique strategies
    finalFilteredSuggestions.sort((a, b) => b.score - a.score);

    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate processing time

    if (finalFilteredSuggestions.length > 0) {
      setSuggestions(finalFilteredSuggestions.slice(0, 5));
    } else {
      setSuggestions([
        {
          id: "no_beneficial_suggestions",
          description:
            "No beneficial prepayment or EMI increase suggestions found that significantly improve upon the original schedule with current preferences.",
          interestSaved: 0,
          tenureReducedMonths: 0,
          score: 0,
          revisedSchedule: [...amortizationSchedule],
        },
      ]);
    }
    setIsCalculatingSuggestions(false);
  }, [
    principal,
    duration,
    annualRate,
    calculatedEmi,
    amortizationSchedule,
    maxPrepaymentAmount,
    prepaymentFrequency,
    preferredPrepaymentMonth,
    maxEmiIncrease,
    scoreWeightInterest,
    initialCalculationDone,
    startYear,
    startMonth,
    calculateNewSchedule,
  ]);

  const openDetailedScheduleModal = (schedule: AmortizationEntry[]) => {
    setDetailedScheduleToShow(schedule);
    setShowDetailedScheduleModal(true);
  };

  const closeDetailedScheduleModal = () => {
    setShowDetailedScheduleModal(false);
    setDetailedScheduleToShow(null);
  };

  // Effect to clear suggestions if primary loan parameters change
  useEffect(() => {
    setSuggestions([]);
    setInitialCalculationDone(false); // Reset this flag too
    setCalculatedEmi(null); // Also clear calculated EMI display
    // Optionally clear amortization schedule too, or let user re-calculate
    // setAmortizationSchedule([]);
  }, [principal, duration, annualRate, manualEmi, startMonth, startYear]);

  return (
    <div className="font-sans text-foreground">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">
        Plan & Optimize Your Loan
      </h2>

      {/* Inputs Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Loan Parameters Section */}
        <div className="lg:col-span-7 p-5 border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-background">
          <h3 className="text-xl font-semibold mb-5 text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">1</span>
            </span>
            Loan Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label
                htmlFor="principal"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Principal Amount (₹):
              </label>
              <input
                type="number"
                id="principal"
                value={principal}
                onChange={(e) => {
                  setPrincipal(e.target.value);
                }}
                placeholder="e.g., 100000"
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="duration"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Loan Duration (Months):
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                }}
                placeholder="e.g., 120"
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="annualRate"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Annual Interest Rate (%):
              </label>
              <input
                type="number"
                id="annualRate"
                value={annualRate}
                onChange={(e) => {
                  setAnnualRate(e.target.value);
                }}
                placeholder="e.g., 8.5"
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="manualEmi"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Current EMI (₹) (Optional):
              </label>
              <input
                type="number"
                id="manualEmi"
                value={manualEmi}
                onChange={(e) => {
                  setManualEmi(e.target.value);
                }}
                placeholder="If loan exists, else blank"
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="startMonth"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Loan Start Month:
              </label>
              <select
                id="startMonth"
                value={startMonth}
                onChange={(e) => {
                  setStartMonth(parseInt(e.target.value, 10));
                }}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
              >
                {monthNames.map((name, index) => (
                  <option
                    key={index}
                    value={index}
                    className="dark:bg-slate-700 dark:text-white"
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="startYear"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Loan Start Year:
              </label>
              <input
                type="number"
                id="startYear"
                value={startYear}
                onChange={(e) => {
                  setStartYear(e.target.value);
                }}
                placeholder={`e.g., ${currentYear.toString()}`}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Suggestion Preferences Section */}
        <div className="lg:col-span-5 p-5 border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-background">
          <h3 className="text-xl font-semibold mb-5 text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">2</span>
            </span>
            Optimization Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <label
                htmlFor="maxPrepaymentAmount"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Max One-Time Prepayment (₹):
              </label>
              <input
                type="number"
                id="maxPrepaymentAmount"
                value={maxPrepaymentAmount}
                onChange={(e) => {
                  setMaxPrepaymentAmount(e.target.value);
                }}
                placeholder="e.g., 50000"
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="prepaymentFrequency"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Recurring Prepayment:
              </label>
              <select
                id="prepaymentFrequency"
                value={prepaymentFrequency}
                onChange={(e) => {
                  setPrepaymentFrequency(
                    e.target.value as "once" | "annually" | "half-yearly"
                  );
                }}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
              >
                <option
                  value="once"
                  className="dark:bg-slate-700 dark:text-white"
                >
                  None (Consider One-Time Only)
                </option>
                <option
                  value="annually"
                  className="dark:bg-slate-700 dark:text-white"
                >
                  Annually
                </option>
                <option
                  value="half-yearly"
                  className="dark:bg-slate-700 dark:text-white"
                >
                  Half-Yearly
                </option>
              </select>
            </div>
            <div className={prepaymentFrequency === "once" ? "opacity-50" : ""}>
              <label
                htmlFor="preferredPrepaymentMonth"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Recurring Prepayment Month:
              </label>
              <select
                id="preferredPrepaymentMonth"
                value={preferredPrepaymentMonth}
                onChange={(e) => {
                  setPreferredPrepaymentMonth(parseInt(e.target.value, 10));
                }}
                disabled={prepaymentFrequency === "once"}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {monthNames.map((name, index) => (
                  <option
                    key={index}
                    value={index}
                    className="dark:bg-slate-700 dark:text-white"
                  >
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="maxEmiIncrease"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Max EMI Increase Amount (₹):
              </label>
              <input
                type="number"
                id="maxEmiIncrease"
                value={maxEmiIncrease}
                onChange={(e) => {
                  setMaxEmiIncrease(e.target.value);
                }}
                placeholder="e.g., 1000"
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:placeholder-slate-400 dark:text-white transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="scoreWeightInterest"
                className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Optimization Focus (Interest Saved %):{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {scoreWeightInterest}%
                </span>
              </label>
              <input
                type="range"
                id="scoreWeightInterest"
                min="0"
                max="100"
                step="5"
                value={scoreWeightInterest}
                onChange={(e) => {
                  setScoreWeightInterest(parseInt(e.target.value, 10));
                }}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>More Tenure Reduction</span>
                <span>More Interest Saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Calculated EMI Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <button
          onClick={handleCalculateAmortization}
          className="w-full sm:w-auto px-6 py-3 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-md focus:ring-4 focus:outline-none focus:ring-primary/30 transition-all duration-150 ease-in-out"
        >
          Calculate Amortization
        </button>
        {calculatedEmi !== null && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary text-center sm:text-left shadow-sm">
            <strong>Calculated EMI: ₹{calculatedEmi.toFixed(2)}</strong>
            {manualEmi &&
              parseFloat(manualEmi) > 0 &&
              Math.abs(calculatedEmi - parseFloat(manualEmi)) > 0.01 && (
                <span className="block sm:inline sm:ml-2 text-xs text-amber-600">
                  (Manual EMI differs)
                </span>
              )}
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="my-4 p-3.5 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg shadow-sm">
          <p>
            <strong>Error:</strong> {errorMessage}
          </p>
        </div>
      )}

      {/* Amortization Schedule Table */}
      {amortizationSchedule.length > 0 && !errorMessage && (
        <div className="mt-8 p-2 bg-background border border-border shadow-md hover:shadow-lg transition-all duration-200 rounded-xl overflow-hidden">
          <h3 className="text-xl font-semibold mb-4 px-4 pt-4 text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">3</span>
            </span>
            Amortization Schedule
          </h3>
          <div className="overflow-x-auto max-h-[500px] styled-scrollbar">
            {" "}
            {/* Added styled-scrollbar for potential custom scrollbar styling via global CSS */}
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 sticky top-0 z-10">
                <tr>
                  {[
                    "Month No.",
                    "Month-Year",
                    "Opening Balance (₹)",
                    "EMI (₹)",
                    "Principal (₹)",
                    "Interest (₹)",
                    "Closing Balance (₹)",
                  ].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {header === "Month-Year"
                        ? `${monthNames[startMonth]} ${startYear.toString()}`
                        : header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {amortizationSchedule.map((entry) => (
                  <tr
                    key={entry.month}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {entry.month}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {entry.displayMonthYear}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      {entry.openingBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      {entry.emi.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right text-green-600">
                      {entry.principalPaid.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right text-red-600">
                      {entry.interestPaid.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right font-medium">
                      {entry.closingBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {amortizationSchedule.length > 0 && (
            <div className="mt-6 mb-2 px-4 pb-2 text-center">
              <button
                onClick={() => {
                  void handleGenerateSuggestions();
                }}
                disabled={isCalculatingSuggestions}
                className="px-6 py-3 text-base font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:outline-none focus:ring-green-300 transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCalculatingSuggestions
                  ? "Optimizing..."
                  : "Suggest Optimizations"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Suggestions Display */}
      {isCalculatingSuggestions && (
        <div className="mt-6 p-4 text-center text-muted-foreground">
          <div role="status" className="inline-flex items-center">
            <svg
              aria-hidden="true"
              className="w-6 h-6 mr-2 text-muted animate-spin fill-primary"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="ml-2 text-lg">
              Calculating optimal suggestions... Please wait.
            </span>
          </div>
        </div>
      )}

      {suggestions.length > 0 && !isCalculatingSuggestions && (
        <div className="mt-8 p-5 bg-background border border-border shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
          <h3 className="text-xl font-semibold mb-5 text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">4</span>
            </span>
            Top Loan Optimization Suggestions
          </h3>
          {suggestions[0].id === "no_beneficial_suggestions" ||
          suggestions[0].id === "no_interest_loan" ||
          suggestions[0].id === "no_loan_to_optimize" ? (
            <p className="p-3 text-muted-foreground bg-muted/50 rounded-md">
              {suggestions[0].description}
            </p>
          ) : (
            <div className="space-y-5">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className="p-4 border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-background"
                >
                  <p className="font-semibold text-md text-primary mb-2">
                    <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-bold mr-2">
                      #{index + 1}
                    </span>
                    {suggestion.description} (Score:{" "}
                    {suggestion.score.toFixed(1)})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p className="text-green-600">
                      Interest Saved:{" "}
                      <span className="font-medium">
                        ₹{suggestion.interestSaved.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-blue-600">
                      Tenure Reduced:{" "}
                      <span className="font-medium">
                        {suggestion.tenureReducedMonths} months
                      </span>
                    </p>
                    {suggestion.newTotalInterest !== undefined && (
                      <p className="text-muted-foreground">
                        New Total Interest: ₹
                        {suggestion.newTotalInterest.toFixed(2)}
                      </p>
                    )}
                    {suggestion.newTenureMonths !== undefined && (
                      <p className="text-muted-foreground">
                        New Tenure: {suggestion.newTenureMonths} months
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      openDetailedScheduleModal(suggestion.revisedSchedule);
                    }}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                  >
                    View Detailed Schedule
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Schedule Modal */}
      {showDetailedScheduleModal && detailedScheduleToShow && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"
          onClick={() => {
            closeDetailedScheduleModal();
          }}
        >
          <div
            className="bg-background p-5 md:p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-primary">
                Detailed Amortization (Suggestion)
              </h4>
              <button
                onClick={() => {
                  closeDetailedScheduleModal();
                }}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto styled-scrollbar flex-grow">
              <table className="min-w-full text-sm text-left text-slate-700 dark:text-slate-300">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300 sticky top-0 z-10">
                  <tr>
                    {[
                      "Month No.",
                      "Month-Year",
                      "Opening Balance (₹)",
                      "EMI (₹)",
                      "Principal (₹)",
                      "Interest (₹)",
                      "Closing Balance (₹)",
                    ].map((header) => (
                      <th
                        key={header}
                        scope="col"
                        className="px-4 py-3 font-medium whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {detailedScheduleToShow.map((entry, idx) => (
                    <tr
                      key={`${entry.month}-${idx}`}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {entry.month}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {entry.displayMonthYear}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        {entry.openingBalance.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right">
                        {entry.emi.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right text-green-600 dark:text-green-400">
                        {entry.principalPaid.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right text-red-600 dark:text-red-400">
                        {entry.interestPaid.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-right font-medium">
                        {entry.closingBalance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => {
                  closeDetailedScheduleModal();
                }}
                className="px-5 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;
