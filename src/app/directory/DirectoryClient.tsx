"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Star, ExternalLink, Mail, Search, X } from "lucide-react";

export interface AlumnusRecord {
  id: string;
  name: string;
  gradYear: number | null;
  email: string | null;
  linkedInUrl: string | null;
  company: string | null;
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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterIndustry, setFilterIndustry] = useState<string>("all");
  const [filterMentor, setFilterMentor] = useState<string>("all");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("akpsi-favorites");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        setFavorites(new Set(ids));
      }
    } catch {
      // ignore
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem("akpsi-favorites", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Build unique option lists
  const gradYears = useMemo(() => {
    const years = alumni
      .map((a) => a.gradYear)
      .filter((y): y is number => y !== null && y !== undefined);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [alumni]);

  const industries = useMemo(() => {
    const inds = alumni
      .map((a) => a.industry)
      .filter((i): i is string => !!i && i.trim() !== "");
    return Array.from(new Set(inds)).sort();
  }, [alumni]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...alumni];

    // Favorites filter
    if (filterFavorites) {
      result = result.filter((a) => favorites.has(a.id));
    }

    // Search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter((a) =>
        [a.name, a.company, a.email, a.major, a.industry, a.location]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      );
    }

    // Year filter
    if (filterYear !== "all") {
      const yr = parseInt(filterYear);
      result = result.filter((a) => a.gradYear === yr);
    }

    // Industry filter
    if (filterIndustry !== "all") {
      result = result.filter((a) => a.industry === filterIndustry);
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
        case "company-asc":
          return (a.company ?? "").localeCompare(b.company ?? "");
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [alumni, debouncedSearch, filterYear, filterIndustry, filterMentor, filterFavorites, sortBy, favorites]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilterYear("all");
    setFilterIndustry("all");
    setFilterMentor("all");
    setFilterFavorites(false);
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    search ||
    filterYear !== "all" ||
    filterIndustry !== "all" ||
    filterMentor !== "all" ||
    filterFavorites;

  return (
    <div>
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by name, company, email, major, industry, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Grad Year */}
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-36">
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

          {/* Industry */}
          <Select value={filterIndustry} onValueChange={setFilterIndustry}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mentor */}
          <Select value={filterMentor} onValueChange={setFilterMentor}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Mentorship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mentorship</SelectItem>
              <SelectItem value="yes">Willing to Mentor</SelectItem>
              <SelectItem value="no">Not Mentoring</SelectItem>
            </SelectContent>
          </Select>

          {/* Favorites toggle */}
          <Button
            variant={filterFavorites ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterFavorites((v) => !v)}
            className={
              filterFavorites
                ? "bg-[#c9a84c] text-[#1e3a5f] hover:bg-[#b8963d] border-[#c9a84c]"
                : "border-gray-300"
            }
          >
            <Star className="w-3.5 h-3.5 mr-1.5" />
            Favorites
          </Button>

          {/* Sort */}
          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A–Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z–A)</SelectItem>
                <SelectItem value="year-desc">Year (Newest)</SelectItem>
                <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                <SelectItem value="company-asc">Company (A–Z)</SelectItem>
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

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((alumnus) => (
            <AlumnusCard
              key={alumnus.id}
              alumnus={alumnus}
              isFavorited={favorites.has(alumnus.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AlumnusCardProps {
  alumnus: AlumnusRecord;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

function AlumnusCard({ alumnus, isFavorited, onToggleFavorite }: AlumnusCardProps) {
  const name = field(alumnus.name);
  const company = field(alumnus.company);
  const role = field(alumnus.role);
  const email = field(alumnus.email);
  const linkedIn = field(alumnus.linkedInUrl);
  const major = field(alumnus.major);
  const location = field(alumnus.location);
  const industry = field(alumnus.industry);

  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col relative">
      {/* Favorite star */}
      <button
        onClick={() => onToggleFavorite(alumnus.id)}
        className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={`w-4 h-4 transition-colors ${
            isFavorited
              ? "fill-[#c9a84c] text-[#c9a84c]"
              : "text-gray-300 hover:text-[#c9a84c]"
          }`}
        />
      </button>

      <CardHeader className="pb-0 pr-10">
        <CardTitle>
          <Link
            href={`/alumni/${alumnus.id}`}
            className="text-[#1e3a5f] hover:text-[#c9a84c] hover:underline transition-colors font-bold leading-snug"
          >
            {name ?? "Unknown"}
          </Link>
        </CardTitle>
        {alumnus.gradYear && (
          <Badge
            className="w-fit mt-1 bg-[#1e3a5f] text-white border-[#1e3a5f] text-xs"
          >
            Class of {alumnus.gradYear}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-2 pt-3">
        {/* Company & Role */}
        <div>
          {company ? (
            <p className="text-sm font-medium text-gray-800">{company}</p>
          ) : (
            <p className="text-sm">{NA}</p>
          )}
          {role && (
            <p className="text-xs text-gray-500">{role}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Details */}
        <div className="space-y-1 text-xs">
          <Row label="Major">{major ? major : NA}</Row>
          <Row label="Location">{location ? location : NA}</Row>
          <Row label="Industry">{industry ? industry : NA}</Row>
        </div>

        {/* Badges */}
        {alumnus.willingToMentor && (
          <Badge className="w-fit bg-green-100 text-green-800 border-green-200 text-xs">
            Open to Mentor
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1 text-xs text-[#1e3a5f] hover:text-[#c9a84c] transition-colors"
              title={`Email ${name}`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{email}</span>
            </a>
          )}
          {linkedIn && (
            <a
              href={linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs bg-[#0077b5] text-white px-2 py-1 rounded hover:bg-[#005582] transition-colors shrink-0"
              title="LinkedIn Profile"
            >
              <ExternalLink className="w-3 h-3" />
              LinkedIn
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-1">
      <span className="text-gray-400 shrink-0">{label}:</span>
      <span className="text-gray-700 truncate">{children}</span>
    </div>
  );
}
