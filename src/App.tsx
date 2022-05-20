import {useEffect, useState} from 'react'
import './App.css'
import { createIframe } from "cookie-toss";
import {ActivityIndicator} from './ActivityIndicator';

// Sites allows to access data on the hub domain:
const dependentDomains = [
    "ctsat1.netlify.app",
    "ctsat2.netlify.app",
    "localhost:3030",
    "localhost:3040",
    "localhost"
];

// Sets up the contents of the iframe:
createIframe({ dependentDomains });

export interface ICart {
  cart: {
    userId: string;
    merchant: string;
    cartId: string;
    total: number;
  },
  cartItems: {
    cartId: string;
    productName: string;
    qty: number;
    price: number
  }[];
}

const API_URL = 'https://----.ngrok.io';

function App() {
  // const [count, setCount] = useState(0)
  const [cart, setCart] = useState<ICart | null>(null);
  const [start, setStart] = useState(false);
  const [checkoutId, setCheckoutId] = useState('');
  const [showPic, setShowPic] = useState(false);
  const [picUrl] = useState('https://i.imgur.com/S48w9VV.jpeg');
  const [loading, setLoading] = useState(true);
  const startCheckout = () => {
    // const chkout = new (window as any).RapydCheckoutToolkit({
    //   id: "checkout_30c9875a7a6867c38776e626c0dc7a7a",
    // });
    // chkout.displayCheckout();
  }
  const [success, setSuccess] = useState<boolean | null>(null);
  const fetchCart = () => {};
  useEffect(() => {
      const params: any = new Proxy(new URLSearchParams(window.location.search), {
          get: (searchParams, prop) => searchParams.get(prop.toString()),
      });
      console.log(`params: ${params['id']}`);
      // if not abandoned cart, show picture ad
      if (!('id' in params) || params.id.length === 0) {
          setLoading(false);
          setShowPic(true);
          return;
      }
      const checkoutId = params.id;
      setCheckoutId(checkoutId);
      // Called from the iframe after checkout ends
      window.addEventListener('onCheckoutPaymentSuccess', function (event: any) {
          setSuccess(true);
          console.log(`onCheckoutPaymentSuccess: ${JSON.stringify(event.detail)}`)
      });
      window.addEventListener('onCheckoutFailure', function (event: any) {
          setSuccess(false);
          console.log(`onCheckoutFailure: ${event.detail.error}`)
      });
      // todo: attempt to get userId & viewerId from queryParams

    // setCart({
    //       cart: {
    //         userId: '123',
    //         merchant: 'amazon.in',
    //         cartId: 'od1234',
    //         total: 120
    //       },
    //       cartItems: [
    //         {
    //           cartId: 'od1234',
    //           productName: 'Basmati rice (1kg)',
    //           qty: 5,
    //           price: 500
    //         }
    //       ]
    //     }
    // );
  }, []);

  const getCart = () => {
    return cart && (
        <div className={'table-wrapper'}>
          [{cart.cart.merchant}] Complete checkout <br /> to restart game
          <table className={'fl-table'}>
            <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
            </thead>
            <tbody>
            {cart.cartItems.map(item => (
                <tr>
                  <td>{item.productName}</td>
                  <td>{item.qty}</td>
                  <td>{item.price}</td>
                </tr>
            ))}
            <tr>
              <td></td>
              <td>Total</td>
              <td>₹{cart.cart.total}</td>
            </tr>
            </tbody>
          </table>
          <button onClick={() => {setStart(true)}} className={'clicky'}>Procced to pay →</button>
        </div>
    )
  };
  const getChekout = () => {
    return (
        <div id="rapyd-checkout"></div>
    );
  };
  useEffect(() => {
    if (start)
      startCheckout()
  }, [start]);

  if (success === true) {
    window.parent.postMessage('rapydGenieSuccess', '*');
    return (
        <div>
          <img src={'https://i.imgur.com/FM67qJG.png'} width={132} height={120} alt={'successIcon'} />
          <h2>Success</h2>
          <p>You will get redirected</p>
        </div>
    )
  }

  if (success === false) {
    window.parent.postMessage('rapydGenieSuccess', '*');
    return (
        <div>
          <img src={'https://i.imgur.com/5DRKgbq_d.webp?maxwidth=760&fidelity=grand'} width={132} height={132} alt={'successIcon'} />
          <h2>Failed</h2>
          <p>You will get redirected</p>
        </div>
    )
  }
  return loading ? (
      <ActivityIndicator />
  ) : (
      <div className="App">
          {cart === null && showPic ? (
              <div>
                  <img src={picUrl} alt={'ad'} width={320} height={320} />
                  <button onClick={() => {setSuccess(true)}} className={'clicky'}>Continue →</button>
              </div>
          ) : (
              <>
                  {!start && getCart()}
                  {getChekout()}
            </>
          )}
      </div>
  )
}

export default App
