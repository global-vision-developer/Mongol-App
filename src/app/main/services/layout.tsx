
import type React from "react";

export default function ServicesSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The main Header, BottomNav, and Context Providers (LanguageProvider, CityProvider)
  // are already defined in the parent layout: src/app/(main)/layout.tsx.
  // This layout is nested within that parent layout for routes under /services.
  // Therefore, we only need to render the children here.
  // If there were layout elements specific ONLY to the /services/* routes,
  // they would be added here. Otherwise, this file could potentially be removed
  // if it serves no other purpose than wrapping children.
  return <>{children}</>;
}
