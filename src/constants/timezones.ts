// Mapping of country codes to representative time zones
// Based on most populous city or capital
export const COUNTRY_TIMEZONES: Record<string, string> = {
    // North America
    US: 'America/New_York',
    CA: 'America/Toronto',
    MX: 'America/Mexico_City',

    // South America
    BR: 'America/Sao_Paulo',
    AR: 'America/Argentina/Buenos_Aires',
    CL: 'America/Santiago',
    CO: 'America/Bogota',
    PE: 'America/Lima',

    // Europe
    GB: 'Europe/London',
    FR: 'Europe/Paris',
    DE: 'Europe/Berlin',
    IT: 'Europe/Rome',
    ES: 'Europe/Madrid',
    PT: 'Europe/Lisbon',
    NL: 'Europe/Amsterdam',
    BE: 'Europe/Brussels',
    CH: 'Europe/Zurich',
    SE: 'Europe/Stockholm',
    NO: 'Europe/Oslo',
    FI: 'Europe/Helsinki',
    DK: 'Europe/Copenhagen',
    PL: 'Europe/Warsaw',
    CZ: 'Europe/Prague',
    HU: 'Europe/Budapest',
    AT: 'Europe/Vienna',
    GR: 'Europe/Athens',
    TR: 'Europe/Istanbul',
    RU: 'Europe/Moscow',
    UA: 'Europe/Kyiv',

    // Asia
    CN: 'Asia/Shanghai',
    JP: 'Asia/Tokyo',
    KR: 'Asia/Seoul',
    IN: 'Asia/Kolkata',
    ID: 'Asia/Jakarta',
    TH: 'Asia/Bangkok',
    VN: 'Asia/Ho_Chi_Minh',
    PH: 'Asia/Manila',
    MY: 'Asia/Kuala_Lumpur',
    SG: 'Asia/Singapore',
    HK: 'Asia/Hong_Kong',
    TW: 'Asia/Taipei',
    SA: 'Asia/Riyadh',
    AE: 'Asia/Dubai',
    IL: 'Asia/Jerusalem',
    IR: 'Asia/Tehran',
    PK: 'Asia/Karachi',
    BD: 'Asia/Dhaka',

    // Africa
    ZA: 'Africa/Johannesburg',
    NG: 'Africa/Lagos',
    EG: 'Africa/Cairo',
    KE: 'Africa/Nairobi',
    MA: 'Africa/Casablanca',
    DZ: 'Africa/Algiers',

    // Oceania
    AU: 'Australia/Sydney',
    NZ: 'Pacific/Auckland',

    // Default fallback
    DEFAULT: 'UTC',
};

export function getTimezoneForCountry(countryCode: string | null | undefined): string {
    if (!countryCode) return COUNTRY_TIMEZONES.DEFAULT;
    const code = countryCode.toUpperCase();
    return COUNTRY_TIMEZONES[code] || COUNTRY_TIMEZONES.DEFAULT;
}