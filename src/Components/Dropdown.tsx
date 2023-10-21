import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type DropdownProps = {
  children: { id: string; name: string }[];
  onSelect: (id: string) => void;
  lastChild?: { id: string; name: string };
  lastOnSelect?: (id: string) => void;
  className?: string;
  direction?: "left" | "right" | "center";
  title?: string;
};

export default function Dropdown({
  children,
  lastChild,
  onSelect,
  lastOnSelect,
  className,
  direction = "left",
  title,
}: DropdownProps) {
  const [selected, setSelected] = useState<string>();

  useEffect(() => {
    if (children.length > 0) {
      setSelected(children[0].id);
    }
  }, [children]);

  return (
    <Menu as="div" className={`${className} relative inline-block text-left mt-2"`}>
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-[#85869833] hover:bg-[#85869855] ring-1 ring-inset ring-[#525363]">
          {title
            ? title
            : (
                children.find((child: any) => child.id == selected) || {
                  name: "Loading...",
                }
              ).name}
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
        <Menu.Items
          className={`fixed ${
            direction != "center" ? direction + "-0" : ""
          } z-50 mt-2 w-56 origin-top-right rounded-md shadow-lg bg-[#32333b] ring-1 ring-inset ring-[#525363] focus:outline-none`}
        >
          <div className="py-1">
            {children.map((child: any) => (
              <Menu.Item key={child.id}>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? "" : "text-[#D9D9D9] ",
                      "block px-4 py-2 text-sm hover:text-white hover:bg-[#32333b00]",
                    )}
                    onClick={() => {
                      onSelect(child.id);
                      setSelected(child.id);
                    }}
                  >
                    {child.name}
                  </a>
                )}
              </Menu.Item>
            ))}
            {lastChild && (
              <Menu.Item key={lastChild.id}>
                {({ active }) => (
                  <a
                    href="#"
                    onClick={() => {
                      if (lastOnSelect) {
                        lastOnSelect(lastChild.id);
                      }
                    }}
                    className={classNames(
                      active ? "" : "text-[#D9D9D9] ",
                      "block px-4 py-2 text-sm hover:text-white hover:bg-[#32333b00] font-bold",
                    )}
                  >
                    {lastChild.name}
                  </a>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
