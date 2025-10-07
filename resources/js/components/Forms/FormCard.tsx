import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Eye, Copy, Trash2, Calendar, ExternalLink, MoreVertical, Settings } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Form {
  id: number;
  title: string;
  description: string;
  published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface FormCardProps {
  form: Form;
}

export function FormCard({ form }: FormCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formUrl = `${window.location.origin}/f/${form.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this form?')) {
      setIsDeleting(true);
      router.delete(`/forms/${form.id}`, {
        onFinish: () => setIsDeleting(false),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 ${
        isHovered
          ? 'shadow-xl border-primary/40 scale-[1.02]'
          : 'shadow-md hover:shadow-lg border-border'
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-xl truncate group-hover:text-primary transition-colors">
                {form.title}
              </h3>
              <span
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
                  form.published
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
              >
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>
            {form.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={formUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in new tab
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>Created on {formatDate(form.created_at)}</span>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

        <div className="flex gap-2">
          <Link href={`/forms/${form.id}/edit`} className="flex-1">
            <Button
              className="w-full group/btn"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
              Configure
            </Button>
          </Link>
          <a href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button
              variant="outline"
              className="w-full group/btn"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              View
            </Button>
          </a>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary transform origin-left transition-transform duration-300 ${
          isHovered ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </Card>
  );
}
