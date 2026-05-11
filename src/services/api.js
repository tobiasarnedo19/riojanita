// ============================================================================
// CONFIGURACIÓN: REEMPLAZA ESTA URL POR LA URL DE TU WEB APP DE APPS SCRIPT
// ============================================================================
export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybYdogcz-MzbKmlK2jJmSj_ESQKvSJtcYwCPRu5_wvFE4Qgw4sjn8kSPngNnd43iyZ/exec";

export const api = {
  get: async (table) => {
    try {
      const response = await fetch(`${SCRIPT_URL}?table=${table}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }
  },

  post: async (payload) => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        // GAS requires text/plain for CORS workaround in POST without preflight
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data || data.message;
    } catch (error) {
      console.error("Error posting data:", error);
      throw error;
    }
  },

  create: async (table, data) => {
    return api.post({ action: "create", table, data });
  },

  createBulk: async (table, data) => {
    return api.post({ action: "create_bulk", table, data });
  },

  update: async (table, data) => {
    return api.post({ action: "update", table, data });
  },

  liquidar: async (liquidaciones, novedadesUsadasIds) => {
    return api.post({
      action: "liquidar",
      data: { liquidaciones, novedadesUsadasIds },
    });
  },
};
