import { z } from "zod";
import { strictPlainText } from "./common.validator.js";

export const createDirectorySchema = z.object({
  body: z.object({
    dirname: strictPlainText("Directory name"),
  }),
});

export const renameDirectorySchema = z.object({
  body: z.object({
    newDirname: strictPlainText("Directory name"),
  }),
});
