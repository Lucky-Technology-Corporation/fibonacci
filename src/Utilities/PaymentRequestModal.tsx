import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK);


export default function PaymentRequestModal({
  isVisible,
  setIsVisible,
}: {
  isVisible: boolean;
  setIsVisible?: (isVisible: boolean) => void;
}) {

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
        <div
          className={`inline-block align-bottom bg-[#32333b] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}
        >
          <div className="bg-[#181922] px-4 pt-5 pb-2 sm:p-6 sm:pb-4">
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-[#D9D9D9]" id="modal-title">
                Update payment method
              </h3>
              <div className="mt-1">
                <div className="text-sm text-[#D9D9D9]">$20 / month for unlimited AI, plus
                <ul className='list-disc ml-4 my-2'>
                  <li>1 million requests</li>
                  <li>1 million database calls</li>
                  <li>1 GB storage</li>
                </ul>
                For subsequent usage, see <a href="https://www.swizzle.co/#Pricing" target='_blank' rel="noreferrer" className='font-normal underline text-gray-200'>usage</a> pricing.</div>
              </div>
              <Elements stripe={stripePromise}>
                <CheckoutForm setIsVisible={setIsVisible} />
              </Elements>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
