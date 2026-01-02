

"use client"
import { useTRPC } from "@/trpc/client"
import { useMutation } from "@tanstack/react-query";




 const page=()=> {  

  const trpc = useTRPC();
  const invoke= useMutation(trpc.invoke.mutationOptions({}));

console.log("Server componet")

  return (
 <div>
  <button onClick={()=> invoke.mutate({text:"himanshu"})}>Invoke Background Job</button>

 </div>
  );
}

export default page;