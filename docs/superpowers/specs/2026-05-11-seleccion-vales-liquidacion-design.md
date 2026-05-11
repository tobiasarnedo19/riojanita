# Especificación: Selección de Vales y Anticipos en Liquidación

Este documento detalla el diseño técnico para permitir que el usuario seleccione o deseleccione vales y anticipos individuales de forma dinámica al crear una liquidación en la vista de `Liquidacion.jsx`.

## 1. Objetivo
Proporcionar una interfaz moderna y fluida para que el administrador pueda decidir qué vales y anticipos se incluyen en el cobro de una liquidación específica, ya que no siempre se liquidan todos los pendientes simultáneamente.

## 2. Cambios Propuestos

### 2.1 Lógica de Datos (`getNovedadesCalc`)
Actualmente, la función `getNovedadesCalc` resume los montos en una sola cifra. Se modificará para:
*   Retornar la lista completa de objetos de novedad filtrados (`novedadesFiltradas`).
*   Mantener el cálculo por defecto (todos seleccionados inicialmente).

### 2.2 Estado del Borrador (`borrador`)
Cada objeto dentro del array `borrador` se ampliará para incluir:
*   `novedadesDetalle`: Array con los objetos completos de novedades (Vales/Anticipos).
*   `novedadesSeleccionadas`: Un Array o Set de IDs que representa las novedades que el usuario ha decidido incluir.

### 2.3 Interfaz de Usuario (UI) en `Liquidacion.jsx`
*   **Columna "Vales/Ant. (-)"**: Se convertirá en un elemento interactivo (clickable) con un indicador visual (ej: flecha o subrayado punteado).
*   **Fila Expandible**: Se implementará una nueva fila condicional que aparecerá debajo de la fila del empleado cuando se haga clic en el monto de vales.
*   **Sub-tabla de Detalles**: Dentro de la expansión, se listarán las novedades con:
    *   Checkbox para incluir/excluir.
    *   Fecha de la novedad.
    *   Tipo (Vale/Anticipo).
    *   Monto.

### 2.4 Animaciones
*   Se utilizará **GSAP** para animar la apertura y cierre de la fila expandible (`height: 0` a `height: auto` y `opacity`).

## 3. Flujo de Interacción
1.  El usuario genera el borrador. Por defecto, todas las novedades pendientes están marcadas.
2.  El usuario hace clic en el monto de "Vales/Ant." de un empleado.
3.  Se expande el detalle.
4.  El usuario desmarca un vale de $5.000.
5.  Automáticamente, el total de "Vales/Ant." de esa fila disminuye en $5.000 y el "Total" de la liquidación del empleado aumenta en $5.000.
6.  Al "Confirmar Liquidación", solo se envían al backend los IDs de las novedades que quedaron marcadas.

## 4. Consideraciones Técnicas
*   **Persistencia**: Solo las novedades seleccionadas se enviarán en el campo `allNovIds` al llamar a `api.liquidar`.
*   **Performance**: El recalculo de totales se hará localmente en el estado del componente para asegurar respuesta instantánea.
