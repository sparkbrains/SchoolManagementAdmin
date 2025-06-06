import React from "react";
import styles from "./DatePicker.module.css";

interface DatePickerProps {
  label?: string;
  selectedDate: string | undefined;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | undefined;
  className?: string;
  type?: string;
  min?: string | number | undefined;
  max?: string | number | undefined;
  tabIndex?: number | undefined;
  disabled?: boolean;
  name?: string | undefined;
  visibility?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  selectedDate,
  onDateChange,
  error,
  className,
  type = "date",
  min = undefined,
  max = undefined,
  tabIndex = undefined,
  disabled = false,
  name = undefined,
  visibility = true,
  ...props
}) => {
  return (
    <div className={`${styles["custom-date-picker"]} ${className} ${!visibility ? styles.hidden : ""}`}>
      {label && (
        <label
          className={`${styles["date-picker-label"]} ${
            error ? styles.errorLabel : ""
          }`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={selectedDate}
        onChange={onDateChange}
        className={`${styles["date-picker-input"]} ${
          error ? styles.errorState : ""
        }`}
        min={min}
        max={max}
        tabIndex={tabIndex}
        disabled={disabled}
        name={name}
        {...props}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default DatePicker;
