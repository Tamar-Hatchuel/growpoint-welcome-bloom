
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';

interface Department {
  department: string;
  engagement: number;
  cohesion: number;
  friction: number;
  employees: number;
  responseCount: number;
  engagementScores: number[];
}

interface HREngagementChartProps {
  departments: Department[];
  chartConfig: any;
}

const HREngagementChart: React.FC<HREngagementChartProps> = ({ departments, chartConfig }) => {
  return (
    <Card className="border-growpoint-accent/20 w-full max-w-full">
      <CardHeader className="p-4">
        <CardTitle className="text-growpoint-dark flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-growpoint-primary" />
          Engagement by Department
        </CardTitle>
        <CardDescription className="text-growpoint-dark/60 text-sm">Current engagement levels across all departments (1-5 scale)</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <XAxis 
                dataKey="department" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                fontSize={12}
                interval={0}
                tick={{ fill: '#B5828C' }}
                axisLine={{ stroke: '#B5828C' }}
              />
              <YAxis 
                domain={[0, 5]} 
                fontSize={12}
                tick={{ fill: '#B5828C' }}
                axisLine={{ stroke: '#B5828C' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="engagement" 
                fill="#FFB4A2" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HREngagementChart;
