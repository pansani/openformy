import {
  TextInputField,
  TextareaField,
  DateInputField,
  FileUploadField,
  SelectField,
  RadioField,
  CheckboxField,
  YesNoField,
  RatingField,
  StatementField,
  OpinionScaleField,
  RankingField,
  PictureChoiceField,
  MatrixField,
  MultiSelectField,
  SignatureField,
  TimeField,
  DateRangeField,
  LegalField,
  HiddenField,
  MultiInputField,
} from '@/components/Fields';

interface SubInput {
  id: string;
  type: 'text' | 'email' | 'number' | 'phone' | 'url' | 'date' | 'time';
  label: string;
  placeholder?: string;
  required: boolean;
}

interface Question {
  type: string;
  placeholder?: string;
  options?: {
    items?: string[];
    subInputs?: SubInput[];
  };
}

interface QuestionPreviewProps {
  question: Question;
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  const getOptions = () => {
    return question.options?.items || [];
  };
  
  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'short-text':
        return <TextInputField type="short-text" placeholder={question.placeholder} />;
      
      case 'email':
        return <TextInputField type="email" placeholder={question.placeholder} />;
      
      case 'number':
        return <TextInputField type="number" placeholder={question.placeholder} />;
      
      case 'phone':
        return <TextInputField type="phone" placeholder={question.placeholder} />;
      
      case 'url':
        return <TextInputField type="url" placeholder={question.placeholder} />;
      
      case 'textarea':
      case 'long-text':
        return <TextareaField placeholder={question.placeholder} />;
      
      case 'date':
        return <DateInputField />;
      
      case 'file':
        return <FileUploadField />;
      
      case 'dropdown':
        return <SelectField options={getOptions()} />;
      
      case 'radio':
        return <RadioField options={getOptions()} />;
      
      case 'checkbox':
        return <CheckboxField options={getOptions()} />;
      
      case 'yesno':
        return <YesNoField />;
      
      case 'rating':
        return <RatingField />;
      
      case 'statement':
        return <StatementField />;
      
      case 'opinion-scale':
        return <OpinionScaleField />;
      
      case 'ranking':
        return <RankingField options={getOptions()} />;
      
      case 'picture-choice':
        return <PictureChoiceField options={getOptions()} />;
      
      case 'matrix':
        return <MatrixField />;
      
      case 'multi-select':
        return <MultiSelectField options={getOptions()} />;
      
      case 'signature':
        return <SignatureField />;
      
      case 'time':
        return <TimeField />;
      
      case 'date-range':
        return <DateRangeField />;
      
      case 'legal':
        return <LegalField />;
      
      case 'hidden':
        return <HiddenField />;
      
      case 'multi-input':
        const subInputs = typeof question.options === 'object' && question.options?.subInputs 
          ? question.options.subInputs 
          : [];
        return <MultiInputField subInputs={subInputs} />;
      
      default:
        return <p className="text-sm text-muted-foreground">Preview not available</p>;
    }
  };

  return <div className="mt-3">{renderInput()}</div>;
}
