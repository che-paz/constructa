import { z } from "zod";

export const UserRoleSchema = z.enum([
  "constructor",
  "supervisor",
  "oficina",
  "contador",
  "cliente",
]);

export const OrganizationPlanSchema = z.enum([
  "basico",
  "profesional",
  "empresa",
]);

export const ProjectStatusSchema = z.enum([
  "active",
  "paused",
  "completed",
  "cancelled",
]);

export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const SignupSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  fullName: z.string().min(2, "Nombre requerido").max(100),
  organizationName: z
    .string()
    .min(2, "Nombre de empresa requerido")
    .max(100),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200),
  description: z.string().max(2000).optional(),
  address: z.string().max(300).optional(),
  municipality: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  status: ProjectStatusSchema.default("active"),
  start_date: z.string().date().optional().nullable(),
  planned_end_date: z.string().date().optional().nullable(),
  total_budget: z.number().nonnegative().optional().nullable(),
  client_advance: z.number().nonnegative().optional().nullable(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
