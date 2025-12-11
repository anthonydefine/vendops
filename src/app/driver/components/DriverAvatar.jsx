'use-client';

import LogoutButton from '../../../app/components/LogoutButton';

import { Avatar } from 'radix-ui'
import { DropdownMenu } from 'radix-ui';

function DriverAvatar({driver}) {
  return (
    <div>
      <LogoutButton />
    </div>
  )
}

export default DriverAvatar