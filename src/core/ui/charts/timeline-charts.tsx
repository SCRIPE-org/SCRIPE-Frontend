"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";

// Simple timeline component using CSS
const TimelineChart = ({ data, colors, title, description }: any) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "مكتمل":
        return "#22c55e";
      case "in progress":
      case "قيد التقدم":
        return "#f59e0b";
      case "pending":
      case "معلق":
        return "#6b7280";
      case "upcoming":
      case "قادم":
        return "#3b82f6";
      case "delivered":
      case "تم التسليم":
        return "#10b981";
      case "in transit":
      case "في الطريق":
        return "#06b6d4";
      case "released":
      case "تم الإصدار":
        return "#8b5cf6";
      case "in development":
      case "قيد التطوير":
        return "#f97316";
      default:
        return colors[0];
    }
  };

  return (
    <Card className="hover:shadow-3xl w-full border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-base text-slate-300">{description}</CardDescription>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>
              Completed:{" "}
              {
                data.filter(
                  (item: any) =>
                    item.status.toLowerCase().includes("completed") || item.status.includes("مكتمل")
                ).length
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <span>
              In Progress:{" "}
              {
                data.filter(
                  (item: any) =>
                    item.status.toLowerCase().includes("progress") || item.status.includes("تقدم")
                ).length
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gray-500"></div>
            <span>
              Pending:{" "}
              {
                data.filter(
                  (item: any) =>
                    item.status.toLowerCase().includes("pending") || item.status.includes("معلق")
                ).length
              }
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-inner">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-0 left-8 top-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="space-y-8">
              {data.map((item: any, index: number) => {
                const statusColor = getStatusColor(item.status);
                const isCompleted =
                  item.status.toLowerCase().includes("completed") || item.status.includes("مكتمل");

                return (
                  <div key={index} className="group relative flex items-start">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-6 z-10 h-4 w-4 rounded-full border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:shadow-xl ${
                        isCompleted ? "animate-pulse" : ""
                      }`}
                      style={{ backgroundColor: statusColor }}
                    >
                      {/* Inner pulse for active items */}
                      {!isCompleted && (
                        <div
                          className="absolute inset-0 animate-ping rounded-full opacity-75"
                          style={{ backgroundColor: statusColor }}
                        ></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="ml-16 flex-1">
                      <div className="rounded-lg border border-slate-600/50 bg-slate-700/50 p-4 transition-all duration-300 hover:border-slate-500 hover:bg-slate-700/70 group-hover:scale-[1.02] group-hover:shadow-lg">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white transition-colors duration-200 group-hover:text-blue-300">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-slate-600/50 px-2 py-1 text-sm text-slate-300">
                              {item.date}
                            </span>
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: statusColor }}
                            ></div>
                          </div>
                        </div>
                        <p className="mb-3 text-sm text-slate-300 transition-colors duration-200 group-hover:text-slate-200">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: statusColor }}
                            ></div>
                            <span className="text-xs font-medium text-slate-400">
                              {item.status}
                            </span>
                          </div>
                          <div className="rounded bg-slate-600/30 px-2 py-1 text-xs text-slate-400">
                            Duration: {item.duration}
                          </div>
                        </div>

                        {/* Progress bar for in-progress items */}
                        {item.status.toLowerCase().includes("progress") ||
                          (item.status.includes("تقدم") && (
                            <div className="mt-3">
                              <div className="h-1.5 w-full rounded-full bg-slate-600">
                                <div
                                  className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                                  style={{ width: `${((index * 13) % 40) + 30}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                Progress: {Math.round(((index * 13) % 40) + 30)}%
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline summary */}
          <div className="mt-8 rounded-lg border border-slate-600/50 bg-slate-700/30 p-4">
            <div className="mb-2 text-sm text-slate-300">Timeline Summary:</div>
            <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
              <div className="text-center">
                <div className="font-bold text-green-400">{data.length}</div>
                <div className="text-slate-400">Total Items</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-400">
                  {
                    data.filter(
                      (item: any) =>
                        item.status.toLowerCase().includes("completed") ||
                        item.status.includes("مكتمل")
                    ).length
                  }
                </div>
                <div className="text-slate-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-400">
                  {
                    data.filter(
                      (item: any) =>
                        item.status.toLowerCase().includes("progress") ||
                        item.status.includes("تقدم")
                    ).length
                  }
                </div>
                <div className="text-slate-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-400">
                  {
                    data.filter(
                      (item: any) =>
                        item.status.toLowerCase().includes("pending") ||
                        item.status.includes("معلق")
                    ).length
                  }
                </div>
                <div className="text-slate-400">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function ProfessionalTimelineCharts() {
  const { t } = useI18n();

  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  const projectTimelineData = [
    {
      title: t("charts.common.phase1"),
      description: t("charts.common.phase1Description"),
      date: "2024-01-01",
      status: t("charts.common.completed"),
      duration: "10 days",
    },
    {
      title: t("charts.common.phase2"),
      description: t("charts.common.phase2Description"),
      date: "2024-01-15",
      status: t("charts.common.completed"),
      duration: "15 days",
    },
    {
      title: t("charts.common.phase3"),
      description: t("charts.common.phase3Description"),
      date: "2024-02-01",
      status: t("charts.common.inProgress"),
      duration: "12 days",
    },
    {
      title: t("charts.common.phase4"),
      description: t("charts.common.phase4Description"),
      date: "2024-02-15",
      status: t("charts.common.pending"),
      duration: "8 days",
    },
  ];

  const milestoneTimelineData = [
    {
      title: t("charts.common.milestoneA"),
      description: t("charts.common.milestoneADescription"),
      date: "2024-01-05",
      status: t("charts.common.completed"),
      duration: "5 days",
    },
    {
      title: t("charts.common.milestoneB"),
      description: t("charts.common.milestoneBDescription"),
      date: "2024-01-20",
      status: t("charts.common.completed"),
      duration: "7 days",
    },
    {
      title: t("charts.common.milestoneC"),
      description: t("charts.common.milestoneCDescription"),
      date: "2024-02-05",
      status: t("charts.common.inProgress"),
      duration: "6 days",
    },
  ];

  const eventTimelineData = [
    {
      title: t("charts.common.event1"),
      description: t("charts.common.event1Description"),
      date: "2024-01-10",
      status: t("charts.common.completed"),
      duration: "1 day",
    },
    {
      title: t("charts.common.event2"),
      description: t("charts.common.event2Description"),
      date: "2024-01-25",
      status: t("charts.common.completed"),
      duration: "1 day",
    },
    {
      title: t("charts.common.event3"),
      description: t("charts.common.event3Description"),
      date: "2024-02-10",
      status: t("charts.common.upcoming"),
      duration: "1 day",
    },
    {
      title: t("charts.common.event4"),
      description: t("charts.common.event4Description"),
      date: "2024-02-25",
      status: t("charts.common.upcoming"),
      duration: "1 day",
    },
  ];

  const ganttChartData = [
    {
      title: t("charts.common.taskA"),
      description: t("charts.common.taskADescription"),
      date: "2024-01-01",
      status: t("charts.common.completed"),
      duration: "5 days",
    },
    {
      title: t("charts.common.taskB"),
      description: t("charts.common.taskBDescription"),
      date: "2024-01-08",
      status: t("charts.common.completed"),
      duration: "7 days",
    },
    {
      title: t("charts.common.taskC"),
      description: t("charts.common.taskCDescription"),
      date: "2024-01-15",
      status: t("charts.common.inProgress"),
      duration: "6 days",
    },
    {
      title: t("charts.common.taskD"),
      description: t("charts.common.taskDDescription"),
      date: "2024-01-22",
      status: t("charts.common.pending"),
      duration: "4 days",
    },
  ];

  const resourceAllocationData = [
    {
      title: t("charts.common.resource1"),
      description: t("charts.common.resource1Description"),
      date: "2024-01-01",
      status: t("charts.common.allocated"),
      duration: "20 days",
    },
    {
      title: t("charts.common.resource2"),
      description: t("charts.common.resource2Description"),
      date: "2024-01-10",
      status: t("charts.common.allocated"),
      duration: "15 days",
    },
    {
      title: t("charts.common.resource3"),
      description: t("charts.common.resource3Description"),
      date: "2024-01-20",
      status: t("charts.common.available"),
      duration: "25 days",
    },
  ];

  const deliveryTimelineData = [
    {
      title: t("charts.common.order1"),
      description: t("charts.common.order1Description"),
      date: "2024-01-01",
      status: t("charts.common.delivered"),
      duration: "3 days",
    },
    {
      title: t("charts.common.order2"),
      description: t("charts.common.order2Description"),
      date: "2024-01-05",
      status: t("charts.common.delivered"),
      duration: "5 days",
    },
    {
      title: t("charts.common.order3"),
      description: t("charts.common.order3Description"),
      date: "2024-01-10",
      status: t("charts.common.inTransit"),
      duration: "2 days",
    },
  ];

  const sprintTimelineData = [
    {
      title: t("charts.common.sprint1"),
      description: t("charts.common.sprint1Description"),
      date: "2024-01-01",
      status: t("charts.common.completed"),
      duration: "14 days",
    },
    {
      title: t("charts.common.sprint2"),
      description: t("charts.common.sprint2Description"),
      date: "2024-01-15",
      status: t("charts.common.completed"),
      duration: "14 days",
    },
    {
      title: t("charts.common.sprint3"),
      description: t("charts.common.sprint3Description"),
      date: "2024-01-29",
      status: t("charts.common.inProgress"),
      duration: "14 days",
    },
  ];

  const releaseTimelineData = [
    {
      title: t("charts.common.release1"),
      description: t("charts.common.release1Description"),
      date: "2024-01-01",
      status: t("charts.common.released"),
      duration: "30 days",
    },
    {
      title: t("charts.common.release2"),
      description: t("charts.common.release2Description"),
      date: "2024-02-01",
      status: t("charts.common.inDevelopment"),
      duration: "45 days",
    },
  ];

  return (
    <div className="space-y-8">
      <TimelineChart
        data={projectTimelineData}
        colors={colors}
        title={t("charts.timeline.project.title")}
        description={t("charts.timeline.project.description")}
      />

      <TimelineChart
        data={milestoneTimelineData}
        colors={colors}
        title={t("charts.timeline.milestone.title")}
        description={t("charts.timeline.milestone.description")}
      />

      <TimelineChart
        data={eventTimelineData}
        colors={colors}
        title={t("charts.timeline.event.title")}
        description={t("charts.timeline.event.description")}
      />

      <TimelineChart
        data={ganttChartData}
        colors={colors}
        title={t("charts.timeline.gantt.title")}
        description={t("charts.timeline.gantt.description")}
      />

      <TimelineChart
        data={resourceAllocationData}
        colors={colors}
        title={t("charts.timeline.resource.title")}
        description={t("charts.timeline.resource.description")}
      />

      <TimelineChart
        data={deliveryTimelineData}
        colors={colors}
        title={t("charts.timeline.delivery.title")}
        description={t("charts.timeline.delivery.description")}
      />

      <TimelineChart
        data={sprintTimelineData}
        colors={colors}
        title={t("charts.timeline.sprint.title")}
        description={t("charts.timeline.sprint.description")}
      />

      <TimelineChart
        data={releaseTimelineData}
        colors={colors}
        title={t("charts.timeline.release.title")}
        description={t("charts.timeline.release.description")}
      />
    </div>
  );
}
