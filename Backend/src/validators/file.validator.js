import { z } from "zod";
import { strictFileName, mimeType } from "./common.validator.js";

export const initiateFileUploadSchema = z.object({
  body: z.object({
    fileSize: z.coerce
      .number({ error: "FileSize should be a number" })
      .min(0, { error: "FileSize cannot be negative" }),
    fileName: strictFileName(),
    fileType: mimeType.default("application/octet-stream"),
  }),
});

export const getFileSchema = z.object({
  query: z
    .object({
      action: z.enum(["download"]).optional(),
    })
    .optional(),
});

export const renameFileSchema = z.object({
  body: z.object({
    newFilename: strictFileName,
  }),
});

export const setAllowAnyoneSchema = z.object({
  body: z.object({
    permission: z.enum(["Edit", "View"]).nullable().optional(),
  }),
});
