import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye, HelpCircle, Lightbulb } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ConversationalPreview, TraditionalPreview } from './DisplayModePreview';
import { Form } from '@/types/form';

interface FormEditorHeaderProps {
  form: Form;
  displayMode: string;
  isPublished: boolean;
  isSaving: boolean;
  onDisplayModeChange: (mode: string) => void;
  onPublishToggle: (checked: boolean) => void;
  onSave: () => void;
}

export function FormEditorHeader({
  form,
  displayMode,
  isPublished,
  isSaving,
  onDisplayModeChange,
  onPublishToggle,
  onSave,
}: FormEditorHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-4">
          <Link href="/forms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-bold text-lg">{form.title}</h1>
            <p className="text-xs text-muted-foreground">/{form.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="display-mode"
              checked={displayMode === 'conversational'}
              onCheckedChange={(checked) => onDisplayModeChange(checked ? 'conversational' : 'traditional')}
            />
            <Label htmlFor="display-mode" className="text-sm cursor-pointer">
              {displayMode === 'conversational' ? 'Conversational' : 'Traditional'}
            </Label>
            
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-0 border-0 bg-transparent shadow-none">
                  <div className="flex gap-3 p-4 bg-white dark:bg-slate-950 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded bg-blue-600" />
                        <p className="font-semibold text-sm">Conversational</p>
                      </div>
                      <ConversationalPreview />
                    </div>
                    
                    <div className="w-px bg-slate-200 dark:bg-slate-800" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 w-4 rounded bg-slate-600" />
                        <p className="font-semibold text-sm">Traditional</p>
                      </div>
                      <TraditionalPreview />
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={onPublishToggle}
            />
            <Label htmlFor="published" className="text-sm cursor-pointer">
              {isPublished ? 'Published' : 'Draft'}
            </Label>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                Quick Tips
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Quick Tips
                  </h4>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Use clear, descriptive titles that tell respondents what to expect</p>
                  <p>• Add a description to provide context and increase completion rates</p>
                  <p>• You can customize your form's design and branding later</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Link href={`/f/${form.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
