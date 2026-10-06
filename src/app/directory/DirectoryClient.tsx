"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { safeLinkedIn } from "@/lib/links";
import { classifyField, CORE_FIELDS } from "@/lib/core-fields";
import { type ConnectionStatus, type ConnectionRecord } from "@/lib/connections";
import { ConnectionSelect } from "@/components/ConnectionTracker";
import { CompanyLogo } from "@/components/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Mail, Search, X, ChevronLeft, ChevronRight, ArrowUpDown, SlidersHorizontal, ChevronDown } from "lucide-react";

export interface AlumnusRecord {
  id: string;
  name: string;
  gradYear: number | null;
  email: string | null;
  linkedInUrl: string | null;
  company: string | null;
  pastCompanies?: string[];
  employmentVerifiedAt?: Date | null;
  role: string | null;
  major: string | null;
  location: string | null;
  industry: string | null;
  willingToMentor: boolean;
  willingToSpeak: boolean;
  notes: string | null;
  adminNotes: string | null;
  unsubscribed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DirectoryClientProps {
  alumni: AlumnusRecord[];
}

const NA = <span className="text-gray-400 italic text-xs">Not provided</span>;

function field(val: string | null | undefined) {
  return val && val.trim() ? val.trim() : null;
}

export function DirectoryClient({ alumni }: DirectoryClientProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [companyScope, setCompanyScope] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterField, setFilterField] = useState<string>("all");
  const [filterMentor, setFilterMentor] = useState<string>("all");
  const [connectionView, setConnectionView] = useState("all");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({});
  const favorites = useMemo(() => new Set(Object.keys(connections)), [connections]);
  const fieldById = useMemo(() => new Map(alumni.map(a => [a.id, classifyField(a)])), [alumni]);

