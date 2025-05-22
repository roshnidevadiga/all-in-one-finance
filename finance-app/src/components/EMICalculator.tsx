import React, { useState, useCallback } from "react";

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
  score?: number;
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
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [principal, setPrincipal] = useState<string>("");
  const [duration, setDuration] = useState<string>(""); // in months
  const [annualRate, setAnnualRate] = useState<string>(""); // in percentage
  const [manualEmi, setManualEmi] = useState<string>("");
  const [startMonth, setStartMonth] = useState<number>(currentMonth);
  const [startYear, setStartYear] = useState<string>(currentYear.toString());
  const [amortizationSchedule, setAmortizationSchedule] = useState<
    AmortizationEntry[]
  >([]);
  const [calculatedEmi, setCalculatedEmi] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isCalculatingSuggestions, setIsCalculatingSuggestions] =
    useState(false);

  // State for suggestion preferences
  const [maxPrepaymentAmount, setMaxPrepaymentAmount] = useState<string>("");
  const [prepaymentFrequency, setPrepaymentFrequency] =
    useState<string>("once"); // once, annually, half-yearly
  const [preferredPrepaymentMonth, setPreferredPrepaymentMonth] =
    useState<number>(currentMonth); // 0-11
  const [maxEmiIncrease, setMaxEmiIncrease] = useState<string>("");
  const [scoreWeightInterest, setScoreWeightInterest] = useState<number>(60); // 0-100 scale for UI

  const [detailedScheduleToShow, setDetailedScheduleToShow] = useState<
    AmortizationEntry[] | null
  >(null);
  const [showDetailedScheduleModal, setShowDetailedScheduleModal] =
    useState(false);

  const handleCalculate = useCallback(() => {
    const p = parseFloat(principal);
    const n = parseInt(duration, 10);
    const rAnnual = parseFloat(annualRate);
    const sYear = parseInt(startYear, 10);

    if (isNaN(sYear) || sYear < 1900 || sYear > 2200) {
      alert("Please enter a valid start year (e.g., 1900-2200).");
      setAmortizationSchedule([]);
      return;
    }

    if (
      isNaN(p) ||
      p <= 0 ||
      isNaN(n) ||
      n <= 0 ||
      isNaN(rAnnual) ||
      rAnnual <= 0
    ) {
      alert(
        "Please enter valid positive numbers for principal, duration, and rate."
      );
      setAmortizationSchedule([]);
      setCalculatedEmi(null);
      return;
    }

    const rMonthly = rAnnual / 12 / 100;
    let currentEmi: number;

    if (manualEmi && parseFloat(manualEmi) > 0) {
      currentEmi = parseFloat(manualEmi);
    } else {
      // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
      currentEmi =
        (p * rMonthly * Math.pow(1 + rMonthly, n)) /
        (Math.pow(1 + rMonthly, n) - 1);
      if (isNaN(currentEmi) || !isFinite(currentEmi)) {
        alert(
          "Could not calculate EMI. Please check your inputs. Ensure duration is not too long or rate too small leading to instability."
        );
        setAmortizationSchedule([]);
        setCalculatedEmi(null);
        return;
      }
    }
    setCalculatedEmi(parseFloat(currentEmi.toFixed(2)));

    const schedule: AmortizationEntry[] = [];
    let remainingPrincipal = p;

    for (let i = 0; i < n; i++) {
      if (remainingPrincipal <= 0 && i > 0) break;

      const paymentDate = new Date(sYear, startMonth + i, 1);
      const displayMonthYearStr = `${
        monthNames[paymentDate.getMonth()]
      } ${paymentDate.getFullYear().toString()}`;

      const interestForMonth = remainingPrincipal * rMonthly;
      let principalPaidForMonth = currentEmi - interestForMonth;

      // Adjust EMI for the last month if remaining principal is less than calculated principal payment
      let actualEmiForMonth = currentEmi;
      if (principalPaidForMonth > remainingPrincipal) {
        principalPaidForMonth = remainingPrincipal;
        actualEmiForMonth = remainingPrincipal + interestForMonth;
      }

      const openingBalance = remainingPrincipal;
      remainingPrincipal -= principalPaidForMonth;

      // Ensure closing balance doesn't go negative due to floating point inaccuracies
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
      // If closing balance is zero, stop further calculations
      if (
        closingBalance === 0 &&
        i < n - 1 &&
        manualEmi &&
        parseFloat(manualEmi) > 0
      ) {
        const monthNumberForWarning = i + 1;
        const warningMessage =
          "Loan will be paid off by month " +
          monthNumberForWarning.toString() +
          " with the provided EMI. Stopping further schedule generation.";
        console.warn(warningMessage);
        break;
      }
    }
    setAmortizationSchedule(schedule);
    setSuggestions([]); // Clear previous suggestions when new schedule is calculated
  }, [principal, duration, annualRate, manualEmi, startMonth, startYear]);

  const calculateNewSchedule = (
    originalPrincipal: number,
    monthlyInterestRate: number,
    originalDurationMonths: number,
    emi: number,
    prepayments: { month: number; amount: number }[], // 0-indexed month
    emiIncreases: { startMonth: number; newEmi: number }[] // 0-indexed month
  ): {
    schedule: AmortizationEntry[];
    totalInterest: number;
    actualDuration: number;
  } => {
    let remainingPrincipal = originalPrincipal;
    const newSchedule: AmortizationEntry[] = [];
    let totalInterestPaid = 0;
    let currentEmi = emi;
    let actualLoanDurationMonths = 0;

    // Determine the effective start year and month from component state
    const sYear = parseInt(startYear, 10);
    const sMonth = startMonth; // Already 0-indexed

    for (let i = 0; i < originalDurationMonths * 2; i++) {
      // Allow longer loop for early payoff
      if (remainingPrincipal <= 0.01) break; // Consider paid off if negligible amount remains
      actualLoanDurationMonths = i + 1;

      // Apply EMI increases
      const emiIncreaseApplicable = emiIncreases.find(
        (inc) => inc.startMonth === i
      );
      if (emiIncreaseApplicable) {
        currentEmi = emiIncreaseApplicable.newEmi;
      }

      // Apply prepayments
      const prepaymentApplicable = prepayments.find((prep) => prep.month === i);
      if (prepaymentApplicable) {
        remainingPrincipal -= prepaymentApplicable.amount;
        if (remainingPrincipal < 0) remainingPrincipal = 0;
      }

      const interestForMonth = remainingPrincipal * monthlyInterestRate;
      let principalPaidForMonth = currentEmi - interestForMonth;
      let actualEmiForMonth = currentEmi;

      if (remainingPrincipal <= 0) {
        // Already paid off by prepayment before this EMI cycle
        newSchedule.push({
          month: i + 1,
          displayMonthYear: `${
            monthNames[new Date(sYear, sMonth + i).getMonth()]
          } ${new Date(sYear, sMonth + i).getFullYear().toString()}`,
          openingBalance: 0,
          emi: 0,
          principalPaid: 0,
          interestPaid: 0,
          closingBalance: 0,
        });
        continue; // Skip to next month if already paid off
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

      const paymentDate = new Date(sYear, sMonth + i);
      const displayMonthYearStr = `${
        monthNames[paymentDate.getMonth()]
      } ${paymentDate.getFullYear().toString()}`;

      newSchedule.push({
        month: i + 1,
        displayMonthYear: displayMonthYearStr,
        openingBalance: parseFloat(openingBalance.toFixed(2)),
        emi: parseFloat(actualEmiForMonth.toFixed(2)),
        principalPaid: parseFloat(principalPaidForMonth.toFixed(2)),
        interestPaid: parseFloat(interestForMonth.toFixed(2)),
        closingBalance: parseFloat(closingBalance.toFixed(2)),
      });
    }
    return {
      schedule: newSchedule,
      totalInterest: totalInterestPaid,
      actualDuration: actualLoanDurationMonths,
    };
  };

  const handleGenerateSuggestions = async () => {
    setIsCalculatingSuggestions(true);
    setSuggestions([]);

    const p = parseFloat(principal);
    const n = parseInt(duration, 10);
    const rAnnual = parseFloat(annualRate);
    const sYear = parseInt(startYear, 10);
    const sMonth = startMonth; // 0-indexed

    // Read suggestion preferences
    const userMaxPrepayment = parseFloat(maxPrepaymentAmount);
    const userFrequency = prepaymentFrequency;
    const userPrefPrepaymentMonth = preferredPrepaymentMonth; // 0-indexed
    const userMaxEmiIncrease = parseFloat(maxEmiIncrease);

    if (
      isNaN(p) ||
      p <= 0 ||
      isNaN(n) ||
      n <= 0 ||
      isNaN(rAnnual) ||
      rAnnual < 0 /* allow 0 rate */ ||
      !calculatedEmi ||
      calculatedEmi <= 0
    ) {
      alert(
        "Please calculate the initial amortization schedule first with valid positive inputs leading to a valid EMI."
      );
      setIsCalculatingSuggestions(false);
      return;
    }

    const rMonthly = rAnnual / 12 / 100;
    const originalTotalInterest = amortizationSchedule.reduce(
      (acc, entry) => acc + entry.interestPaid,
      0
    );
    const originalTenure = amortizationSchedule.length;

    if (originalTenure === 0) {
      alert(
        "Original amortization schedule is empty. Cannot generate suggestions."
      );
      setIsCalculatingSuggestions(false);
      return;
    }
    if (p <= 0 && originalTotalInterest <= 0) {
      // If loan principal is zero or already no interest
      setSuggestions([
        {
          id: "no_suggestions_needed",
          description:
            "Loan principal is zero or no interest is being paid. No prepayment/EMI increase suggestions needed.",
          interestSaved: 0,
          tenureReducedMonths: 0,
          revisedSchedule: [...amortizationSchedule],
        },
      ]);
      setIsCalculatingSuggestions(false);
      return;
    }

    const generatedSuggestions: Suggestion[] = [];

    // **1. Prepayment Scenarios **
    const prepaymentAmountsToTry: number[] = [];
    if (!isNaN(userMaxPrepayment) && userMaxPrepayment > 0) {
      prepaymentAmountsToTry.push(userMaxPrepayment);
    } else {
      prepaymentAmountsToTry.push(calculatedEmi, calculatedEmi * 2); // Default: 1 or 2 EMIs
    }

    if (userFrequency === "once") {
      for (const amount of prepaymentAmountsToTry) {
        // Try prepayment at different early stages or preferred month
        const prepaymentMonthsToTry = [2, 5, 11]; // 0-indexed (e.g., month 3, 6, 12)
        if (
          !isNaN(userMaxPrepayment) &&
          userMaxPrepayment > 0 &&
          userPrefPrepaymentMonth !== sMonth
        ) {
          // if user specified an amount, also try their preferred month if different from loan start month
          // and ensure it's not already in the list
          if (!prepaymentMonthsToTry.includes(userPrefPrepaymentMonth))
            prepaymentMonthsToTry.push(userPrefPrepaymentMonth);
        }
        for (const prepMonth of prepaymentMonthsToTry) {
          if (prepMonth < n && prepMonth >= 0) {
            // Ensure prepayment month is valid and within loan tenure
            const sim = calculateNewSchedule(
              p,
              rMonthly,
              n,
              calculatedEmi,
              [{ month: prepMonth, amount }],
              []
            );
            const interestSaved = originalTotalInterest - sim.totalInterest;
            const tenureReduced = originalTenure - sim.actualDuration;
            if (interestSaved > 0 || tenureReduced > 0) {
              generatedSuggestions.push({
                id: `prep_once_${amount.toString()}_m${(
                  prepMonth + 1
                ).toString()}`,
                description: `Make a one-time prepayment of ₹${amount.toFixed(
                  2
                )} in ${
                  sim.schedule[prepMonth]?.displayMonthYear ||
                  `month ${(prepMonth + 1).toString()}`
                }.`,
                interestSaved: parseFloat(interestSaved.toFixed(2)),
                tenureReducedMonths: tenureReduced,
                newTotalInterest: parseFloat(sim.totalInterest.toFixed(2)),
                newTenureMonths: sim.actualDuration,
                revisedSchedule: sim.schedule,
              });
            }
          }
        }
      }
    } else if (
      userFrequency === "annually" ||
      userFrequency === "half-yearly"
    ) {
      for (const amount of prepaymentAmountsToTry) {
        if (amount <= 0) continue; // only try positive amounts
        const prepayments: { month: number; amount: number }[] = [];
        const interval = userFrequency === "annually" ? 12 : 6;
        for (let i = 0; i < n; i++) {
          const currentPaymentDate = new Date(sYear, sMonth + i);
          if (
            currentPaymentDate.getMonth() === userPrefPrepaymentMonth &&
            i % interval ===
              (userPrefPrepaymentMonth - sMonth + n * 12) % interval
          ) {
            // Ensure it's the preferred month and respects the interval from the loan start
            if (i > 0) {
              // Don't prepay in the very first month of loan for recurring, unless it's also preferred for a one-time.
              prepayments.push({ month: i, amount });
            }
          }
        }
        if (prepayments.length > 0) {
          const sim = calculateNewSchedule(
            p,
            rMonthly,
            n,
            calculatedEmi,
            prepayments,
            []
          );
          const interestSaved = originalTotalInterest - sim.totalInterest;
          const tenureReduced = originalTenure - sim.actualDuration;
          if (interestSaved > 0 || tenureReduced > 0) {
            generatedSuggestions.push({
              id: `prep_recur_${userFrequency}_${amount.toString()}`,
              description: `Prepay ₹${amount.toFixed(2)} ${userFrequency} in ${
                monthNames[userPrefPrepaymentMonth]
              }.`,
              interestSaved: parseFloat(interestSaved.toFixed(2)),
              tenureReducedMonths: tenureReduced,
              newTotalInterest: parseFloat(sim.totalInterest.toFixed(2)),
              newTenureMonths: sim.actualDuration,
              revisedSchedule: sim.schedule,
            });
          }
        }
      }
    }

    // **2. EMI Increase Scenarios **
    const emiIncreasesToTry: number[] = [];
    if (!isNaN(userMaxEmiIncrease) && userMaxEmiIncrease > 0) {
      emiIncreasesToTry.push(calculatedEmi + userMaxEmiIncrease);
    } else {
      emiIncreasesToTry.push(
        calculatedEmi * 1.05,
        calculatedEmi * 1.1,
        calculatedEmi * 1.15
      ); // Default: 5%, 10%, 15% increase
    }

    for (const newEmi of emiIncreasesToTry) {
      if (newEmi <= calculatedEmi) continue; // Only consider actual increases
      const sim = calculateNewSchedule(
        p,
        rMonthly,
        n,
        calculatedEmi,
        [],
        [{ startMonth: 0, newEmi }]
      );
      const interestSaved = originalTotalInterest - sim.totalInterest;
      const tenureReduced = originalTenure - sim.actualDuration;
      if (interestSaved > 0 || tenureReduced > 0) {
        generatedSuggestions.push({
          id: `inc_emi_${String(newEmi.toFixed(0))}`,
          description: `Increase monthly EMI to ₹${newEmi.toFixed(
            2
          )} from the start.`,
          interestSaved: parseFloat(interestSaved.toFixed(2)),
          tenureReducedMonths: tenureReduced,
          newTotalInterest: parseFloat(sim.totalInterest.toFixed(2)),
          newTenureMonths: sim.actualDuration,
          revisedSchedule: sim.schedule,
        });
      }
    }

    // **3. Combined Scenarios (Basic) **
    const combinedPrepaymentAmount =
      !isNaN(userMaxPrepayment) && userMaxPrepayment > 0
        ? userMaxPrepayment
        : calculatedEmi; // Use user pref or 1 EMI
    if (combinedPrepaymentAmount > 0) {
      // Only if there's a prepayment amount
      const combinedPrepaymentMonth = 2; // 0-indexed (e.g., month 3)

      let combinedEmiIncrease =
        !isNaN(userMaxEmiIncrease) && userMaxEmiIncrease > 0
          ? calculatedEmi + userMaxEmiIncrease
          : calculatedEmi * 1.05; // User pref or 5% increase
      if (combinedEmiIncrease <= calculatedEmi)
        combinedEmiIncrease = calculatedEmi * 1.05; // Ensure it's an actual increase

      if (combinedPrepaymentMonth < n) {
        const simCombined = calculateNewSchedule(
          p,
          rMonthly,
          n,
          calculatedEmi,
          [
            {
              month: combinedPrepaymentMonth,
              amount: combinedPrepaymentAmount,
            },
          ],
          [{ startMonth: 0, newEmi: combinedEmiIncrease }]
        );
        const interestSavedCombined =
          originalTotalInterest - simCombined.totalInterest;
        const tenureReducedCombined =
          originalTenure - simCombined.actualDuration;

        if (interestSavedCombined > 0 || tenureReducedCombined > 0) {
          generatedSuggestions.push({
            id: `comb_prep${combinedPrepaymentAmount.toFixed(0).toString()}_m${(
              combinedPrepaymentMonth + 1
            ).toString()}_incEMI${combinedEmiIncrease.toFixed(0).toString()}`,
            description: `Prepay ₹${combinedPrepaymentAmount.toFixed(2)} in ${
              simCombined.schedule[combinedPrepaymentMonth]?.displayMonthYear ||
              `month ${(combinedPrepaymentMonth + 1).toString()}`
            }, AND increase EMI to ₹${combinedEmiIncrease.toFixed(
              2
            )} from start.`,
            interestSaved: parseFloat(interestSavedCombined.toFixed(2)),
            tenureReducedMonths: tenureReducedCombined,
            newTotalInterest: parseFloat(simCombined.totalInterest.toFixed(2)),
            newTenureMonths: simCombined.actualDuration,
            revisedSchedule: simCombined.schedule,
          });
        }
      }
    }

    // --- Scoring and Sorting ---
    let scoredSuggestions: Suggestion[] = [];
    if (generatedSuggestions.length > 0) {
      const weightInterest = scoreWeightInterest / 100;
      const weightTenure = 1 - weightInterest;
      scoredSuggestions = generatedSuggestions
        .map((s) => {
          const normalizedInterestSaved =
            originalTotalInterest > 0
              ? s.interestSaved / originalTotalInterest
              : s.interestSaved > 0
              ? 1
              : 0; // Handle 0 original interest
          const normalizedTenureReduced =
            originalTenure > 0
              ? s.tenureReducedMonths / originalTenure
              : s.tenureReducedMonths > 0
              ? 1
              : 0;
          const score =
            weightInterest * normalizedInterestSaved +
            weightTenure * normalizedTenureReduced;
          return { ...s, score };
        })
        .sort((a, b) => b.score - a.score);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (scoredSuggestions.length > 0) {
      setSuggestions(scoredSuggestions.slice(0, 5));
    } else if (p > 0) {
      // Only show if there was a loan to begin with
      setSuggestions([
        {
          id: "no_beneficial_suggestions",
          description:
            "No beneficial prepayment or EMI increase suggestions found for the current parameters and preferences that result in savings or tenure reduction.",
          interestSaved: 0,
          tenureReducedMonths: 0,
          revisedSchedule: [...amortizationSchedule],
        },
      ]);
    }
    setIsCalculatingSuggestions(false);
  };

  const openDetailedScheduleModal = (schedule: AmortizationEntry[]) => {
    setDetailedScheduleToShow(schedule);
    setShowDetailedScheduleModal(true);
  };

  const closeDetailedScheduleModal = () => {
    setShowDetailedScheduleModal(false);
    setDetailedScheduleToShow(null);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>EMI Amortization Calculator</h2>
      <div
        style={{
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px",
        }}
      >
        <div>
          <label
            htmlFor="principal"
            style={{ display: "block", marginBottom: "5px" }}
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
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Loan Duration (in Months):
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value);
            }}
            placeholder="e.g., 120"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="annualRate"
            style={{ display: "block", marginBottom: "5px" }}
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
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="manualEmi"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Current EMI Amount (₹) (Optional):
          </label>
          <input
            type="number"
            id="manualEmi"
            value={manualEmi}
            onChange={(e) => {
              setManualEmi(e.target.value);
            }}
            placeholder="If known, otherwise leave blank"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="startMonth"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Start Month:
          </label>
          <select
            id="startMonth"
            value={startMonth}
            onChange={(e) => {
              setStartMonth(parseInt(e.target.value, 10));
            }}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="startYear"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Start Year:
          </label>
          <input
            type="number"
            id="startYear"
            value={startYear}
            onChange={(e) => {
              setStartYear(e.target.value);
            }}
            placeholder={`e.g., ${String(currentYear)}`}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      {/* Suggestion Preferences Section */}
      <div
        style={{
          marginTop: "20px",
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>
          Suggestion Preferences (Optional)
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
          }}
        >
          <div>
            <label
              htmlFor="maxPrepaymentAmount"
              style={{ display: "block", marginBottom: "5px" }}
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
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="prepaymentFrequency"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Prepayment Frequency:
            </label>
            <select
              id="prepaymentFrequency"
              value={prepaymentFrequency}
              onChange={(e) => {
                setPrepaymentFrequency(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="once">Once</option>
              <option value="annually">Annually</option>
              <option value="half-yearly">Half-Yearly</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="preferredPrepaymentMonth"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Preferred Prepayment Month:
            </label>
            <select
              id="preferredPrepaymentMonth"
              value={preferredPrepaymentMonth}
              onChange={(e) => {
                setPreferredPrepaymentMonth(parseInt(e.target.value, 10));
              }}
              disabled={prepaymentFrequency === "once"} // Disable if frequency is 'once'
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {monthNames.map((name, index) => (
                <option key={index} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="maxEmiIncrease"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Max EMI Increase Per Month (₹):
            </label>
            <input
              type="number"
              id="maxEmiIncrease"
              value={maxEmiIncrease}
              onChange={(e) => {
                setMaxEmiIncrease(e.target.value);
              }}
              placeholder="e.g., 5000"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label
              htmlFor="scoreWeightInterest"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Emphasis on Interest Saved (0-100): {scoreWeightInterest}%
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
              style={{ width: "100%" }}
            />
            <div style={{ fontSize: "0.8em", color: "#555" }}>
              (Tenure Reduction Emphasis: {100 - scoreWeightInterest}%)
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Calculate Amortization
      </button>

      {calculatedEmi !== null && (
        <div style={{ marginBottom: "20px", fontSize: "1.1em" }}>
          <strong>Calculated EMI: ₹{calculatedEmi}</strong>
          {manualEmi &&
            parseFloat(manualEmi) > 0 &&
            Math.abs(calculatedEmi - parseFloat(manualEmi)) > 0.01 && (
              <span style={{ marginLeft: "10px", color: "orange" }}>
                (Note: Provided EMI differs from standard calculated EMI for the
                given inputs.)
              </span>
            )}
        </div>
      )}

      {amortizationSchedule.length > 0 && (
        <div>
          <h3>Amortization Schedule</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Payment Month / Year
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Opening Balance (₹)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  EMI (₹)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Principal Paid (₹)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Interest Paid (₹)
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Closing Balance (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {amortizationSchedule.map((entry) => (
                <tr key={entry.month}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entry.displayMonthYear}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entry.openingBalance.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entry.emi.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entry.principalPaid.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entry.interestPaid.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {entry.closingBalance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {amortizationSchedule.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => {
              void handleGenerateSuggestions();
            }}
            disabled={isCalculatingSuggestions}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745", // Green color for suggestion button
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Suggest Prepayment / Increased EMI
          </button>
        </div>
      )}

      {isCalculatingSuggestions && (
        <div style={{ marginTop: "20px", fontStyle: "italic" }}>
          Calculating suggestions...
        </div>
      )}

      {suggestions.length > 0 && !isCalculatingSuggestions && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>
            Prepayment / Increased EMI Suggestions:
          </h3>
          {suggestions[0].id === "no_beneficial_suggestions" ||
          suggestions[0].id === "no_suggestions_needed" ? (
            <p>{suggestions[0].description}</p>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                style={{
                  marginBottom: "15px",
                  paddingBottom: "10px",
                  borderBottom: "1px dashed #eee",
                }}
              >
                <p>
                  <strong>{suggestion.description}</strong>
                </p>
                <p style={{ color: "green" }}>
                  Potential Interest Saved: ₹
                  {suggestion.interestSaved.toFixed(2)}
                </p>
                <p style={{ color: "blue" }}>
                  Loan Tenure Reduced By: {suggestion.tenureReducedMonths}{" "}
                  months
                </p>
                {suggestion.newTotalInterest !== undefined && (
                  <p>
                    New Total Interest: ₹
                    {suggestion.newTotalInterest.toFixed(2)}
                  </p>
                )}
                {suggestion.newTenureMonths !== undefined && (
                  <p>New Loan Tenure: {suggestion.newTenureMonths} months</p>
                )}
                <button
                  onClick={() => {
                    openDetailedScheduleModal(suggestion.revisedSchedule);
                  }}
                  style={{
                    fontSize: "0.9em",
                    padding: "3px 8px",
                    marginTop: "5px",
                    cursor: "pointer",
                  }}
                >
                  View Detailed Schedule
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showDetailedScheduleModal && detailedScheduleToShow && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "80%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h4 style={{ marginTop: 0, marginBottom: "15px" }}>
              Detailed Amortization Schedule (Suggestion)
            </h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Payment Month / Year
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Opening Balance (₹)
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    EMI (₹)
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Principal Paid (₹)
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Interest Paid (₹)
                  </th>
                  <th
                    style={{
                      border: "1px solid #ddd",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Closing Balance (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailedScheduleToShow.map((entry) => (
                  <tr
                    key={`${entry.displayMonthYear}-${entry.month.toString()}`}
                  >
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {entry.displayMonthYear}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {entry.openingBalance.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {entry.emi.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {entry.principalPaid.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {entry.interestPaid.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {entry.closingBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={closeDetailedScheduleModal}
              style={{ marginTop: "20px", padding: "8px 15px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;
