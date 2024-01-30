import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useContext, useState } from "react";
import { Helmet } from "react-helmet";
import useSettingsApi from "../API/SettingsAPI";
import Button from "./Button";
import { SwizzleContext } from "./GlobalContext";

export default function CheckoutForm({ setIsVisible }: { setIsVisible?: (isVisible: boolean) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { updatePaymentMethod } = useSettingsApi();
  const { setHasPaymentMethod, hasPaymentMethod } = useContext(SwizzleContext);
  const [loading, setLoading] = useState<boolean>(false);

  const gtagReportConversion = () => {
    const callback = () => {
      console.log("Conversion reported");
    };
    // Send a conversion event to Google Analytics
    (window as any).gtag("event", "conversion", {
      send_to: "AW-1031579973/XmqbCOTcp4EYEMXS8usD",
      event_callback: callback,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    const result = await stripe.createPaymentMethod({
      type: "card",
      card: card,
    });

    if (result.error) {
      console.error(result.error);
    } else {
      const paymentReqResult = await updatePaymentMethod(result.paymentMethod.id);
      if (paymentReqResult == null || paymentReqResult.success == false) {
        alert("Something went wrong. Please try again.");
        setLoading(false);
      } else {
        if (!hasPaymentMethod) {
          gtagReportConversion();
        }
        setHasPaymentMethod(true);
        setIsVisible(false);
      }
    }
  };

  const CARD_OPTIONS = {
    style: {
      base: {
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        fontSmoothing: "antialiased",
        "::placeholder": {
          color: "#aaa",
        },
        backgroundColor: "transparent",
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
    iconStyle: "solid" as "solid",
  };

  const openCodeFlow = () => {
    const input = prompt("Enter your code");
    if (input == null || input == "") {
      return;
    }
    const code = input.trim().toLowerCase();
    if (code == "iamspecial") {
      setHasPaymentMethod(true);
      setIsVisible(false);
    } else {
      alert("Invalid code");
    }
  };

  return (
    <>
      <Helmet>
        {/* Add AdWords tracking script to the head */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-1031579973"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() {
              window.dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', 'AW-1031579973');
          `}
        </script>
      </Helmet>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col">
          <div className="border border-gray-600 rounded-md shadow-lg p-2 my-4">
            <CardElement options={CARD_OPTIONS} />
          </div>
          <div className="flex">
            <div className={`my-auto`}>
              <a href="#" onClick={() => setIsVisible(false)} className={`text-gray-400 text-sm  ${!hasPaymentMethod ? "hidden" : ""}`}>
                Cancel
              </a>
              <a
                onClick={() => {
                  openCodeFlow();
                }}
                className="text-gray-400 text-sm ml-3 cursor-pointer"
              >
                I have a code
              </a>
            </div>
            <button type="submit" disabled={!stripe || loading} className="ml-auto mr-0">
              <Button
                className={`${
                  loading ? "opacity-70" : ""
                } w-auto text-sm inline-flex justify-center rounded-md shadow-sm px-4 py-2 bg-indigo-700 hover:bg-indigo-600 text-base font-bold text-white hover:bg-[#85869866]`}
                children={
                  loading ? "Loading..." : hasPaymentMethod == false ? "Start 7-day free trial" : "Save Payment Method"
                }
                onClick={() => {}}
              />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
