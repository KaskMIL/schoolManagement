// src/database/seed.ts
import 'dotenv/config'
import { MikroORM, ref } from '@mikro-orm/core'
import Decimal from 'decimal.js'
import * as readline from 'readline'
import ormConfig from '../mikro-orm.config'
import { Family } from '../families/entities/family.entity'
import { Guardian } from '../families/entities/guardian.entity'
import { Institution } from '../institutions/entities/institution.entity'
import { Student } from '../students/entities/student.entity'
import { Enrollment } from '../students/entities/enrollment.entity'
import { FeeConcept } from '../fee-concepts/entities/fee-concept.entity'
import { FeePrice } from '../fee-prices/entities/fee-price.entity'
import { PriceTier } from '../price-tiers/entities/price-tier.entity'
import { Installment } from '../installments/entities/installment.entity'
import { InstallmentDetail } from '../installments/entities/installment-detail.entity'
import { Payment } from '../payments/entities/payment.entity'
import { PaymentAllocation } from '../payments/entities/payment-allocation.entity'
import { Receipt } from '../payments/entities/receipt.entity'
import { User } from '../users/entities/user.entity'
import { FeeConceptType } from '../fee-concepts/entities/fee-concept-type.enum'
import { Relationship } from '../families/entities/relationship.enum'
import { Level } from '../students/entities/level.enum'
import { Section } from '../students/entities/section.enum'
import { Shift } from '../students/entities/shift.enum'
import { InstallmentStatus } from '../installments/entities/installment-status.enum'
import { PaymentMethod } from '../payments/entities/payment-method.enum'

// ─── Mock data ──────────────────────────────────────────────────────────────

const LAST_NAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez',
  'Pérez', 'Gómez', 'Díaz', 'Torres', 'Ramírez', 'Flores', 'Herrera', 'Moreno',
  'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Castro', 'Ortega',
  'Rubio', 'Morales', 'Jiménez', 'Delgado', 'Vázquez', 'Suárez', 'Serrano',
  'Blanco', 'Molina', 'Guerrero', 'Medina', 'Santos', 'Peña', 'Iglesias', 'Vega',
  'Vargas', 'Cabrera', 'Ramos', 'Acosta', 'Vera', 'Benítez', 'Ríos', 'Mendoza',
  'Aguirre', 'Silva', 'Luna', 'Paredes', 'Rojas', 'Salinas', 'Ponce', 'Reyes',
  'Figueroa', 'Miranda', 'Arias', 'Bravo', 'Cortés', 'Domínguez', 'Escobar',
  'Fuentes', 'Garrido', 'Ibáñez', 'Juárez', 'Lara', 'Núñez', 'Ojeda', 'Quiroz',
  'Ruiz', 'Tapia', 'Uribe', 'Valero', 'Zamora', 'Aráoz', 'Centeno', 'Durán',
  'Espinoza', 'Farías', 'Galarza', 'Hidalgo', 'Jara', 'Lacroix', 'Mansilla',
  'Orellano', 'Patiño', 'Quiroga', 'Reynoso', 'Segovia', 'Urquiza', 'Vieyra',
  'Albornoz', 'Baigorria', 'Córdoba', 'Ferreyra', 'Galván', 'Heredia', 'Nardone',
  'Ocampo', 'Pedraza', 'Rivero', 'Soria', 'Tejada', 'Berón', 'Coria', 'Dávila',
]

const FIRST_NAMES_M = [
  'Martín', 'Santiago', 'Matías', 'Lucas', 'Nicolás', 'Juan', 'Pablo', 'Diego',
  'Andrés', 'Federico', 'Sebastián', 'Rodrigo', 'Carlos', 'Fernando', 'Alejandro',
  'Tomás', 'Facundo', 'Ignacio', 'Emiliano', 'Agustín',
]

const FIRST_NAMES_F = [
  'Valentina', 'Sofía', 'Camila', 'Lucía', 'Florencia', 'María', 'Ana', 'Valeria',
  'Natalia', 'Carolina', 'Daniela', 'Marcela', 'Paula', 'Andrea', 'Laura',
  'Micaela', 'Jimena', 'Gabriela', 'Verónica', 'Alejandra',
]

