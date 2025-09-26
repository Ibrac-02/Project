import { useEffect, useRef, useState } from 'react';
import { performSmartSearch, SearchResult } from '../lib/searchUtils';

interface UseSmartSearchOptions {
  debounceTime?: number; // Time in milliseconds to debounce the search input
}

interface UseSmartSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  loading: boolean;
  error: string | null;
}

export const useSmartSearch = (options?: UseSmartSearchOptions): UseSmartSearchReturn => {
  const { debounceTime = 300 } = options || {};
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadRef = useRef(true); // To prevent initial search on mount

  useEffect(() => {
    // Skip the initial render to prevent searching with an empty string on mount
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const handler = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const results = await performSmartSearch(searchTerm);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to perform search. Please try again.");
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debounceTime]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    error,
  };
};
