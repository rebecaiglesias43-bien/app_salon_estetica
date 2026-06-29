/**
 * Validadores reutilizables para formularios del frontend.
 * Cada función retorna un string de error o null si es válido.
 */

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }
  return null;
}

export function validateNombre(value: string, fieldName = 'Nombre'): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres`;
  }
  if (value.trim().length > 80) {
    return `${fieldName} no debe exceder 80 caracteres`;
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'´.-]+$/.test(value.trim())) {
    return `${fieldName} solo debe contener letras y espacios`;
  }
  return null;
}

export function validateTelefono(value: string, fieldName = 'Teléfono'): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }
  const cleaned = value.replace(/[\s\-\(\)]/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return `${fieldName} solo debe contener números`;
  }
  if (cleaned.length < 10 || cleaned.length > 15) {
    return `${fieldName} debe tener 10 dígitos`;
  }
  return null;
}

export function validateEmail(value: string, fieldName = 'Email'): string | null {
  if (!value || value.trim() === '') {
    return null; // email es opcional
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())) {
    return `${fieldName} no tiene un formato válido`;
  }
  return null;
}

export function validatePositiveNumber(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }
  if (num < 0) {
    return `${fieldName} no puede ser negativo`;
  }
  return null;
}

export function validatePositiveInt(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }
  const num = parseInt(value, 10);
  if (isNaN(num) || !Number.isInteger(num)) {
    return `${fieldName} debe ser un número entero`;
  }
  if (num <= 0) {
    return `${fieldName} debe ser mayor a 0`;
  }
  return null;
}

export function validateMin(value: string, fieldName: string, min: number): string | null {
  const num = parseFloat(value);
  if (!isNaN(num) && num < min) {
    return `${fieldName} debe ser al menos ${min}`;
  }
  return null;
}

export function validateMax(value: string, fieldName: string, max: number, tipo: 'numero' | 'moneda' = 'numero'): string | null {
  if (!value || value.trim() === '') return null;
  const num = tipo === 'moneda' ? parseFloat(value) : parseInt(value, 10);
  if (isNaN(num)) return null;
  if (num > max) {
    if (tipo === 'moneda') {
      return `${fieldName} no puede exceder $${max.toLocaleString()}`;
    }
    return `${fieldName} no puede exceder ${max.toLocaleString()}`;
  }
  return null;
}

/**
 * Filtros de entrada en tiempo real para inputs.
 * Úsalos en el onChange para bloquear caracteres inválidos mientras el usuario escribe.
 */

export function filterNombre(value: string): string {
  // Solo permite letras (incl. acentuadas), espacios, guiones, apóstrofes y puntos
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'´.-]/g, '');
}

export function filterLetras(value: string, maxLength = 30): string {
  // Solo permite letras (incl. acentuadas) y espacios — sin números, sin símbolos
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, maxLength);
}

export function validateCategoriaNombre(value: string, fieldName = 'Nombre'): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} de categoría es requerido`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres`;
  }
  if (value.trim().length > 30) {
    return `${fieldName} no debe exceder 30 caracteres`;
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value.trim())) {
    return `${fieldName} solo debe contener letras y espacios, sin números ni símbolos`;
  }
  return null;
}

export function filterTelefono(value: string, maxDigits = 10): string {
  // Solo permite dígitos, máximo `maxDigits`
  return value.replace(/\D/g, '').slice(0, maxDigits);
}
