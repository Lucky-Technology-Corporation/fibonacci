import { Fragment, useContext, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useSignOut, useAuthUser } from "react-auth-kit";
import { SwizzleContext } from "./Utilities/GlobalContext";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FullPageModal from "./Utilities/FullPageModal";
import toast from "react-hot-toast";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UserDropdown() {
  const signOut = useSignOut();
  const auth = useAuthUser();
  const { setActiveProject, setActiveProjectName, isFree, setIsFree } = useContext(SwizzleContext);

  const [inviteVisible, setInviteVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const addCreditCard = () => {
    setIsVisible(true);
  };

  function delay(duration) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
  const didAddCreditCard = () => {
    toast.promise(delay(1000), {
      loading: "Adding credit card...",
      success: () => {
        setIsFree(false);
        setIsVisible(false);
        return "Added credit card!";
      },
      error: "Failed to add credit card",
    });
  };

  const didInvite = () => {
    toast.promise(delay(1000), {
      loading: "Inviting...",
      success: () => {
        setIsVisible(false);
        return "Invited!";
      },
      error: "Failed to invite",
    });
  };

  const openStripe = () => {
    window.open("https://buy.stripe.com/dR617UeRDdgac3C8ww?client_reference_id=" + auth()?.developerId, "_blank");
  }

  return (
    <>
      <Menu as="div" className="fixed bottom-4 left-6 w-44 inline-block text-left">
        <div
          className={`${
            isFree ? "" : "hidden"
          } flex-1 mt-1 p-1.5 px-2 mb-2 border-[#525363] cursor-pointer border bg-[#33333c] hover:bg-[#474752] cursor-pointer rounded text-sm`}
          onClick={addCreditCard}
        >
          <FontAwesomeIcon icon={faRotateLeft} className="mr-2" />
          Fix skewed rotation
        </div>

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
                      openStripe()
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
                      toast.error("Collaboration is pre-alpha. Your account only has access to beta or higher.")
                      return
                      setInviteVisible(true);
                    }}
                  >
                    Invite Collaborators
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
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        modalDetails={{
          title: "💳 Add a credit card",
          description: (
            <>
              Unskew the page by adding a credit card. You will only be charged for the compute you use. For more
              details, see our <a href="">pricing page</a>
            </>
          ),
          placeholder: "Card number",
          confirmText: "Finish",
          confirmHandler: didAddCreditCard,
          shouldShowInput: true,
        }}
      />

      <FullPageModal
        isVisible={inviteVisible}
        setIsVisible={setInviteVisible}
        modalDetails={{
          title: "Invite",
          description: (
            <>
              Invite a team member to collaborate on this project.
            </>
          ),
          placeholder: "Email",
          confirmText: "Invite",
          confirmHandler: didInvite,
          shouldShowInput: true,
        }}
      />

    </>
  );
}
