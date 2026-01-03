

"use client"
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";




 const page=()=> {  

  const trpc = useTRPC();
  const {data:messages} = useQuery(trpc.messages.getMany.queryOptions());
  const createMessage= useMutation(trpc.messages.create.mutationOptions({}));
const [value,setvalue] = useState("");
console.log("Server componet")

  return (
 <div>
  <input value={value} onChange={(e)=>setvalue(e.target.value)}></input>
  

  <Button onClick={()=> createMessage.mutate({value:value})}>Build</Button>
{JSON.stringify(messages,null,2
)}
 </div>
  );
}

export default page;