"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Messages = [
  "Thinking…",
  "Analyzing context…",
  "Generating response…",
  "Refining output…",
  "Almost there…",
];

export const ShimmerMessages = () => {
  const [message, setMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
     setMessage((prev)=>(prev+1) % Messages.length);
    }, 1600);

    return () => clearInterval(interval);
  }, [Messages.length]);

return(
    <div className="flex items-center gap-2" >
        <span className="text-base text-muted-foreground animate-pulse">{Messages[message]}</span>
    </div>
  );
};

export const MessageLoading =()=>{
    return(
        <div className="flex flex-col group px-2 pb-4">

            <div className="flex items-center gap-2 pl-2 mb-2">
<Image src="/Logo.png" alt="Koda" width={18} height={18} className="shrink-0">

</Image>
<span className="text-sm font-medium">Koda</span>
<div className="pl-8.5 flex flex-col gap-y-4">
<ShimmerMessages></ShimmerMessages>
</div>
            </div>
        </div>
    )
}
