import {useEffect, useState} from 'react'
import './App.css'
import { createIframe } from "cookie-toss";
import {ActivityIndicator} from './ActivityIndicator';

// Sites allowed to access localstorage belonging to the hub domain:
const dependentDomains = [
    "ctsat1.netlify.app",
    "ctsat2.netlify.app",
    "localhost:3030",
    "localhost:3040",
    "localhost"
];

// Sets up the iframe for satellite to refer to hub's localstorage data:
createIframe({ dependentDomains });

export interface ICart {
    cart: {
        userId: string;
        merchant: string;
        cartId: string;
        total: number;
        id: number;
        rapydCheckoutId: string;
        status: string;
    },
    items: {
        id: number;
        cartId: string;
        productName: string;
        qty: number;
        price: number
    }[];
}

const API_URL = import.meta.env.VITE_API_URL;
function App() {
    // const [count, setCount] = useState(0)
    const [cart, setCart] = useState<ICart | null>(null);
    const [start, setStart] = useState(false);
    const [checkoutId, setCheckoutId] = useState('');
    const [showPic, setShowPic] = useState(false);
    const [picUrl] = useState('https://i.imgur.com/S48w9VV.jpeg');
    const [loading, setLoading] = useState(true);
    const startCheckout = () => {
        const chkout = new (window as any).RapydCheckoutToolkit({
          id: checkoutId,
        });
        chkout.displayCheckout();
    }
    const [success, setSuccess] = useState<boolean | null>(null);
    const fetchCart = (rapydCheckoutId: string) => {
        if (rapydCheckoutId.length > 0) {
            const url = API_URL + `/cart?id=${rapydCheckoutId}`;
            fetch(url)
                .then(r => r.json())
                .then(res => {
                    console.log(`cart result: ${JSON.stringify(res)}`);
                    setCart(res);
                    setLoading(false);
                })
                .catch(console.log)
        } else {
            console.log(`cannot fetchCart since rapydCheckoutId is empty`)
        }
    };

    useEffect(() => {
        // rapydCheckoutId is received by search params of the iframe link
        const params: any = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop.toString()),
        });
        console.log(`[iframe] search params: ${params['id']}`);
        // if not abandoned cart, show picture ad
        if (params.id === null) {
            console.log(`going to show picture ad`);
            setLoading(false);
            setShowPic(true);
            return;
        }
        console.log(`going to show abandoned cart`);
        const rapydCheckoutId = params.id;
        setCheckoutId(rapydCheckoutId);
        fetchCart(rapydCheckoutId);
        // listen to rapyd checkout events
        window.addEventListener('onCheckoutPaymentSuccess', function (event: any) {
            setSuccess(true);
            console.log(`onCheckoutPaymentSuccess: ${JSON.stringify(event.detail)}`)
        });
        window.addEventListener('onCheckoutFailure', function (event: any) {
            setSuccess(false);
            console.log(`onCheckoutFailure: ${event.detail.error}`)
        });
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
                    {cart.items.map(item => (
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
