export const endpoints = {
  authV1: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    confirmRegister: "/api/v1/auth/register/confirm",
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password",
    me: "/api/v1/auth/me",
    changePassword: "/api/v1/auth/change-password",
    trustedBrowsers: "/api/v1/auth/trusted-browsers",
    trustedBrowser: (id: string) => `/api/v1/auth/trusted-browsers/${encodeURIComponent(id)}`,
    logout: "/api/v1/auth/logout",
    acceptLoginTerms: "/api/v1/auth/login/accept-terms",
  },
  terms: {
    current: "/api/v1/terms/current",
  },
  usersV1: {
    list: "/api/v1/admin/users",
    me: "/api/v1/users/me",
    customers: "/api/v1/admin/users/c",
    customer: (id: string) => `/api/v1/admin/users/c/${encodeURIComponent(id)}`,
    invitations: "/api/v1/admin/users/invitations",
    invitationAccept: "/api/v1/users/invitations/accept",
    invitationResend: (id: string) => `/api/v1/admin/users/invitations/${encodeURIComponent(id)}/resend`,
    invitationRevoke: (id: string) => `/api/v1/admin/users/invitations/${encodeURIComponent(id)}/revoke`,
    detail: (id: string) => `/api/v1/admin/users/${encodeURIComponent(id)}`,
    employee: (id: string) => `/api/v1/admin/users/${encodeURIComponent(id)}/employee`,
    blocking: (id: string) => `/api/v1/admin/users/${encodeURIComponent(id)}/blocking`,
  },
  rolesV1: {
    list: "/api/v1/admin/authorization/roles",
    permissions: "/api/v1/admin/authorization/permissions",
    detail: (id: string) => `/api/v1/admin/authorization/roles/${encodeURIComponent(id)}`,
    rolePermissions: (id: string) => `/api/v1/admin/authorization/roles/${encodeURIComponent(id)}/permissions`,
  },
  notificationsV1: {
    list: "/api/v1/notifications/me",
    detail: (id: string) => `/api/v1/notifications/me/${encodeURIComponent(id)}`,
    read: (id: string) => `/api/v1/notifications/me/${encodeURIComponent(id)}/read`,
    readAll: "/api/v1/notifications/me/read-all",
  },
  //--------admin-wallet----//
  adminWalletV1: {
    configuration: "/api/v1/admin/wallet/configuration",
    customers: "/api/v1/admin/wallet/customers",
    customer: (userId: string) => `/api/v1/admin/wallet/customers/${encodeURIComponent(userId)}`,
    customerFreeze: (userId: string) => `/api/v1/admin/wallet/customers/${encodeURIComponent(userId)}/freeze`,
    merchant: "/api/v1/admin/wallet/merchant",
    merchantHistory: "/api/v1/admin/wallet/merchant/history",
    withdrawals: "/api/v1/admin/wallet/withdrawals",
    withdrawal: (withdrawalId: string) => `/api/v1/admin/wallet/withdrawals/${encodeURIComponent(withdrawalId)}`,
    withdrawalAction: (withdrawalId: string, action: string) =>
      `/api/v1/admin/wallet/withdrawals/${encodeURIComponent(withdrawalId)}/actions/${encodeURIComponent(action)}`,
    withdrawalEvidence: (withdrawalId: string) =>
      `/api/v1/admin/wallet/withdrawals/${encodeURIComponent(withdrawalId)}/evidence`,
    transfers: "/api/v1/admin/wallet/transfers",
    transfer: (transferId: string) => `/api/v1/admin/wallet/transfers/${encodeURIComponent(transferId)}`,
  },
  //-------end-admin-wallet----//
  bookings: {},
  flights: {},
  finance: {},
} as const;
