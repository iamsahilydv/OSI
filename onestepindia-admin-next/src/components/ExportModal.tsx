"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, X } from "lucide-react";
import Modal from "./ui/Modal";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  title: string;
  onExport: (format: "pdf" | "excel") => void;
}

export default function ExportModal({
  isOpen,
  onClose,
  data,
  title,
  onExport,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "excel">("excel");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="md">
      <div className="space-y-6">
        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Choose Format</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={selectedFormat === "excel"}
                onChange={(e) => setSelectedFormat(e.target.value as "pdf" | "excel")}
                className="mr-3"
              />
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-medium">Excel (.xlsx)</div>
                  <div className="text-sm text-gray-500">
                    Export as spreadsheet with formatting
                  </div>
                </div>
              </div>
            </label>

            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={selectedFormat === "pdf"}
                onChange={(e) => setSelectedFormat(e.target.value as "pdf" | "excel")}
                className="mr-3"
              />
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-medium">PDF (.pdf)</div>
                  <div className="text-sm text-gray-500">
                    Export as printable document
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>Title: {title}</div>
            <div>Records: {data.length} items</div>
            <div>Format: {selectedFormat.toUpperCase()}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-primary btn-sm"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Exporting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export {selectedFormat.toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
