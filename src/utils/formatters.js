/**
 * Formatea un número con separador de miles (coma) y 2 decimales.
 * Ejemplo: 1500 -> 1,500.00
 */
export const formatCurrency = (number) => {
  if (number === undefined || number === null || isNaN(number)) return '0.00';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

/**
 * Formatea un número con separador de miles pero sin forzar decimales si no los tiene.
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('en-US').format(number);
};
/**
 * Formatea un número redondeado y sin separadores (solo para el recibo).
 * Ejemplo: 1500.50 -> 1501
 */
export const formatReceiptAmount = (number) => {
  if (number === undefined || number === null || isNaN(number)) return '0';
  return Math.round(number).toString();
};
