import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { FormCard } from '@/components/Forms';

interface Form {
  id: number;
  title: string;
  description: string;
  published: boolean;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  forms: Form[];
}

export default function Index({ forms }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredForms = forms?.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <AppLayout>
      <Head title="Forms" />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Meus Formulários
              </h1>
              <p className="text-muted-foreground text-lg">
                Crie e gerencie seus formulários
              </p>
            </div>
            
            <Link href="/forms/create">
              <Button size="lg" className="group">
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Novo Formulário
              </Button>
            </Link>
          </div>

          {forms && forms.length > 0 && (
            <div className="mb-8">
              <input
                type="text"
                placeholder="Buscar formulários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 px-4 py-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          )}

          {filteredForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}
            </div>
          ) : forms && forms.length > 0 ? (
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Nenhum formulário encontrado
                </h3>
                <p className="text-muted-foreground mb-6">
                  Tente uma busca diferente
                </p>
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Limpar busca
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-16 text-center border-2 border-dashed hover:border-primary/40 transition-all duration-300">
              <div className="max-w-md mx-auto">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Plus className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-primary/10 animate-ping" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  Nenhum formulário ainda
                </h3>
                <p className="text-muted-foreground text-lg mb-8">
                  Comece criando seu primeiro formulário
                </p>
                <Link href="/forms/create">
                  <Button size="lg" className="group">
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Criar Primeiro Formulário
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
