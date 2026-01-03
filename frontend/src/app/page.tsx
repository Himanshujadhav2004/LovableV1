

"use client"
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";




 const page=()=> {  

  const trpc = useTRPC();
  const invoke= useMutation(trpc.invoke.mutationOptions({}));
const [value,setvalue] = useState("");
console.log("Server componet")

  return (
 <div>
  <input value={value} onChange={(e)=>setvalue(e.target.value)}></input>
  

  <Button onClick={()=> invoke.mutate({value:value})}>Build</Button>

 </div>
  );
}

export default page;