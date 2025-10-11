import { useState, useEffect, useRef, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Question, Form } from '@/types/form';

export function useFormEditor(form: Form) {
  const [questions, setQuestions] = useState<Question[]>(
    form.edges.questions?.sort((a, b) => a.order - b.order) || []
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  
  const { data, setData, processing, isDirty, reset, post } = useForm({
    questions: JSON.stringify(form.edges.questions?.sort((a, b) => a.order - b.order) || []),
    published: form.published ? '1' : '0',
    display_mode: form.display_mode || 'traditional',
  });
  
  const isSavingRef = useRef(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    const currentQuestionsStr = JSON.stringify(questions);
    const currentPublished = data.published;
    const currentDisplayMode = data.display_mode;
    
    return (
      currentQuestionsStr !== data.questions ||
      currentPublished !== (form.published ? '1' : '0') ||
      currentDisplayMode !== (form.display_mode || 'traditional')
    );
  }, [questions, data.published, data.display_mode, data.questions, form.published, form.display_mode]);

  useEffect(() => {
    const removeInertiaListener = router.on('before', (event) => {
      if (isSavingRef.current) {
        return;
      }
      
      if (hasUnsavedChanges) {
        event.preventDefault();
        pendingNavigationRef.current = () => {
          router.visit(event.detail.visit.url.href, {
            method: event.detail.visit.method,
          });
        };
        setShowUnsavedDialog(true);
        return false;
      }
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSavingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      removeInertiaListener();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleFieldSelect = (type: string) => {
    let options: Question['options'] = undefined;
    
    if (['dropdown', 'radio', 'checkbox', 'multi-select'].includes(type)) {
      options = { items: ['Option 1', 'Option 2'] };
    } else if (type === 'multi-input') {
      options = { subInputs: [] };
    }

    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      type,
      title: '',
      description: '',
      placeholder: '',
      required: true,
      order: questions.length,
      options,
    };

    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
  };

  const handleQuestionUpdate = (updatedQuestion: Question) => {
    setQuestions(questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)));
  };

  const handleQuestionDelete = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
  };

  const handleReorder = (reorderedQuestions: Question[]) => {
    const updated = reorderedQuestions.map((q, index) => ({ ...q, order: index }));
    setQuestions(updated);
  };

  const handleSave = () => {
    isSavingRef.current = true;
    

    const updatedFormData = {
      ...data,
      questions: JSON.stringify(questions),
    };
    

    router.post(`/forms/${form.id}`, updatedFormData, {
      forceFormData: true,
      onSuccess: () => {

        setData('questions', JSON.stringify(questions));
      },
      onFinish: () => {
        isSavingRef.current = false;
      },
    });
  };

  const handleConfirmLeave = () => {
    setShowUnsavedDialog(false);
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  };

  const handleCancelLeave = () => {
    setShowUnsavedDialog(false);
    pendingNavigationRef.current = null;
  };

  const handlePublishToggle = (checked: boolean) => {
    setData('published', checked ? '1' : '0');
  };

  const handleDisplayModeChange = (mode: string) => {
    setData('display_mode', mode);
  };

  const handleReset = () => {
    const initialQuestions = JSON.parse(data.questions);
    setQuestions(initialQuestions);
    reset();
    setSelectedQuestionId(null);
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  return {
    questions,
    selectedQuestionId,
    selectedQuestion,
    isSaving: processing,
    isPublished: data.published === '1',
    displayMode: data.display_mode,
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
    handleReset,
  };
}
