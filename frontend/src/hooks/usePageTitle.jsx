import { useEffect } from "react";

const usePageTitle = (title) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} - AI Examiner`;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default usePageTitle;
