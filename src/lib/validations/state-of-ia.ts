import { z } from "zod";

export const ReportSectionSchema = z.object({
  title: z.string().min(1, "Le titre de la section est requis."),
  body: z.string(),
  chartType: z
    .enum(["distribution", "dimensions", "trends", "segments"])
    .optional(),
});

export const ReportContentSchema = z.object({
  introduction: z.string(),
  sections: z.array(ReportSectionSchema),
  keyInsights: z.array(z.string()),
  methodology: z.string(),
});

export type ReportContent = z.infer<typeof ReportContentSchema>;
export type ReportSection = z.infer<typeof ReportSectionSchema>;

export const defaultReportContent: ReportContent = {
  introduction: "",
  sections: [],
  keyInsights: [],
  methodology: "",
};

export const ExtractSnapshotsSchema = z.object({
  year: z.number().int().min(2024).max(2100),
  replaceExisting: z.boolean().optional().default(false),
});

export const CreateReportSchema = z.object({
  year: z.number().int().min(2024).max(2100),
});

export const UpdateReportSchema = z.object({
  reportId: z.string().uuid(),
  content: ReportContentSchema,
});

export const PublishReportSchema = z.object({
  reportId: z.string().uuid(),
});
