interface HiddenFieldProps {
  value?: string;
  disabled?: boolean;
}

export function HiddenField({ value = '', disabled = true }: HiddenFieldProps) {
  if (disabled) {
    return (
      <div className="flex items-center gap-2 p-3 border border-dashed border-input rounded-lg bg-muted/10">
        <p className="text-sm text-muted-foreground italic">
          Hidden field - not visible to users
        </p>
      </div>
    );
  }

  return <input type="hidden" value={value} />;
}
