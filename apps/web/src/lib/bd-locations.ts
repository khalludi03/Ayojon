// Bangladesh Divisions and Cities

export const BD_DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
] as const

export type Division = (typeof BD_DIVISIONS)[number]

export const BD_CITIES: Record<Division, Array<string>> = {
  Dhaka: [
    'Dhaka',
    'Gazipur',
    'Narayanganj',
    'Tangail',
    'Kishoreganj',
    'Manikganj',
    'Munshiganj',
    'Narsingdi',
    'Rajbari',
    'Faridpur',
    'Gopalganj',
    'Madaripur',
    'Shariatpur',
  ],
  Chittagong: [
    'Chittagong',
    "Cox's Bazar",
    'Comilla',
    'Feni',
    'Brahmanbaria',
    'Noakhali',
    'Rangamati',
    'Khagrachari',
    'Bandarban',
    'Lakshmipur',
    'Chandpur',
  ],
  Rajshahi: [
    'Rajshahi',
    'Bogra',
    'Pabna',
    'Sirajganj',
    'Natore',
    'Chapainawabganj',
    'Naogaon',
    'Joypurhat',
  ],
  Khulna: [
    'Khulna',
    'Jessore',
    'Satkhira',
    'Bagerhat',
    'Kushtia',
    'Chuadanga',
    'Jhenaidah',
    'Magura',
    'Meherpur',
    'Narail',
  ],
  Barisal: [
    'Barisal',
    'Patuakhali',
    'Bhola',
    'Pirojpur',
    'Jhalokati',
    'Barguna',
  ],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: [
    'Rangpur',
    'Dinajpur',
    'Kurigram',
    'Lalmonirhat',
    'Nilphamari',
    'Gaibandha',
    'Thakurgaon',
    'Panchagarh',
  ],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
}

// Phone number validation for Bangladesh
export function validateBDPhone(phone: string): boolean {
  // Remove spaces, dashes, and plus signs
  const cleaned = phone.replace(/[\s\-+]/g, '')

  // Should be 11 digits starting with 01, or 13 digits starting with 880
  const pattern11 = /^01[3-9]\d{8}$/
  const pattern13 = /^8801[3-9]\d{8}$/

  return pattern11.test(cleaned) || pattern13.test(cleaned)
}

// Postal code validation for Bangladesh (4 digits)
export function validateBDPostalCode(postalCode: string): boolean {
  if (!postalCode) return true // Optional field
  return /^\d{4}$/.test(postalCode)
}

// Format phone number for display
export function formatBDPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '')

  if (cleaned.startsWith('880') && cleaned.length === 13) {
    return `+880 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  } else if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  return phone
}
