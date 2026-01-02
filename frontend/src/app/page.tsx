
import { caller, getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Client } from "./client";
import { Suspense } from "react";


 const page= async()=> {  
const queryClient = getQueryClient();
void queryClient.prefetchQuery(trpc.createAi.queryOptions({text:"Himanshu"}))
console.log("Server componet")

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
{/* { JSON.stringify(data)} */}
   
   <Suspense fallback={<p>loading...</p>}>
<Client></Client>
</Suspense>
    </div>
    </HydrationBoundary>
  );
}

export default page;