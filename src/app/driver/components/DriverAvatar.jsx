'use-client';

import LogoutButton from '../../../app/components/LogoutButton';

import { Avatar, AvatarFallback, } from '../../../../@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../../../@/components/ui/dropdown-menu"

function DriverAvatar({driver}) {
  let initial = driver.full_name[0]
  let firstName = driver.full_name.split(' ')[0]
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className='flex items-center gap-2'>
          <Avatar className='size-10'>
            <AvatarFallback className="bg-linear-to-br from-purple-400 to-pink-400 text-white">{initial}</AvatarFallback>
          </Avatar>
          <span className='font-bold text-sm'>
              {firstName}
            </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='mr-4'>
          <DropdownMenuLabel>
            Welcome, {driver.full_name}
          </DropdownMenuLabel>
          <DropdownMenuItem>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      
    </div>
  )
}

export default DriverAvatar