export function RadioPreview() {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <input type="radio" disabled className="text-primary" />
        <span className="text-muted-foreground">Option 1</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="radio" disabled className="text-primary" />
        <span className="text-muted-foreground">Option 2</span>
      </label>
    </div>
  );
}
