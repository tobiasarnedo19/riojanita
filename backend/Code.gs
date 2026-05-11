const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  try {
    const sheetName = e.parameter.table;
    if (!sheetName) return errorResponse("Falta el parámetro 'table'.");
    
    const data = getTableData(sheetName);
    return jsonResponse({ success: true, data: data });
  } catch (error) {
    return errorResponse(error.message);
  }
}

function doPost(e) {
  try {
    // Para CORS, usualmente se envía body en texto plano
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    if (action === "create" || action === "update") {
      const result = saveRecord(body.table, body.data, action);
      return jsonResponse({ success: true, data: result });
    } else if (action === "create_bulk") {
      const result = saveRecordsBulk(body.table, body.data);
      return jsonResponse({ success: true, data: result });
    } else if (action === "liquidar") {
      const result = processLiquidacion(body.data);
      return jsonResponse({ success: true, message: result });
    }
    
    return errorResponse("Acción desconocida");
  } catch (error) {
    return errorResponse("Error procesando POST: " + error.message);
  }
}

function getTableData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("No se encontró la hoja: " + sheetName);
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return []; // Solo encabezados o vacía
  
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    // Omitimos filas completamente vacías
    if (rows[i].join("").trim() === "") continue;
    
    let rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = rows[i][j];
    }
    data.push(rowObj);
  }
  return data;
}

function saveRecord(sheetName, recordData, action) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("No se encontró la hoja: " + sheetName);
  
  const headers = sheet.getDataRange().getValues()[0];
  
  if (action === "create") {
    // Si no viene ID, creamos uno
    if (!recordData.id) {
       recordData.id = Utilities.getUuid();
    }
    const newRow = headers.map(h => recordData[h] !== undefined ? recordData[h] : "");
    sheet.appendRow(newRow);
    return recordData;
    
  } else if (action === "update") {
    const rows = sheet.getDataRange().getValues();
    const idIndex = headers.indexOf("id");
    if (idIndex === -1) throw new Error("No existe columna 'id' en la hoja " + sheetName);
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === recordData.id) {
        
        // --- LOGICA DE HISTORIAL PARA CATEGORIAS ---
        if (sheetName === "Categorias" && recordData.valor_hora !== undefined) {
          const valorHoraIndex = headers.indexOf("valor_hora");
          const categoriaIndex = headers.indexOf("categoria");
          const valorAnterior = rows[i][valorHoraIndex];
          const valorNuevo = recordData.valor_hora;
          
          if (String(valorAnterior) !== String(valorNuevo)) {
            const sheetHist = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Historial horas");
            if (sheetHist) {
              const timestamp = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "dd/MM/yyyy HH:mm:ss");
              const responsable = recordData.responsable || "Administrador";
              const catName = recordData.categoria || rows[i][categoriaIndex];
              
              // Columnas: id_historial, timestamp, categoria, valor_actual, valor_anterior, responsable
              sheetHist.appendRow([
                Utilities.getUuid(),
                timestamp,
                catName,
                valorNuevo,
                valorAnterior,
                responsable
              ]);
            }
          }
        }
        // --- FIN LOGICA HISTORIAL ---

        // Encontramos la fila, la actualizamos
        for (let j = 0; j < headers.length; j++) {
          if (recordData[headers[j]] !== undefined) {
            sheet.getRange(i + 1, j + 1).setValue(recordData[headers[j]]);
          }
        }
        return recordData;
      }
    }
    throw new Error("No se encontró registro con ID: " + recordData.id);
  }
}

function saveRecordsBulk(sheetName, recordsArray) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error("No se encontró la hoja: " + sheetName);
  
  const headers = sheet.getDataRange().getValues()[0];
  const newRows = [];
  
  recordsArray.forEach(recordData => {
    if (!recordData.id) {
       recordData.id = Utilities.getUuid();
    }
    const newRow = headers.map(h => recordData[h] !== undefined ? recordData[h] : "");
    newRows.push(newRow);
  });
  
  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
  }
  
  return recordsArray;
}

function processLiquidacion(payload) {
  // payload.liquidaciones: Array de objetos para la tabla Liquidaciones
  // payload.novedadesUsadasIds: Array de IDs de Novedades a marcar como PAGADO
  
  const liquidaciones = payload.liquidaciones || [];
  const novedadesIds = payload.novedadesUsadasIds || [];
  const planillaId = Utilities.getUuid();
  const timestamp = Utilities.formatDate(new Date(), "America/Argentina/Buenos_Aires", "dd/MM/yyyy HH:mm:ss");
  
  const sheetLiq = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Liquidaciones");
  if (!sheetLiq) throw new Error("No se encontró la hoja Liquidaciones");
  const headersLiq = sheetLiq.getDataRange().getValues()[0];
  
  // Guardar Liquidaciones
  liquidaciones.forEach(liq => {
    if (!liq.id) liq.id = Utilities.getUuid();
    liq.timestamp = timestamp;
    liq.planilla_id = planillaId;
    
    const newRow = headersLiq.map(h => liq[h] !== undefined ? liq[h] : "");
    sheetLiq.appendRow(newRow);
  });
  
  // Actualizar Novedades a PAGADO
  if (novedadesIds.length > 0) {
    const sheetNov = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Novedades");
    if (!sheetNov) throw new Error("No se encontró la hoja Novedades");
    const headersNov = sheetNov.getDataRange().getValues()[0];
    const rowsNov = sheetNov.getDataRange().getValues();
    
    const idIndexNov = headersNov.indexOf("id");
    const estadoIndexNov = headersNov.indexOf("estado");
    
    if (idIndexNov !== -1 && estadoIndexNov !== -1) {
      for (let i = 1; i < rowsNov.length; i++) {
        const novId = rowsNov[i][idIndexNov];
        if (novedadesIds.includes(novId)) {
          sheetNov.getRange(i + 1, estadoIndexNov + 1).setValue("PAGADO");
        }
      }
    }
  }
  
  return "Liquidación procesada correctamente.";
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
