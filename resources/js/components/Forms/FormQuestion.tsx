import { Label } from "@/components/ui/label";
import {
  TextInputField,
  TextareaField,
  DateInputField,
  TimeField,
  DateRangeField,
  FileUploadField,
  SelectField,
  RadioField,
  CheckboxField,
  MultiSelectField,
  YesNoField,
  RatingField,
  OpinionScaleField,
  SignatureField,
  LegalField,
  HiddenField,
  StatementField,
  MultiInputField,
} from "@/components/Fields";

interface SubInput {
  id: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'url' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
}

interface Question {
  id: number;
  type: string;
  title: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: {
    items?: string[];
    subInputs?: SubInput[];
  };
}

interface FormQuestionProps {
  question: Question;
  value: string | string[] | Record<string, string>;
  error?: string;
  onChange: (value: string | string[] | Record<string, string>) => void;
}

export function FormQuestion({
  question,
  value,
  error,
  onChange,
}: FormQuestionProps) {
  const stringValue = typeof value === "string" ? value : "";
  const arrayValue = Array.isArray(value) ? value : [];
  
  const handleChange = (newValue: string | string[]) => {
    onChange(newValue);
  };

  const renderField = () => {
    switch (question.type) {
      case "text":
      case "short-text":
        return (
          <TextInputField
            type="short-text"
            placeholder={question.placeholder}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "long-text":
        return (
          <TextareaField
            placeholder={question.placeholder}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "email":
        return (
          <TextInputField
            type="email"
            placeholder={question.placeholder}
            value={stringValue}
            onChange={handleChange}
            disabled={false}
            error={error}
          />
        );

      case "number":
        return (
          <TextInputField
            type="number"
            placeholder={question.placeholder}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "phone":
      case "phone-number":
        return (
          <TextInputField
            type="phone"
            placeholder={question.placeholder}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "url":
      case "link":
        return (
          <TextInputField
            type="url"
            placeholder={question.placeholder}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "date":
        return (
          <DateInputField
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "time":
        return (
          <TimeField
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "textarea":
        return (
          <TextareaField
            placeholder={question.placeholder}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "dropdown":
      case "select-dropdown":
        return (
          <SelectField
            options={question.options?.items}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "multi-select":
        return (
          <MultiSelectField
            options={question.options?.items}
            value={arrayValue}
            onChange={onChange}
            disabled={false}
            questionId={question.id}
          />
        );

      case "radio":
        return (
          <RadioField
            options={question.options?.items}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            questionId={question.id}
          />
        );

      case "checkbox":
        return (
          <CheckboxField
            options={question.options?.items}
            value={arrayValue}
            onChange={onChange}
            disabled={false}
            questionId={question.id}
          />
        );

      case "file":
      case "file-upload":
        return (
          <FileUploadField
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
            questionId={question.id}
          />
        );

      case "yesno":
        return (
          <YesNoField
            value={stringValue}
            onChange={onChange}
            disabled={false}
          />
        );

      case "rating":
        return (
          <RatingField
            value={stringValue}
            onChange={onChange}
            disabled={false}
          />
        );

      case "opinion-scale":
        return (
          <OpinionScaleField
            value={stringValue}
            onChange={onChange}
            disabled={false}
          />
        );

      case "date-range":
        return (
          <DateRangeField
            value={typeof value === 'string' ? JSON.parse(value || '{}') : value}
            onChange={(val) => onChange(JSON.stringify(val))}
            disabled={false}
            error={error}
          />
        );

      case "signature":
        return (
          <SignatureField
            value={stringValue}
            onChange={onChange}
            disabled={false}
            error={error}
          />
        );

      case "legal":
        return (
          <LegalField
            description={question.description}
            value={stringValue}
            onChange={onChange}
            disabled={false}
            questionId={question.id}
          />
        );

      case "hidden":
        return <HiddenField value={stringValue} />;

      case "statement":
        return (
          <StatementField
            title={question.title}
            description={question.description}
          />
        );

      case "multi-input":
        const subInputs = question.options?.subInputs || [];
        const multiInputValue = typeof value === 'object' && !Array.isArray(value) ? value : {};
        return (
          <MultiInputField
            subInputs={subInputs}
            values={multiInputValue}
            onChange={onChange}
            disabled={false}
          />
        );

      default:
        return null;
    }
  };

  if (question.type === "statement") {
    return renderField();
  }

  return (
    <div className="p-6 rounded-lg brand-card-bg">
      <div className="space-y-4">
        <div>
          <Label
            htmlFor={`question-${question.id}`}
            className="text-base font-semibold"
          >
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {question.description}
            </p>
          )}
        </div>

        <div>{renderField()}</div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
