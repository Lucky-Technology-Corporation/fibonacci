
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useSignOut, useAuthUser } from 'react-auth-kit'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}


export default function UserDropdown(){
    const signOut = useSignOut()
    const auth = useAuthUser()

    return (
        <Menu as="div" className="fixed bottom-4 left-6 w-44 inline-block text-left">
        <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-[#85869833] ring-1 ring-inset ring-[#525363]">
            {auth()?.user}
            <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
        </div>

        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-[#32333b] ring-1 ring-inset ring-[#525363] focus:outline-none">
            <div className="py-1">
                <Menu.Item>
                     {({ active }) => (
                     <a
                         href="#"
                         className={classNames(
                         active ? '' : 'text-[#D9D9D9] ',
                         'block px-4 py-2 text-sm hover:text-white hover:bg-[#32333b00]'
                         )}
                         onClick={() => {signOut()}}>
                         Sign Out
                     </a>
                     )}
                 </Menu.Item>
            </div>
        </Menu.Items>
        </Transition>
    </Menu>
    )
}