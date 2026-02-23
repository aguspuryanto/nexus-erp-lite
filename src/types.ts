import { LucideIcon } from "lucide-react";

export interface DashboardStats {
  revenue: number;
  expenses: number;
  productCount: number;
  employeeCount: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  unit: string;
  purchase_price: number;
  sales_price: number;
  stock_qty: number;
}

export interface Partner {
  id: number;
  type: 'Customer' | 'Supplier';
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Transaction {
  id: number;
  type: 'QUOTATION' | 'SO' | 'PO' | 'PR' | 'INVOICE_IN' | 'INVOICE_OUT';
  number: string;
  date: string;
  partner_id: number;
  partner_name?: string;
  status: string;
  total_amount: number;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  join_date: string;
  salary: number;
  status: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string;
  status: string;
  value: number;
  last_follow_up: string;
}

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  module: string;
}
