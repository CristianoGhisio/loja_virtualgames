'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro' | 'credito_loja';

export type PDVProduct = {
  id: string;
  commercialName: string;
  barcode?: string | null;
  price: number;
  stock: number;
};

export type CartItem = {
  productId: string;
  commercialName: string;
  barcode?: string | null;
  unitPrice: number;
  stock: number;
  quantity: number;
};

export type PDVCustomer = {
  id: string;
  name: string;
  document: string;
  phone?: string | null;
};

type PDVContextType = {
  cartItems: CartItem[];
  discount: number;
  paymentMethod: PaymentMethod | null;
  customerDocument: string;
  customerName: string;
  selectedCustomer: PDVCustomer | null;
  receivedAmount: number;
  subtotal: number;
  total: number;
  addProduct: (product: PDVProduct) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  setDiscount: (value: number) => void;
  setPaymentMethod: (value: PaymentMethod | null) => void;
  setCustomerDocument: (value: string) => void;
  setCustomerName: (value: string) => void;
  setSelectedCustomer: (value: PDVCustomer | null) => void;
  setReceivedAmount: (value: number) => void;
  clearSale: () => void;
};

const PDVContext = createContext<PDVContextType | undefined>(undefined);

export function PDVProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscountState] = useState(0);
  const [paymentMethod, setPaymentMethodState] = useState<PaymentMethod | null>(null);
  const [customerDocument, setCustomerDocumentState] = useState('');
  const [customerName, setCustomerNameState] = useState('');
  const [selectedCustomer, setSelectedCustomerState] = useState<PDVCustomer | null>(null);
  const [receivedAmount, setReceivedAmountState] = useState(0);

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cartItems]
  );

  const total = useMemo(() => Math.max(subtotal - discount, 0), [subtotal, discount]);

  const addProduct = (product: PDVProduct) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          commercialName: product.commercialName,
          barcode: product.barcode,
          unitPrice: Number(product.price),
          stock: Number(product.stock),
          quantity: 1,
        },
      ];
    });
  };

  const incrementItem = (productId: string) => {
    setCartItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item
      )
    );
  };

  const decrementItem = (productId: string) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((current) => current.filter((item) => item.productId !== productId));
  };

  const setDiscount = (value: number) => {
    setDiscountState(Number.isFinite(value) ? Math.max(value, 0) : 0);
  };

  const setPaymentMethod = (value: PaymentMethod | null) => {
    setPaymentMethodState(value);
  };

  const setCustomerDocument = (value: string) => {
    setCustomerDocumentState(value);
  };

  const setCustomerName = (value: string) => {
    setCustomerNameState(value);
  };

  const setSelectedCustomer = (value: PDVCustomer | null) => {
    setSelectedCustomerState(value);
    if (value) {
      setCustomerNameState(value.name);
      setCustomerDocumentState(value.document);
    } else {
      setCustomerNameState('');
      setCustomerDocumentState('');
    }
  };

  const setReceivedAmount = (value: number) => {
    setReceivedAmountState(Number.isFinite(value) ? Math.max(value, 0) : 0);
  };

  const clearSale = () => {
    setCartItems([]);
    setDiscountState(0);
    setPaymentMethodState(null);
    setCustomerDocumentState('');
    setCustomerNameState('');
    setSelectedCustomerState(null);
    setReceivedAmountState(0);
  };

  return (
    <PDVContext.Provider
      value={{
        cartItems,
        discount,
        paymentMethod,
        customerDocument,
        customerName,
        selectedCustomer,
        receivedAmount,
        subtotal,
        total,
        addProduct,
        incrementItem,
        decrementItem,
        removeItem,
        setDiscount,
        setPaymentMethod,
        setCustomerDocument,
        setCustomerName,
        setSelectedCustomer,
        setReceivedAmount,
        clearSale,
      }}
    >
      {children}
    </PDVContext.Provider>
  );
}

export function usePDV() {
  const context = useContext(PDVContext);
  if (!context) {
    throw new Error('usePDV deve ser usado dentro de PDVProvider');
  }
  return context;
}
