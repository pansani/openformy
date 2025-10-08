import { useState, useEffect, useRef, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { Question, Form } from '@/types/form';

export function useFormEditor(form: Form) {
  const [questions, setQuestions] = useState<Question[]>(
    form.edges.questions?.sort((a, b) => a.order - b.order) || []
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(form.published);
  const [displayMode, setDisplayMode] = useState<string>(form.display_mode || 'traditional');
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  
  const initialStateRef = useRef({
    questions: JSON.stringify(form.edges.questions?.sort((a, b) => a.order - b.order) || []),
    published: form.published,
    display_mode: form.display_mode || 'traditional',
  });
  
  const isSavingRef = useRef(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    const currentQuestionsStr = JSON.stringify(questions);
    return (
      currentQuestionsStr !== initialStateRef.current.questions ||
      isPublished !== initialStateRef.current.published ||
      displayMode !== initialStateRef.current.display_mode
    );
  }, [questions, isPublished, displayMode]);

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
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      type,
      title: '',
      description: '',
      placeholder: '',
      required: false,
      order: questions.length,
      options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option 1', 'Option 2'] : undefined,
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
    setIsSaving(true);
    isSavingRef.current = true;
    router.put(
      `/forms/${form.id}`,
      { 
        questions: JSON.stringify(questions),
        published: isPublished ? '1' : '0',
        display_mode: displayMode,
      },
      {
        forceFormData: true,
        onFinish: () => {
          setIsSaving(false);
          isSavingRef.current = false;
        },
        onSuccess: () => {
          initialStateRef.current = {
            questions: JSON.stringify(questions),
            published: isPublished,
            display_mode: displayMode,
          };
        },
      }
    );
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
    setIsPublished(checked);
  };

  const handleDisplayModeChange = (mode: string) => {
    setDisplayMode(mode);
  };

  const handleReset = () => {
    const initialQuestions = JSON.parse(initialStateRef.current.questions);
    setQuestions(initialQuestions);
    setIsPublished(initialStateRef.current.published);
    setDisplayMode(initialStateRef.current.display_mode);
    setSelectedQuestionId(null);
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || null;

  return {
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
    handleReset,
  };
}