  const [favoritesReady, setFavoritesReady] = useState(false);
  const [favoritesError, setFavoritesError] = useState("");
  const [savingFavorites, setSavingFavorites] = useState<Set<string>>(new Set());
  useEffect(() => {
    let active = true;
    fetch("/api/connections").then(async res => { if(!res.ok) throw new Error(); return res.json(); }).then((records:ConnectionRecord[])=>{ if(active) { setConnections(Object.fromEntries(records.map(r => [r.alumniId, r.status]))); setFavoritesReady(true); } }).catch(()=>{if(active) setFavoritesError("Could not load your saved contacts. Refresh to try again.");});
    return ()=>{active=false;};
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const saveConnection = useCallback(async (id: string, status: ConnectionStatus | null) => {
    if (savingFavorites.has(id)) return;
    setSavingFavorites(prev => new Set(prev).add(id));
    setFavoritesError("");
    try {
      const res = await fetch(`/api/connections/${encodeURIComponent(id)}`, {
        method: status ? "PATCH" : "DELETE", headers: { "Content-Type": "application/json" },
        ...(status ? { body: JSON.stringify({ status }) } : {}),
      });
      if (!res.ok) throw new Error();
      setConnections(prev => { const next = { ...prev }; if (status) next[id] = status; else delete next[id]; return next; });
    } catch { setFavoritesError("Could not save your contact status. Please try again."); }
    finally { setSavingFavorites(prev => { const next = new Set(prev); next.delete(id); return next; }); }
  }, [savingFavorites]);

  const toggleFavorite = useCallback((id: string) => saveConnection(id, favorites.has(id) ? null : "WANT_TO_TALK"), [favorites, saveConnection]);

  // Build unique option lists
  const gradYears = useMemo(() => {
    const years = alumni
      .map((a) => a.gradYear)
      .filter((y): y is number => y !== null && y !== undefined);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [alumni]);

  const fields = useMemo(() => CORE_FIELDS.filter(field => alumni.some(a => fieldById.get(a.id)?.fields.includes(field))), [alumni, fieldById]);

  const companies = useMemo(() => Array.from(new Set(alumni.flatMap(a => [a.company?.trim(), ...(a.pastCompanies ?? [])]).filter((company): company is string => !!company))).sort((a, b) => a.localeCompare(b)), [alumni]);

  const locations = useMemo(() => Array.from(new Set(alumni.map(a => a.location?.trim()).filter((v): v is string => !!v))).sort(), [alumni]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filterCompany, filterLocation, companyScope, filterYear, filterField, filterMentor, connectionView, sortBy, pageSize]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...alumni];

    // Private contact lists
    if (connectionView === "saved") result = result.filter(a => favorites.has(a.id));
    else if (connectionView !== "all") result = result.filter(a => connections[a.id] === connectionView);

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter((a) =>
        [a.name, a.company, ...(a.pastCompanies ?? []), a.role, a.email, a.major, ...(fieldById.get(a.id)?.fields ?? []), a.location]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      );
    }

    if (filterCompany.trim()) {
      const companyQuery = filterCompany.trim().toLowerCase();
      result = result.filter(a => {
        const current = companyScope !== "past" && !!a.company?.toLowerCase().includes(companyQuery);
        const past = companyScope !== "current" && (a.pastCompanies ?? []).some(c => c.toLowerCase().includes(companyQuery));
        return current || past;
      });
    }

    if (filterLocation.trim()) {
      const query = filterLocation.trim().toLowerCase();
      result = result.filter(a => a.location?.toLowerCase().includes(query));
    }

    // Year filter
    if (filterYear !== "all") {
      const yr = parseInt(filterYear);
      result = result.filter((a) => a.gradYear === yr);
    }

    // Core field filter
    if (filterField !== "all") {
      result = result.filter((a) => fieldById.get(a.id)?.fields.includes(filterField as typeof CORE_FIELDS[number]));
    }

    // Mentor filter
    if (filterMentor === "yes") {
      result = result.filter((a) => a.willingToMentor);
    } else if (filterMentor === "no") {
      result = result.filter((a) => !a.willingToMentor);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "year-desc":
          return (b.gradYear ?? 0) - (a.gradYear ?? 0);
        case "year-asc":
          return (a.gradYear ?? 0) - (b.gradYear ?? 0);
        case "company-desc":
          return (b.company ?? "").localeCompare(a.company ?? "");
        case "company-asc":
          return (a.company ?? "").localeCompare(b.company ?? "");
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [alumni, debouncedSearch, filterCompany, filterLocation, companyScope, filterYear, filterField, filterMentor, connectionView, sortBy, favorites, connections, fieldById]);

  const clearFilters = () => {
    setPage(1);
    setFilterCompany("");
    setFilterLocation("");
    setCompanyScope("all");
    setSearch("");
    setDebouncedSearch("");
    setFilterYear("all");
    setFilterField("all");
    setFilterMentor("all");
    setConnectionView("all");
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    search || filterCompany || filterLocation || companyScope !== "all" ||
    filterYear !== "all" ||
    filterField !== "all" ||
    filterMentor !== "all" ||
    connectionView !== "all";

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const visibleAlumni = filtered.slice(offset, offset + pageSize);
  function sortColumn(column: string) {
    setSortBy(sortBy === `${column}-asc` ? `${column}-desc` : `${column}-asc`);
  }

  return (
    <div className="directory-workspace">
      <div className="connection-views" role="group" aria-label="Contact lists">
        {([
          ["all", "All members", alumni.length],
          ["saved", "Saved", favorites.size],
          ["WANT_TO_TALK", "Want to talk", Object.values(connections).filter(s => s === "WANT_TO_TALK").length],
          ["TALKED_TO", "Talked to", Object.values(connections).filter(s => s === "TALKED_TO").length],
        ] as const).map(([value, label, count]) => <button key={value} type="button" aria-pressed={connectionView === value}
          disabled={value !== "all" && !favoritesReady} onClick={() => setConnectionView(value)}>
          {label}<span>{value === "all" || favoritesReady ? count : "—"}</span>
        </button>)}
        <span className="connection-privacy">Your saved contacts are private.</span>
      </div>
      {/* Controls */}
      <div className="directory-controls">
        {/* Search */}
        <div className="directory-search-row"><div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            aria-label="Search alumni"
            type="search"
            placeholder="Find a person, company, role, or major…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 directory-search"
          />
        </div>

        <button type="button" className="filter-disclosure" aria-expanded={filtersOpen} aria-controls="directory-filter-panel" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16}/> Filters {hasActiveFilters && <span className="filter-active-dot"/>}<ChevronDown size={14}/></button></div>
        {/* Filters row */}
        <div id="directory-filter-panel" className={`directory-filters ${filtersOpen ? "expanded" : ""}`}>
          <div className="relative w-full sm:w-64">
            <Input aria-label="Filter by company" type="search" list="directory-companies" placeholder="All companies — type to filter" value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="pr-8" />
            <datalist id="directory-companies">{companies.map(company => <option key={company} value={company} />)}</datalist>
          </div>
          <select aria-label="Company history filter" value={companyScope} onChange={e => setCompanyScope(e.target.value)} className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm">
            <option value="all">Current & past companies</option>
            <option value="current">Current / reported company</option>
            <option value="past">Past companies only</option>
          </select>
          <div className="w-full sm:w-64">
            <Input aria-label="Filter by location" type="search" list="directory-locations" placeholder="All locations — type to filter" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} />
            <datalist id="directory-locations">{locations.map(location => <option key={location} value={location} />)}</datalist>
          </div>
          {/* Grad Year */}
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger aria-label="Graduation year" className="w-36">
              <SelectValue placeholder="Grad Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {gradYears.map((yr) => (
                <SelectItem key={yr} value={String(yr)}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Field */}
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger aria-label="Field" className="w-44">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fields</SelectItem>
              {fields.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mentor */}
          <Select value={filterMentor} onValueChange={setFilterMentor}>
            <SelectTrigger aria-label="Mentorship" className="w-44">
              <SelectValue placeholder="Mentorship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mentorship</SelectItem>
              <SelectItem value="yes">Willing to Mentor</SelectItem>
              <SelectItem value="no">Not Mentoring</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger aria-label="Sort alumni" className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                <SelectItem value="year-desc">Year (Newest)</SelectItem>
                <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                <SelectItem value="company-asc">Company (A–Z)</SelectItem>
                <SelectItem value="company-desc">Company (Z–A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {favoritesError && <p role="alert" className="form-error my-3">{favoritesError}</p>}
      {/* Result count */}
      <p role="status" aria-live="polite" className="directory-result-count">
        Showing{" "}
        <span className="font-semibold text-[#1e3a5f]">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "alumnus" : "alumni"}
        {alumni.length !== filtered.length && ` of ${alumni.length} total`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-gray-500">No results found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <div className="directory-table-panel">
          <div className="max-h-[75vh] overflow-auto" tabIndex={0} role="region" aria-label="Alumni directory table, scroll to see more columns">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <caption className="sr-only">Alumni directory with company, field, location, contact status, and contact links</caption>
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  {[["name", "Alumni"], ["year", "Class"], ["company", "Company & role"]].map(([key, label]) => (
                    <th key={key} scope="col" className="border-b border-slate-200 px-4 py-4" aria-sort={sortBy.startsWith(key + "-") ? (sortBy.endsWith("asc") ? "ascending" : "descending") : "none"}>
                      <button onClick={() => sortColumn(key)} className="flex items-center gap-2 font-semibold hover:text-[#1e3a5f]" aria-label={`Sort by ${label}`}>
                        {label}<ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="border-b border-slate-200 px-4 py-4">Field</th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-4">Location</th>
                  <th scope="col" className="border-b border-slate-200 px-4 py-4">Connect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleAlumni.map(alumnus => <AlumnusRow key={alumnus.id} alumnus={alumnus} status={connections[alumnus.id] ?? null} isSaving={!favoritesReady || savingFavorites.has(alumnus.id)} onToggleFavorite={toggleFavorite} onStatusChange={saveConnection} />)}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
            <span>{offset + 1}–{Math.min(offset + pageSize, filtered.length)} of {filtered.length} alumni</span>
            <div className="flex items-center gap-3">
              <label className="hidden items-center gap-2 sm:flex">Rows
                <select aria-label="Rows per page" value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-700">
                  {[25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
              <Button variant="outline" size="icon" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="tabular-nums">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="icon" aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AlumnusRowProps {
  alumnus: AlumnusRecord;
  status: ConnectionStatus | null;
  isSaving: boolean;
  onToggleFavorite: (id: string) => void;
  onStatusChange: (id: string, status: ConnectionStatus | null) => void;
}

function AlumnusRow({ alumnus, status, isSaving, onToggleFavorite, onStatusChange }: AlumnusRowProps) {
  const isFavorited = !!status;
  const classification = classifyField(alumnus);
  const company = field(alumnus.company);
  return (
    <tr className="group transition-colors hover:bg-[#f5f8fc] focus-within:bg-[#f5f8fc]">
      <td className="w-[23%] px-4 py-4 align-top">
        <div className="flex items-start gap-2">
          <button disabled={isSaving} onClick={() => onToggleFavorite(alumnus.id)} aria-pressed={isFavorited} aria-label={`${isFavorited ? "Remove" : "Add"} ${alumnus.name} ${isFavorited ? "from" : "to"} saved contacts`} className="mt-0.5 rounded p-1 text-slate-300 hover:bg-amber-50 hover:text-[#c9a84c]">
            <Star className={`h-4 w-4 ${isFavorited ? "fill-[#c9a84c] text-[#c9a84c]" : ""}`} />
          </button>
          <span className="member-initials" aria-hidden="true">{alumnus.name.split(/\s+/).filter(Boolean).slice(0,2).map(n=>n[0]).join("")}</span>
          <div>
            <Link href={`/alumni/${alumnus.id}`} className="font-semibold leading-6 text-[#1e3a5f] hover:underline">{alumnus.name}</Link>
            <ConnectionSelect name={alumnus.name} status={status} disabled={isSaving} onChange={next => onStatusChange(alumnus.id, next)}/>
            {alumnus.willingToMentor && <Badge className="mt-1 block w-fit border-emerald-100 bg-emerald-50 text-[10px] font-medium text-emerald-700">Open to mentor</Badge>}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-top tabular-nums text-slate-500">{alumnus.gradYear ?? NA}</td>
      <td className="w-[25%] px-4 py-4 align-top">
        <div className="flex items-start gap-3">
          {company && <CompanyLogo key={company} company={company} />}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{alumnus.employmentVerifiedAt ? "Current" : "Reported · unverified"}</p>
            <p className="font-medium leading-5 text-slate-800">{company ?? (alumnus.employmentVerifiedAt ? "Current company not listed" : NA)}</p>
            {field(alumnus.role) && <p className="mt-1 text-xs leading-5 text-slate-500">{alumnus.role}</p>}
          </div>
        </div>
        {!!alumnus.pastCompanies?.length && <p className="mt-2 text-xs leading-5 text-slate-500"><span className="font-medium">Previously:</span> {alumnus.pastCompanies.join(" · ")}</p>}
      </td>
      <td className="w-[18%] px-4 py-4 align-top text-xs leading-5 text-slate-600">{classification.fields.length ? <><div className="core-field-tags">{classification.fields.map(f => <span key={f}>{f}</span>)}</div><small className="field-source">{classification.source === "role" ? "From role" : "From education"}</small></> : NA}</td>
      <td className="w-[19%] px-4 py-4 align-top">
        <p className="text-xs leading-5 text-slate-500">{field(alumnus.location) ?? NA}</p>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex items-center gap-1">
          {alumnus.email && <a href={`mailto:${alumnus.email}`} title={alumnus.email} aria-label={`Email ${alumnus.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-[#1e3a5f]"><Mail className="h-4 w-4" /></a>}
          {safeLinkedIn(alumnus.linkedInUrl) && <a href={safeLinkedIn(alumnus.linkedInUrl)!} target="_blank" rel="noopener noreferrer" title="LinkedIn profile" aria-label={`${alumnus.name} on LinkedIn`} className="rounded-lg p-2 text-[#0077b5] hover:bg-blue-50"><ExternalLink className="h-4 w-4" /></a>}
          {!alumnus.email && !alumnus.linkedInUrl && <span className="text-slate-300">—</span>}
        </div>
      </td>
    </tr>
  );
}
