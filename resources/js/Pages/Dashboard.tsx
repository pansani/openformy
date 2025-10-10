import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { StatCard } from '@/components/Dashboard/StatCard';
import { ResponsesChart } from '@/components/Dashboard/ResponsesChart';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { FormsTable } from '@/components/Dashboard/FormsTable';
import { WebsiteUrlDialog } from '@/components/Dashboard/WebsiteUrlDialog';
import { FileText, BarChart, CheckCircle, TrendingUp } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
];

interface DashboardStats {
  total_forms: number;
  total_responses: number;
  active_forms: number;
  avg_completion_rate: number;
}

interface RecentResponse {
  form_title: string;
  submitted_at: string;
  completed: boolean;
  response_id: number;
  form_id: number;
}

interface FormStats {
  id: number;
  title: string;
  response_count: number;
  completion_rate: number;
  last_response: string | null;
  published: boolean;
}

interface ChartDataPoint {
  date: string;
  responses: number;
}

interface DashboardProps {
  stats: DashboardStats;
  recentResponses: RecentResponse[];
  formStats: FormStats[];
  chartData: ChartDataPoint[];
}

export default function Dashboard({ stats, recentResponses, formStats, chartData }: DashboardProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <WebsiteUrlDialog />
      
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your forms and responses</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Forms" value={stats.total_forms} icon={FileText} />
          <StatCard title="Total Responses" value={stats.total_responses} icon={BarChart} />
          <StatCard title="Active Forms" value={stats.active_forms} icon={CheckCircle} />
          <StatCard
            title="Avg. Completion"
            value={`${stats.avg_completion_rate.toFixed(1)}%`}
            icon={TrendingUp}
          />
        </div>

        <ResponsesChart data={chartData} />

        <div className="grid gap-8 md:grid-cols-2">
          <RecentActivity responses={recentResponses} />
          <FormsTable forms={formStats} />
        </div>
      </div>
    </AppLayout>
  );
}
