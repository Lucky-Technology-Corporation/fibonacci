import { useSignIn } from 'react-auth-kit'
import toast from 'react-hot-toast';
import jwt_decode from 'jwt-decode';

export default function SignIn(){
    const signIn = useSignIn()

    const getNameFromJWT = (token: string) => {
        let decoded = jwt_decode(token) as any;
        return decoded.github_user || decoded.name;
    }

    const signInWithJWT = (jwt: string) => {
        if(signIn(
            {
                token: jwt,
                expiresIn: 10080,
                authState: { isAuthenticated: true, user: getNameFromJWT(jwt) },
                tokenType: "Bearer",
            }
        )){
            // toast.success("Signed in!")
            console.log("Signed in!")
            window.history.replaceState({}, document.title, window.location.pathname);
        }else {
            console.log("Couldn't sign in")
            toast.error("Couldn't sign in")
        }
    }

    //check if there's a jwt query param
    const urlParams = new URLSearchParams(window.location.search);
    const jwt = urlParams.get('jwt');
    if(jwt && jwt.length > 0){
        signInWithJWT(jwt)
    }

    return (
        <>
            <img src="/logo_offwhite.png" className="w-20 mt-8 mb-2 m-auto" />
            <div className='m-auto text-center text-3xl mb-2 font-bold'>Swizzle</div>
            <div className='m-auto text-center text-lg mb-8'>Sign in to get started</div>
            <div className='w-64 cursor-pointer text-center bg-black border-[#525363] hover:border-[#6f7082] hover:text-white border rounded-md p-3 text-lg font-medium m-auto' onClick={() => { location.href = ('https://github.com/login/oauth/authorize?client_id=d95918858b376aa1aa40')}}>
            <div className='flex m-auto w-fit'>
                <img src="/github.svg" className='w-6 h-6 mr-2 m-auto' /> Sign in with Github</div>
            </div>
        </>
    )
}