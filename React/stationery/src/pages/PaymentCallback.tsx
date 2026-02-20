import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PaymentCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    
    if (status === 'successful') {
      alert('Payment successful! Thank you for your purchase.');
    } else {
      alert('Payment was not completed. Please try again.');
    }
    
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="payment-status">
      <h2>Processing your payment...</h2>
      <p>Please wait while we verify your payment.</p>
    </div>
  );
}
