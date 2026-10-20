interface ChoiceProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  optionLabel: (value: T) => string;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/** Segmented single choice; the currently selected option is pressed. */
export function Choice<T extends string>({ label, value, options, optionLabel, onChange, disabled }: ChoiceProps<T>) {
  return (
    <div className="choice" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={option === value ? "chip chip-on" : "chip"}
          aria-pressed={option === value}
          disabled={disabled}
          onClick={() => onChange(option)}
        >
          {optionLabel(option)}
        </button>
      ))}
    </div>
  );
}
