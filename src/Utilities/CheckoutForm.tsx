import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useContext, useState } from 'react';
import useSettingsApi from '../API/SettingsAPI';
import Button from './Button';
import { SwizzleContext } from './GlobalContext';

export default function CheckoutForm({setIsVisible}: {setIsVisible?: (isVisible: boolean) => void}){
    const stripe = useStripe();
    const elements = useElements();
    const { updatePaymentMethod } = useSettingsApi()
    const { setHasPaymentMethod } = useContext(SwizzleContext);
    const [loading, setLoading] = useState<boolean>(false)

    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true)
      
      if (!stripe || !elements) return;
  
      const card = elements.getElement(CardElement);
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
      });
  
      if (result.error) {
        console.error(result.error);
      } else {
        const paymentReqResult = await updatePaymentMethod(result.paymentMethod.id)
        if(paymentReqResult == null || paymentReqResult.success == false){
          alert('Something went wrong. Please try again.');
          setLoading(false)
        } else{
            setHasPaymentMethod(true)
            if(setIsVisible == undefined) return;
            setIsVisible(false)
        }
      }
    };

    const CARD_OPTIONS = {
        style: {
            base: {
              color: "#fff",
              fontFamily: 'Arial, sans-serif',
              fontSmoothing: "antialiased",
              "::placeholder": {
                color: "#aaa"
              },
              backgroundColor: "transparent",
            },
            invalid: {
              color: "#fa755a",
              iconColor: "#fa755a"
            }
        },
        iconStyle: "solid" as "solid",
      }      

    
    return (
      <form onSubmit={handleSubmit} className='w-full'>
        <div className='flex flex-col'>
        <div className='border border-gray-600 rounded-md shadow-lg p-2 my-4'>
            <CardElement options={CARD_OPTIONS} />
        </div>
        <div className='flex'>
            <div className={`my-auto ${setIsVisible == undefined ? "hidden" : ""}`}>
                <a href="#" onClick={() => setIsVisible(false)} className='text-gray-400 text-sm'>Cancel</a>
            </div>
            <button type="submit" disabled={!stripe || loading} className='ml-auto mr-0'>
                <Button
                    className={`${loading ? "opacity-70" : ""} w-auto text-sm inline-flex justify-center rounded-md shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-700 to-violet-700 hover:to-violet-600 text-base font-bold text-white hover:bg-[#85869866]`}
                    children={loading ? "Loading..." : setIsVisible == undefined ? "Start 7-day free trial" : "Save Payment Method"}
                    onClick={() => {}}
                />
            </button>
        </div>
        </div>
      </form>
    );
}