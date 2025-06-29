import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import TeamHealthIndicator from '../TeamHealthIndicator';
import { useFeedbackData } from '@/hooks/useFeedbackData';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import VerbalFeedbackPanel from '@/components/VerbalFeedbackPanel';
import { useHRDashboardData } from '@/hooks/useHRDashboardData';
import HRDashboardHeader from './hr/HRDashboardHeader';
import HRKPICards from './hr/HRKPICards';
import HREngagementChart from './hr/HREngagementChart';
import HRDistributionChart from './hr/HRDistributionChart';
import HRCohesionFrictionAnalysis from './hr/HRCohesionFrictionAnalysis';

interface HRDashboardProps {
  userData: {
    name?: string;
    department?: string;
    employeeId?: string;
  };
  onRestart?: () => void;
}

const chartConfig = {
  engagement: {
    label: "Engagement Score",
    color: "#FFB4A2", // GrowPoint primary
  },
  cohesion: {
    label: "Cohesion Score", 
    color: "#FFCDB2", // GrowPoint soft
  },
  friction: {
    label: "Friction Level",
    color: "#E5989B", // GrowPoint accent
  },
  employees: {
    label: "Employee Count",
    color: "#FFCDB2", // GrowPoint soft
  },
  stdDev: {
    label: "Standard Deviation",
    color: "#E5989B", // GrowPoint accent
  },
};

const HRDashboard: React.FC<HRDashboardProps> = ({ userData, onRestart }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState('last-30-days');
  const { feedbackData, loading, error } = useFeedbackData({ 
    selectedDepartment, 
    dateRange 
  });

  const processedData = useHRDashboardData(feedbackData);

  // Calculate department-specific engagement score with corrected status logic (1-5 scale)
  const departmentEngagementStats = React.useMemo(() => {
    const filteredData = selectedDepartment === 'all' ? feedbackData : 
      feedbackData.filter(response => response.department === selectedDepartment);
    
    if (filteredData.length === 0) return { average: 0, status: 'No Data', color: 'text-gray-500' };
    
    const totalEngagement = filteredData.reduce((sum, response) => sum + (response.engagement_score || 0), 0);
    const average = totalEngagement / filteredData.length;
    
    let status = 'Healthy';
    let color = 'text-green-600';
    
    // Fixed logic: 1-5 scale evaluation
    if (average >= 4.0) {
      status = 'Excellent';
      color = 'text-green-600';
    } else if (average >= 2.5) {
      status = 'At Risk';
      color = 'text-yellow-600';
    } else {
      status = 'Needs Attention';
      color = 'text-red-600';
    }
    
    return { average: Number(average.toFixed(1)), status, color };
  }, [feedbackData, selectedDepartment]);

  // Calculate high-risk teams based on friction >= 3.6
  const highRiskTeams = React.useMemo(() => {
    return processedData.departments.filter(dept => dept.friction >= 3.6).length;
  }, [processedData.departments]);

  // Process data for AI insights with verbal comments
  const aiInsightsData = React.useMemo(() => {
    const filteredData = selectedDepartment === 'all' ? feedbackData : 
      feedbackData.filter(response => response.department === selectedDepartment);
    
    if (filteredData.length === 0) {
      return {
        avgEngagement: 0,
        avgCohesion: 0,
        avgFriction: 0,
        teamGoalDistribution: {},
        departmentName: selectedDepartment === 'all' ? 'the organization' : selectedDepartment,
        verbalComments: []
      };
    }

    const avgEngagement = filteredData.reduce((sum, r) => sum + (r.engagement_score || 0), 0) / filteredData.length;
    const avgCohesion = filteredData.reduce((sum, r) => sum + (r.cohesion_score || 0), 0) / filteredData.length;
    const avgFriction = filteredData.reduce((sum, r) => sum + (r.friction_level || 0), 0) / filteredData.length;
    
    const goalDistribution = filteredData.reduce((acc, r) => {
      if (r.team_goal) {
        acc[r.team_goal] = (acc[r.team_goal] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });

    const verbalComments: string[] = [];
    filteredData.forEach(response => {
      [
        response.verbal_q1_comment,
        response.verbal_q2_comment,
        response.verbal_q3_comment,
        response.verbal_q4_comment,
        response.verbal_q5_comment,
        response.verbal_q6_comment,
        response.verbal_q7_comment
      ].forEach(comment => {
        if (comment && comment.trim()) {
          verbalComments.push(comment.trim());
        }
      });
    });

    return {
      avgEngagement,
      avgCohesion,
      avgFriction,
      teamGoalDistribution: goalDistribution,
      departmentName: selectedDepartment === 'all' ? 'the organization' : selectedDepartment,
      verbalComments
    };
  }, [feedbackData, selectedDepartment]);

  // Filter feedback data for verbal feedback panel
  const verbalFeedbackData = React.useMemo(() => {
    return selectedDepartment === 'all' ? feedbackData : 
      feedbackData.filter(response => response.department === selectedDepartment);
  }, [feedbackData, selectedDepartment]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-growpoint-soft via-white to-growpoint-primary/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-growpoint-primary mx-auto mb-4"></div>
          <p className="text-growpoint-dark">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-growpoint-soft via-white to-growpoint-primary/20 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading dashboard data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-growpoint-soft via-white to-growpoint-primary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HRDashboardHeader
          onRestart={onRestart}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <HRKPICards
          totalResponses={feedbackData.length}
          totalDepartments={processedData.departments.length}
          engagementStats={departmentEngagementStats}
          highRiskTeams={highRiskTeams}
        />

        {/* Department Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {processedData.departments.slice(0, 3).map((dept, index) => (
            <TeamHealthIndicator 
              key={index}
              frictionLevel={dept.friction}
              engagementScore={dept.engagement}
              teamName={dept.department}
            />
          ))}
        </div>

        {/* Analytics Charts - Fixed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="w-full">
            <HREngagementChart
              departments={processedData.departments}
              chartConfig={chartConfig}
            />
          </div>
          <div className="w-full">
            <HRDistributionChart
              departments={processedData.departments}
              chartConfig={chartConfig}
            />
          </div>
        </div>

        <HRCohesionFrictionAnalysis
          cohesionFrictionData={processedData.cohesionFrictionData}
          engagementVariabilityData={processedData.engagementVariabilityData}
          chartConfig={chartConfig}
        />

        <AIInsightsPanel 
          data={aiInsightsData}
          isHR={true}
        />

        <VerbalFeedbackPanel 
          feedbackData={verbalFeedbackData}
          departmentName={selectedDepartment === 'all' ? undefined : selectedDepartment}
        />
      </div>
    </div>
  );
};

export default HRDashboard;
