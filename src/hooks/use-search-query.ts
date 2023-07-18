import { useContext } from "react";
import { SearchContext } from "~/components/home/search-provider";

export const useSearchQuery = () => {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("SearchProvider not found");
  }
  return context;
};
