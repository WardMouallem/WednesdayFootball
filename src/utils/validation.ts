export function isValidIsraeliPhoneNumber(phoneNumber: string): boolean {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Israeli phone number patterns:
  // Mobile: 05X-XXXXXXX (10 digits total)
  // Landline: 0X-XXXXXXX (9-10 digits total)
  // International format: +972-X-XXXXXXX
  
  // Check for mobile numbers (05X-XXXXXXX)
  if (cleanNumber.match(/^05[0-9]\d{7}$/)) {
    return true;
  }
  
  // Check for landline numbers (02, 03, 04, 08, 09 + 7 digits)
  if (cleanNumber.match(/^0[2-4,8-9]\d{7}$/)) {
    return true;
  }
  
  // Check for international format starting with 972
  if (cleanNumber.match(/^972[2-9]\d{7,8}$/)) {
    return true;
  }
  
  return false;
}

export function formatIsraeliPhoneNumber(phoneNumber: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Format mobile numbers
  if (cleanNumber.match(/^05[0-9]\d{7}$/)) {
    return `${cleanNumber.slice(0, 3)}-${cleanNumber.slice(3)}`;
  }
  
  // Format landline numbers
  if (cleanNumber.match(/^0[2-4,8-9]\d{7}$/)) {
    return `${cleanNumber.slice(0, 2)}-${cleanNumber.slice(2)}`;
  }
  
  return phoneNumber;
}