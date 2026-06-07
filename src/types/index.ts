import type {
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  BOOKING_STATUSES,
  ROLES,
  ORG_ROLES,
} from "@/constants";

export type Role      = (typeof ROLES)[number];
export type OrgRole   = (typeof ORG_ROLES)[number];
export type BookingStatus  = (typeof BOOKING_STATUSES)[number];
export type AssetStatus    = (typeof ASSET_STATUSES)[number];
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

export type IdLike = string;

export interface AssetSummary {
  id:                IdLike;
  name:              string;
  categoryId:        IdLike;
  orgId:             IdLike;
  totalQuantity:     number;
  availableQuantity: number;
  condition:         AssetCondition;
  status:            AssetStatus;
}

export interface BookingSummary {
  id:        IdLike;
  assetId:   IdLike;
  userId:    IdLike;
  quantity:  number;
  startDate: string;
  endDate:   string;
  status:    BookingStatus;
}
