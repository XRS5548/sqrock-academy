"use client";

import { PrinterIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="lg"
      className="h-9 rounded-lg px-4 text-xs print:hidden"
      onClick={() => window.print()}
    >
      <PrinterIcon data-icon="inline-start" />
      Print / save as PDF
    </Button>
  );
}
