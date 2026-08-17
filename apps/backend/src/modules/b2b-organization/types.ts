export enum B2BOrganizationStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  ARCHIVED = "archived",
}

export enum B2BOrganizationMemberStatus {
  INVITED = "invited",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  REMOVED = "removed",
}

export enum B2BOrganizationRole {
  OWNER = "owner",
  BUYER = "buyer",
  APPROVER = "approver",
  FINANCE = "finance",
  VIEWER = "viewer",
}