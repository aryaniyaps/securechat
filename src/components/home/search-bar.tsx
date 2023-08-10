import { useSearchQuery } from "~/hooks/use-search-query";
import { Input } from "../ui/input";

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useSearchQuery();

  return (
    <Input
      type="text"
      value={searchQuery}
      onChange={(event) => setSearchQuery(event.target.value)}
      placeholder="search rooms here..."
      data-testid="search-bar-input"
    />
  );
}
