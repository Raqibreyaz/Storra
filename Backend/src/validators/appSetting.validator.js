import { z } from "zod";

const toggleWithBytesLimitSchema = z
  .object({
    enabled: z.boolean().optional(),
    bytesLimit: z.number().min(0).nullable().optional(),
  })
  .refine((data) => data.enabled !== true || data.bytesLimit != null, {
    path: ["bytesLimit"],
    error: "bytesLimit must be provided when enabled is true!",
  });

const toggleWithNoOfUsersCountSchema = z
  .object({
    enabled: z.boolean().optional(),
    count: z.number().min(1).nullable().optional(),
  })
  .refine((data) => data.enabled !== true || data.count != null, {
    path: ["count"],
    error: "users count must be provided when enabled is true!",
  });

export const appSettingSchema = z.object({
  body: z.object({
    newRegistrationDisabled: z.boolean().optional(),
    globalObjectStorageCap: toggleWithBytesLimitSchema,
    maxFileUploadSize: toggleWithBytesLimitSchema,
    fileUploadDisabled: z.boolean().optional(),
    noOfUsersAllowed: toggleWithNoOfUsersCountSchema,
    freePlanUpgradeDisabled: z.boolean().optional(),
  }),
});
