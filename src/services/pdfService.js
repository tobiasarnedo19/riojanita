import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency } from '../utils/formatters';

// Función auxiliar para fecha corta
const formatDateSimple = (date) => {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().substr(-2)}`;
};

// Genera el HTML de un recibo individual para ser procesado
const createReciboHTML = (liq, empName) => {
  return `
    <div style="width: 230px; padding: 8px; background-color: white; font-family: Arial, sans-serif; color: #333; line-height: 1.1; box-sizing: border-box;">
      <div style="border: 1px solid #333; padding: 6px; height: 135px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
        <div style="display: flex; justify-content: flex-end; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-bottom: 5px;">
          <div style="text-align: right; font-size: 7px; font-weight: bold;">FECHA: ${formatDateSimple(new Date())}</div>
        </div>
        <div style="margin-bottom: 5px;">
          <div style="font-size: 10px; font-weight: bold; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${empName}</div>
          <div style="font-size: 7px; color: #666;">${liq.fecha}</div>
        </div>
        <div style="font-size: 8px; flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>${liq.total_horas} (${formatCurrency(liq.valor_hora)})</span>
            <span>${formatCurrency(liq.total_horas * liq.valor_hora)}</span>
          </div>
          ${parseFloat(liq.feriados) > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px; color: green;">
            <span>Feriados:</span>
            <span>+${formatCurrency(liq.feriados)}</span>
          </div>
          ` : ''}
          ${parseFloat(liq.vales_anticipos) > 0 ? `
          <div style="display: flex; justify-content: space-between; color: #d32f2f;">
            <span>Vales/Ant:</span>
            <span>-${formatCurrency(liq.vales_anticipos)}</span>
          </div>
          ` : ''}
        </div>
        <div style="background-color: #333; color: white; padding: 4px; border-radius: 2px; text-align: right; margin-top: 4px;">
          <div style="font-size: 7px; text-transform: uppercase; opacity: 0.9; font-weight: bold;">TOTAL</div>
          <div style="font-size: 13px; font-weight: 800;">${formatCurrency(liq.total)}</div>
        </div>
      </div>
    </div>
  `;
};

export const generateReciboPDF = async (liq, empName) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.innerHTML = createReciboHTML(liq, empName);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 4, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'l', unit: 'mm', format: [60, 40] });
    pdf.addImage(imgData, 'PNG', 0, 0, 60, 40);
    pdf.save(`Recibo_${empName.replace(/\s+/g, '_')}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};

export const generatePlanillaPDF = async (planilla, getEmpName) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  // Configuración de la cuadrícula A4 (210x297mm)
  const marginX = 10;
  const marginY = 10;
  const itemW = 60; // mm
  const itemH = 40; // mm
  const cols = 3;
  const rowsPerPage = 7;
  
  let currentX = marginX;
  let currentY = marginY;
  let count = 0;

  for (const liq of planilla.empleados) {
    const empName = getEmpName(liq.empelado);
    container.innerHTML = createReciboHTML(liq, empName);
    
    const canvas = await html2canvas(container, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');

    // Si ya llenamos una página, creamos una nueva
    if (count > 0 && count % (cols * rowsPerPage) === 0) {
      pdf.addPage();
      currentX = marginX;
      currentY = marginY;
    }

    pdf.addImage(imgData, 'PNG', currentX, currentY, itemW, itemH);
    
    // Avanzar posición
    count++;
    if (count % cols === 0) {
      currentX = marginX;
      currentY += itemH + 2; // +2mm de separación
    } else {
      currentX += itemW + 2; // +2mm de separación
    }
  }

  document.body.removeChild(container);
  pdf.save(`Planilla_Recibos_${planilla.periodo.replace(/\s+/g, '_')}.periodo.pdf`);
};
