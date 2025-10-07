interface ResponsesSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResponsesSearch({ value, onChange }: ResponsesSearchProps) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search by IP, user agent, or date..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full md:w-96 px-4 py-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
      />
    </div>
  );
}
