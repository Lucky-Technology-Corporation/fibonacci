import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useContext, useState } from "react";
import { useAuthUser, useSignOut } from "react-auth-kit";
import toast from "react-hot-toast";
import useSettingsApi from "./API/SettingsAPI";
import FullPageModal from "./Utilities/FullPageModal";
import { SwizzleContext } from "./Utilities/GlobalContext";
import PaymentRequestModal from "./Utilities/PaymentRequestModal";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UserDropdown() {
  const signOut = useSignOut();
  const auth = useAuthUser();
  const {deleteProject} = useSettingsApi()

  const { setActiveProject, setActiveProjectName, activeProject, activeProjectName } = useContext(SwizzleContext);

  const [inviteVisible, setInviteVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Menu as="div" className="fixed bottom-4 left-6 w-44 inline-block text-left">

        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-[#33333c] ring-1 ring-inset ring-[#525363]">
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
          <Menu.Items className="absolute left-0 bottom-8 z-10 mb-2 w-44 origin-top-right rounded-md shadow-lg bg-[#32333b] ring-1 ring-inset ring-[#525363] focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "" : "text-[#D9D9D9] ",
                      "block px-4 py-2 text-sm hover:text-white hover:bg-[#32333b00]",
                    )}
                    onClick={() => {
                      setIsVisible(true)
                    }}
                  >
                    Billing
                  </a>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "" : "text-[#D9D9D9] ",
                      "block px-4 py-2 text-sm hover:text-white hover:bg-[#32333b00]",
                    )}
                    onClick={() => {
                      const c = prompt(`Are you sure you want to delete this project? Type the project name: ${activeProjectName} to confirm.`);
                      if (c == activeProjectName) {
                        toast.promise(deleteProject(activeProject), {
                          loading: "Deleting project...",
                          success: () => {
                            setTimeout(() => {
                              window.location.reload();
                            }, 500)
                            return "Project deleted!"
                          },
                          error: "Error deleting project",
                        });
                      } else if(c == ""){
                        toast("Project not deleted.")
                      } else{
                        toast.error(`Project name did not match. To avoid accidental deletion, please type the project name: ${activeProjectName} exactly.`)
                      }
                    }}
                  >
                    Delete Project
                  </a>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "" : "text-[#D9D9D9] ",
                      "block px-4 py-2 text-sm hover:text-white hover:bg-[#32333b00]",
                    )}
                    onClick={() => {
                      setActiveProject("");
                      setActiveProjectName("");
                      signOut();
                    }}
                  >
                    Sign Out
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <FullPageModal
        isVisible={inviteVisible}
        setIsVisible={setInviteVisible}
        modalDetails={{
          title: "Invite",
          description: <>Invite a team member to collaborate on this project.</>,
          placeholder: "Email",
          confirmText: "Invite",
          confirmHandler: () => {},
          shouldShowInput: true,
        }}
      />

        <PaymentRequestModal 
          isVisible={isVisible}
          setIsVisible={setIsVisible}
        />
    </>
  );
}
