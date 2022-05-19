import {useEffect, useState} from 'react'
import './App.css'
import { createIframe } from "cookie-toss";

// Sites allows to access data on the hub domain:
const dependentDomains = ["ctsat1.netlify.app", "ctsat2.netlify.app"];

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


function App() {
  // const [count, setCount] = useState(0)
  const [cart, setCart] = useState<ICart | null>(null);
  const [start, setStart] = useState(false);
  const startCheckout = () => {
    const chkout = new (window as any).RapydCheckoutToolkit({
      id: "checkout_3fef6abb69430e8c9648e8c17f57c0be",
    });
    chkout.displayCheckout();
  }
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    window.parent.postMessage('rapydGenieSuccess', '*');

    // Called from the iframe
    window.addEventListener('onCheckoutPaymentSuccess', function (event: any) {
      setSuccess(true);
      console.log(`onCheckoutPaymentSuccess: ${JSON.stringify(event.detail)}`)
    });
    window.addEventListener('onCheckoutFailure', function (event: any) {
      setSuccess(false);
      console.log(`onCheckoutFailure: ${event.detail.error}`)
    });
    // todo: attempt to get userId & viewerId from queryParams

    // todo: api call to get ad, based on type of ad set cart or pic
    setCart({
          cart: {
            userId: '123',
            merchant: 'amazon.in',
            cartId: 'od1234',
            total: 120
          },
          cartItems: [
            {
              cartId: 'od1234',
              productName: 'Basmati rice (1kg)',
              qty: 5,
              price: 500
            }
          ]
        }
    );
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
    setTimeout(() => {location.reload()}, 3500);
    return (
        <div>
          <img src={'./img.png'} width={132} height={120} alt={'successIcon'} />
          <h2>Success</h2>
          <p>You will get redirected</p>
        </div>
    )
  }
  if (success === false) {
    setTimeout(() => {location.reload()}, 3500);
    return (
        <div>
          <img src={'./img.png'} width={132} height={120} alt={'successIcon'} />
          <h2>Failed</h2>
          <p>You will get redirected</p>
        </div>
    )
  }
  return (
      <div className="App">
        {!start && getCart()}
        {getChekout()}
      </div>
  )
}

export default App
