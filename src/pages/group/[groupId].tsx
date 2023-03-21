import { type User, type Groups } from '@prisma/client'
import { type GetServerSideProps } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { prisma } from '~/server/db'

export const getServerSideProps: GetServerSideProps = async (context) => {
  
  const group = await prisma.groups.findFirst({where: {id: context.query.groupId?.toString()}})
  const members = await prisma.user.findMany({where: {groups: {some: {groupId: group?.id}}}})
  
  return {
    props: {
      group,
      members,
    },
  }
}


type Props = {group?: Groups, members: User[]}
function GroupPage({group, members}: Props) {
  const { data: sessionData } = useSession()
  const [origin, setOrigin] = useState('')
  
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])
  
  
  if(!group) return
  if(!sessionData?.user) return
  return (<div>

    <div className='flex'>
      <button onClick={()=>{void navigator.clipboard.writeText(`${origin}/group/join/${group.id}`)}}> 
        Copy invitation 
      </button>
      <p> Nombre del grupo: {group.name} </p>
    </div>
    {members?.map(member => <div key={member.id}>
      <p> { member.name } {member.id === sessionData.user.id ? '(Hey, its you!)' : ''} </p>
    </div>)}

    

  </div>)
}

export default GroupPage