import { Card } from '@/components/ui/card';
import { FileSpreadsheet, BarChart3, Eye } from 'lucide-react';
import { Response } from '@/types/response';

interface ResponsesStatsProps {
  totalResponses: number;
  completionRate: number;
  responses: Response[];
}

export function ResponsesStats({ totalResponses, completionRate, responses }: ResponsesStatsProps) {
  const calculateAveragePerDay = () => {
    if (responses.length === 0) return 0;
    
    const daysSinceFirst = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - new Date(responses[responses.length - 1].submitted_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    
    return Math.round(responses.length / daysSinceFirst);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Responses</p>
            <p className="text-2xl font-bold">{totalResponses}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Eye className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Per Day</p>
            <p className="text-2xl font-bold">{calculateAveragePerDay()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
