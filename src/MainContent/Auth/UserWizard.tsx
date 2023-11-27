import bcrypt from 'bcryptjs';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useDatabaseApi from "../../API/DatabaseAPI";

export default function UserWizard({
  isVisible,
  setIsVisible,
  handleRefresh
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  handleRefresh: () => void;
}) {

  const {createUser} = useDatabaseApi();
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  useEffect(() => {
    setEmailValue("");
    setPasswordValue("");
  }, [isVisible]);

  const createHandler = async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordValue, salt);

    if(emailValue == ""){
      throw new Error("Error. Email cannot be empty.")
    } else if(passwordValue == ""){
      throw new Error("Error. Password cannot be empty.")
    }

    try{
      const response = await createUser(
        emailValue,
        hashedPassword,
        nameValue,
      )

      handleRefresh()
      setIsVisible(false);
    } catch (e: any) {
      console.log("error", e);
      if(e.response.status == 400) {
        throw new Error("Error. This user may already exist.")
      }
      throw new Error("Error. Something went wrong.")
    }
  }

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      style={{ transition: "opacity 0.2s" }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true"></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-[#181922] border-[#525363] border w-4/12 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle">
          <div className="bg-[#181922] rounded-lg px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <>
                <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                New user
                </h3>
                <span className="text-sm leading-6">Create a new user manually</span>
                <div className="mt-3 mb-2 flex">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => {
                      setNameValue(e.target.value);
                    }}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder={"Full Name"}
                  />
                </div>
                <div className="mt-3 mb-2 flex">
                  <input
                    type="text"
                    value={emailValue}
                    onChange={(e) => {
                      setEmailValue(e.target.value);
                    }}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder={"test@email.com"}
                  />
                </div>
                <div className="mt-3 mb-2 flex">
                  <input
                    type="text"
                    value={passwordValue}
                    onChange={(e) => {
                      setPasswordValue(e.target.value);
                    }}
                    className="w-full bg-transparent border-[#525363] w-80 border rounded outline-0 focus:border-[#68697a] p-2"
                    placeholder={"Password"}
                  />
                </div>
                <div className="bg-[#181922] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                  <div className="bg-[#181922] py-3 pt-0 mt-2 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => {
                        toast.promise(createHandler(), {
                          loading: "Creating user...",
                          success: "User created!",
                          error: (err) => { return err.message }
                        });
                      }}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#85869833] text-base font-medium text-white hover:bg-[#858698]  sm:ml-3 sm:w-auto sm:text-sm`}
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsVisible(false);
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-[#181922] text-base font-medium text-[#D9D9D9] hover:bg-[#525363]  sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
