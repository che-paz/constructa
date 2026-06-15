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

export const OrgStaffRoleSchema = z.enum([
  "constructor",
  "supervisor",
  "oficina",
  "contador",
]);

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(2, "Nombre requerido").max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email("Correo inválido").optional().nullable(),
  logo_url: z.string().max(500).optional().nullable(),
});

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(6, "Mínimo 6 caracteres"),
    new_password: z.string().min(6, "Mínimo 6 caracteres"),
    confirm_password: z.string().min(6, "Mínimo 6 caracteres"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

export const InviteMemberSchema = z.object({
  email: z.string().email("Correo inválido"),
  role: OrgStaffRoleSchema.default("supervisor"),
});

export const UpdateMemberSchema = z.object({
  role: OrgStaffRoleSchema.optional(),
  is_active: z.boolean().optional(),
});

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

export const UpdateMaterialEntrySchema = z.object({
  stage_id: z.string().uuid().optional().nullable(),
  entry_type: MaterialEntryTypeSchema.optional(),
  quantity: z.number().positive("La cantidad debe ser mayor a cero").optional(),
  unit_price: z.number().nonnegative().optional().nullable(),
  invoice_number: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const CreateMaterialBudgetSchema = z.object({
  project_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  material_id: z.string().uuid(),
  expected_quantity: z.number().positive("La cantidad esperada debe ser mayor a cero"),
});

export const UpdateMaterialBudgetSchema = z.object({
  expected_quantity: z
    .number()
    .positive("La cantidad esperada debe ser mayor a cero")
    .optional(),
});

export const WorkerSpecialtySchema = z.enum([
  "albanil",
  "electricista",
  "plomero",
  "peon",
  "carpintero",
  "herrero",
  "pintor",
  "otro",
]);

export const AttendanceTypeSchema = z.enum([
  "full",
  "half",
  "absent",
  "overtime",
]);

export const CheckInMethodSchema = z.enum(["manual", "qr", "gps", "face"]);

export const WorkerPaymentTypeSchema = z.enum(["daily", "contract"]);

const WorkerBaseSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(200),
  dpi: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  specialty: z.string().max(100).optional().nullable(),
  payment_type: WorkerPaymentTypeSchema.default("daily"),
  daily_rate: z
    .number()
    .nonnegative("El jornal debe ser cero o mayor")
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
});

function refineWorkerPaymentType<
  T extends z.ZodType<{ payment_type?: "daily" | "contract"; daily_rate?: number | null }>,
>(schema: T) {
  return schema.superRefine((data, ctx) => {
    if (data.payment_type === "daily" && data.daily_rate == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El jornal diario es requerido para trabajadores por jornal",
        path: ["daily_rate"],
      });
    }
  });
}

export const CreateWorkerSchema = refineWorkerPaymentType(WorkerBaseSchema);

export const UpdateWorkerSchema = refineWorkerPaymentType(
  WorkerBaseSchema.partial().extend({
    is_active: z.boolean().optional(),
  }),
);

export const CreateAttendanceSchema = z.object({
  project_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  work_date: z.string().date("Fecha inválida"),
  check_in: z.string().datetime({ offset: true }).optional().nullable(),
  check_out: z.string().datetime({ offset: true }).optional().nullable(),
  attendance_type: AttendanceTypeSchema.default("full"),
  check_in_method: CheckInMethodSchema.default("manual"),
  amount_paid: z
    .number()
    .nonnegative("El monto debe ser cero o mayor")
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
  is_paid: z.boolean().optional(),
});

export const UpdateAttendanceSchema = z.object({
  check_in: z.string().datetime({ offset: true }).optional().nullable(),
  check_out: z.string().datetime({ offset: true }).optional().nullable(),
  attendance_type: AttendanceTypeSchema.optional(),
  amount_paid: z
    .number()
    .nonnegative("El monto debe ser cero o mayor")
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
  is_paid: z.boolean().optional(),
});

export const CreateWorkerAdvanceSchema = z.object({
  worker_id: z.string().uuid(),
  amount: z.number().positive("El adelanto debe ser mayor a cero"),
  advance_date: z.string().date("Fecha inválida"),
  notes: z.string().max(500).optional().nullable(),
  week_start: z.string().date("Semana inválida").optional(),
});

export const UpdateWorkerAdvanceSchema = z.object({
  amount: z.number().positive("El adelanto debe ser mayor a cero").optional(),
  advance_date: z.string().date("Fecha inválida").optional(),
  notes: z.string().max(500).optional().nullable(),
  is_deducted: z.boolean().optional(),
});

export const ClosePayrollSchema = z.object({
  week_start: z.string().date("Semana inválida"),
  worker_ids: z.array(z.string().uuid()).optional(),
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
export type UpdateMaterialEntryInput = z.infer<typeof UpdateMaterialEntrySchema>;
export type CreateMaterialBudgetInput = z.infer<typeof CreateMaterialBudgetSchema>;
export type UpdateMaterialBudgetInput = z.infer<typeof UpdateMaterialBudgetSchema>;
export type CreateWorkerInput = z.infer<typeof CreateWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof UpdateWorkerSchema>;
export type CreateAttendanceInput = z.infer<typeof CreateAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof UpdateAttendanceSchema>;
export type CreateWorkerAdvanceInput = z.infer<typeof CreateWorkerAdvanceSchema>;
export type UpdateWorkerAdvanceInput = z.infer<typeof UpdateWorkerAdvanceSchema>;
export type ClosePayrollInput = z.infer<typeof ClosePayrollSchema>;

export const ExpenseCategorySchema = z.enum([
  "materiales",
  "mano_obra",
  "transporte",
  "otros",
]);

export const CreateExpenseSchema = z.object({
  category: ExpenseCategorySchema,
  description: z.string().min(1, "Descripción requerida").max(500),
  amount: z.number().positive("El monto debe ser mayor a cero"),
  expense_date: z.string().date("Fecha inválida"),
  stage_id: z.string().uuid().optional().nullable(),
  invoice_number: z.string().max(100).optional().nullable(),
});

export const CashflowPeriodSchema = z.enum(["week", "month"]);

export const CashflowQuerySchema = z.object({
  period: CashflowPeriodSchema.default("month"),
  project: z.string().uuid().optional(),
  reference_date: z.string().date().optional(),
});

export type CashflowQueryInput = z.infer<typeof CashflowQuerySchema>;
export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const AIChatRequestSchema = z.object({
  message: z.string().min(1, "Mensaje requerido").max(4000),
  conversation_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
});

export const ReportTypeSchema = z.enum(["weekly", "monthly", "milestone"]);

export const GenerateReportSchema = z.object({
  project_id: z.string().uuid(),
  report_type: ReportTypeSchema.default("weekly"),
  period_start: z.string().date().optional(),
  period_end: z.string().date().optional(),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
export type AIChatRequestInput = z.infer<typeof AIChatRequestSchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
