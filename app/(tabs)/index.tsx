import { CartProvider } from "@/components/context/CartContext";
import AppNavigation from "@/navigation/appNavigation";



export default function Index() {
  return (
    <CartProvider>
     <AppNavigation />
     </CartProvider>
  );
}


