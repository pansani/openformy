import {
  TextInputPreview,
  TextareaPreview,
  DateInputPreview,
  FileUploadPreview,
  SelectPreview,
  RadioPreview,
  CheckboxPreview,
  YesNoPreview,
  RatingPreview,
  StatementPreview,
  OpinionScalePreview,
  RankingPreview,
  PictureChoicePreview,
  MatrixPreview,
  MultiSelectPreview,
  SignaturePreview,
  TimePreview,
  DateRangePreview,
  LegalPreview,
  HiddenPreview,
} from './previews';

interface Question {
  type: string;
  placeholder?: string;
}

interface QuestionPreviewProps {
  question: Question;
}

export function QuestionPreview({ question }: QuestionPreviewProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'short-text':
      case 'email':
      case 'number':
      case 'phone':
      case 'url':
        return <TextInputPreview type={question.type as any} placeholder={question.placeholder} />;
      
      case 'textarea':
      case 'long-text':
        return <TextareaPreview placeholder={question.placeholder} />;
      
      case 'date':
        return <DateInputPreview />;
      
      case 'file':
        return <FileUploadPreview />;
      
      case 'dropdown':
        return <SelectPreview />;
      
      case 'radio':
        return <RadioPreview />;
      
      case 'checkbox':
        return <CheckboxPreview />;
      
      case 'yesno':
        return <YesNoPreview />;
      
      case 'rating':
        return <RatingPreview />;
      
      case 'statement':
        return <StatementPreview />;
      
      case 'opinion-scale':
        return <OpinionScalePreview />;
      
      case 'ranking':
        return <RankingPreview />;
      
      case 'picture-choice':
        return <PictureChoicePreview />;
      
      case 'matrix':
        return <MatrixPreview />;
      
      case 'multi-select':
        return <MultiSelectPreview />;
      
      case 'signature':
        return <SignaturePreview />;
      
      case 'time':
        return <TimePreview />;
      
      case 'date-range':
        return <DateRangePreview />;
      
      case 'legal':
        return <LegalPreview />;
      
      case 'hidden':
        return <HiddenPreview />;
      
      default:
        return <p className="text-sm text-muted-foreground">Preview not available</p>;
    }
  };

  return <div className="mt-3">{renderInput()}</div>;
}
