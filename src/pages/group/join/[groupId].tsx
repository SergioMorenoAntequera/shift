import { type User, type Groups } from "@prisma/client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

type TPathParams = {params: { groupId: string }}[] 
export async function getStaticPaths() {
  const allGroups = await prisma.groups.findMany()

  const paths:TPathParams = allGroups.map((group) => ({
    params: { groupId: group.id },
  }))
  
  return { paths, fallback: 'blocking' }
}

type TPropsParams = { params: { groupId: string } }
export async function getStaticProps(props: TPropsParams) {
  const groupId = props.params.groupId 
  if(!groupId) return { props: {group: null}}
  const group = await prisma.groups.findFirst({where: {id: {equals: groupId}}})
  
  const userInGroup = await prisma.usersInGroups.findMany({select:{ userId: true }, where: {groupId: groupId}})
  const users = await prisma.user.findMany({where: {id: {in: userInGroup.map(u => u.userId)}}})


  return { props: { group, users }, revalidate: 300 }
}
  
type Props = {group: Groups, users: User[]} 
function JoinGroupPage({ group, users }:Props) {
  const { data: sessionData }= useSession()
  const router = useRouter()
  
  const addUserToGroup = api.group.addUsers.useMutation()

  useEffect(() => {
    const usersInGroupIds = users.map(u => u.id) 
    if(!sessionData) return
    if(usersInGroupIds.includes(sessionData?.user.id)) {
      void router.push(`/group/${group.id}`)
    }  
  }, [sessionData])

  function joinGroup() {
    if(!sessionData?.user.email) return
    addUserToGroup.mutate({groupId: group.id, usersToAdd: [{email: sessionData.user.email}]})
    void router.push(`/group/${group.id}`)
  }
  

  if(!group) return 'oopss'
  return (<div> 
    <p> Has sido invitado a { group.name } </p>

    {sessionData && <>

      <div>
        <button onClick={joinGroup}> Unete aquí </button>
      </div>
    
    </>}

    {!sessionData && <div>
      
      <button onClick={() => void signIn()}>
        Logeate
      </button>
      
    </div>} 
  </div>)
}

export default JoinGroupPage