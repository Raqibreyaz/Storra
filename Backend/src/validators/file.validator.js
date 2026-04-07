import { z } from "zod";

export const initiateFileUploadSchema = z.object({
  body: z.object({
    fileSize: z.coerce
      .number({ error: "FileSize should be a number" })
      .min(0, { error: "FileSize cannot be negative" }),
    fileName: z
      .string({ error: "Filename is required!" })
      .min(1, { error: "Filename cannot be empty!" }),
    fileType: z
      .string({ error: "FileType is required!" })
      .min(1, { error: "FileType cannot be empty!" }),
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
    newFilename: z.string().min(1),
  }),
});

export const setAllowAnyoneSchema = z.object({
  body: z.object({
    permission: z.enum(["Edit", "View"]).nullable().optional(),
  }),
});
