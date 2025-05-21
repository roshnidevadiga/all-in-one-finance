import React, { useState } from "react";

interface AmortizationEntry {
  month: number;
  displayMonthYear: string;
  openingBalance: number;
  emi: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
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

  const handleCalculate = () => {
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
      } ${paymentDate.getFullYear()}`;

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
              width: "90%",
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
              width: "90%",
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
              width: "90%",
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
              width: "90%",
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
              width: "90%",
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
              width: "90%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
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
    </div>
  );
};

export default EMICalculator;
