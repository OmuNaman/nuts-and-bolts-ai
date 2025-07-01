// FILE: src/components/MatrixInput.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { Lock } from "lucide-react"; // Import Lock icon

interface MatrixInputProps {
  matrix: number[][]; // This is the numeric matrix from the parent
  onChange: (matrix: number[][]) => void; // Callback to update the numeric matrix
  errors?: boolean[][];
  readonly?: boolean; // Used for disabling input
  isCompleted?: boolean; // Added to help with placeholder logic
}

export function MatrixInput({
  matrix,
  onChange,
  errors,
  readonly,
  isCompleted,
}: MatrixInputProps) {
  const { isDark } = useTheme();

  // Internal state to hold string values of inputs for display purposes
  const [displayValues, setDisplayValues] = useState<string[][]>([]);

  useEffect(() => {
    // When the numeric matrix prop changes (e.g., step change, reset, initial load),
    // update the displayValues.
    // If a cell is 0 and the input is active (not readonly/completed),
    // set its displayValue to an empty string to show the placeholder.
    setDisplayValues(
      matrix.map((row) =>
        row.map((cellValue) => {
          if (cellValue === 0 && !readonly && !isCompleted) {
            return ""; // Show placeholder for 0 in active inputs
          }
          return cellValue.toString(); // Otherwise, show the number as a string
        })
      )
    );
  }, [matrix, readonly, isCompleted]); // Re-run when these change

  const handleInputChange = (i: number, j: number, value: string) => {
    if (readonly) return;

    const newDisplayValues = displayValues.map((row) => [...row]);
    newDisplayValues[i][j] = value;
    setDisplayValues(newDisplayValues);

    // OPTIONAL: Live update parent for immediate validation feedback (can be costly)
    // If you want live validation as user types:
    // let numericValue = parseFloat(value);
    // if (isNaN(numericValue)) numericValue = 0; // Or handle as error preview
    // const tempNumericMatrix = matrix.map(r => [...r]);
    // tempNumericMatrix[i][j] = numericValue;
    // onChange(tempNumericMatrix);
  };

  const handleBlur = (i: number, j: number) => {
    if (readonly) return;

    const currentDisplayValue = displayValues[i][j];
    let numericValue: number;

    if (currentDisplayValue.trim() === "" || currentDisplayValue === "-") {
      numericValue = 0;
    } else {
      const parsed = parseFloat(currentDisplayValue);
      numericValue = isNaN(parsed) ? 0 : parsed;
    }

    // Update the canonical numeric matrix in the parent state
    const newNumericMatrix = matrix.map((row) => [...row]);
    if (newNumericMatrix[i][j] !== numericValue) {
      // Only update if value actually changed
      newNumericMatrix[i][j] = numericValue;
      onChange(newNumericMatrix);
    } else if (
      numericValue === 0 &&
      currentDisplayValue !== "0" &&
      currentDisplayValue !== ""
    ) {
      // If user typed something that parses to 0, but wasn't "0" or empty,
      // ensure the display updates to show "0" or placeholder
      const newDisplayValues = displayValues.map((row) => [...row]);
      newDisplayValues[i][j] = readonly || isCompleted ? "0" : "";
      setDisplayValues(newDisplayValues);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-block relative"
    >
      {/* Only show lock overlay when readonly (disabled) and not just when completed */}
      {readonly && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/50 backdrop-blur-sm rounded-md">
          <Lock
            className={`w-6 h-6 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          />
        </div>
      )}

      <div
        className={`px-2 py-1 rounded-md ${
          isDark
            ? "border-l-2 border-r-2 border-slate-600"
            : "border-l-2 border-r-2 border-slate-400"
        }`}
      >
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${
              matrix[0]?.length || 1
            }, minmax(0, 1fr))`,
          }}
        >
          {matrix.map((row, i) =>
            row.map(
              (
                _,
                j // Iterate using matrix for structure, but use displayValues for value
              ) => (
                <Input
                  key={`${i}-${j}`}
                  type="text"
                  placeholder="0" // The visual placeholder "0"
                  value={displayValues[i]?.[j] ?? ""} // Use internal string state for display
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleInputChange(i, j, e.target.value)}
                  onBlur={() => handleBlur(i, j)}
                  className={`w-16 h-12 text-center text-sm font-mono transition-colors duration-150 rounded-md ${
                    readonly || isCompleted
                      ? isDark
                        ? "border-green-500 bg-green-700/20 text-green-300 focus-visible:ring-green-500/50"
                        : "border-green-400 bg-green-100 text-green-700 focus-visible:ring-green-400/50"
                      : errors?.[i]?.[j]
                      ? isDark
                        ? "border-red-500 bg-red-700/20 text-red-300 focus-visible:ring-red-500/50"
                        : "border-red-400 bg-red-100 text-red-700 focus-visible:ring-red-400/50"
                      : isDark
                      ? "bg-slate-700 border-slate-600 text-slate-200 focus-visible:ring-slate-500/50"
                      : "bg-slate-50 border-slate-300 text-slate-800 focus-visible:ring-slate-400/50"
                  }`}
                  readOnly={readonly || isCompleted} // Make readonly if node is readonly OR completed
                />
              )
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
