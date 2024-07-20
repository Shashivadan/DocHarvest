import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export default function Clipboard({ url }: { url: string }) {
  return (
    <div>
      {" "}
      <div
        onClick={() => {
          navigator.clipboard.writeText(url);
          toast("copy to clipboard");
        }}
      >
        <Copy />
      </div>
    </div>
  );
}
