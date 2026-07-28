import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface PDFPreviewProps {
  pdfBlobUrl: string | null;
  title?: string;
  onClose: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  open: boolean;
  language?: "en" | "am";
}

export function PDFPreview({
  pdfBlobUrl,
  title = "Document Preview",
  onClose,
  onDownload,
  onPrint,
  open,
  language = "en",
}: PDFPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = useCallback(() => setZoom((prev) => Math.min(prev + 25, 300)), []);
  const handleZoomOut = useCallback(() => setZoom((prev) => Math.max(prev - 25, 25)), []);
  const handleRotate = useCallback(() => setRotation((prev) => (prev + 90) % 360), []);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl, "_blank");
      printWindow?.print();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (pdfBlobUrl) {
      const link = document.createElement("a");
      link.href = pdfBlobUrl;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent
        size="full"
        showClose={false}
        className="h-[95vh] flex flex-col p-0"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/20 bg-woreda-darker">
          <DialogHeader className="p-0">
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[40px] text-center tabular-nums">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-border/30 mx-1" />

            {/* Rotate */}
            <Button variant="ghost" size="icon-sm" onClick={handleRotate} title="Rotate">
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <div className="w-px h-5 bg-border/30 mx-1" />

            {/* Download */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              title={language === "am" ? "አውርድ" : "Download"}
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Print */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handlePrint}
              title={language === "am" ? "አትም" : "Print"}
            >
              <Printer className="h-4 w-4" />
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              title={language === "am" ? "ዝጋ" : "Close"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-900 overflow-auto flex items-center justify-center p-4">
          {pdfBlobUrl ? (
            <iframe
              src={pdfBlobUrl}
              className="border-0 shadow-2xl transition-all duration-200"
              style={{
                width: `${zoom}%`,
                height: `${zoom}%`,
                maxWidth: "100%",
                maxHeight: "100%",
                transform: `rotate(${rotation}deg)`,
                aspectRatio: "210 / 297",
              }}
              title={title}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <p>{language === "am" ? "ሰነድ አልተገኘም" : "No document to preview"}</p>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/20 text-xs text-muted-foreground">
          <span>{language === "am" ? "የሰነድ ቅድመ እይታ" : "Document Preview"}</span>
          <span>
            {language === "am" ? "ለማውረድ ወይም ለማተም ከላይ ያሉትን አዝራሮች ይጠቀሙ" : "Use the buttons above to download or print"}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PDFPreview;