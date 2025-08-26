import { useEffect, useState } from "react";

// @see (link: https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
export const useMediaQuery = (query: string): boolean => {
  const [isMatched, setIsMatched] = useState(false);

  useEffect(() => {
    const onChange = (event: MediaQueryListEvent) => {
      setIsMatched(event.matches);
    };

    const result = window.matchMedia(query);
    result.addEventListener("change", onChange);
    setIsMatched(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, []);

  return isMatched;
};
