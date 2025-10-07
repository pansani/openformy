import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { FieldTypesSidebar, FormPreview, FieldSettings } from '@/components/FormBuilder';
import { FormEditorHeader } from '@/components/Forms/FormEditorHeader';
import { UnsavedChangesAlert } from '@/components/Forms/UnsavedChangesAlert';
import { UnsavedChangesDialog } from '@/components/Forms/UnsavedChangesDialog';
import { useFormEditor } from '@/hooks/useFormEditor';
import { Form } from '@/types/form';

interface Props {
  form: Form;
}

export default function Edit({ form }: Props) {
  const {
    questions,
    selectedQuestionId,
    selectedQuestion,
    isSaving,
    isPublished,
    displayMode,
    hasUnsavedChanges,
    showUnsavedDialog,
    setSelectedQuestionId,
    handleFieldSelect,
    handleQuestionUpdate,
    handleQuestionDelete,
    handleReorder,
    handleSave,
    handlePublishToggle,
    handleDisplayModeChange,
    handleConfirmLeave,
    handleCancelLeave,
  } = useFormEditor(form);

  return (
    <AppLayout>
      <Head title={`Edit Form: ${form.title}`} />

      <UnsavedChangesDialog 
        open={showUnsavedDialog}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />

      <div className="flex flex-col h-full bg-background -mt-16 pt-16">
        <UnsavedChangesAlert hasUnsavedChanges={hasUnsavedChanges} />
        
        <FormEditorHeader
          form={form}
          displayMode={displayMode}
          isPublished={isPublished}
          isSaving={isSaving}
          onDisplayModeChange={handleDisplayModeChange}
          onPublishToggle={handlePublishToggle}
          onSave={handleSave}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <FieldTypesSidebar onFieldSelect={handleFieldSelect} />
          </div>

          <div className="flex-1 overflow-hidden">
            <FormPreview
              form={form}
              questions={questions}
              selectedQuestionId={selectedQuestionId}
              onQuestionSelect={setSelectedQuestionId}
              onQuestionDelete={handleQuestionDelete}
              onReorder={handleReorder}
            />
          </div>

          <div className="w-96 flex-shrink-0 overflow-hidden">
            <FieldSettings
              question={selectedQuestion}
              onUpdate={handleQuestionUpdate}
              onClose={() => setSelectedQuestionId(null)}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
