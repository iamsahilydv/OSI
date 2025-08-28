"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Package,
  DollarSign,
} from "lucide-react";

interface SearchFilter {
  field: string;
  operator: string;
  value: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  placeholder?: string;
  filters?: {
    name: string;
    label: string;
    type: "text" | "select" | "date" | "number";
    options?: { value: string; label: string }[];
  }[];
}

export default function AdvancedSearch({
  onSearch,
  placeholder = "Search...",
  filters = [],
}: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    onSearch(query, searchFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const addFilter = () => {
    if (filters.length > 0) {
      setSearchFilters([
        ...searchFilters,
        {
          field: filters[0].name,
          operator: "contains",
          value: "",
        },
      ]);
    }
  };

  const removeFilter = (index: number) => {
    setSearchFilters(searchFilters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: string, value: string) => {
    const newFilters = [...searchFilters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setSearchFilters(newFilters);
  };

  const clearAll = () => {
    setQuery("");
    setSearchFilters([]);
    onSearch("", []);
  };

  const getOperatorOptions = (filterType: string) => {
    switch (filterType) {
      case "text":
        return [
          { value: "contains", label: "Contains" },
          { value: "equals", label: "Equals" },
          { value: "starts_with", label: "Starts with" },
          { value: "ends_with", label: "Ends with" },
        ];
      case "number":
        return [
          { value: "equals", label: "Equals" },
          { value: "greater_than", label: "Greater than" },
          { value: "less_than", label: "Less than" },
          { value: "between", label: "Between" },
        ];
      case "date":
        return [
          { value: "equals", label: "Equals" },
          { value: "greater_than", label: "After" },
          { value: "less_than", label: "Before" },
          { value: "between", label: "Between" },
        ];
      default:
        return [{ value: "equals", label: "Equals" }];
    }
  };

  const getFilterType = (fieldName: string) => {
    const filter = filters.find((f) => f.name === fieldName);
    return filter?.type || "text";
  };

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="input pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 rounded hover:bg-gray-100"
              title="Advanced filters"
            >
              <Filter className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <button onClick={handleSearch} className="btn btn-primary btn-sm">
            Search
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && filters.length > 0 && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Advanced Filters</h3>
              <div className="flex items-center gap-2">
                <button onClick={addFilter} className="btn btn-outline btn-sm">
                  Add Filter
                </button>
                <button
                  onClick={clearAll}
                  className="btn btn-ghost btn-sm text-gray-500"
                >
                  Clear All
                </button>
              </div>
            </div>

            {searchFilters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No filters applied</p>
                <p className="text-sm">Click "Add Filter" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchFilters.map((filter, index) => {
                  const filterConfig = filters.find(
                    (f) => f.name === filter.field
                  );
                  const operatorOptions = getOperatorOptions(
                    getFilterType(filter.field)
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                    >
                      {/* Field Select */}
                      <select
                        value={filter.field}
                        onChange={(e) =>
                          updateFilter(index, "field", e.target.value)
                        }
                        className="input flex-1"
                      >
                        {filters.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator Select */}
                      <select
                        value={filter.operator}
                        onChange={(e) =>
                          updateFilter(index, "operator", e.target.value)
                        }
                        className="input flex-1"
                      >
                        {operatorOptions.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Value Input */}
                      {filterConfig?.type === "select" ? (
                        <select
                          value={filter.value}
                          onChange={(e) =>
                            updateFilter(index, "value", e.target.value)
                          }
                          className="input flex-1"
                        >
                          <option value="">Select value</option>
                          {filterConfig.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : filterConfig?.type === "date" ? (
                        <input
                          type="date"
                          value={filter.value}
                          onChange={(e) =>
                            updateFilter(index, "value", e.target.value)
                          }
                          className="input flex-1"
                        />
                      ) : (
                        <input
                          type={
                            filterConfig?.type === "number" ? "number" : "text"
                          }
                          value={filter.value}
                          onChange={(e) =>
                            updateFilter(index, "value", e.target.value)
                          }
                          placeholder="Enter value"
                          className="input flex-1"
                        />
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-1 text-gray-400 hover:text-red-500 interactive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      {(query || searchFilters.length > 0) && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Search results for:</span>
            {query && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                "{query}"
              </span>
            )}
            {searchFilters.length > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {searchFilters.length} filter(s)
              </span>
            )}
          </div>
          <button
            onClick={clearAll}
            className="text-gray-400 hover:text-gray-600"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