const KIDS_M = [
  'Mateo', 'Joaquín', 'Santino', 'Bruno', 'Lautaro', 'Bautista', 'Agustín',
  'Felipe', 'Ignacio', 'Marco', 'Thiago', 'Benicio', 'Máximo', 'Valentín', 'León',
]

const KIDS_F = [
  'Emma', 'Valentina', 'Olivia', 'Mía', 'Catalina', 'Martina', 'Luciana',
  'Ámbar', 'Renata', 'Agustina', 'Sofía', 'Isadora', 'Paloma', 'Mora', 'Violeta',
]

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre',
]

const METHODS = [PaymentMethod.Efectivo, PaymentMethod.Transferencia, PaymentMethod.MercadoPago]

// IDs de conceptos existentes en la DB
const EXISTING_IDS = {
  cuota: '019d3779-94ce-772f-92c6-7a148ccaec1c',
  matricula: '019d377d-e60b-7515-9110-b4f2e66a6c52',
  campamento1: '019d3a22-280f-7346-bddb-c83722a7ecae',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], idx: number): T {
  return arr[((idx % arr.length) + arr.length) % arr.length]
}

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

function tierCodeForLevel(level: Level, grade: number): string {
  if (level === Level.Jardin) return 'jardin'
  if (level === Level.Secundaria) return 'secundaria'
  return grade <= 3 ? 'primaria_1' : 'primaria_2'
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now()
  console.log('🌱 EscuelaGest Mock Data Seed')
  console.log('Conectando a la base de datos...')

  const orm = await MikroORM.init(ormConfig)
  const em = orm.em.fork()
  console.log('✓ Conexión establecida\n')

  try {
    // ── Idempotencia ─────────────────────────────────────────────────────────
    const existingCount = await em.count(Family, { notes: { $like: '%[SEED]%' } })
    if (existingCount > 0) {
      const answer = await prompt(
        `⚠️  Ya existen ${existingCount} familias del seed anterior. ¿Borrarlas y re-seedear? [s/N] `,
      )
      if (answer.trim().toLowerCase() !== 's') {
        console.log('Abortado.')
        await orm.close()
        return
      }
      console.log('Eliminando datos anteriores del seed...')
      const seedFamilies = await em.find(Family, { notes: { $like: '%[SEED]%' } }, { fields: ['id'] })
      const seedIds = seedFamilies.map((f) => f.id)
      await em.nativeDelete('Receipt', { payment: { family: { $in: seedIds } } })
      await em.nativeDelete('PaymentAllocation', { payment: { family: { $in: seedIds } } })
      await em.nativeDelete('Payment', { family: { $in: seedIds } })
      await em.nativeDelete('InstallmentDetail', { installment: { family: { $in: seedIds } } })
      await em.nativeDelete('Installment', { family: { $in: seedIds } })
      await em.nativeDelete('Enrollment', { student: { family: { $in: seedIds } } })
      await em.nativeDelete('Student', { family: { $in: seedIds } })
      await em.nativeDelete('Guardian', { family: { $in: seedIds } })
      await em.nativeDelete('Family', { id: { $in: seedIds } })
      em.clear()
      console.log('✓ Datos anteriores eliminados\n')
    }

    // ── Prerequisitos ────────────────────────────────────────────────────────
    const jardinInst = await em.findOne(Institution, { name: { $like: '%Alpina%' } })
    const colegioInst = await em.findOne(Institution, { name: { $like: '%San Miguel%' } })
    if (!jardinInst) throw new Error('Institución "Jardín La Alpina Verde" no encontrada. Verificá que exista en la DB.')
    if (!colegioInst) throw new Error('Institución "Colegio San Miguel Arcángel" no encontrada. Verificá que exista en la DB.')

    const adminUser = await em.findOne(User, { username: 'admin' })
    if (!adminUser) throw new Error('Usuario "admin" no encontrado. Levantá el servidor al menos una vez antes de correr el seed.')

    const priceTiers = await em.find(PriceTier, {})
    const tierByCode: Record<string, PriceTier> = {}
    for (const t of priceTiers) tierByCode[t.code] = t
    for (const code of ['jardin', 'primaria_1', 'primaria_2', 'secundaria']) {
      if (!tierByCode[code]) throw new Error(`PriceTier "${code}" no encontrado.`)
    }

    // ── FASE 1: Fee Concepts ─────────────────────────────────────────────────
    console.log('[Fase 1] Fee concepts...')

    const existingCuota = await em.findOneOrFail(FeeConcept, EXISTING_IDS.cuota)
    const existingMatricula = await em.findOneOrFail(FeeConcept, EXISTING_IDS.matricula)
    const existingCamp1 = await em.findOneOrFail(FeeConcept, EXISTING_IDS.campamento1)

    async function getOrCreateConcept(
      name: string,
      institution: Institution,
      type: FeeConceptType,
      isRecurring: boolean,
    ): Promise<FeeConcept> {
      const found = await em.findOne(FeeConcept, { name, institution: ref(institution) })
      if (found) return found
      const concept = new FeeConcept({ institution: ref(institution), name, type, isRecurring })
      em.persist(concept)
      return concept
    }

    const materialesSala3 = await getOrCreateConcept('Materiales Sala 3', jardinInst, FeeConceptType.Otro, false)
    const materialesSala4 = await getOrCreateConcept('Materiales Sala 4', jardinInst, FeeConceptType.Otro, false)
    const materialesSala5 = await getOrCreateConcept('Materiales Sala 5', jardinInst, FeeConceptType.Otro, false)
    const materialesBySala: Record<number, FeeConcept> = { 3: materialesSala3, 4: materialesSala4, 5: materialesSala5 }

    const campamentosGrados: FeeConcept[] = [existingCamp1]
    const ordinals = ['', '2do', '3ro', '4to', '5to', '6to']
    for (let g = 2; g <= 6; g++) {
      campamentosGrados.push(
        await getOrCreateConcept(`Campamento ${ordinals[g - 1]} grado`, colegioInst, FeeConceptType.Otro, false),
      )
    }

    const convivenciasAnios: FeeConcept[] = []
    const ordinalsSec = ['1ro', '2do', '3ro', '4to', '5to', '6to']
    for (let y = 1; y <= 6; y++) {
      convivenciasAnios.push(
        await getOrCreateConcept(`Convivencia ${ordinalsSec[y - 1]} año`, colegioInst, FeeConceptType.Otro, false),
      )
    }

    await em.flush()
    console.log('  ✓ Conceptos creados/verificados\n')

    // ── FASE 2: Fee Prices ───────────────────────────────────────────────────
    console.log('[Fase 2] Fee prices...')

    async function getOrCreatePrice(concept: FeeConcept, tierCode: string, amount: string): Promise<void> {
      const tier = tierByCode[tierCode]
      const found = await em.findOne(FeePrice, {
        feeConcept: ref(concept),
        priceTier: ref(tier),
        academicYear: 2025,
      })
      if (found) return
      em.persist(new FeePrice({ feeConcept: ref(concept), priceTier: ref(tier), academicYear: 2025, amount }))
    }

    await getOrCreatePrice(existingCuota, 'jardin', '50000.00')
    await getOrCreatePrice(existingCuota, 'primaria_1', '55000.00')
    await getOrCreatePrice(existingCuota, 'primaria_2', '60000.00')
    await getOrCreatePrice(existingCuota, 'secundaria', '65000.00')

    for (const code of ['jardin', 'primaria_1', 'primaria_2', 'secundaria']) {
      await getOrCreatePrice(existingMatricula, code, '30000.00')
    }

    for (const mat of [materialesSala3, materialesSala4, materialesSala5]) {
      await getOrCreatePrice(mat, 'jardin', '6000.00')
    }

    for (let g = 1; g <= 3; g++) {
      await getOrCreatePrice(campamentosGrados[g - 1], 'primaria_1', '9000.00')
    }
    for (let g = 4; g <= 6; g++) {
      await getOrCreatePrice(campamentosGrados[g - 1], 'primaria_2', '11000.00')
    }

    for (const conv of convivenciasAnios) {
      await getOrCreatePrice(conv, 'secundaria', '13000.00')
    }

    await em.flush()
    console.log('  ✓ Precios creados/verificados\n')

    const allPrices = await em.find(FeePrice, { academicYear: 2025 }, { populate: ['feeConcept', 'priceTier'] })
    const priceMap = new Map<string, string>()
    for (const fp of allPrices) {
      if (fp.priceTier) {
        priceMap.set(`${fp.feeConcept.id}:${fp.priceTier.id}`, fp.amount)
      }
    }

    function getPrice(concept: FeeConcept, tierCode: string): string {
      const tier = tierByCode[tierCode]
      return priceMap.get(`${concept.id}:${tier.id}`) ?? '0.00'
    }

    function getLevelConcept(level: Level, grade: number): FeeConcept {
      if (level === Level.Jardin) return materialesBySala[grade]
      if (level === Level.Primaria) return campamentosGrados[grade - 1]
      return convivenciasAnios[grade - 1]
    }

    // ── FASE 3+4: Familias, alumnos, cuotas y pagos ──────────────────────────
    console.log('[Fase 3] Familias, responsables y alumnos...')
    console.log('[Fase 4] Cuotas e historial de pagos...')

    let receiptCounter = 0

    for (let i = 0; i < 100; i++) {
      const lastName = pick(LAST_NAMES, i)

      const family = new Family({
        familyName: `Familia ${lastName}`,
        primaryPhone: `11 ${String(4000 + i).slice(-4)}-${String(1000 + i * 7).slice(-4)}`,
        notes: '[SEED] Datos de prueba',
      })
      em.persist(family)

      const numGuardians = i % 2 === 0 ? 1 : 2
      for (let g = 0; g < numGuardians; g++) {
        const isMother = (i % 4 === 0 && g === 0) || g === 1
        const guardian = new Guardian({
          family: ref(family),
          firstName: isMother ? pick(FIRST_NAMES_F, i + g) : pick(FIRST_NAMES_M, i + g),
          lastName,
          relationship: isMother ? Relationship.Madre : Relationship.Padre,
          phone: `11 ${String(5000 + i + g).slice(-4)}-${String(2000 + i * 3).slice(-4)}`,
          isPrimaryContact: g === 0,
        })
        em.persist(guardian)
      }

      const jardinGrade = 3 + (i % 3)
      const primariaGrade = 1 + (i % 6)
      const secundariaGrade = 1 + ((i + 3) % 6)

      const studentDefs = [
        { level: Level.Jardin, grade: jardinGrade, institution: jardinInst, section: Section.Unico, shift: i % 2 === 0 ? Shift.Manana : Shift.Tarde },
        { level: Level.Primaria, grade: primariaGrade, institution: colegioInst, section: i % 2 === 0 ? Section.A : Section.B, shift: Shift.Manana },
        { level: Level.Secundaria, grade: secundariaGrade, institution: colegioInst, section: i % 2 === 0 ? Section.A : Section.B, shift: Shift.Tarde },
      ]

      const students: Student[] = []
      for (let s = 0; s < 3; s++) {
        const sd = studentDefs[s]
        const isGirl = (i + s) % 2 === 0
        const student = new Student({
          family: ref(family),
          institution: ref(sd.institution),
          firstName: pick(isGirl ? KIDS_F : KIDS_M, i * 3 + s),
          lastName,
        })
        em.persist(student)

        em.persist(new Enrollment({
          student: ref(student),
          academicYear: 2025,
          level: sd.level,
          grade: sd.grade,
          section: sd.section,
          shift: sd.shift,
        }))

        students.push(student)
      }

      const profile = i < 40 ? 'aldia' : i < 75 ? 'corriente' : 'morosa'

      for (let month = 1; month <= 10; month++) {
        let status: InstallmentStatus
        if (profile === 'aldia') {
          status = InstallmentStatus.Pagada
        } else if (profile === 'corriente') {
          if (month <= 7) status = InstallmentStatus.Pagada
          else if (month === 9) status = InstallmentStatus.Parcial
          else status = InstallmentStatus.Pendiente
        } else {
          status = month <= 4 ? InstallmentStatus.Pagada : InstallmentStatus.Vencida
        }

        type DetailSpec = { concept: FeeConcept; tierCode: string; description: string; amount: string; student: Student }
        const detailSpecs: DetailSpec[] = []

        for (let s = 0; s < 3; s++) {
          const sd = studentDefs[s]
          const tierCode = tierCodeForLevel(sd.level, sd.grade)
          const studentName = `${students[s].firstName} ${lastName}`

          if (month === 1) {
            const amt = getPrice(existingMatricula, tierCode)
            detailSpecs.push({ concept: existingMatricula, tierCode, description: `Matrícula 2025 — ${studentName}`, amount: amt, student: students[s] })
          }

          const cuotaAmt = getPrice(existingCuota, tierCode)
          detailSpecs.push({ concept: existingCuota, tierCode, description: `Cuota ${MONTH_NAMES[month - 1]} — ${studentName}`, amount: cuotaAmt, student: students[s] })

          const levelConcept = getLevelConcept(sd.level, sd.grade)
          const levelAmt = getPrice(levelConcept, tierCode)
          if (levelAmt !== '0.00') {
            detailSpecs.push({ concept: levelConcept, tierCode, description: `${levelConcept.name} — ${studentName}`, amount: levelAmt, student: students[s] })
          }
        }

        const subtotal = detailSpecs.reduce((acc, d) => acc.plus(new Decimal(d.amount)), new Decimal('0'))
        const dueDate = new Date(2025, month - 1, 10)

        const installment = new Installment({
          family: ref(family),
          academicYear: 2025,
          month,
          description: `Cuota ${MONTH_NAMES[month - 1]} 2025`,
          subtotal: subtotal.toFixed(2),
          total: subtotal.toFixed(2),
          dueDate,
          status,
        })
        em.persist(installment)

        for (const d of detailSpecs) {
          em.persist(new InstallmentDetail({
            installment: ref(installment),
            student: ref(d.student),
            feeConcept: ref(d.concept),
            description: d.description,
            amount: d.amount,
            finalAmount: d.amount,
          }))
        }

        if (status === InstallmentStatus.Pagada || status === InstallmentStatus.Parcial) {
          const isParcial = status === InstallmentStatus.Parcial
          const paymentAmount = isParcial
            ? new Decimal(subtotal).dividedBy(2).toDecimalPlaces(2).toFixed(2)
            : subtotal.toFixed(2)

          const paymentDate = new Date(dueDate)
          paymentDate.setDate(paymentDate.getDate() - 5)

          receiptCounter++

          const payment = new Payment({
            family: ref(family),
            amount: paymentAmount,
            paymentDate,
            method: pick(METHODS, receiptCounter),
            receivedBy: ref(adminUser),
          })
          em.persist(payment)

          em.persist(new PaymentAllocation({
            payment: ref(payment),
            installment: ref(installment),
            allocatedAmount: paymentAmount,
          }))

          em.persist(new Receipt({
            payment: ref(payment),
            receiptNumber: receiptCounter,
            academicYear: 2025,
            issuedDate: paymentDate,
          }))
        }
      }

      if ((i + 1) % 20 === 0) {
        await em.flush()
        process.stdout.write(`  Progreso: ${i + 1}/100 familias...\r`)
      }
    }

    await em.flush()

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log('\n')
    console.log('  ✓ 100 familias creadas')
    console.log('  ✓ 1000 cuotas generadas')
    console.log(`  ✓ ${receiptCounter} pagos y recibos registrados`)
    console.log(`\n✅ Seed completado en ${elapsed}s`)
  } finally {
    await orm.close()
  }
}

main().catch((err: unknown) => {
  console.error('\n❌ Error durante el seed:')
  console.error(err)
  process.exit(1)
})
