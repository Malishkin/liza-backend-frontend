import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useDocumentTitle = (titles) => {
  const location = useLocation();

  useEffect(() => {
    const title = titles[location.pathname] || "El Messeg";
    document.title = title;
  }, [location, titles]);
};

export default useDocumentTitle;
