# EscuelaGest — Backend

NestJS 11 · TypeScript · PostgreSQL · MikroORM 6.x

## Comandos

```bash
pnpm start:dev                             # Dev server con watch
pnpm build && pnpm start:prod              # Producción
pnpm lint && pnpm format                   # o: pnpm clean (ambos juntos)
pnpm mikro-orm schema:update --safe --run  # Aplicar cambios de schema
pnpm mikro-orm migration:create            # Nueva migración
```

## Variables de entorno

```
DATABASE_URL=postgresql://localhost:5432/colegiogestion
ROOT_PASSWORD=<requerido>
ADMIN_PASSWORD=admin
PORT=8080
```

## Convenciones

### Entidades MikroORM

```typescript
@Entity({ tableName: 'families' })
export class Family {
  @PrimaryKey({ type: 'uuid' })
  readonly id: string = uuid.v7()  // SIEMPRE v7 — NUNCA v4

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

### Validación — Zod v4 SIEMPRE (NUNCA class-validator)

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

Decoradores disponibles: `@UsePipes(new ZodPipe(schema))`, `@RequirePermission()`, `@CurrentSession()`, `new UuidPipe()` para params UUID.

### Errores HTTP

Usar excepciones NestJS: `NotFoundException`, `ConflictException`, `BadRequestException`.
Unicidad: atrapar `UniqueConstraintViolationException` de MikroORM.

### DB naming

- Tablas: `snake_case` plural
- Columnas: `snake_case` — FKs: `[entity]_id`
- Todas las tablas: `created_at` + `updated_at`

### Montos de dinero

```typescript
@Property({ columnType: 'numeric(10,2)' })
amount!: string  // numeric(10,2) en DB — string en TypeScript — NUNCA number
```

### Soft delete

Usar enums de status en lugar de `deletedAt`. Métodos `deactivate()` / `reactivate()` en la entidad.

## Patrón para nuevos módulos

Referencia: `families/` y `students/` son los más recientes.

```
src/[module]/
├── [module].controller.ts
├── [module].service.ts
├── [module].module.ts
├── [module].repository.ts
├── entities/
│   ├── [entity].entity.ts
│   └── [enum].enum.ts
└── schemas/
    ├── create-[entity].schema.ts
    └── update-[entity].schema.ts
```

Siempre registrar en `app.module.ts`.

## Módulos implementados y notas clave

- `auth/` + `users/` — ejemplo canónico, no reimplementar
- `installments/` — `generateInstallment()` contiene el mapeo `level+grade → PriceTierCode`
  - jardin → jardin, primaria grade 1-3 → primaria_1, 4-6 → primaria_2, secundaria → secundaria
- `payments/` — `getNextReceiptNumber(year)` devuelve el siguiente correlativo por año
  - Regenerar cuota (mismo family+month+year) elimina la anterior **salvo si está `pagada`**
- `system-config/` — `SystemConfigService` se exporta; inyectarlo donde se necesite `currentAcademicYear`
- `price-tiers/` — solo GET, sin creación/eliminación (seeded en bootstrap)
- `fee-concepts/` tipo `servicio` son los asignables a alumnos via `StudentService`
- `enrollment.grade` es `smallint` — jardín: 3-5, primaria/secundaria: 1-6
