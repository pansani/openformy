interface SelectFieldProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function SelectField({ options = [], value = '', onChange, disabled = true, error }: SelectFieldProps) {
  const safeOptions = Array.isArray(options) ? options : [];
  
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-input rounded-lg bg-background text-sm ${error ? 'border-red-500' : ''}`}
    >
      <option value="">Select an option...</option>
      {safeOptions.map((option, idx) => (
        <option key={idx} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
