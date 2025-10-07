import { ArrowRight } from "lucide-react";

interface DisplayModePreviewProps {
  mode: "conversational" | "traditional";
}

export function ConversationalPreview() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 rounded-lg p-4 space-y-3 w-64">
      <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 w-1/3 transition-all duration-300" />
      </div>

      <div className="text-right text-xs text-slate-500">1 / 3</div>

      <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          What's your name?
        </h3>
        <input
          type="text"
          placeholder="Type your answer..."
          className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-900 dark:placeholder:text-slate-100"
          readOnly
        />

        <div className="flex justify-end pt-1">
          <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md flex items-center gap-1 hover:bg-blue-700 transition-colors">
            Next
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center pt-2">
        One question at a time
      </p>
    </div>
  );
}

export function TraditionalPreview() {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3 w-64">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            What's your name?
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 mt-1 placeholder:text-slate-900 dark:placeholder:text-slate-100"
            readOnly
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Your email?
          </label>
          <input
            type="email"
            placeholder="john@example.com"
            className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 mt-1 placeholder:text-slate-900 dark:placeholder:text-slate-100"
            readOnly
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Phone number?
          </label>
          <input
            type="tel"
            placeholder="+1 234 567 890"
            className="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 mt-1 placeholder:text-slate-900 dark:placeholder:text-slate-100"
            readOnly
          />
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md hover:bg-slate-800 transition-colors">
          Submit
        </button>
      </div>

      <p className="text-xs text-slate-500 text-center pt-1">
        All questions on one page
      </p>
    </div>
  );
}

export function DisplayModePreview({ mode }: DisplayModePreviewProps) {
  return mode === "conversational" ? (
    <ConversationalPreview />
  ) : (
    <TraditionalPreview />
  );
}
