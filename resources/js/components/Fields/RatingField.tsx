import { Star } from 'lucide-react';

interface RatingFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function RatingField({ 
  value = '', 
  onChange, 
  disabled = true 
}: RatingFieldProps) {
  const rating = parseInt(value) || 0;
  
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange?.(star.toString())}
          disabled={disabled}
          className={`text-4xl transition-all hover:scale-110 ${
            disabled 
              ? 'cursor-not-allowed opacity-60' 
              : rating >= star
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
