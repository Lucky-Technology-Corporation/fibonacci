import jwt_decode from "jwt-decode";
import { useEffect } from "react";
import { useSignIn, useSignOut } from "react-auth-kit";
import toast from "react-hot-toast";

export default function SignIn() {
  const signIn = useSignIn();
  const signOut = useSignOut();

  const getNameFromJWT = (token: string) => {
    try {
      let decoded = jwt_decode(token) as any;
      return decoded.github_user || decoded.name;
    } catch (e) {
      console.error(e);
      console.log("Couldn't get name from JWT");
      return "Anonymous";
    }
  };

  const getIdFromJWT = (token: string) => {
    try {
      let decoded = jwt_decode(token) as any;
      return decoded.developer_id;
    } catch (e) {
      console.error(e);
      console.log("Couldn't get ID from JWT");
      return "UNKNOWN";
    }
  };

  const signInWithJWT = (jwt: string) => {
    const userName = getNameFromJWT(jwt);
    const id = getIdFromJWT(jwt);
    if (
      signIn({
        token: jwt,
        expiresIn: 10080,
        authState: {
          isAuthenticated: true,
          user: userName,
          developerId: id,
        },
        tokenType: "Bearer",
      })
    ) {
      setTimeout(() => {
        location.href= "/"
      }, 150);
    } else {
      toast.error("Couldn't sign in");
    }
  };

  //check if there's a jwt query param
  //TODO: Check that this is working!
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwt = urlParams.get("jwt");
    if (jwt && jwt.length > 0) {
      // signOut();
      setTimeout(() => {
        signInWithJWT(jwt);
      }, 100)
    }
  }, []);

  return (
    <>
      <img src="/logo_offwhite.png" className="w-20 mt-8 mb-2 m-auto" />
      <div className="m-auto text-center text-3xl mb-2 font-bold">Swizzle</div>
      <div className="m-auto text-center text-lg mb-8">Sign in to get started</div>
      <div
        className="w-64 cursor-pointer text-center bg-black border-[#525363] hover:border-[#6f7082] hover:text-white border rounded-md p-3 text-lg font-medium m-auto"
        onClick={() => {
          // location.href = "https://github.com/login/oauth/authorize?client_id=" + process.env.GITHUB_CLIENT_ID;
          location.href = process.env.NEXT_PUBLIC_BASE_URL + "/login/github";
        }}
      >
        <div className="flex m-auto w-fit">
          <img src="/github.svg" className="w-6 h-6 mr-2 m-auto" /> Sign in with Github
        </div>
      </div>
    </>
  );
}
