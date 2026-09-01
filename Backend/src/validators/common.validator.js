import { z } from "zod";
import dataSanitizer from "../helpers/dataSanitizer.js";

/**
 * A Zod string schema that validates and sanitizes input.
 * It uses a strict approach: if the sanitized version is different from the original,
 * it's considered invalid.
 */

const hasUnsafeText = /[<>\u0000-\u001F\u007F]/u;
const hasUnsafeFileNameChars = /[\\/:*?"<>|\u0000-\u001F\u007F]/u;

export const strictPlainText = (fieldName = "Input") =>
  z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(1, { error: `${fieldName} cannot be empty` })
    .max(255, { error: `${fieldName} is too long` })
    .refine((val) => !hasUnsafeText.test(val), {
      error: `Invalid ${fieldName}: Contains disallowed characters or HTML tags`,
    });

export const strictFileName = () =>
  strictPlainText("Filename").refine(
    (value) => !hasUnsafeFileNameChars.test(value),
    { error: "Filename contains invalid characters" },
  );

export const mimeType = z
  .string()
  .toLowerCase()
  .regex(/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/, {
    error: "Invalid file type",
  });
