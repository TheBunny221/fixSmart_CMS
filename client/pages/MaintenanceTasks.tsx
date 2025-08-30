import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import {
  useGetComplaintsQuery,
  useUpdateComplaintStatusMutation,
} from "../store/api/complaintsApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import PhotoUploadModal from "../components/PhotoUploadModal";
import {
  Wrench,
  Calendar,
  MapPin,
  Clock,
  Camera,
  Navigation,
  CheckCircle,
  AlertTriangle,
  Play,
  Plus,
  RotateCcw,
  ListTodo,
  AlertCircle,
  Upload,
} from "lucide-react";

const MaintenanceTasks: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { translations } = useAppSelector((state) => state.language);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isMarkResolvedOpen, setIsMarkResolvedOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [resolveComment, setResolveComment] = useState("");
  const [resolvePhoto, setResolvePhoto] = useState<File | null>(null);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [selectedTaskForPhotos, setSelectedTaskForPhotos] = useState<any>(null);

  // Fetch complaints assigned to this maintenance team member
  const {
    data: complaintsResponse,
    isLoading,
    error,
    refetch: refetchComplaints,
  } = useGetComplaintsQuery({
    assignedToId: user?.id,
    page: 1,
    limit: 100,
  });

  const [updateComplaintStatus] = useUpdateComplaintStatusMutation();

  // Extract tasks from API response
  const tasks = useMemo(() => {
    if (Array.isArray(complaintsResponse?.data?.complaints)) {
      return complaintsResponse!.data!.complaints.map((complaint: any) => ({
        id: complaint.id,
        title: complaint.title || `${complaint.type} Issue`,
        location: complaint.area,
        address: `${complaint.area}${complaint.landmark ? ', ' + complaint.landmark : ''}${complaint.address ? ', ' + complaint.address : ''}`,
        priority: complaint.priority || "MEDIUM",
        status: complaint.status,
        estimatedTime: getPriorityEstimatedTime(complaint.priority),
        dueDate: complaint.deadline ? new Date(complaint.deadline).toISOString().split('T')[0] : null,
        isOverdue: complaint.deadline ? new Date(complaint.deadline) < new Date() && !["RESOLVED", "CLOSED"].includes(complaint.status) : false,
        description: complaint.description,
        assignedAt: complaint.assignedOn || complaint.submittedOn,
        resolvedAt: complaint.resolvedOn,
        photo: complaint.attachments?.[0]?.url || null,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        complaintId: complaint.complaintId,
      }));
    }
    if (Array.isArray((complaintsResponse as any)?.data)) {
      return (complaintsResponse as any).data.map((complaint: any) => ({
        id: complaint.id,
        title: complaint.title || `${complaint.type} Issue`,
        location: complaint.area,
        address: `${complaint.area}${complaint.landmark ? ', ' + complaint.landmark : ''}${complaint.address ? ', ' + complaint.address : ''}`,
        priority: complaint.priority || "MEDIUM",
        status: complaint.status,
        estimatedTime: getPriorityEstimatedTime(complaint.priority),
        dueDate: complaint.deadline ? new Date(complaint.deadline).toISOString().split('T')[0] : null,
        isOverdue: complaint.deadline ? new Date(complaint.deadline) < new Date() && !["RESOLVED", "CLOSED"].includes(complaint.status) : false,
        description: complaint.description,
        assignedAt: complaint.assignedOn || complaint.submittedOn,
        resolvedAt: complaint.resolvedOn,
        photo: complaint.attachments?.[0]?.url || null,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        complaintId: complaint.complaintId,
      }));
    }
    return [];
  }, [complaintsResponse]);

  // Helper function to get estimated time based on priority
  const getPriorityEstimatedTime = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "2-4 hours";
      case "HIGH":
        return "4-8 hours";
      case "MEDIUM":
        return "1-2 days";
      case "LOW":
        return "2-5 days";
      default:
        return "1-2 days";
    }
  };


  // Calculate task counts
  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "ASSIGNED").length,
    overdue: tasks.filter((t) => t.isOverdue).length,
    resolved: tasks.filter((t) => t.status === "RESOLVED").length,
    reopened: tasks.filter((t) => t.status === "REOPENED").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
  };

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter((task) => {
    switch (activeFilter) {
      case "pending":
        return task.status === "ASSIGNED";
      case "overdue":
        return task.isOverdue;
      case "resolved":
        return task.status === "RESOLVED";
      case "reopened":
        return task.status === "REOPENED";
      case "inProgress":
        return task.status === "IN_PROGRESS";
      default:
        return true;
    }
  });

  // Handle task status updates
  const handleStartWork = async (taskId: string) => {
    try {
      await updateComplaintStatus({
        id: taskId,
        status: "IN_PROGRESS",
      }).unwrap();
      refetchComplaints();
    } catch (error) {
      console.error("Failed to start work:", error);
      // You might want to show a toast notification here
    }
  };

  const handleMarkResolved = (task: any) => {
    setSelectedTask(task);
    setIsMarkResolvedOpen(true);
  };

  const submitMarkResolved = async () => {
    if (selectedTask) {
      try {
        await updateComplaintStatus({
          id: selectedTask.id,
          status: "RESOLVED",
          remarks: resolveComment,
        }).unwrap();

        // TODO: Handle photo upload when the photo upload modal is implemented
        if (resolvePhoto) {
          console.log("Photo upload would happen here:", resolvePhoto.name);
        }

        setIsMarkResolvedOpen(false);
        setResolveComment("");
        setResolvePhoto(null);
        setSelectedTask(null);
        refetchComplaints();
      } catch (error) {
        console.error("Failed to mark as resolved:", error);
        // You might want to show a toast notification here
      }
    }
  };

  // Handle navigation
  const handleNavigate = (task: any) => {
    if (task.latitude && task.longitude) {
      // Use exact coordinates if available
      window.open(`https://maps.google.com/?q=${task.latitude},${task.longitude}`, "_blank");
    } else {
      // Fallback to address search
      const encodedAddress = encodeURIComponent(task.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank");
    }
  };

  // Handle photo view
  const handleViewPhoto = (photoUrl: string) => {
    window.open(photoUrl, "_blank");
  };

  // Handle photo upload
  const handlePhotoUpload = (task: any) => {
    setSelectedTaskForPhotos(task);
    setIsPhotoUploadOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800";
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "REOPENED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <AlertTriangle className="h-4 w-4" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REOPENED":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error Loading Tasks
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to load your maintenance tasks. Please try again.
          </p>
          <Button onClick={() => refetchComplaints()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Maintenance Tasks
          </h1>
          <p className="text-gray-600">Manage your assigned maintenance work</p>
        </div>
      </div>

      {/* Task Count Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${activeFilter === "all" ? "ring-2 ring-primary" : "hover:bg-gray-50"}`}
          onClick={() => setActiveFilter("all")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">
                  {taskCounts.total}
                </p>
              </div>
              <ListTodo className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${activeFilter === "pending" ? "ring-2 ring-primary" : "hover:bg-gray-50"}`}
          onClick={() => setActiveFilter("pending")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Tasks
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {taskCounts.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${activeFilter === "overdue" ? "ring-2 ring-primary" : "hover:bg-gray-50"}`}
          onClick={() => setActiveFilter("overdue")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Overdue Tasks
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {taskCounts.overdue}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${activeFilter === "resolved" ? "ring-2 ring-primary" : "hover:bg-gray-50"}`}
          onClick={() => setActiveFilter("resolved")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Resolved Tasks
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {taskCounts.resolved}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${activeFilter === "reopened" ? "ring-2 ring-primary" : "hover:bg-gray-50"}`}
          onClick={() => setActiveFilter("reopened")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Reopened Tasks
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {taskCounts.reopened}
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtered Tasks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              My Tasks{" "}
              {activeFilter !== "all" &&
                `(${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)})`}
            </CardTitle>
            <Badge variant="secondary">{filteredTasks.length} tasks</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{task.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      <span className="flex items-center">
                        {getStatusIcon(task.status)}
                        <span className="ml-1">
                          {task.status.replace("_", " ")}
                        </span>
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Est. {task.estimatedTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate(task)}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                    {task.photo ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Camera className="h-3 w-3 mr-1" />
                            Photos
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewPhoto(task.photo)}>
                            View Existing Photo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handlePhotoUpload(task)}>
                            Upload New Photos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePhotoUpload(task)}
                      >
                        <Camera className="h-3 w-3 mr-1" />
                        Add Photos
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {task.status === "ASSIGNED" && (
                      <Button
                        size="sm"
                        onClick={() => handleStartWork(task.id)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start Work
                      </Button>
                    )}
                    {(task.status === "IN_PROGRESS" ||
                      task.status === "REOPENED") && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkResolved(task)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark as Resolved
                      </Button>
                    )}
                    <Link to={`/tasks/${task.id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mark as Resolved Dialog */}
      <Dialog open={isMarkResolvedOpen} onOpenChange={setIsMarkResolvedOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Task as Resolved</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedTask.title}</h4>
                <p className="text-sm text-gray-600">{selectedTask.location}</p>
              </div>

              <div>
                <Label htmlFor="resolveComment">Completion Notes</Label>
                <Textarea
                  id="resolveComment"
                  value={resolveComment}
                  onChange={(e) => setResolveComment(e.target.value)}
                  placeholder="Add notes about the work completed..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="resolvePhoto">Upload Completion Photo</Label>
                <Input
                  id="resolvePhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setResolvePhoto(e.target.files?.[0] || null)}
                />
                {resolvePhoto && (
                  <p className="text-sm text-green-600 mt-1">
                    Photo selected: {resolvePhoto.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsMarkResolvedOpen(false);
                    setResolveComment("");
                    setResolvePhoto(null);
                    setSelectedTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitMarkResolved}
                  disabled={!resolveComment.trim()}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaintenanceTasks;
