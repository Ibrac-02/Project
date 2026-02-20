import { useState, useEffect } from 'react';
import './App.css';

// Declare PaychanguCheckout on window object
declare global {
  interface Window {
    PaychanguCheckout: (options: any) => void;
  }
}

type Product = {
  id: number;
  title: string;
  price: number; // price in MWK
  image: string;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPaychanguLoaded, setIsPaychanguLoaded] = useState(false);

  // Load products from Fake Store API
  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then((data) => {
        // Convert USD → MWK (~1500 MK per 1 USD) and reduce price by 50%
        const mwkProducts = data.map((p: any) => {
          let price = Math.round(p.price * 1500 * 0.5); // reduced price
          if (price > 25000) price = 25000;           // cap at 25,000 MWK
          return {
            id: p.id,
            title: p.title,
            price,
            image: p.image,
          };
        });
        setProducts(mwkProducts);
      });
  }, []);

  // Load Paychangu SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://in.paychangu.com/js/popup.js';
    script.async = true;
    script.onload = () => setIsPaychanguLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const makePayment = (product: Product) => {
    if (!window.PaychanguCheckout) {
      alert('Payment system is not ready. Please try again in a moment.');
      return;
    }

    window.PaychanguCheckout({
      public_key: 'PUB-TEST-CbLD2wj2maUiJQ4NyMJ4rTKs2XFBV3xr',
      tx_ref: 'tx_' + Math.floor((Math.random() * 1000000000) + 1),
      amount: product.price,
      currency: 'MWK',
      callback_url: `${window.location.origin}/payment-callback`,
      return_url: `${window.location.origin}/payment-return`,
      customer: {
        email: 'customer@example.com',
        first_name: 'Customer',
        last_name: 'Name',
      },
      customization: {
        title: `Payment for ${product.title}`,
        description: `Purchase of ${product.title}`,
      },
      meta: {
        uuid: 'uuid-' + Date.now(),
        response: 'response'
      }
    });
  };

  return (
    <div className="app">
      <header>
        <h1>Stationery Shop</h1>
      </header>
      <main>
        <div className="products-scroll">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img 
                src={product.image} 
                alt={product.title} 
                className="product-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
                }}
              />
              <h3>{product.title}</h3>
              <p className="price">MK {product.price.toLocaleString()}</p>
              <button 
                className="buy-button"
                onClick={() => makePayment(product)}
                disabled={!isPaychanguLoaded}
              >
                {isPaychanguLoaded ? 'Buy Now' : 'Loading...'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
