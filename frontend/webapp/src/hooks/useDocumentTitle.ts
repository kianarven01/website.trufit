// src/hooks/useDocumentTitle.ts
import { useEffect } from "react";

// set your global site name here
const SITE_NAME = "Trufit Auto Center";

export default function useDocumentTitle(pageTitle: string) {
  useEffect(() => {
    if (pageTitle) {
      document.title = `${pageTitle} | ${SITE_NAME}`;
    } else {
      document.title = SITE_NAME; // fallback if no page title
    }
  }, [pageTitle]);
}