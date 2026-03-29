# AGENTS.md — EscuelaGest Backend

Este documento guía a agentes de código (Claude Code, OpenCode, etc.) para trabajar en este repo.

---

## Contexto del Proyecto

**EscuelaGest** es un sistema de gestión escolar para dos instituciones en San Miguel, Buenos Aires, Argentina:
- **Jardín de Infantes La Alpina Verde** (Sala de 3, 4 y 5 — turnos mañana/tarde)
- **Colegio San Miguel Arcángel** (Primaria 1°-6° — cursos A/B, Secundaria 1°-6° — único)

Ambas comparten base de datos, diferenciadas por `institution_id`. La **unidad de facturación es la familia**, no el alumno individual.

Este repo es el **backend** (API REST). El frontend vive en el repo `schoolManagement-front/`.

---

## Stack

| | |
|---|---|
| Framework | NestJS 11 · TypeScript |
| Base de datos | PostgreSQL |
| ORM | MikroORM 6.x |
| IDs | **UUID v7** — `uuid.v7()` — NUNCA v4 |
| Auth | Cookies HttpOnly (`sid`) · **argon2** · sessions custom |
| Validación | **Zod v4** — NUNCA class-validator |
| Package Manager | pnpm >=10 |
| Node | >=22 |
| Deploy | Contabo VPS · nginx · PM2 |

---

## Comandos

```bash
pnpm install               # Instalar dependencias
pnpm build                 # Compilar (nest build)
pnpm start:dev             # Dev server con watch
pnpm start:prod            # Producción
pnpm lint                  # ESLint --fix
pnpm format                # Prettier --write
pnpm clean                 # lint + format

# MikroORM
pnpm mikro-orm debug                       # Verificar conexión a DB
pnpm mikro-orm schema:update --safe --run  # Aplicar cambios de schema
pnpm mikro-orm migration:create            # Crear migración
pnpm mikro-orm migration:up                # Ejecutar migraciones pendientes
```

---

## Variables de Entorno (.env)

```
DATABASE_URL=postgresql://localhost:5432/colegiogestion
ROOT_PASSWORD=<password>     # requerido — usuario root de mantenimiento
ADMIN_PASSWORD=admin         # default — usuario admin de desarrollo
PORT=8080
```

---

## Seed en onApplicationBootstrap

Al arrancar se crean automáticamente si no existen:

- **Usuarios** (`UsersService`): `root` (password desde `ROOT_PASSWORD`) y `admin` (password desde `ADMIN_PASSWORD`)
- **Instituciones** (`InstitutionsService`): Jardín La Alpina Verde + Colegio San Miguel Arcángel
- **PriceTiers** (`PriceTiersService`): Jardín, Primaria 1er ciclo, Primaria 2do ciclo, Secundaria

---

## Estructura de Módulos

