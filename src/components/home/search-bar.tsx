import { useContext } from "react";
import { Input } from "../ui/input";
import { SearchContext } from "./search-provider";

export function SearchBar() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("SearchBar must be used within a SearchProvider");
  }

  const { searchQuery, setSearchQuery } = context;

  return (
    <Input
      type="text"
      value={searchQuery}
      onChange={(event) => setSearchQuery(event.target.value)}
      placeholder="search rooms here..."
    />
  );
}
