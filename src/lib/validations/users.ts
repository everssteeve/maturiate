import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis.").max(100, "Le nom ne doit pas dépasser 100 caractères."),
  image: z.string().url("L'URL de l'avatar n'est pas valide.").optional().or(z.literal("")),
});
