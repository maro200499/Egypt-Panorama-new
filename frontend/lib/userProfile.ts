import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"
import arLocale from "i18n-iso-countries/langs/ar.json"
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min"

countries.registerLocale(enLocale)
countries.registerLocale(arLocale)

export type Gender = "male" | "female" | "prefer_not_to_say"

export type UserProfile = {
  id?: number
  email: string
  name?: string
  firstName?: string
  lastName?: string
  nationality?: string
  phone?: string
  phoneCountry?: string
  gender?: Gender
  role?: "user" | "admin"
}

export type NationalityOption = {
  value: string
  en: string
  ar: string
}

export type PhoneCountryOption = NationalityOption & {
  dialCode: string
}

const englishCountryNames = countries.getNames("en", { select: "official" }) as Record<string, string>
const arabicCountryNames = countries.getNames("ar", { select: "official" }) as Record<string, string>

export const nationalityOptions: NationalityOption[] = Object.keys(englishCountryNames)
  .filter((code) => code.length === 2)
  .map((code) => ({
    value: code,
    en: englishCountryNames[code],
    ar: arabicCountryNames[code] ?? englishCountryNames[code],
  }))
  .sort((left, right) => left.en.localeCompare(right.en, "en"))

export const phoneCountryOptions: PhoneCountryOption[] = getCountries()
  .map((code) => {
    const englishName = englishCountryNames[code] ?? code

    return {
      value: code,
      en: englishName,
      ar: arabicCountryNames[code] ?? englishName,
      dialCode: `+${getCountryCallingCode(code)}`,
    }
  })
  .sort((left, right) => left.en.localeCompare(right.en, "en"))

function normalizeCountryCode(value: string | undefined) {
  return value?.trim().toUpperCase() ?? ""
}

export function getNationalityFlag(value: string | undefined) {
  const code = normalizeCountryCode(value)

  if (!/^[A-Z]{2}$/.test(code)) {
    return ""
  }

  return String.fromCodePoint(...code.split("").map((char) => 127397 + char.charCodeAt(0)))
}

export function getNationalityLabel(value: string | undefined, locale: "en" | "ar") {
  const code = normalizeCountryCode(value)
  const option = nationalityOptions.find((item) => item.value === code)

  if (!option) return value ?? ""

  return locale === "ar" ? option.ar : option.en
}