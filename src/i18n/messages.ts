import type { AbstractIntlMessages } from "next-intl";

import type { Locale } from "./locale";
import arBookings from "./messages/ar/bookings.json";
import arCancellations from "./messages/ar/cancellations.json";
import arCommon from "./messages/ar/common.json";
import arCustomers from "./messages/ar/customers.json";
import arDefault from "./messages/ar/default.json";
import arFinance from "./messages/ar/finance.json";
import arFlights from "./messages/ar/flights.json";
import arNavigation from "./messages/ar/navigation.json";
import arNotifications from "./messages/ar/notifications.json";
import arProfile from "./messages/ar/profile.json";
import arRefunds from "./messages/ar/refunds.json";
import arSupport from "./messages/ar/support.json";
import arTicketing from "./messages/ar/ticketing.json";
import arTransactions from "./messages/ar/transactions.json";
import arWalletOperations from "./messages/ar/wallet-operations.json";
import arWallets from "./messages/ar/wallets.json";
import enBookings from "./messages/en/bookings.json";
import enCancellations from "./messages/en/cancellations.json";
import enCommon from "./messages/en/common.json";
import enCustomers from "./messages/en/customers.json";
import enDefault from "./messages/en/default.json";
import enFinance from "./messages/en/finance.json";
import enFlights from "./messages/en/flights.json";
import enNavigation from "./messages/en/navigation.json";
import enNotifications from "./messages/en/notifications.json";
import enProfile from "./messages/en/profile.json";
import enRefunds from "./messages/en/refunds.json";
import enSupport from "./messages/en/support.json";
import enTicketing from "./messages/en/ticketing.json";
import enTransactions from "./messages/en/transactions.json";
import enWalletOperations from "./messages/en/wallet-operations.json";
import enWallets from "./messages/en/wallets.json";

export const messageScopes = [
  "common",
  "navigation",
  "default",
  "finance",
  "bookings",
  "flights",
  "ticketing",
  "cancellations",
  "refunds",
  "customers",
  "support",
  "transactions",
  "wallets",
  "wallet-operations",
  "profile",
  "notifications",
] as const;

export type MessageScope = (typeof messageScopes)[number];

export const messages: Record<Locale, AbstractIntlMessages> = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    default: enDefault,
    finance: enFinance,
    bookings: enBookings,
    flights: enFlights,
    ticketing: enTicketing,
    cancellations: enCancellations,
    refunds: enRefunds,
    customers: enCustomers,
    support: enSupport,
    transactions: enTransactions,
    wallets: enWallets,
    "wallet-operations": enWalletOperations,
    profile: enProfile,
    notifications: enNotifications,
  },
  ar: {
    common: arCommon,
    navigation: arNavigation,
    default: arDefault,
    finance: arFinance,
    bookings: arBookings,
    flights: arFlights,
    ticketing: arTicketing,
    cancellations: arCancellations,
    refunds: arRefunds,
    customers: arCustomers,
    support: arSupport,
    transactions: arTransactions,
    wallets: arWallets,
    "wallet-operations": arWalletOperations,
    profile: arProfile,
    notifications: arNotifications,
  },
};
