import { z } from "zod";
import {
  preprocessString,
  preprocessEnum,
  STATUS_VALUES,
  preprocessFileFlexible,
} from "@/lib/zodSchema";

export const visitorCreateSchema = z.object({
  visitorFirstName: preprocessString("Please provide visitorFirstName"),
  visitorLastName: preprocessString("Please provide visitorLastName"),
  visitorCompany: preprocessString("Please provide visitorCompany"),
  visitorCarRegistration: preprocessString(
    "Please provide visitorCarRegistration",
  ),
  visitorProvince: preprocessString("Please provide visitorProvince"),
  visitorContactUserId: preprocessString("Please provide visitorContactUserId"),
  visitorContactReason: preprocessEnum(
    STATUS_VALUES.VISITOR_REASON,
    "Please provide visitorContactReason",
  ),
  visitorPhoto: preprocessFileFlexible("Please provide visitorPhoto"),
  visitorDocumentPhotos: z
    .union([z.array(preprocessFileFlexible()), preprocessFileFlexible()])
    .optional(),
  visitorCreatedBy: preprocessString("Please provide the creator ID"),
});

export const visitorUpdateSchema = z.object({
  visitorId: preprocessString("Please provide the visitor ID"),
  visitorFirstName: preprocessString("Please provide visitorFirstName"),
  visitorLastName: preprocessString("Please provide visitorLastName"),
  visitorCompany: preprocessString("Please provide visitorCompany"),
  visitorCarRegistration: preprocessString(
    "Please provide visitorCarRegistration",
  ),
  visitorProvince: preprocessString("Please provide visitorProvince"),
  visitorContactUserId: preprocessString("Please provide visitorContactUserId"),
  visitorContactReason: preprocessEnum(
    STATUS_VALUES.VISITOR_REASON,
    "Please provide visitorContactReason",
  ),
  visitorPhoto: preprocessFileFlexible(
    "Please provide visitorPhoto",
  ).optional(),
  visitorDocumentPhotos: z
    .union([z.array(preprocessFileFlexible()), preprocessFileFlexible()])
    .optional(),
  visitorStatus: preprocessEnum(
    STATUS_VALUES.VISITOR,
    "Please provide visitorStatus",
  ),
  visitorUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const visitorCheckoutSchema = z.object({
  visitorId: preprocessString("Please provide the visitor ID"),
  visitorUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const patrolCreateSchema = z.object({
  patrolQrCodeInfo: preprocessString("Please provide patrolQrCodeInfo"),
  patrolPicture: preprocessFileFlexible("Please provide patrolPicture"),
  patrolNote: preprocessString("Please provide patrolNote"),
  patrolCreatedBy: preprocessString("Please provide the creator ID"),
});

export const patrolUpdateSchema = z.object({
  patrolId: preprocessString("Please provide the patrol ID"),
  patrolQrCodeInfo: preprocessString("Please provide patrolQrCodeInfo"),
  patrolPicture: preprocessFileFlexible(
    "Please provide patrolPicture",
  ).optional(),
  patrolNote: preprocessString("Please provide patrolNote"),
  patrolUpdatedBy: preprocessString("Please provide the updater ID"),
});
