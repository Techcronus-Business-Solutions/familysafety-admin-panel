import countryRecords from './countries.json';

export interface CountryCode {
  name: string;
  flag: string;
  dial: string;
  isoCode: string;
}

export const COUNTRY_CODES: CountryCode[] = countryRecords;

export function normalizeCountryName(country: string): string {
  return country.trim().toLowerCase().replace(/[(),.]/g, '').replace(/\s+/g, ' ');
}

export function findCountryByName(countryName?: string | null): CountryCode | undefined {
  const countryWithoutDialCode = countryName?.replace(/\s*\(\+\d+\)\s*$/, '') ?? '';
  const normalizedName = countryWithoutDialCode ? normalizeCountryName(countryWithoutDialCode) : '';
  if (!normalizedName) {
    return undefined;
  }

  const aliases: Record<string, string> = {
    usa: 'US',
    'united states of america': 'US',
    uk: 'GB'
  };
  const aliasCode = aliases[normalizedName];
  return COUNTRY_CODES.find(country =>
    normalizeCountryName(country.name) === normalizedName
    || country.isoCode.toLowerCase() === normalizedName
    || country.isoCode === aliasCode
  );
}

const DEFAULT_COUNTRY = COUNTRY_CODES.find(country => country.isoCode === 'IN');
export const DEFAULT_COUNTRY_CODE = DEFAULT_COUNTRY?.dial ?? '+91';
export const DEFAULT_COUNTRY_ISO = DEFAULT_COUNTRY?.isoCode ?? 'IN';

/**
 * Splits a combined phone number like '+919876543210' into its dial code and
 * national number, matching the longest known dial code prefix. Falls back to
 * DEFAULT_COUNTRY_CODE when the value has no '+' prefix or no code matches.
 */
export function splitPhoneNumber(fullNumber: string | null | undefined): { dialCode: string; number: string } {
  const value = (fullNumber ?? '').trim();
  if (!value.startsWith('+')) {
    return { dialCode: DEFAULT_COUNTRY_CODE, number: value };
  }
  const byLength = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  const match = byLength.find(c => value.startsWith(c.dial));
  if (match) {
    return { dialCode: match.dial, number: value.slice(match.dial.length) };
  }
  return { dialCode: DEFAULT_COUNTRY_CODE, number: value };
}

/**
 * Converts a stored combined phone number (e.g. '+919876543210') into the
 * { number, countryCode } shape ngx-intl-tel-input expects for pre-filling a
 * form control: the bare national number plus the ISO2 country code. Passing
 * it a full combined string directly leaves the dial code duplicated in the
 * visible input, since the component only strips it from objects, not strings.
 * When provided, the API country determines the selected country, including
 * cases where multiple countries share a dial code.
 */
export function toNgxIntlTelInputValue(fullNumber: string | null | undefined, countryName?: string | null): { number: string; countryCode: string } | null {
  if (!fullNumber) {
    return null;
  }
  const value = fullNumber.trim();
  const apiCountry = findCountryByName(countryName);
  if (apiCountry) {
    let number = value;
    if (value.startsWith(apiCountry.dial)) {
      number = value.slice(apiCountry.dial.length);
    } else if (value.startsWith('+')) {
      number = splitPhoneNumber(value).number;
    }
    return { number, countryCode: apiCountry.isoCode.toUpperCase() };
  }

  if (!value.startsWith('+')) {
    return { number: value, countryCode: '' };
  }

  if (!COUNTRY_CODES.some(c => value.startsWith(c.dial))) {
    return { number: value, countryCode: '' };
  }

  const { dialCode, number } = splitPhoneNumber(value);
  const country = COUNTRY_CODES.find(c => c.dial === dialCode);
  return { number, countryCode: country?.isoCode.toUpperCase() ?? '' };
}