```
src/
├── main.ts
├── app.module.ts
├── mikro-orm.config.ts
├── zod.filter.ts                  # Exception filter para errores de Zod
├── common/
│   ├── pagination-options.schema.ts
│   ├── uuid.pipe.ts
│   └── zod.pipe.ts
├── auth/                          # IMPLEMENTADO
│   ├── auth.controller.ts         # POST /api/login, POST /api/logout, GET /api/me
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── authentication.guard.ts
│   ├── authorization.guard.ts
│   ├── decorators/                # @CurrentSession, @RequirePermission, @SkipAuth, @SkipAuthorization
│   ├── entities/session.entity.ts
│   ├── schemas/login-data.schema.ts
│   └── sessions.repository.ts
├── users/                         # IMPLEMENTADO
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   ├── users.repository.ts
│   ├── password.service.ts        # argon2 hash/verify
│   ├── constants.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── role.enum.ts
│   └── schemas/
│       ├── new-user.schema.ts
│       ├── password-update.schema.ts
│       └── profile-update.schema.ts
├── institutions/                  # IMPLEMENTADO
│   ├── institutions.controller.ts # GET /api/institutions, PATCH /api/institutions/:id
│   ├── institutions.service.ts
│   ├── institutions.module.ts
│   ├── institutions.repository.ts
│   ├── entities/institution.entity.ts
│   └── schemas/update-institution.schema.ts
├── families/                      # IMPLEMENTADO
│   ├── families.controller.ts     # /api/families, /api/families/:id/guardians
│   ├── families.service.ts
│   ├── families.module.ts
│   ├── families.repository.ts
│   ├── entities/
│   │   ├── family.entity.ts       # status: activa | inactiva
│   │   ├── family-status.enum.ts
│   │   ├── guardian.entity.ts
│   │   └── relationship.enum.ts   # padre | madre | tutor | otro
│   └── schemas/
│       ├── create-family.schema.ts
│       ├── update-family.schema.ts
│       ├── create-guardian.schema.ts
│       └── update-guardian.schema.ts
├── students/                      # IMPLEMENTADO
│   ├── students.controller.ts     # /api/students, sub-resources: enrollments, emergency-contacts
│   ├── students.service.ts
│   ├── students.module.ts
│   ├── students.repository.ts
│   ├── entities/
│   │   ├── student.entity.ts      # status: activo|inactivo|egresado|baja
│   │   ├── student-status.enum.ts
│   │   ├── enrollment.entity.ts   # grade: smallint (jardín 3-5, primaria/secundaria 1-6)
│   │   ├── enrollment-status.enum.ts  # inscripto|confirmado|baja
│   │   ├── emergency-contact.entity.ts
│   │   ├── gender.enum.ts         # masculino|femenino|otro
│   │   ├── level.enum.ts          # jardin|primaria|secundaria
│   │   ├── section.enum.ts        # A|B|unico
│   │   └── shift.enum.ts          # manana|tarde|completo
│   └── schemas/
│       ├── create-student.schema.ts
│       ├── update-student.schema.ts
│       ├── create-enrollment.schema.ts
│       ├── update-enrollment.schema.ts
│       ├── create-emergency-contact.schema.ts
│       └── update-emergency-contact.schema.ts
├── price-tiers/                   # IMPLEMENTADO (seeded, sin CRUD de creación)
│   ├── price-tiers.controller.ts  # GET /api/price-tiers
│   ├── price-tiers.service.ts
│   ├── price-tiers.module.ts
│   ├── price-tiers.repository.ts
│   └── entities/price-tier.entity.ts  # code: jardin|primaria_1|primaria_2|secundaria
├── fee-concepts/                  # IMPLEMENTADO
│   ├── fee-concepts.controller.ts # CRUD /api/fee-concepts, activate/deactivate
│   ├── fee-concepts.service.ts
│   ├── fee-concepts.module.ts
│   ├── fee-concepts.repository.ts
│   ├── entities/
│   │   ├── fee-concept.entity.ts
│   │   └── fee-concept-type.enum.ts  # arancel|servicio|matricula|otro
│   └── schemas/
│       ├── create-fee-concept.schema.ts
│       └── update-fee-concept.schema.ts
├── fee-prices/                    # IMPLEMENTADO
│   ├── fee-prices.controller.ts   # /api/fee-prices
│   ├── fee-prices.service.ts
│   ├── fee-prices.module.ts
│   ├── fee-prices.repository.ts
│   ├── entities/fee-price.entity.ts   # amount: numeric(10,2) como string
│   └── schemas/
│       ├── create-fee-price.schema.ts
│       └── update-fee-price.schema.ts
├── student-services/              # IMPLEMENTADO
│   ├── student-services.controller.ts  # /api/students/:studentId/services
│   ├── student-services.service.ts
│   ├── student-services.module.ts
│   ├── student-services.repository.ts
│   ├── entities/student-service.entity.ts
│   └── schemas/
│       ├── create-student-service.schema.ts
│       └── update-student-service.schema.ts
├── system-config/                 # IMPLEMENTADO — año lectivo activo + config global
│   ├── system-config.controller.ts  # GET /api/system-config, PATCH /api/system-config
│   ├── system-config.service.ts     # onApplicationBootstrap: seed current_academic_year
│   ├── system-config.module.ts      # exports SystemConfigService
│   ├── system-config.repository.ts
│   ├── entities/system-config.entity.ts  # PK: key (text), value (text)
│   └── schemas/update-system-config.schema.ts
├── installments/                  # IMPLEMENTADO — cuotas por familia
│   ├── installments.controller.ts  # GET /api/installments?familyId=, POST, PUT /:id/annul
│   ├── installments.service.ts     # generateInstallment() — lógica de cálculo
│   ├── installments.module.ts
│   ├── installments.repository.ts
│   ├── entities/
│   │   ├── installment.entity.ts        # family+month+year, subtotal/total, status enum
│   │   ├── installment-detail.entity.ts # por alumno+concepto, amount/finalAmount
│   │   └── installment-status.enum.ts   # pendiente|parcial|pagada|vencida|anulada
│   └── schemas/generate-installment.schema.ts
└── payments/                      # IMPLEMENTADO — pagos + recibos
    ├── payments.controller.ts  # GET /api/payments?familyId=, GET /:id, POST
    ├── payments.service.ts     # createPayment() — actualiza status installment + genera receipt
    ├── payments.module.ts
    ├── payments.repository.ts  # getNextReceiptNumber() — correlativo por año
    ├── entities/
    │   ├── payment.entity.ts        # family+installment(nullable)+amount+method+receivedBy
    │   ├── receipt.entity.ts        # receiptNumber correlativo por academicYear
    │   └── payment-method.enum.ts   # efectivo|transferencia|mercadopago
    └── schemas/create-payment.schema.ts
```

