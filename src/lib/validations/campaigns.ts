import { z } from "zod";

export const CreateCampaignSchema = z
  .object({
    orgId: z.string().uuid(),
    name: z
      .string()
      .min(1, "Le nom de la campagne est requis.")
      .max(100, "Le nom ne doit pas dépasser 100 caractères."),
    startDate: z.coerce.date({ error: "La date de début est requise." }),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => !data.endDate || data.endDate > data.startDate,
    {
      message: "La date de fin doit être postérieure à la date de début.",
      path: ["endDate"],
    },
  );

export const UpdateCampaignSchema = z
  .object({
    orgId: z.string().uuid(),
    campaignId: z.string().uuid(),
    name: z
      .string()
      .min(1, "Le nom de la campagne est requis.")
      .max(100, "Le nom ne doit pas dépasser 100 caractères."),
    startDate: z.coerce.date({ error: "La date de début est requise." }),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => !data.endDate || data.endDate > data.startDate,
    {
      message: "La date de fin doit être postérieure à la date de début.",
      path: ["endDate"],
    },
  );
