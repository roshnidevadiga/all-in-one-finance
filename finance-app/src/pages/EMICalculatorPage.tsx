import React from "react";
import EMICalculator from "../components/EMICalculator";

const EMICalculatorPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      {/* You can add a page title or breadcrumbs here if needed */}
      {/* For example: <h1 className="text-2xl font-bold mb-4">EMI Calculator Tool</h1> */}
      <EMICalculator />
    </div>
  );
};

export default EMICalculatorPage;