---

## Patrón para Nuevos Módulos

Referencia: `families/` y `students/` son los ejemplos más recientes.

```
src/[module]/
├── [module].controller.ts
├── [module].service.ts
├── [module].module.ts
├── [module].repository.ts
├── entities/
│   ├── [entity].entity.ts
│   └── [enum].enum.ts        # si aplica
└── schemas/
    ├── create-[entity].schema.ts
    └── update-[entity].schema.ts
```

Siempre registrar el módulo en `app.module.ts`.

---

## Convenciones

### Entidades MikroORM

```typescript
@Entity({ tableName: 'families' })
export class Family {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()  // SIEMPRE v7

  @Property({ type: 'timestamptz' })
  readonly createdAt: Date = new Date()

  @Property({ type: 'timestamptz', onUpdate: () => new Date() })
  readonly updatedAt: Date = new Date()
}
```

### Relaciones

```typescript
@ManyToOne(() => Family, { ref: true })
family!: Ref<Family>

@OneToMany(() => Student, (s) => s.family)
students = new Collection<Student>(this)
```

### Soft delete

Usar enums de status en lugar de `deletedAt`/`disabledAt`. Agregar métodos `deactivate()` / `reactivate()` a la entidad.

### Validación Zod v4

```typescript
export const createFamilySchema = z.object({
  familyName: z.string().min(1),
  primaryEmail: z.string().email().nullable().optional(),
})
export type CreateFamily = z.infer<typeof createFamilySchema>
```

### Controllers

```typescript
@Post()
@UsePipes(new ZodPipe(createFamilySchema))
@RequirePermission(Permission.ManageFamilies)
async create(@Body() body: CreateFamily, @CurrentSession() session: Session) { ... }
```

- `@UsePipes(new ZodPipe(schema))` — validación del body
- `@RequirePermission()` — autorización
- `@CurrentSession()` — sesión actual
- `new UuidPipe()` — validación de params UUID

### Errores HTTP

Usar excepciones de NestJS: `NotFoundException`, `ConflictException`, `BadRequestException`.
Para conflictos de unicidad: atrapar `UniqueConstraintViolationException` de MikroORM.

### Naming de base de datos

- Tablas: `snake_case` plural
- Columnas: `snake_case`
- FKs: `[entity]_id`
- Todas las tablas llevan `created_at` y `updated_at`

### Montos de dinero

`numeric(10,2)` en PostgreSQL, almacenado como `string` en la entidad:

```typescript
@Property({ columnType: 'numeric(10,2)' })
amount!: string
```

---

## Entidades del Dominio

