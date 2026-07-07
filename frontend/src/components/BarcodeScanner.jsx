import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";

export default function BarcodeScanner({ open, onClose, onScan }) {
  const [err, setErr] = useState("");
  const scannerRef = useRef(null);
  const containerId = "barcode-reader";

  useEffect(() => {
    if (!open) return;
    let scanner;
    const start = async () => {
      try {
        scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decoded) => {
            onScan(decoded);
            stop();
          },
          () => {}
        );
      } catch (e) {
        setErr("Camera nahi khul rahi. Manual search karo.");
      }
    };
    const stop = async () => {
      try {
        if (scannerRef.current) {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
          scannerRef.current = null;
        }
      } catch {}
    };
    start();
    return () => { stop(); };
  }, [open, onScan]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Camera className="w-4 h-4" /> Barcode Scan</DialogTitle></DialogHeader>
        <div className="text-xs text-slate-500 mb-2">Product ka barcode camera ke saamne rakho</div>
        <div id={containerId} className="w-full bg-black rounded-lg overflow-hidden" style={{ minHeight: 250 }} data-testid="barcode-scanner-view" />
        {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
        <Button data-testid="close-scanner" variant="outline" onClick={onClose} className="mt-2">
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
