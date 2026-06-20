import { useState, type FormEvent } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLE, ROUTING } from "@/config/constant.config";
import { toFieldErrors } from "@/lib/form";
import type { School } from "@/shared/services/school.service";
import { accountNoun, type AccountType } from "../types/account-type";
import { AccountTypeTabs } from "../components/AccountTypeTabs";
import { AuthLayout } from "../components/AuthLayout";
import { DateField } from "../components/DateField";
import { FormField } from "../components/FormField";
import { GradeSelect } from "../components/GradeSelect";
import { LegalDialog } from "../components/LegalDialog";
import { SchoolSearchBox } from "../components/SchoolSearchBox";
import { useRegister } from "../hooks/use-register";
import { LEGAL } from "../data/legal-content";
import { registerTextSchema } from "../schemas/auth.schema";
import type { RegisterPayload } from "../interfaces/auth.interface";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  birthDate: "",
  phoneNumber: "",
  schoolId: null as number | null,
  schoolName: "",
  academicGradeId: null as number | null,
  acceptTerms: false,
};

export function RegisterPage() {
  const { register, isLoading, error, isSuccess } = useRegister();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const accountType: AccountType =
    searchParams.get("role") === "teacher" ? "teacher" : "student";
  const isStudent = accountType === "student";
  const noun = accountNoun(accountType);

  const goToLogin = () =>
    navigate(`${ROUTING.LOGIN}?role=${accountType}`, { replace: true });

  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onAccountChange = (value: AccountType) => {
    setSearchParams({ role: value }, { replace: true });
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = registerTextSchema.safeParse(form);
    const errors: Record<string, string> = parsed.success
      ? {}
      : toFieldErrors(parsed.error);

    if (form.schoolId === null) errors.schoolId = "Selecciona tu colegio";
    if (isStudent && form.academicGradeId === null)
      errors.academicGradeId = "Selecciona tu grado académico";
    if (!form.acceptTerms)
      errors.acceptTerms = "Debes aceptar los términos y condiciones";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    const payload: RegisterPayload = {
      name: form.name,
      email: form.email,
      password: form.password,
      birthDate: form.birthDate,
      roleId: isStudent ? ROLE.STUDENT : ROLE.TEACHER,
      schoolId: form.schoolId!,
      ...(isStudent ? { academicGradeId: form.academicGradeId! } : {}),
      ...(form.phoneNumber ? { phoneNumber: form.phoneNumber } : {}),
    };

    void register(payload);
  };

  return (
    <AuthLayout
      title={`Crear cuenta de ${noun}`}
      subtitle="Completa los datos para registrarte"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            to={`${ROUTING.LOGIN}?role=${accountType}`}
            className="font-semibold text-mathe-blue"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        <AccountTypeTabs value={accountType} onChange={onAccountChange} />

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <FormField
          label="Nombre completo"
          name="name"
          autoComplete="name"
          placeholder="Tu nombre y apellido"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={fieldErrors.name}
        />
        <FormField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="correo@claretiano.edu.co"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          error={fieldErrors.email}
        />
        <FormField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          error={fieldErrors.password}
        />
        <FormField
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          value={form.confirmPassword}
          onChange={(e) => set("confirmPassword", e.target.value)}
          error={fieldErrors.confirmPassword}
        />
        <DateField
          label="Fecha de nacimiento"
          name="birthDate"
          value={form.birthDate}
          onChange={(v) => set("birthDate", v)}
          error={fieldErrors.birthDate}
        />
        <FormField
          label="Teléfono (opcional)"
          name="phoneNumber"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel"
          placeholder="987654321"
          maxLength={15}
          value={form.phoneNumber}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "")
            set("phoneNumber", digits)
          }}
          error={fieldErrors.phoneNumber}
        />
        <SchoolSearchBox
          label="Nombre del colegio"
          name="schoolId"
          value={form.schoolId}
          displayValue={form.schoolName}
          onSelect={(school: School) =>
            setForm((prev) => ({
              ...prev,
              schoolId: school.id,
              schoolName: school.cenEdu,
            }))
          }
          error={fieldErrors.schoolId}
        />
        {isStudent && (
          <GradeSelect
            label="Grado académico"
            name="academicGradeId"
            value={form.academicGradeId}
            onChange={(id) => set("academicGradeId", id)}
            error={fieldErrors.academicGradeId}
          />
        )}

        <div className="grid gap-1">
          <div className="flex items-start gap-3">
            <Checkbox
              id="acceptTerms"
              aria-label="Acepto los términos y condiciones y la política de privacidad"
              checked={form.acceptTerms}
              onCheckedChange={(checked) =>
                set("acceptTerms", checked === true)
              }
              className="-mt-[1px]"
            />
            <p className="text-sm font-normal leading-snug text-mathe-muted">
              Acepto los{" "}
              <LegalDialog trigger="términos y condiciones" doc={LEGAL.terms} />{" "}
              y la{" "}
              <LegalDialog trigger="política de privacidad" doc={LEGAL.privacy} />
            </p>
          </div>
          {fieldErrors.acceptTerms && (
            <p className="text-sm text-destructive">
              {fieldErrors.acceptTerms}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !form.acceptTerms}
          className="h-11 rounded-pill bg-mathe-blue text-base font-semibold hover:bg-mathe-blue-deep"
        >
          {isLoading ? (
            "Creando cuenta…"
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </form>

      <Dialog
        open={isSuccess}
        onOpenChange={(open) => {
          if (!open) goToLogin();
        }}
      >
        <DialogContent>
          <DialogHeader className="items-center text-center sm:text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-mathe-surface text-mathe-blue">
              <MailCheck className="size-7" />
            </div>
            <DialogTitle>Cuenta en revisión</DialogTitle>
            <DialogDescription>
              Tu cuenta de {noun} fue creada correctamente.
            </DialogDescription>
          </DialogHeader>
          <p className="text-center text-sm leading-relaxed text-mathe-muted">
            Un administrador revisará y validará tu acceso. Tu cuenta
            permanecerá inactiva hasta que sea aprobada; te avisaremos cuando
            esté lista.
          </p>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={goToLogin}
              className="h-11 rounded-pill bg-mathe-blue px-6 font-semibold hover:bg-mathe-blue-deep"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