| Entidad | Tabla | Estado |
|---------|-------|--------|
| Institution | `institutions` | ✅ Implementado |
| Family | `families` | ✅ Implementado |
| Guardian | `guardians` | ✅ Implementado |
| Student | `students` | ✅ Implementado |
| Enrollment | `enrollments` | ✅ Implementado |
| EmergencyContact | `emergency_contacts` | ✅ Implementado |
| User | `users` | ✅ Implementado |
| PriceTier | `price_tiers` | ✅ Implementado (seeded) |
| FeeConcept | `fee_concepts` | ✅ Implementado |
| FeePrice | `fee_prices` | ✅ Implementado |
| StudentService | `student_services` | ✅ Implementado |
| SystemConfig | `system_config` | ✅ Implementado (seeded) |
| Installment | `installments` | ✅ Implementado |
| InstallmentDetail | `installment_details` | ✅ Implementado |
| Payment | `payments` | ✅ Implementado |
| Receipt | `receipts` | ✅ Implementado |
| Discount | `discounts` | ⬜ Pendiente |
| AppliedDiscount | `applied_discounts` | ⬜ Pendiente |
| AuditLog | `audit_logs` | ⬜ Pendiente |

---

## Reglas de Negocio Clave

1. **Facturación por familia**: una cuota agrupa todos los conceptos de todos los alumnos de esa familia
2. **Precios por ciclo**: Jardín / Primaria 1er ciclo / Primaria 2do ciclo / Secundaria — no por grado individual
3. **Pagos parciales**: permitidos, la cuota queda en estado `parcial`
4. **Saldo a favor**: pagos a cuenta sin cuota asociada, aplicables a cuotas futuras
5. **Recibos**: numeración correlativa por año
6. **Descuentos acumulables**: hermano + beca + pronto pago pueden coexistir
7. **Mora configurable**: días de gracia + recargo (% o fijo)
8. **Métodos de pago**: Efectivo, Transferencia bancaria, MercadoPago
9. **Enrollment grade**: integer — jardín: 3-5, primaria/secundaria: 1-6

---

## Estado del MVP (Fase 1)

- [x] Auth — login/logout/me, sessions, guards
- [x] Users — CRUD, roles, disable/restore, seed admin/root
- [x] Institutions — seed 2 instituciones, PATCH datos
- [x] Families — CRUD familias + responsables, status activa/inactiva
- [x] Students — CRUD alumnos, inscripciones (grade int), contactos de emergencia
- [x] PriceTiers — 4 ciclos seeded en bootstrap
- [x] FeeConcepts — CRUD por institución, activate/deactivate
- [x] FeePrices — precios por concepto + ciclo + año
- [x] StudentServices — servicios adicionales por alumno
- [x] SystemConfig — tabla + seed (currentAcademicYear), GET/PATCH /api/system-config
- [x] Installment + InstallmentDetail — generación de cuotas por familia+mes
- [x] Payment + Receipt — registro de pagos con numeración correlativa por año
- [ ] Discount + AppliedDiscount
- [ ] Dashboard — recaudación del mes, deudores

---

## Notas para el Agente

- **No commitear ni pushear** sin confirmación explícita del usuario.
- Si hay duda sobre lógica impositiva o reglas de facturación argentinas, **preguntar antes de implementar**.
- Passwords con **argon2** (`password.service.ts`), NUNCA bcrypt.
- IDs siempre con `uuid.v7()`, NUNCA `uuid.v4()`.
- Montos de dinero: `numeric(10,2)` en DB, `string` en TypeScript, NUNCA `number` nativo.
- `auth/` y `users/` son el ejemplo canónico de módulo — no reimplementar.
- `families/`, `students/`, `fee-concepts/` y `fee-prices/` son la referencia más reciente.
- `Enrollment.grade` es `smallint` — no `gradeOrRoom` texto libre.
- `PriceTiers` solo se leen, no tienen endpoint de creación/eliminación.
- `FeeConcepts` de tipo `servicio` son los que se asignan a alumnos via `StudentService`.
- `SystemConfigService` se exporta desde su módulo — inyectarlo en otros servicios que necesiten el año lectivo activo.
- La lógica de mapeo `level+grade → PriceTierCode` está en `installments.service.ts`: jardin→jardin, primaria grade 1-3→primaria_1, 4-6→primaria_2, secundaria→secundaria.
- `Receipt.receiptNumber` es correlativo por `academicYear` — usar `paymentsRepository.getNextReceiptNumber(year)`.
- Regenerar cuota (mismo family+month+year) elimina la anterior salvo si está `pagada`.
