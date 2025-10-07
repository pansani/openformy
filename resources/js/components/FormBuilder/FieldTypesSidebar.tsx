import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Type, 
  Mail, 
  Hash, 
  AlignLeft, 
  ChevronDown, 
  Circle, 
  CheckSquare, 
  Calendar, 
  Phone, 
  Link as LinkIcon 
} from 'lucide-react';
import { useState } from 'react';

interface FieldType {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const inputFields: FieldType[] = [
  { type: 'text', label: 'Text Input', icon: <Type className="h-5 w-5" />, description: 'A single line for short text responses.' },
  { type: 'email', label: 'Email', icon: <Mail className="h-5 w-5" />, description: 'Collect a valid email address.' },
  { type: 'number', label: 'Number', icon: <Hash className="h-5 w-5" />, description: 'Input for numeric values.' },
  { type: 'textarea', label: 'Textarea', icon: <AlignLeft className="h-5 w-5" />, description: 'A multi-line field for longer text.' },
  { type: 'phone', label: 'Phone Number', icon: <Phone className="h-5 w-5" />, description: 'Input for phone numbers with validation.' },
  { type: 'url', label: 'Link', icon: <LinkIcon className="h-5 w-5" />, description: 'Input for a valid website URL.' },
  { type: 'date', label: 'Date', icon: <Calendar className="h-5 w-5" />, description: 'Pick a date from a calendar.' },
];

const selectionFields: FieldType[] = [
  { type: 'dropdown', label: 'Select Dropdown', icon: <ChevronDown className="h-5 w-5" />, description: 'Dropdown to choose one option.' },
  { type: 'radio', label: 'Radio Buttons', icon: <Circle className="h-5 w-5" />, description: 'Pick a single option from a list.' },
  { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="h-5 w-5" />, description: 'Select one or more options.' },
];

interface FieldTypesSidebarProps {
  onFieldSelect: (type: string) => void;
}

export function FieldTypesSidebar({ onFieldSelect }: FieldTypesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const allFields = [...inputFields, ...selectionFields];
  const filteredFields = allFields.filter((field) =>
    field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    field.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background border-r">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold mb-2">Form Fields</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click to add fields to your form
        </p>
        <Input
          type="text"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {searchQuery === '' ? (
          <>
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                INPUT FIELDS
              </h3>
              <div className="space-y-2">
                {inputFields.map((field) => (
                  <FieldTypeCard key={field.type} field={field} onSelect={onFieldSelect} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                SELECTION FIELDS
              </h3>
              <div className="space-y-2">
                {selectionFields.map((field) => (
                  <FieldTypeCard key={field.type} field={field} onSelect={onFieldSelect} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {filteredFields.length > 0 ? (
              filteredFields.map((field) => (
                <FieldTypeCard key={field.type} field={field} onSelect={onFieldSelect} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No fields found
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldTypeCard({ field, onSelect }: { field: FieldType; onSelect: (type: string) => void }) {
  return (
    <Card
      className="p-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
      onClick={() => onSelect(field.type)}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {field.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-0.5">{field.label}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {field.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
