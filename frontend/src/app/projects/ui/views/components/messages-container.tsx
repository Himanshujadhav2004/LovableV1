import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCard } from "./message-card";
import { MessageForm } from "./message-form";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma/client";
import { MessageLoading } from "./message-loading";

interface Props{
    projectId:string;
        activeFragment:Fragment |null
   setActiveFragment:(fragment:Fragment|null)=>void;
}

export const MessagesContainer =({projectId,activeFragment,setActiveFragment}:Props)=>{
const bottomRef = useRef<HTMLDivElement>(null);

      const trpc = useTRPC()
    const {data:messages}=useSuspenseQuery(trpc.messages.getMany.queryOptions({
       projectId:projectId,
    },{refetchInterval:5000}))
//     useEffect(()=>{
//         const lastAssistanMessagewithFragment = messages.findLast(
//             (messages)=>messages.role ==="ASSISTANT" && !!messages.fragment,
//         );
//         if(lastAssistanMessagewithFragment &&lastAssistanMessagewithFragment.fragment){
//         setActiveFragment(lastAssistanMessagewithFragment.fragment);
//         }
//     },[messages,setActiveFragment])
// useEffect(()=>{
// bottomRef.current?.scrollIntoView();

// },[messages.length]);
const lastMessage = messages[messages.length-1];
const isLastMessagesUser = lastMessage?.role ==="USER";
    return(
        <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="pt-2 pr-1">
                    {messages.map((messages)=>(
                        <MessageCard
                        key={messages.id}
                        content={messages.content}
                        role={messages.role}
                        fragment={messages.fragment}
                        createdAt={messages.createdAt}
                        isActiveFragment = {activeFragment?.id===messages.fragment?.id}
                        onFragmentClick={()=>{setActiveFragment(messages.fragment)}}
                        type={messages.type}
                        />
                    ))}
                    {isLastMessagesUser && <MessageLoading></MessageLoading>}
                    <div ref={bottomRef}></div>
                     </div>

            </div>

            <div className="relative p-4 pt-1">
<div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none"> </div>
<MessageForm projectId={projectId}></MessageForm>
            </div>
       
        </div>
    )
}