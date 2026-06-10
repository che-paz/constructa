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

export const PaymentMethodSchema = z.enum([
  "efectivo",
  "transferencia",
  "cheque",
  "tarjeta",
  "otro",
]);

export const CreatePaymentSchema = z.object({
  amount: z.number().positive("El monto debe ser mayor a cero"),
  payment_date: z.string().date("Fecha inválida"),
  payment_method: PaymentMethodSchema,
  reference_number: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  receipt_url: z.string().max(500).optional().nullable(),
});

export const StageStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "delayed",
]);

export const CreateStageSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200),
  description: z.string().max(2000).optional().nullable(),
  order_index: z.number().int().nonnegative().optional(),
  planned_start: z.string().date().optional().nullable(),
  planned_end: z.string().date().optional().nullable(),
  actual_start: z.string().date().optional().nullable(),
  actual_end: z.string().date().optional().nullable(),
  progress_pct: z.number().int().min(0).max(100).optional(),
  responsible_id: z.string().uuid().optional().nullable(),
  status: StageStatusSchema.optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const UpdateStageSchema = CreateStageSchema.partial();

export const MaterialUnitSchema = z.enum([
  "bolsas",
  "quintales",
  "metros",
  "unidades",
  "litros",
  "camionadas",
  "millares",
  "pies_tablares",
]);

export const MaterialEntryTypeSchema = z.enum([
  "purchase",
  "consumption",
  "transfer",
  "loss",
  "return",
]);

export const CreateMaterialCatalogSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  unit: MaterialUnitSchema,
  category: z.string().max(50).optional().nullable(),
  standard_price: z.number().nonnegative().optional().nullable(),
});

export const UpdateMaterialCatalogSchema = CreateMaterialCatalogSchema.partial();

export const CreateMaterialEntrySchema = z.object({
  project_id: z.string().uuid(),
  stage_id: z.string().uuid().optional().nullable(),
  material_id: z.string().uuid(),
  entry_type: MaterialEntryTypeSchema,
  quantity: z.number().positive("La cantidad debe ser mayor a cero"),
  unit_price: z.number().nonnegative().optional().nullable(),
  invoice_number: z.string().max(100).optional().nullable(),
  invoice_url: z.string().max(500).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const CreateMaterialBudgetSchema = z.object({
  project_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  material_id: z.string().uuid(),
  expected_quantity: z.number().positive("La cantidad esperada debe ser mayor a cero"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type CreateStageInput = z.infer<typeof CreateStageSchema>;
export type UpdateStageInput = z.infer<typeof UpdateStageSchema>;
export type CreateMaterialCatalogInput = z.infer<typeof CreateMaterialCatalogSchema>;
export type UpdateMaterialCatalogInput = z.infer<typeof UpdateMaterialCatalogSchema>;
export type CreateMaterialEntryInput = z.infer<typeof CreateMaterialEntrySchema>;
export type CreateMaterialBudgetInput = z.infer<typeof CreateMaterialBudgetSchema>;
