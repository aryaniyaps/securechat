import React, { useState } from "react";
import { useDebounce } from "use-debounce";

interface SearchContextProps {
  searchQuery: string;
  debouncedSearchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchContext = React.createContext<
  SearchContextProps | undefined
>(undefined);

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // delay is set to 1000ms (adjust delay as needed)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery, debouncedSearchQuery }}
    >
      {children}
    </SearchContext.Provider>
  );
};
