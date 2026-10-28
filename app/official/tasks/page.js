"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { getTasks, updateTaskStatus, formatDate } from "@/lib/dataService";

export default function OfficialTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTasks({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search,
      });
      setTasks(data);
      setLoading(false);
    }
    load();
  }, [statusFilter, priorityFilter, search]);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Workflow Tasks" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Assigned Workflow Tasks
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Active verification assignments, discrepancy investigations, and clearance follow-ups.
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                placeholder="Search tasks or institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "OPEN", label: "Open" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: "", label: "All Priorities" },
                { value: "URGENT", label: "Urgent" },
                { value: "HIGH", label: "High" },
                { value: "NORMAL", label: "Normal" },
              ]}
            />
          </div>
        </Card>

        {/* Task Cards */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 hover:border-slate-300 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.priority} type="priority" size="sm" />
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                      {task.task_type}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Due: <strong className="text-slate-800">{formatDate(task.due_at)}</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 max-w-2xl">
                    {task.description}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-1">
                    Institution: <strong>{task.institution_name}</strong> • Assignee: <strong>{task.assigned_to_name}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  {task.status !== "COMPLETED" ? (
                    <>
                      {task.status === "OPEN" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Check}
                          onClick={() => handleUpdateTaskStatus(task.id, "COMPLETED")}
                        >
                          Mark Completed
                        </Button>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  )}

                  {task.instrument_id && (
                    <Link href={`/official/verification/${task.instrument_id}`}>
                      <Button variant="tertiary" size="sm">
                        Inspect Record →
                      </Button>
                    </Link>
                  )}
                  {task.release_request_id && (
                    <Link href={`/official/release/${task.release_request_id}`}>
                      <Button variant="tertiary" size="sm">
                        Inspect Release →
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
