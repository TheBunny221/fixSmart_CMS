import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import {
  useGetComplaintsQuery,
  useGetComplaintStatisticsQuery,
} from "../store/api/complaintsApi";
import {
  useGetDashboardAnalyticsQuery,
  useGetRecentActivityQuery,
  useGetDashboardStatsQuery,
  useGetUserActivityQuery,
  useGetSystemHealthQuery,
} from "../store/api/adminApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Shield,
  Users,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  BarChart3,
  UserCheck,
  Database,
  MessageSquare,
  Activity,
  Target,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { translations } = useAppSelector((state) => state.language);

  // Fetch real-time data using API queries
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetDashboardStatsQuery();

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useGetDashboardAnalyticsQuery();

  const {
    data: recentActivityData,
    isLoading: activityLoading,
    error: activityError,
  } = useGetRecentActivityQuery({ limit: 5 });

  const {
    data: userActivityData,
    isLoading: userActivityLoading,
    error: userActivityError,
  } = useGetUserActivityQuery({ period: "24h" });

  const {
    data: systemHealthData,
    isLoading: systemHealthLoading,
    error: systemHealthError,
  } = useGetSystemHealthQuery();

  const systemStats = dashboardStats?.data || {
    totalComplaints: 0,
    totalUsers: 0,
    activeComplaints: 0,
    resolvedComplaints: 0,
    overdue: 0,
    wardOfficers: 0,
    maintenanceTeam: 0,
    pendingTeamAssignments: 0,
  };

  const analytics = analyticsData?.data;
  const recentActivity = recentActivityData?.data || [];
  const isLoading =
    statsLoading ||
    analyticsLoading ||
    activityLoading ||
    userActivityLoading ||
    systemHealthLoading;

  // Use real data from APIs with fallbacks
  const complaintTrends = analytics?.complaintTrends || [];
  const complaintsByType = analytics?.complaintsByType || [];
  const wardPerformance = analytics?.wardPerformance || [];
  const metrics = analytics?.metrics || {
    avgResolutionTime: 0,
    slaCompliance: 0,
    citizenSatisfaction: 0,
    resolutionRate: 0,
  };

  // Development debugging
  if (process.env.NODE_ENV === "development") {
    console.log("Dashboard Data Debug:", {
      analytics: analytics,
      complaintTrends: complaintTrends,
      complaintsByType: complaintsByType,
      wardPerformance: wardPerformance,
      metrics: metrics,
      systemStats: systemStats,
    });
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  // Show error state
  if (
    statsError ||
    analyticsError ||
    activityError ||
    userActivityError ||
    systemHealthError
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">
          Error loading dashboard data. Please try refreshing the page.
          {process.env.NODE_ENV === "development" && (
            <div className="text-sm mt-2">
              Errors:{" "}
              {JSON.stringify({ statsError, analyticsError, activityError })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "resolution":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "assignment":
        return <UserCheck className="h-4 w-4 text-orange-600" />;
      case "login":
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case "user_created":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "user":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🛡️ Administrator Dashboard 🛠️
            </h1>
            <p className="text-purple-100">
              Complete system overview and management controls for Cochin Smart
              City
            </p>
          </div>
          <Shield className="h-16 w-16 text-purple-200" />
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-700 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {systemStats.totalComplaints}
            </div>
            <div className="text-sm text-purple-200">Total Complaints</div>
          </div>
          <div className="bg-purple-700 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {systemStats.wardOfficers + systemStats.maintenanceTeam}
            </div>
            <div className="text-sm text-purple-200">Active Users</div>
          </div>
          <div className="bg-purple-700 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {metrics?.slaCompliance || 0}%
            </div>
            <div className="text-sm text-purple-200">SLA Compliance</div>
          </div>
          <div className="bg-purple-700 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {(metrics?.citizenSatisfaction || 0).toFixed(1)}/5
            </div>
            <div className="text-sm text-purple-200">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Complaints
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {systemStats.activeComplaints}
            </div>
            <p className="text-xs text-muted-foreground">Pending resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {systemStats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Team Assignment
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {systemStats.pendingTeamAssignments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Needs maintenance assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Resolution
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(metrics?.avgResolutionTime || 0).toFixed(1)}d
            </div>
            <p className="text-xs text-muted-foreground">Target: 3 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaint Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Complaint Trends (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                {complaintTrends && complaintTrends.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={complaintTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === "complaints" ? "Complaints" : "Resolved",
                          ]}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="complaints"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          name="Complaints"
                          connectNulls={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="resolved"
                          stroke="#10B981"
                          strokeWidth={2}
                          name="Resolved"
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    {process.env.NODE_ENV === "development" && (
                      <div className="mt-2 text-xs text-gray-400">
                        Data points: {complaintTrends.length} | Total
                        complaints:{" "}
                        {complaintTrends.reduce(
                          (sum, trend) => sum + (trend.complaints || 0),
                          0,
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="mb-2">
                        No complaint trend data available
                      </div>
                      {process.env.NODE_ENV === "development" && analytics && (
                        <div className="text-xs">
                          Analytics loaded: {analytics ? "Yes" : "No"} | Trends
                          array length: {complaintTrends?.length || 0}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Complaints by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Complaints by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {complaintsByType && complaintsByType.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={complaintsByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {complaintsByType.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry?.color || "#6B7280"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} complaints`,
                            "Count",
                          ]}
                          labelFormatter={(label) => `Type: ${label}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-h-32 overflow-y-auto">
                      {complaintsByType.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-xs"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: item?.color || "#6B7280",
                            }}
                          ></div>
                          <span className="truncate">
                            {item?.name || "Unknown"} ({item?.value || 0})
                          </span>
                        </div>
                      ))}
                    </div>
                    {process.env.NODE_ENV === "development" && (
                      <div className="mt-2 text-xs text-gray-400">
                        Types: {complaintsByType.length} | Total:{" "}
                        {complaintsByType.reduce(
                          (sum, type) => sum + (type.value || 0),
                          0,
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="mb-2">
                        No complaint type data available
                      </div>
                      {process.env.NODE_ENV === "development" && analytics && (
                        <div className="text-xs">
                          Analytics loaded: {analytics ? "Yes" : "No"} | Types
                          array length: {complaintsByType?.length || 0}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {activity.message}
                          </p>
                          <span className="text-[10px] uppercase tracking-wide text-gray-400">
                            {activity.type}
                          </span>
                        </div>
                        {activity.user && (
                          <p className="text-xs text-gray-600">
                            {activity.user.name}
                            {activity.user.email ? (
                              <>
                                {" "}
                                ·{" "}
                                <span className="text-gray-500">
                                  {activity.user.email}
                                </span>
                              </>
                            ) : null}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  No recent activity available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(metrics?.avgResolutionTime || 0).toFixed(1)}d
                </div>
                <p className="text-sm text-gray-600">Average resolution time</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Target: 3d</span>
                    <span>
                      {(metrics?.avgResolutionTime || 0) <= 3
                        ? "On target"
                        : "Needs improvement"}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (3 / Math.max(metrics?.avgResolutionTime || 0.1, 0.1)) *
                        100,
                      100,
                    )}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {metrics?.resolutionRate || 0}%
                </div>
                <p className="text-sm text-gray-600">Complaints resolved</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Target: 90%</span>
                    <span>
                      {(metrics?.resolutionRate || 0) >= 90
                        ? "Excellent"
                        : (metrics?.resolutionRate || 0) >= 75
                          ? "Good"
                          : "Needs improvement"}
                    </span>
                  </div>
                  <Progress
                    value={metrics?.resolutionRate || 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SLA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {metrics?.slaCompliance || 0}%
                </div>
                <p className="text-sm text-gray-600">Meeting deadlines</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Target: 85%</span>
                    <span>
                      {(metrics?.slaCompliance || 0) >= 85
                        ? "Excellent"
                        : (metrics?.slaCompliance || 0) >= 70
                          ? "Good"
                          : "Below target"}
                    </span>
                  </div>
                  <Progress
                    value={metrics?.slaCompliance || 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {(metrics?.citizenSatisfaction || 0).toFixed(1)}/5
                </div>
                <p className="text-sm text-gray-600">Citizen feedback</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Target: 4.0</span>
                    <span>
                      {(metrics?.citizenSatisfaction || 0) >= 4.0
                        ? "Above target"
                        : "Below target"}
                    </span>
                  </div>
                  <Progress
                    value={((metrics?.citizenSatisfaction || 0) / 5) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Resolution Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {metrics?.resolutionRate || 0}%
                      </span>
                    </div>
                    <Progress
                      value={metrics?.resolutionRate || 0}
                      className="h-3"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">SLA Compliance</span>
                      <span className="text-lg font-bold text-blue-600">
                        {metrics?.slaCompliance || 0}%
                      </span>
                    </div>
                    <Progress
                      value={metrics?.slaCompliance || 0}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {(metrics?.avgResolutionTime || 0).toFixed(1)}d
                      </div>
                      <p className="text-sm text-gray-600">
                        Average Resolution Time
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        Target: 3 days
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(metrics?.citizenSatisfaction || 0).toFixed(1)}/5
                      </div>
                      <p className="text-sm text-gray-600">
                        Satisfaction Score
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/reports">
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Detailed Reports
                    </Button>
                  </Link>
                  <Link to="/admin/analytics">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link to="/admin/users/new">
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </Link>
                  <Link to="/admin/config">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/users" className="block">
                  <Button className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users (
                    {systemStats.wardOfficers + systemStats.maintenanceTeam})
                  </Button>
                </Link>
                <Link to="/admin/users?role=WARD_OFFICER" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Ward Officers ({systemStats.wardOfficers})
                  </Button>
                </Link>
                <Link to="/admin/users?role=MAINTENANCE_TEAM" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Maintenance Team ({systemStats.maintenanceTeam})
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Activity (Real-time)</CardTitle>
              </CardHeader>
              <CardContent>
                {userActivityLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm">Loading activity...</span>
                  </div>
                ) : userActivityError ? (
                  <div className="text-center py-4 text-red-600">
                    <p className="text-sm">Failed to load user activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users (24h)</span>
                      <Badge variant="secondary">
                        {userActivityData?.data?.metrics?.activeUsers || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Registrations (24h)</span>
                      <Badge variant="secondary">
                        {userActivityData?.data?.metrics?.newRegistrations || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Login Success Rate</span>
                      <Badge variant="secondary">
                        {userActivityData?.data?.metrics?.loginSuccessRate || 0}
                        %
                      </Badge>
                    </div>
                    {userActivityData?.data?.activities &&
                      userActivityData.data.activities.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Recent Activity
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {userActivityData.data.activities
                              .slice(0, 3)
                              .map((activity) => (
                                <div
                                  key={activity.id}
                                  className="text-xs p-2 bg-gray-50 rounded"
                                >
                                  <p className="font-medium">
                                    {activity.message}
                                  </p>
                                  <p className="text-gray-500">
                                    {activity.time}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/admin/config" className="block">
                  <Button className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </Link>
                <Link to="/admin/config?tab=wards" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Ward Management
                  </Button>
                </Link>
                <Link to="/admin/config?tab=types" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Complaint Types
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health (Real-time)</CardTitle>
              </CardHeader>
              <CardContent>
                {systemHealthLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm">Checking health...</span>
                  </div>
                ) : systemHealthError ? (
                  <div className="text-center py-4 text-red-600">
                    <p className="text-sm">Failed to load system health</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Uptime</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {systemHealthData?.data?.uptime?.formatted || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status</span>
                      <Badge
                        className={
                          systemHealthData?.data?.services?.database?.status ===
                          "healthy"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {systemHealthData?.data?.services?.database?.status ===
                        "healthy"
                          ? "Healthy"
                          : "Unhealthy"}
                        {systemHealthData?.data?.services?.database
                          ?.responseTime &&
                          ` (${systemHealthData.data.services.database.responseTime})`}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Service</span>
                      <Badge
                        className={
                          systemHealthData?.data?.services?.emailService
                            ?.status === "operational"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {systemHealthData?.data?.services?.emailService
                          ?.status || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">File Storage</span>
                      <Badge
                        className={
                          (systemHealthData?.data?.services?.fileStorage
                            ?.usedPercent || 0) > 90
                            ? "bg-red-100 text-red-800"
                            : (systemHealthData?.data?.services?.fileStorage
                                  ?.usedPercent || 0) > 75
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {systemHealthData?.data?.services?.fileStorage
                          ?.usedPercent || 0}
                        % Used
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Response</span>
                      <Badge className="bg-green-100 text-green-800">
                        {systemHealthData?.data?.services?.api
                          ?.averageResponseTime || "N/A"}
                      </Badge>
                    </div>
                    {systemHealthData?.data?.system?.memory && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Memory Usage</span>
                        <Badge
                          className={
                            systemHealthData.data.system.memory.percentage > 80
                              ? "bg-red-100 text-red-800"
                              : systemHealthData.data.system.memory.percentage >
                                  60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {systemHealthData.data.system.memory.used} (
                          {systemHealthData.data.system.memory.percentage}%)
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
