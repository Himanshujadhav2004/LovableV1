

"use client"
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { Variable } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";




 const page=()=> {  

  const router   =useRouter();

  const trpc = useTRPC();

  const createProject= useMutation(trpc.projects.create.mutationOptions({
    onSuccess:(data)=>{
router.push(`/projects/${data.id}`);
    }
  }));
const [value,setvalue] = useState("");
console.log("Server componet")

  return (
 <div>
  <input value={value} onChange={(e)=>setvalue(e.target.value)}></input>
  

  <Button onClick={()=> createProject.mutate({value:value})}>Build</Button>

 </div>
  );
}

export default page;