/**
 * Type definitions for the QA Automation Framework
 */

export interface IUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  title: string;
  companyName: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  mobileNumber: string;
}

export interface IProductFilter {
  search?: string;
  category?: string;
  brand?: string;
  price?: {
    min: number;
    max: number;
  };
}

export interface IProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
}

export interface ICartItem {
  productId: number;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface IAPIResponse<T> {
  responseCode: number;
  message?: string;
  data?: T;
  error?: string;
}

export interface ILoginResponse {
  user_id: number;
  token?: string;
  email?: string;
}

export interface ICreateAccountResponse {
  user_id: number;
  message: string;
}

export interface ITestContext {
  page?: any;
  apiClient?: any;
  context?: any;
  userData?: IUserData;
  currentProduct?: IProduct;
  cartItems?: ICartItem[];
  authToken?: string;
}

export interface IContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachment?: string;
}
