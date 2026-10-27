"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  CheckCircle2,
  Filter,
  PlusCircle,
  ExternalLink,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { getInstitutions } from "@/lib/dataService";

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('institutions').select('*, role_assignments(*)')
      const data = await getInstitutions({ search, state: stateFilter || undefined });
      setInstitutions(data);
      setLoading(false);
    }
    load();
  }, [search, stateFilter]);

  return (
    <AppShell
      role="admin"
      breadcrumbs={[
        { label: "Admin Console", href: "/admin/dashboard" },
        { label: "Institutions Directory" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Affiliated Technical Institutions Directory
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered institutions, AICTE permanent IDs, regional bureaus, and assigned administrator accounts.
            </p>
          </div>
        </div>

        {/* Filter */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search institution name, AICTE ID, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              options={[
                { value: "", label: "All States & Union Territories" },
                { value: "Delhi", label: "Delhi" },
                { value: "Tamil Nadu", label: "Tamil Nadu" },
                { value: "Maharashtra", label: "Maharashtra" },
                { value: "Odisha", label: "Odisha" },
                { value: "Punjab", label: "Punjab" },
              ]}
            />
          </div>
        </Card>

        {/* Directory Table */}
        <Table
          loading={loading}
          data={institutions}
          columns={[
            {
              header: "Institution & AICTE ID",
              key: "institution_name",
              render: (row) => (
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    {row.institution_name}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Permanent ID: {row.aicte_institution_id}
                  </span>
                </div>
              ),
            },
            {
              header: "Type & Region",
              key: "institution_type",
              render: (row) => (
                <div>
                  <span className="text-xs text-slate-800 font-medium block">
                    {row.institution_type}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {row.region} ({row.state})
                  </span>
                </div>
              ),
            },
            {
              header: "Approved Intake",
              key: "approved_intake",
              align: "right",
              render: (row) => (
                <span className="font-bold text-slate-800 text-xs font-tabular-nums">
                  {row.approved_intake} seats
                </span>
              ),
            },
            {
              header: "Official Contact",
              key: "official_email",
              render: (row) => (
                <div className="text-xs">
                  <span className="text-slate-800 font-medium block">
                    {row.official_email}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {row.official_phone}
                  </span>
                </div>
              ),
            },
            {
              header: "Status",
              key: "status",
              render: (row) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Active
                </span>
              ),
            },
            {
              header: "Action",
              align: "right",
              render: (row) => (
                <Link href={`/official/verification?search=${encodeURIComponent(row.institution_name)}`}>
                  <Button variant="secondary" size="sm">
                    FDR Portfolio →
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
