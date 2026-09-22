const API_BASE = 'https://n8n-kt6h.n8n.nexuscbs.com/webhook';
const URL_LISTAR = `${API_BASE}/hye-facturas`;
const URL_APLICAR_PAGO = `${API_BASE}/hye-aplicar-pago`;
const URL_CARGAR_DOCUMENTO = `${API_BASE}/hye-cargar-documento`;
const URL_BACKFILL_MASIVO = `${API_BASE}/hye-backfill-masivo`;
const URL_EDITAR_FACTURA = `${API_BASE}/hye-editar-factura`;
const URL_INFORMAL_IA = `${API_BASE}/hye-informal-ia`;
const URL_INFORMAL_MANUAL = `${API_BASE}/hye-informal-manual`;
const URL_LISTAR_ABONOS = `${API_BASE}/hye-listar-abonos`;
const URL_ANULAR_ABONO = `${API_BASE}/hye-anular-abono`;
const URL_ADJUNTAR_SOPORTE = `${API_BASE}/hye-adjuntar-soporte`;
const URL_CONTABILIDAD = `${API_BASE}/hye-contabilidad`;
const URL_PUC_CATALOGO = `${API_BASE}/hye-puc-catalogo`;
const URL_CONTABILIDAD_FACTURA = `${API_BASE}/hye-contabilidad-factura`;
const URL_CONTABILIZAR_AHORA = `${API_BASE}/hye-contabilizar-ahora`;
const URL_CORREGIR_CODIGO = `${API_BASE}/hye-corregir-codigo`;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const METODOS_PAGO = ['Crédito', 'Efectivo', 'Banco Av Villas', 'Banco Davivienda', 'TD Av Villas', 'NEQUI_LE'];
const METODO_LABELS = { NEQUI_LE: 'Nequi (L.E)' };
function labelMetodo(m) { return METODO_LABELS[m] || m; }

const state = { facturas: [], filtroTexto: '', filtroEstado: 'todas', filtroMes: 'todos', filtroCredito: false, filtroMetodo: 'todos', filtroTipoDocumento: 'todos', itemActivo: null, ordenarPor: 'fechaEmision', ordenDireccion: -1, seleccionadas: new Set(), abonosActivos: [], modificando: null, valorPagadoEditado: false, retExistente: { rtf: 0, ica: 0 }, contabilidad: [], pucCatalogo: null, contabFacturaCufe: null, contabFiltroActivoCufe: null, contabPagina: 1 };
const CONTAB_POR_PAGINA = 25;

const el = {
  tabla: document.getElementById('tabla-facturas'),
  tablaBody: document.getElementById('tabla-body'),
  estadoCarga: document.getElementById('estado-carga'),
  estadoVacio: document.getElementById('estado-vacio'),
  resumenBar: document.getElementById('resumen-bar'),
  buscar: document.getElementById('buscar'),
  filtroEstado: document.getElementById('filtro-estado'),
  filtroMes: document.getElementById('filtro-mes'),
  filtroCredito: document.getElementById('filtro-credito'),
  filtroMetodo: document.getElementById('filtro-metodo'),
  filtroTipoDocumento: document.getElementById('filtro-tipo-documento'),
  btnRefrescar: document.getElementById('btn-refrescar'),
  inputZipDoc: document.getElementById('input-zip-doc'),
  inputZipMasivo: document.getElementById('input-zip-masivo'),
  zipMensaje: document.getElementById('zip-mensaje'),
  overlayLote: document.getElementById('overlay-lote'),
  overlayLoteTitulo: document.getElementById('overlay-lote-titulo'),
  overlayLoteBarra: document.getElementById('overlay-lote-barra'),
  overlayLoteContador: document.getElementById('overlay-lote-contador'),
  overlayLoteTexto: document.getElementById('overlay-lote-texto'),
  overlayLoteResultado: document.getElementById('overlay-lote-resultado'),
  btnLotePausar: document.getElementById('btn-lote-pausar'),
  btnLoteCancelar: document.getElementById('btn-lote-cancelar'),
  inputInformalIa: document.getElementById('input-informal-ia'),
  btnInformalManual: document.getElementById('btn-informal-manual'),
  modalInformal: document.getElementById('modal-informal'),
  formInformalManual: document.getElementById('form-informal-manual'),
  informalManualMensaje: document.getElementById('informal-manual-mensaje'),
  btnCerrarInformalManual: document.getElementById('btn-cerrar-informal-manual'),
  barraSeleccion: document.getElementById('barra-seleccion'),
  barraSeleccionTexto: document.getElementById('barra-seleccion-texto'),
  btnLimpiarSeleccion: document.getElementById('btn-limpiar-seleccion'),
  btnPagarSeleccionadas: document.getElementById('btn-pagar-seleccionadas'),
  modalPagoLote: document.getElementById('modal-pago-lote'),
  loteLineas: document.getElementById('lote-lineas'),
  formPagoLote: document.getElementById('form-pago-lote'),
  lotePagoMensaje: document.getElementById('lote-pago-mensaje'),
  btnCerrarPagoLote: document.getElementById('btn-cerrar-pago-lote'),
  btnAcercaHye: document.getElementById('btn-acerca-hye'),
  modalAcerca: document.getElementById('modal-acerca'),
  btnCerrarAcerca: document.getElementById('btn-cerrar-acerca'),

  btnVerContabilidad: document.getElementById('btn-ver-contabilidad'),
  modalContabilidad: document.getElementById('modal-contabilidad'),
  btnCerrarContabilidad: document.getElementById('btn-cerrar-contabilidad'),
  contabResumen: document.getElementById('contab-resumen'),
  contabBuscar: document.getElementById('contab-buscar'),
  contabLista: document.getElementById('contab-lista'),
  contabFiltroActivo: document.getElementById('contab-filtro-activo'),
  contabFiltroActivoTexto: document.getElementById('contab-filtro-activo-texto'),
  btnQuitarFiltroActivo: document.getElementById('btn-quitar-filtro-activo'),
  contabPaginacion: document.getElementById('contab-paginacion'),
  contabPagTexto: document.getElementById('contab-pag-texto'),
  btnContabPagAnterior: document.getElementById('btn-contab-pag-anterior'),
  btnContabPagSiguiente: document.getElementById('btn-contab-pag-siguiente'),

  detalleVacio: document.getElementById('detalle-vacio'),
  panelDetalle: document.getElementById('panel-detalle'),
  panelDerecho: document.getElementById('panel-derecho'),
  detProveedor: document.getElementById('det-proveedor'),
  detMeta: document.getElementById('det-meta'),
  detBadgeEstado: document.getElementById('det-badge-estado'),
  detBadgeCredito: document.getElementById('det-badge-credito'),
  detBase: document.getElementById('det-base'),
  detIva: document.getElementById('det-iva'),
  detRetenciones: document.getElementById('det-retenciones'),
  detRetencionesDetalle: document.getElementById('det-retenciones-detalle'),
  pagoBaseHint: document.getElementById('pago-base-hint'),
  detCuadroPago: document.getElementById('det-cuadro-pago'),
  btnModificarPago: document.getElementById('btn-modificar-pago'),
  btnAnularPago: document.getElementById('btn-anular-pago'),
  avisoModificando: document.getElementById('aviso-modificando'),
  avisoModificandoTexto: document.getElementById('aviso-modificando-texto'),
  btnCancelarModificar: document.getElementById('btn-cancelar-modificar'),
  btnCancelarModificarPie: document.getElementById('btn-cancelar-modificar-pie'),
  detTotal: document.getElementById('det-total'),
  detSaldo: document.getElementById('det-saldo'),
  detAbonado: document.getElementById('det-abonado'),
  detConcepto: document.getElementById('det-concepto'),
  detPagoAplicado: document.getElementById('det-pago-aplicado'),
  detPagoForma: document.getElementById('det-pago-forma'),
  detPagoIca: document.getElementById('det-pago-ica'),
  detPagoRetencion: document.getElementById('det-pago-retencion'),
  detPagoValor: document.getElementById('det-pago-valor'),
  linkComprobante: document.getElementById('link-comprobante'),
  detAbonosWrap: document.getElementById('det-abonos-wrap'),
  detAbonosLista: document.getElementById('det-abonos-lista'),
  resizer: document.getElementById('resizer'),
  main: document.querySelector('.main'),

  tabBtns: document.querySelectorAll('.tab-btn'),
  tabDetalle: document.getElementById('tab-detalle'),
  tabPago: document.getElementById('tab-pago'),
  tabDocumento: document.getElementById('tab-documento'),
  tabEditar: document.getElementById('tab-editar'),
  tabContabilidad: document.getElementById('tab-contabilidad'),
  formEditar: document.getElementById('form-editar'),
  editCufe: document.getElementById('edit-cufe'),
  editarMensaje: document.getElementById('editar-mensaje'),

  contabFacturaCargando: document.getElementById('contab-factura-cargando'),
  contabFacturaVacia: document.getElementById('contab-factura-vacia'),
  btnContabilizarAhora: document.getElementById('btn-contabilizar-ahora'),
  contabilizarAhoraMensaje: document.getElementById('contabilizar-ahora-mensaje'),
  contabFacturaLista: document.getElementById('contab-factura-lista'),
  contabSelectTodas: document.getElementById('contab-select-todas'),
  btnAplicarTodasCodigo: document.getElementById('btn-aplicar-todas-codigo'),
  contabLineasBody: document.getElementById('contab-lineas-body'),
  contabGuardarMensaje: document.getElementById('contab-guardar-mensaje'),
  btnGuardarCodigos: document.getElementById('btn-guardar-codigos'),

  linkPdf: document.getElementById('link-pdf'),
  linkXml: document.getElementById('link-xml'),
  visorPdf: document.getElementById('visor-pdf'),
  visorPdfVacio: document.getElementById('visor-pdf-vacio'),

  formPago: document.getElementById('form-pago'),
  formMensaje: document.getElementById('form-mensaje'),
  btnGuardarPago: document.getElementById('btn-guardar-pago'),
};

function claseMetodo(metodo) {
  if (!metodo) return 'metodo-0';
  let hash = 0;
  for (let i = 0; i < metodo.length; i++) hash = (hash * 31 + metodo.charCodeAt(i)) >>> 0;
  return 'metodo-' + ((hash % 6) + 1);
}

function formatoMoneda2(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
const ORDINALES = ['1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'];
function filasPagosHtml(f, pagos, neto) {
  if (!pagos.length) return '';
  let acumulado = 0;
  const filas = pagos.map((p, i) => {
    acumulado += Number(p.valorAbonado) || 0;
    let saldo = Math.round((neto - acumulado) * 100) / 100;
    if (saldo < 1) saldo = 0;
    const nombre = `${ORDINALES[i] || `${i + 1}.º`} pago`;
    return `<tr class="cp-pago"><th>${nombre}<small>${escapeHtml(p.fecha || '')} · ${escapeHtml(labelMetodo(p.formaDePago) || '')}</small><small>${p.driveLinkComprobante ? `<a href="${escapeHtml(p.driveLinkComprobante)}" target="_blank" rel="noopener">Ver soporte ↗</a>` : 'Sin soporte'}</small></th><td class="num">${formatoMoneda2(p.valorAbonado)}</td><td class="tar">Saldo <b>${formatoMoneda2(saldo)}</b></td></tr>`;
  }).join('');
  return `<tr class="cp-pagos-tit"><th colspan="3">Pagos realizados</th></tr>${filas}`;
}

function cuadroPagoHtml(f, pagos = []) {
  const base = Number(f.base) || 0;
  const iva = Number(f.iva) || 0;
  const rtf = Number(f.rtf) || 0;
  const rtIca = Number(f.rtIca) || 0;
  const rtIva = Number(f.rtIva) || 0;
  const neto = Math.round(((Number(f.total) || 0) - rtf - rtIca - rtIva) * 100) / 100;
  const pctIva = base > 0 ? `${Math.round((iva / base) * 10000) / 100}%` : '—';
  const pctRtIva = iva > 0 && rtIva > 0 ? `${Math.round((rtIva / iva) * 10000) / 100}%` : '0%';
  const tipoRtf = String(f.retencionFuenteTipo || '').toLowerCase().startsWith('no') ? '' : (f.retencionFuenteTipo || '');
  const tarifaRtf = rtf > 0 && base > 0 ? escapeHtml(`${tipoRtf} ${Math.round((rtf / base) * 10000) / 100}%`.trim()) : '—';
  const tarifaIca = rtIca > 0 && base > 0 ? `${Math.round((rtIca / base) * 100000) / 100} x 1.000` : '—';
  const fila = (clase, nombre, valor, tarifa) => `<tr class="${clase}"><th>${nombre}</th><td class="num">${valor}</td><td class="tar">${tarifa}</td></tr>`;
  return `<table class="cuadro-pago">
    <thead><tr><th></th><th class="num">Valores</th><th class="tar">Tarifa</th></tr></thead>
    <tbody>
      ${fila('cp-base', 'Base', formatoMoneda2(base), '')}
      ${fila('cp-iva', 'IVA', formatoMoneda2(iva), pctIva)}
      ${fila('cp-bruto', 'Total bruto', formatoMoneda2(f.total), '')}
      ${fila('cp-rtf', 'RT-Fuente', formatoMoneda2(rtf), tarifaRtf)}
      ${fila('cp-ica', 'RT-ICA', formatoMoneda2(rtIca), tarifaIca)}
      ${fila('cp-rtiva', 'RT-IVA', formatoMoneda2(rtIva), pctRtIva)}
      ${fila('cp-neto', 'Neto a pagar', formatoMoneda2(neto), '')}
      ${filasPagosHtml(f, pagos, neto)}
    </tbody></table>`;
}

function formatoMoneda(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function etiquetaMes(mesEmision) {
  if (!mesEmision || mesEmision.length < 7) return 'Sin fecha';
  const [anio, mes] = mesEmision.split('-');
  const idx = Number(mes) - 1;
  return `${MESES[idx] || mes} ${anio}`;
}

async function cargarFacturas({ mantenerSeleccion = false } = {}) {
  el.estadoCarga.hidden = false;
  el.estadoCarga.textContent = 'Cargando facturas...';
  el.estadoVacio.hidden = true;
  el.tabla.hidden = true;
  try {
    const res = await fetch(URL_LISTAR);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.facturas = Array.isArray(data) ? data : [];
  } catch (err) {
    el.estadoCarga.textContent = 'No se pudo cargar el listado. Intenta de nuevo.';
    console.error(err);
    return;
  }
  el.estadoCarga.hidden = true;
  poblarFiltroMes();
  poblarFiltroMetodo();
  render();
  if (mantenerSeleccion && state.itemActivo) {
    const actual = state.facturas.find((f) => String(f.item) === String(state.itemActivo));
    if (actual) mostrarDetalle(actual, { forzarTab: false });
  }
}

function poblarFiltroMes() {
  const meses = [...new Set(state.facturas.map((f) => f.mesEmision).filter(Boolean))].sort().reverse();
  const actual = el.filtroMes.value;
  el.filtroMes.innerHTML = '<option value="todos">Todos los meses</option>' +
    meses.map((m) => `<option value="${m}">${escapeHtml(etiquetaMes(m))}</option>`).join('');
  if (meses.includes(actual)) el.filtroMes.value = actual;
}

function poblarFiltroMetodo() {
  const enUso = state.facturas.map((f) => f.seleccionFormaPago).filter(Boolean);
  const metodos = [...new Set([...METODOS_PAGO, ...enUso])].sort();
  const actual = el.filtroMetodo.value;
  el.filtroMetodo.innerHTML = '<option value="todos">Método de pago</option>' +
    '<option value="__pendiente">Pendientes de pago</option>' +
    metodos.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(labelMetodo(m))}</option>`).join('');
  if (actual === '__pendiente' || metodos.includes(actual)) el.filtroMetodo.value = actual;
}

function facturasFiltradas() {
  const q = state.filtroTexto.trim().toLowerCase();
  return state.facturas.filter((f) => {
    if (state.filtroEstado === 'pendientes' && f.pagado) return false;
    if (state.filtroEstado === 'pagadas' && !f.pagado) return false;
    if (state.filtroMes !== 'todos' && f.mesEmision !== state.filtroMes) return false;
    if (state.filtroCredito && !f.esCredito) return false;
    if (state.filtroMetodo === '__pendiente' && f.seleccionFormaPago) return false;
    if (state.filtroMetodo !== 'todos' && state.filtroMetodo !== '__pendiente' && f.seleccionFormaPago !== state.filtroMetodo) return false;
    const esInformal = f.cufe === 'DOCUMENTO_INFORMAL';
    if (state.filtroTipoDocumento === 'formales' && esInformal) return false;
    if (state.filtroTipoDocumento === 'informales' && !esInformal) return false;
    if (!q) return true;
    const haystack = `${f.vendedorNombre} ${f.vendedorNit} ${f.nroFactura} ${f.cufe} ${f.item}`.toLowerCase();
    return haystack.includes(q);
  }).sort((a, b) => {
    const campo = state.ordenarPor;
    const dir = state.ordenDireccion;
    let va = a[campo];
    let vb = b[campo];
    if (campo === 'item' || campo === 'total') {
      va = Number(va) || 0;
      vb = Number(vb) || 0;
      return (va - vb) * dir;
    }
    va = (va || '').toString().toLowerCase();
    vb = (vb || '').toString().toLowerCase();
    const cmp = va.localeCompare(vb) * dir;
    if (cmp !== 0) return cmp;
    return ((Number(b.item) || 0) - (Number(a.item) || 0));
  });
}

function badgeEstado(f) {
  if (f.estadoPago === 'pagada') return { label: 'Pagada', cls: 'pagado' };
  if (f.estadoPago === 'abono_parcial') return { label: 'Abono parcial', cls: 'abono' };
  return { label: 'Pendiente', cls: 'pendiente' };
}

function render() {
  const items = facturasFiltradas();
  el.tablaBody.innerHTML = '';
  const hayItems = items.length !== 0;
  el.estadoVacio.hidden = hayItems;
  el.tabla.hidden = !hayItems;
  actualizarFlechasOrden();

  const totalMonto = items.reduce((acc, f) => acc + (Number(f.total) || 0), 0);
  const pagadas = items.filter((f) => f.estadoPago === 'pagada').length;
  const abonos = items.filter((f) => f.estadoPago === 'abono_parcial').length;
  el.resumenBar.innerHTML = `${items.length} factura${items.length === 1 ? '' : 's'} · <b>${formatoMoneda(totalMonto)}</b> · ${pagadas} pagadas / ${abonos} con abono / ${items.length - pagadas - abonos} pendientes`;

  state.seleccionadas = new Set([...state.seleccionadas].filter((it) => items.some((f) => String(f.item) === String(it))));

  for (const f of items) {
    const estado = badgeEstado(f);
    const seleccionada = state.seleccionadas.has(String(f.item));
    const tr = document.createElement('tr');
    tr.className = 'item-factura ' + claseMetodo(f.seleccionFormaPago) + (f.esCredito ? ' credito' : '') + (String(f.item) === String(state.itemActivo) ? ' activo' : '');
    tr.innerHTML = `
      <td class="col-check"><input type="checkbox" class="chk-factura" data-item="${escapeHtml(String(f.item))}" ${seleccionada ? 'checked' : ''} ${f.saldo <= 0 ? 'disabled' : ''}></td>
      <td>#${escapeHtml(String(f.item || '?'))}</td>
      <td>${escapeHtml(f.fechaEmision || '')}</td>
      <td class="wrap"><span class="item-proveedor">${escapeHtml(f.vendedorNombre || 'Sin nombre')}</span><br><span class="item-nit">NIT ${escapeHtml(String(f.vendedorNit || ''))} · ${escapeHtml(f.nroFactura || '')}</span></td>
      <td class="wrap">${escapeHtml(f.concepto || f.servicioOCompra || '')}</td>
      <td class="num">${formatoMoneda(f.base)}</td>
      <td class="num">${formatoMoneda(f.iva)}</td>
      <td class="num">${formatoMoneda(f.total)}</td>
      <td class="num">${f.estadoPago === 'abono_parcial' ? `<b>${formatoMoneda(f.saldo)}</b>` : formatoMoneda(f.saldo)}</td>
      <td class="col-adjunto" title="${f.drivePdf ? 'Documento archivado' : 'Sin documento archivado'}">
        <span class="icono-adjunto${f.drivePdf ? ' tiene' : ''}">📎</span>
      </td>
      <td class="col-contable" title="${f.contabilizado ? 'Contabilizada' : 'Aún no contabilizada'}">
        <span class="icono-contable ${f.contabilizado ? 'si' : 'no'}">${f.contabilizado ? '✓' : '✗'}</span>
      </td>
      <td>${f.esCredito ? '<span class="badge-credito">Crédito</span>' : '<span class="badge-contado">Contado</span>'}</td>
      <td><span class="badge-metodo${f.seleccionFormaPago ? '' : ' vacio'}">${escapeHtml(f.seleccionFormaPago ? labelMetodo(f.seleccionFormaPago) : 'Pendiente')}</span></td>
      <td><span class="badge ${estado.cls}">${estado.label}</span></td>
      <td><button type="button" class="btn-pagar ${f.estadoPago === 'pagada' ? 'ver' : ''}" data-item="${escapeHtml(String(f.item))}">${f.estadoPago === 'pagada' ? 'Ver pago' : 'Abonar'}</button></td>`;
    tr.addEventListener('click', (e) => {
      if (e.target.closest('.chk-factura') || e.target.closest('.btn-pagar')) return;
      mostrarDetalle(f, { forzarTab: true, tabInicial: 'detalle' });
    });
    tr.querySelector('.btn-pagar').addEventListener('click', (e) => {
      e.stopPropagation();
      mostrarDetalle(f, { forzarTab: true, tabInicial: f.estadoPago === 'pagada' ? 'detalle' : 'pago' });
    });
    tr.querySelector('.chk-factura').addEventListener('change', (e) => {
      const key = String(f.item);
      if (e.target.checked) state.seleccionadas.add(key);
      else state.seleccionadas.delete(key);
      actualizarBarraSeleccion();
    });
    el.tablaBody.appendChild(tr);
  }
  actualizarBarraSeleccion();
}

function mostrarDetalle(factura, { forzarTab, tabInicial = 'detalle' }) {
  state.itemActivo = factura.item;
  render();

  el.detalleVacio.hidden = true;
  el.panelDetalle.hidden = false;
  actualizarPanelDerecho();

  const estado = badgeEstado(factura);
  el.detProveedor.textContent = factura.vendedorNombre || 'Proveedor sin nombre';
  el.detMeta.textContent = `Item #${factura.item || '?'} · NIT ${factura.vendedorNit || ''} · Fact. ${factura.nroFactura || ''} · ${factura.fechaEmision || ''}`;
  el.detBadgeEstado.textContent = estado.label;
  el.detBadgeEstado.className = 'badge ' + estado.cls;
  el.detBadgeCredito.hidden = !factura.esCredito;

  el.detBase.textContent = formatoMoneda(factura.base);
  el.detIva.textContent = formatoMoneda(factura.iva);
  el.detRetenciones.textContent = formatoMoneda(factura.retenciones);
  el.detRetencionesDetalle.textContent = `Retefuente ${formatoMoneda(factura.rtf)} · ReteICA ${formatoMoneda(factura.rtIca)} · ReteIVA ${formatoMoneda(factura.rtIva)}`;
  el.detTotal.textContent = formatoMoneda(factura.total);
  el.detConcepto.textContent = factura.concepto || factura.servicioOCompra || '';
  if (el.detSaldo) {
    el.detSaldo.textContent = formatoMoneda(factura.saldo);
    el.detSaldo.parentElement.classList.toggle('saldo-cero', (Number(factura.saldo) || 0) <= 0);
    el.detAbonado.textContent = formatoMoneda(factura.abonado) + (factura.cantidadAbonos ? ` (${factura.cantidadAbonos} abono${factura.cantidadAbonos === 1 ? '' : 's'})` : '');
  }

  if (factura.abonado > 0) {
    el.detPagoAplicado.hidden = false;
    el.detPagoForma.textContent = factura.seleccionFormaPago ? labelMetodo(factura.seleccionFormaPago) : '—';
    el.detPagoIca.textContent = factura.tarifaIcaAplicada || '—';
    el.detPagoRetencion.textContent = [factura.retencionFuenteTipo, factura.tarifaRetencionAplicada].filter(Boolean).join(' · ') || '—';
    el.detPagoValor.textContent = formatoMoneda(factura.abonado);
    el.detCuadroPago.innerHTML = cuadroPagoHtml(factura);
    if (factura.driveComprobante) {
      el.linkComprobante.href = factura.driveComprobante;
      el.linkComprobante.hidden = false;
    } else {
      el.linkComprobante.removeAttribute('href');
      el.linkComprobante.hidden = true;
    }
  } else {
    el.detPagoAplicado.hidden = true;
  }

  if (factura.drivePdf) {
    el.linkPdf.href = factura.drivePdf;
    el.linkPdf.hidden = false;
    el.visorPdf.src = factura.drivePdf;
    el.visorPdf.hidden = false;
    el.visorPdfVacio.hidden = true;
  } else {
    el.linkPdf.removeAttribute('href');
    el.linkPdf.hidden = true;
    el.visorPdf.src = '';
    el.visorPdf.hidden = true;
    el.visorPdfVacio.hidden = false;
  }
  if (factura.driveXml) el.linkXml.href = factura.driveXml;
  else el.linkXml.removeAttribute('href');
  el.linkXml.hidden = !factura.driveXml;

  el.formPago.reset();
  state.valorPagadoEditado = false;
  state.modificando = null;
  mostrarAvisoModificando(false);
  el.formPago.elements.valorPagado.value = factura.saldo || 0;
  el.formPago.elements.valorRetencionFuente.value = 0;
  el.formPago.elements.valorIca.value = 0;
  el.pagoBaseHint.textContent = `Base para el cálculo de retenciones: ${formatoMoneda(factura.base)} (subtotal sin IVA)`;
  cargarRetencionesExistentes(factura);
  el.formMensaje.textContent = '';
  el.formMensaje.className = 'form-mensaje';

  el.editCufe.value = factura.cufe || '';
  const fe = el.formEditar.elements;
  fe.documento.value = factura.documento || 'Factura Electronica de Venta';
  fe.nroFactura.value = factura.nroFactura || '';
  fe.fechaEmision.value = factura.fechaEmision || '';
  fe.formaDePago.value = factura.formaDePago || 'SIN DATO';
  fe.vendedorNombre.value = factura.vendedorNombre || '';
  fe.vendedorNit.value = factura.vendedorNit || '';
  fe.vendedorCiudad.value = factura.vendedorCiudad || '';
  fe.vendedorTelefono.value = factura.vendedorTelefono || '';
  fe.vendedorEmail.value = factura.vendedorEmail || '';
  fe.vendedorDireccion.value = factura.vendedorDireccion || '';
  fe.subtotal.value = factura.base || 0;
  fe.iva.value = factura.iva || 0;
  fe.total.value = factura.total || 0;
  fe.concepto.value = factura.concepto || '';
  fe.servicioOCompra.value = (factura.servicioOCompra || 'COMPRA').toUpperCase();
  el.editarMensaje.textContent = '';
  el.editarMensaje.className = 'form-mensaje';

  cargarAbonosFactura(factura.item);
  cargarContabilidadFactura(factura);

  if (forzarTab) activarTab(tabInicial);
}

function mostrarAvisoModificando(visible) {
  el.avisoModificando.hidden = !visible;
  el.btnCancelarModificarPie.hidden = !visible;
}

function cancelarModificacion() {
  const f = facturaActiva();
  if (f) mostrarDetalle(f, { forzarTab: false });
}

function ultimoAbonoActivo() {
  return state.abonosActivos.length ? state.abonosActivos.reduce((m, a) => (Number(a.idAbono) > Number(m.idAbono) ? a : m)) : null;
}
function actualizarAccionesPago() {
  const hay = !!ultimoAbonoActivo();
  el.btnModificarPago.hidden = !hay;
  el.btnAnularPago.hidden = !hay;
}

async function postAnular(idAbono) {
  const res = await fetch(URL_ANULAR_ABONO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idAbono }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo anular.');
}

async function anexarSoporte(idAbono, archivo, input) {
  const factura = facturaActiva();
  if (!factura) return;
  const rotulo = input.parentElement.querySelector('span');
  input.disabled = true;
  rotulo.textContent = '⏳ Subiendo...';
  try {
    const fd = new FormData();
    fd.append('idAbono', idAbono);
    fd.append('cufe', factura.cufe || '');
    fd.append('comprobante', archivo);
    const res = await fetch(URL_ADJUNTAR_SOPORTE, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok !== true) throw new Error('No se pudo anexar');
    await cargarFacturas({ mantenerSeleccion: true });
  } catch (err) {
    console.error(err);
    alert('No se pudo anexar el soporte. Intenta de nuevo.');
    input.disabled = false;
    input.value = '';
    rotulo.textContent = '📎 Anexar soporte';
  }
}

async function anularAbono(idAbono) {
  const ab = state.abonosActivos.find((x) => String(x.idAbono) === String(idAbono));
  const detalle = ab ? `de ${formatoMoneda(ab.valorAbonado)} (${ab.fecha || 'sin fecha'})` : `#${idAbono}`;
  if (!confirm(`¿Anular el pago ${detalle}?`)) return;
  if (!confirm('SEGUNDA CONFIRMACIÓN\n\nAl anular, el saldo de la factura vuelve a subir y las retenciones se recalculan. El pago quedará tachado en el historial.\n\n¿Seguro que quieres anularlo?')) return;
  try {
    await postAnular(idAbono);
    await cargarFacturas({ mantenerSeleccion: true });
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error de conexión.');
  }
}

function iniciarModificar(a) {
  const factura = facturaActiva();
  if (!factura) return;
  state.modificando = { idAbono: a.idAbono, driveLink: a.driveLinkComprobante || '' };
  activarTab('pago');
  const f = el.formPago.elements;
  const base = Number(factura.base) || 0;
  const activoRf = (x) => String(x.retencionFuente || '').toLowerCase() !== 'no aplica' && tasaRetencion(x.tarifaRetencion) > 0;
  const activoIca = (x) => tasaIca(x.tarifaIca) > 0;
  const otros = state.abonosActivos.filter((x) => String(x.idAbono) !== String(a.idAbono));
  el.formPago.querySelectorAll('option[data-custom="1"]').forEach((o) => o.remove());
  f.formaDePago.value = a.formaDePago || '';
  const exRtf = Number(factura.rtf) || 0;
  const exIca = Number(factura.rtIca) || 0;
  state.retExistente = {
    rtf: activoRf(a) ? redondear2(otros.filter(activoRf).reduce((sum, x) => sum + tasaRetencion(x.tarifaRetencion) * base, 0)) : exRtf,
    ica: activoIca(a) ? redondear2(otros.filter(activoIca).reduce((sum, x) => sum + tasaIca(x.tarifaIca) * base, 0)) : exIca,
  };
  if (activoRf(a)) {
    asegurarOpcion(f.tarifaRetencion, a.tarifaRetencion);
    f.tarifaRetencion.value = a.tarifaRetencion;
    marcarTipoRetencion(a.retencionFuente);
    f.valorRetencionFuente.value = redondear2(base * tasaRetencion(a.tarifaRetencion));
  } else if (exRtf > 0 && base > 0) {
    fijarTarifaRetencion(redondear2((exRtf / base) * 100));
    f.valorRetencionFuente.value = exRtf;
  } else {
    f.tarifaRetencion.value = 'No aplica';
    marcarTipoRetencion('No aplica');
    f.valorRetencionFuente.value = 0;
  }
  if (activoIca(a)) {
    asegurarOpcion(f.tarifaIca, a.tarifaIca);
    f.tarifaIca.value = a.tarifaIca;
    f.valorIca.value = redondear2(base * tasaIca(a.tarifaIca));
  } else if (exIca > 0 && base > 0) {
    fijarTarifaIca(redondear2((exIca / base) * 1000));
    f.valorIca.value = exIca;
  } else {
    f.tarifaIca.value = 'No APLICA';
    f.valorIca.value = 0;
  }
  f.valorPagado.value = a.valorAbonado;
  state.valorPagadoEditado = true;
  el.pagoBaseHint.textContent = `Base para el cálculo de retenciones: ${formatoMoneda(factura.base)} (subtotal sin IVA)`;
  el.avisoModificandoTexto.textContent = `Modificando el pago #${a.idAbono} de ${formatoMoneda(a.valorAbonado)}. Al guardar, ese pago se anula y se registra uno nuevo${a.driveLinkComprobante ? '; el soporte actual se conserva si no adjuntas otro' : ''}.`;
  mostrarAvisoModificando(true);
}

async function cargarAbonosFactura(item) {
  el.detAbonosWrap.hidden = true;
  el.detAbonosLista.innerHTML = '';
  state.abonosActivos = [];
  actualizarAccionesPago();
  try {
    const res = await fetch(`${URL_LISTAR_ABONOS}?item=${encodeURIComponent(item)}`);
    if (!res.ok) return;
    const abonos = await res.json();
    if (!Array.isArray(abonos) || !abonos.length) return;
    state.abonosActivos = abonos.filter((a) => !a.anulado);
    actualizarAccionesPago();
    const conSoporte = [...state.abonosActivos].filter((a) => a.driveLinkComprobante).sort((x, y) => Number(y.idAbono) - Number(x.idAbono))[0];
    if (conSoporte) {
      el.linkComprobante.href = conSoporte.driveLinkComprobante;
      el.linkComprobante.textContent = state.abonosActivos.length > 1 ? 'Ver último comprobante ↗' : 'Ver comprobante ↗';
      el.linkComprobante.hidden = false;
    } else {
      el.linkComprobante.removeAttribute('href');
      el.linkComprobante.hidden = true;
    }
    const facturaCuadro = facturaActiva();
    if (facturaCuadro && String(facturaCuadro.item) === String(item) && facturaCuadro.abonado > 0) {
      const ordenados = [...state.abonosActivos].sort((x, y) => Number(x.idAbono) - Number(y.idAbono));
      el.detCuadroPago.innerHTML = cuadroPagoHtml(facturaCuadro, ordenados);
    }
    el.detAbonosWrap.hidden = false;
    const factura = facturaActiva() || {};
    const activos = abonos.filter((a) => !a.anulado);
    const conRetencion = activos.filter((a) => String(a.retencionFuente || '').toLowerCase() !== 'no aplica' && tasaRetencion(a.tarifaRetencion) > 0).length;
    const conIca = activos.filter((a) => tasaIca(a.tarifaIca) > 0).length;
    const pesos = (valor, cantidad) => (cantidad === 1 ? ` → <b>${formatoMoneda(valor)}</b>` : cantidad > 1 ? ` (total factura ${formatoMoneda(valor)})` : '');
    el.detAbonosLista.innerHTML = abonos.map((a) => {
      const tieneRet = !a.anulado && String(a.retencionFuente || '').toLowerCase() !== 'no aplica' && tasaRetencion(a.tarifaRetencion) > 0;
      const tieneIca = !a.anulado && tasaIca(a.tarifaIca) > 0;
      return `
      <details class="abono-det ${a.anulado ? 'anulado' : ''}" data-id="${escapeHtml(String(a.idAbono))}">
        <summary>
          <span><b>${formatoMoneda(a.valorAbonado)}</b> · ${escapeHtml(labelMetodo(a.formaDePago) || 'Sin forma de pago')}</span>
          <span class="abono-fecha">${escapeHtml(a.fecha || '')}${a.anulado ? ' · ANULADO' : ''}</span>
        </summary>
        <div class="abono-det-body">
          <div><span>Forma de pago</span><b>${escapeHtml(labelMetodo(a.formaDePago) || '—')}</b></div>
          <div><span>Valor pagado</span><b>${formatoMoneda(a.valorAbonado)}</b></div>
          <div><span>Retención en la fuente</span><b>${escapeHtml(a.retencionFuente || '—')} · ${escapeHtml(a.tarifaRetencion || '—')}</b>${tieneRet ? pesos(factura.rtf, conRetencion) : ''}</div>
          <div><span>ICA</span><b>${escapeHtml(a.tarifaIca || '—')}</b>${tieneIca ? pesos(factura.rtIca, conIca) : ''}</div>
          <div><span>Soporte</span>${a.driveLinkComprobante ? `<a href="${a.driveLinkComprobante}" target="_blank" rel="noopener">Ver soporte ↗</a>` : `<b>Sin soporte</b>${!a.anulado ? ` <label class="btn btn-anexar"><span>📎 Anexar soporte</span><input type="file" class="input-anexar-soporte" data-id="${escapeHtml(String(a.idAbono))}" accept="image/*,application/pdf" hidden></label>` : ''}`}</div>
          ${!a.anulado ? `<div class="abono-det-acciones"><button type="button" class="btn btn-secundario btn-modificar-abono" data-id="${escapeHtml(String(a.idAbono))}">✏️ Modificar</button> <button type="button" class="btn btn-peligro btn-anular-abono" data-id="${escapeHtml(String(a.idAbono))}">Anular este pago</button></div>` : ''}
        </div>
      </details>`;
    }).join('');
    el.detAbonosLista.querySelectorAll('.btn-anular-abono').forEach((btn) => {
      btn.addEventListener('click', () => anularAbono(btn.dataset.id));
    });
    el.detAbonosLista.querySelectorAll('.input-anexar-soporte').forEach((inp) => {
      inp.addEventListener('change', () => {
        const archivo = inp.files && inp.files[0];
        if (archivo) anexarSoporte(inp.dataset.id, archivo, inp);
      });
    });
    el.detAbonosLista.querySelectorAll('.btn-modificar-abono').forEach((btn) => {
      btn.addEventListener('click', () => {
        const a = abonos.find((x) => String(x.idAbono) === String(btn.dataset.id));
        if (a) iniciarModificar(a);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

function activarTab(nombre) {
  el.tabBtns.forEach((b) => b.classList.toggle('active', b.dataset.tab === nombre));
  el.tabDetalle.classList.toggle('active', nombre === 'detalle');
  el.tabPago.classList.toggle('active', nombre === 'pago');
  el.tabDocumento.classList.toggle('active', nombre === 'documento');
  el.tabEditar.classList.toggle('active', nombre === 'editar');
  el.tabContabilidad.classList.toggle('active', nombre === 'contabilidad');
}

function tasaRetencion(txt) {
  const m = String(txt || '').replace(',', '.').match(/[0-9]+(\.[0-9]+)?/);
  return m ? parseFloat(m[0]) / 100 : 0;
}
function tasaIca(txt) {
  const m = String(txt || '').replace(',', '.').match(/[0-9]+(\.[0-9]+)?/);
  return m ? parseFloat(m[0]) / 1000 : 0;
}
function redondear2(n) { return Math.round(n * 100) / 100; }

function facturaActiva() {
  return state.facturas.find((f) => String(f.item) === String(state.itemActivo));
}

function asegurarOpcion(sel, texto) {
  if ([...sel.options].some((o) => o.value === texto)) return;
  const op = document.createElement('option');
  op.dataset.custom = '1';
  op.value = texto;
  op.textContent = `${texto} (calculada)`;
  sel.insertBefore(op, sel.options[sel.options.length - 1]);
}

function fijarTarifaRetencion(pct) {
  const sel = el.formPago.elements.tarifaRetencion;
  if (!(pct > 0)) { sel.value = 'No aplica'; return; }
  const op = [...sel.options].find((o) => o.value && tasaRetencion(o.value) > 0 && Math.abs(tasaRetencion(o.value) * 100 - pct) < 0.005);
  const texto = op ? op.value : `${pct}%`;
  asegurarOpcion(sel, texto);
  sel.value = texto;
}

function fijarTarifaIca(permil) {
  const sel = el.formPago.elements.tarifaIca;
  if (!(permil > 0)) { sel.value = 'No APLICA'; return; }
  const op = [...sel.options].find((o) => o.value && tasaIca(o.value) > 0 && Math.abs(tasaIca(o.value) * 1000 - permil) < 0.005);
  const texto = op ? op.value : `${permil} x 1.000`;
  asegurarOpcion(sel, texto);
  sel.value = texto;
}

function cargarRetencionesExistentes(factura) {
  const f = el.formPago.elements;
  el.formPago.querySelectorAll('option[data-custom="1"]').forEach((o) => o.remove());
  state.retExistente = { rtf: Number(factura.rtf) || 0, ica: Number(factura.rtIca) || 0 };
  const base = Number(factura.base) || 0;
  const { rtf, ica } = state.retExistente;
  if (!(rtf > 0 || ica > 0) || base <= 0) return;
  f.valorRetencionFuente.value = rtf;
  f.valorIca.value = ica;
  fijarTarifaRetencion(rtf > 0 ? redondear2((rtf / base) * 100) : 0);
  fijarTarifaIca(ica > 0 ? redondear2((ica / base) * 1000) : 0);
  if (!(rtf > 0)) marcarTipoRetencion('No aplica');
  sugerirValorPagado();
  el.pagoBaseHint.textContent = `Esta factura ya trae retenciones (Retefuente ${formatoMoneda2(rtf)} · ICA ${formatoMoneda2(ica)}). Se cargaron con la tarifa calculada (valor ÷ base). Verifica, corrige si hace falta y confirma.`;
}

function sugerirValorPagado() {
  const factura = facturaActiva();
  if (!factura || state.valorPagadoEditado) return;
  const f = el.formPago.elements;
  const rf = Number(f.valorRetencionFuente.value) || 0;
  const ica = Number(f.valorIca.value) || 0;
  const ex = state.retExistente || { rtf: 0, ica: 0 };
  f.valorPagado.value = Math.max(0, redondear2((factura.saldo || 0) - (rf - ex.rtf) - (ica - ex.ica)));
}

function marcarTipoRetencion(valor) {
  const r = el.formPago.querySelector(`input[name="retencionFuente"][value="${valor}"]`);
  if (r) r.checked = true;
}

function recalcularRetenciones(origen) {
  const factura = facturaActiva();
  if (!factura) return;
  const f = el.formPago.elements;
  const base = Number(factura.base) || 0;
  const tarifa = f.tarifaRetencion.value;
  const tipoRet = (el.formPago.querySelector('input[name="retencionFuente"]:checked') || {}).value || '';
  if (origen === 'tipo' && tipoRet === 'No aplica') f.tarifaRetencion.value = 'No aplica';
  if (origen === 'tarifa' && tasaRetencion(tarifa) > 0 && (!tipoRet || tipoRet === 'No aplica')) marcarTipoRetencion('Compras');
  f.valorRetencionFuente.value = redondear2(base * tasaRetencion(f.tarifaRetencion.value));
  f.valorIca.value = redondear2(base * tasaIca(f.tarifaIca.value));
  sugerirValorPagado();
}

function quitarArchivoVacio(fd, form, campo) {
  const input = form.elements[campo];
  if (input && input.files && input.files.length === 0) fd.delete(campo);
}

async function enviarPago(e) {
  e.preventDefault();
  if (!state.itemActivo) return;
  const factura = state.facturas.find((f) => String(f.item) === String(state.itemActivo));
  if (!factura) return;
  const fd = new FormData(el.formPago);
  quitarArchivoVacio(fd, el.formPago, 'comprobante');
  const valorPagado = fd.get('valorPagado');
  fd.append('lineas', JSON.stringify([{ item: factura.item, valor: valorPagado, cufe: factura.cufe || '', rf: redondear2((Number(fd.get('valorRetencionFuente')) || 0) - (state.retExistente || { rtf: 0 }).rtf), ica: redondear2((Number(fd.get('valorIca')) || 0) - (state.retExistente || { ica: 0 }).ica) }]));
  const modificando = state.modificando;
  if (modificando && !confirm(`¿Guardar los cambios?\n\nEl pago #${modificando.idAbono} se anulará y se registrará uno nuevo con los datos del formulario.`)) return;
  el.btnGuardarPago.disabled = true;
  el.formMensaje.textContent = 'Guardando...';
  el.formMensaje.className = 'form-mensaje';
  let anuladoAnterior = false;
  try {
    if (modificando) {
      await postAnular(modificando.idAbono);
      anuladoAnterior = true;
      if (!fd.get('comprobante') && modificando.driveLink) fd.append('driveLinkExistente', modificando.driveLink);
    }
    const res = await fetch(URL_APLICAR_PAGO, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.modificando = null;
    mostrarAvisoModificando(false);
    el.formMensaje.textContent = modificando ? 'Pago modificado correctamente.' : 'Pago aplicado correctamente.';
    el.formMensaje.className = 'form-mensaje ok';
    await cargarFacturas({ mantenerSeleccion: true });
  } catch (err) {
    console.error(err);
    el.formMensaje.textContent = anuladoAnterior
      ? 'El pago anterior ya quedó anulado, pero no se pudo registrar el nuevo. Aplícalo de nuevo.'
      : (modificando ? 'No se pudo anular el pago anterior; no se hizo ningún cambio. Intenta de nuevo.' : 'No se pudo guardar el pago. Intenta de nuevo.');
    el.formMensaje.className = 'form-mensaje error';
    if (anuladoAnterior) { state.modificando = null; mostrarAvisoModificando(false); cargarFacturas({ mantenerSeleccion: true }); }
  } finally {
    el.btnGuardarPago.disabled = false;
  }
}

async function enviarEdicion(e) {
  e.preventDefault();
  if (!state.itemActivo) return;
  const factura = state.facturas.find((f) => String(f.item) === String(state.itemActivo));
  if (!factura) return;
  const fe = el.formEditar.elements;
  const payload = {
    item: factura.item,
    documento: fe.documento.value,
    nroFactura: fe.nroFactura.value,
    fechaEmision: fe.fechaEmision.value,
    formaDePago: fe.formaDePago.value,
    vendedorNombre: fe.vendedorNombre.value,
    vendedorNit: fe.vendedorNit.value,
    vendedorCiudad: fe.vendedorCiudad.value,
    vendedorTelefono: fe.vendedorTelefono.value,
    vendedorEmail: fe.vendedorEmail.value,
    vendedorDireccion: fe.vendedorDireccion.value,
    subtotal: fe.subtotal.value,
    iva: fe.iva.value,
    total: fe.total.value,
    concepto: fe.concepto.value,
    servicioOCompra: fe.servicioOCompra.value,
  };
  el.editarMensaje.textContent = 'Guardando...';
  el.editarMensaje.className = 'form-mensaje';
  try {
    const res = await fetch(URL_EDITAR_FACTURA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    el.editarMensaje.textContent = 'Factura actualizada correctamente.';
    el.editarMensaje.className = 'form-mensaje ok';
    await cargarFacturas({ mantenerSeleccion: true });
  } catch (err) {
    console.error(err);
    el.editarMensaje.textContent = 'No se pudo guardar. Intenta de nuevo.';
    el.editarMensaje.className = 'form-mensaje error';
  }
}

el.formEditar.addEventListener('submit', enviarEdicion);

el.buscar.addEventListener('input', (e) => { state.filtroTexto = e.target.value; render(); });
el.filtroEstado.addEventListener('change', (e) => { state.filtroEstado = e.target.value; render(); });
el.filtroMes.addEventListener('change', (e) => { state.filtroMes = e.target.value; render(); });
el.filtroCredito.addEventListener('change', (e) => { state.filtroCredito = e.target.checked; render(); });
el.filtroTipoDocumento.addEventListener('change', (e) => { state.filtroTipoDocumento = e.target.value; render(); });
el.filtroMetodo.addEventListener('change', (e) => { state.filtroMetodo = e.target.value; render(); });
el.btnRefrescar.addEventListener('click', () => cargarFacturas({ mantenerSeleccion: true }));
el.formPago.addEventListener('submit', enviarPago);
el.btnAnularPago.addEventListener('click', () => { const a = ultimoAbonoActivo(); if (a) anularAbono(a.idAbono); });
el.btnModificarPago.addEventListener('click', () => { const a = ultimoAbonoActivo(); if (a) iniciarModificar(a); });
el.btnCancelarModificar.addEventListener('click', cancelarModificacion);
el.btnCancelarModificarPie.addEventListener('click', cancelarModificacion);
el.formPago.elements.tarifaIca.addEventListener('change', () => recalcularRetenciones('ica'));
el.formPago.elements.tarifaRetencion.addEventListener('change', () => recalcularRetenciones('tarifa'));
el.formPago.querySelectorAll('input[name="retencionFuente"]').forEach((r) => r.addEventListener('change', () => recalcularRetenciones('tipo')));
el.formPago.elements.valorRetencionFuente.addEventListener('input', sugerirValorPagado);
el.formPago.elements.valorIca.addEventListener('input', sugerirValorPagado);
el.formPago.elements.valorPagado.addEventListener('input', () => { state.valorPagadoEditado = true; });
el.tabBtns.forEach((b) => b.addEventListener('click', () => activarTab(b.dataset.tab)));

[el.linkPdf, el.linkXml, el.linkComprobante].forEach((link) => {
  link.addEventListener('click', (e) => {
    if (!link.getAttribute('href')) e.preventDefault();
  });
});

document.querySelectorAll('th.ordenable').forEach((th) => {
  th.addEventListener('click', () => {
    const campo = th.dataset.campo;
    if (state.ordenarPor === campo) {
      state.ordenDireccion *= -1;
    } else {
      state.ordenarPor = campo;
      state.ordenDireccion = (campo === 'item' || campo === 'fechaEmision' || campo === 'total') ? -1 : 1;
    }
    render();
  });
});

function actualizarFlechasOrden() {
  document.querySelectorAll('th.ordenable').forEach((th) => {
    th.querySelector('.flecha')?.remove();
    if (th.dataset.campo === state.ordenarPor) {
      const flecha = document.createElement('span');
      flecha.className = 'flecha';
      flecha.textContent = state.ordenDireccion === 1 ? '▲' : '▼';
      th.appendChild(flecha);
    }
  });
}

// Barra arrastrable entre la tabla y el panel de detalle (lado derecho)
(function initResizer() {
  let arrastrando = false;

  function aplicarAncho(pct) {
    const clamped = Math.min(75, Math.max(25, pct));
    el.panelDerecho.style.flexBasis = clamped + '%';
    try { localStorage.setItem('synapsepagos_split', String(clamped)); } catch (e) {}
  }

  let anchoGuardado = 42;
  try {
    const guardado = parseFloat(localStorage.getItem('synapsepagos_split'));
    if (!isNaN(guardado)) anchoGuardado = guardado;
  } catch (e) {}
  aplicarAncho(anchoGuardado);

  el.resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    arrastrando = true;
    el.resizer.classList.add('arrastrando');
  });

  window.addEventListener('mousemove', (e) => {
    if (!arrastrando) return;
    const rect = el.main.getBoundingClientRect();
    const pctDesdeDerecha = ((rect.right - e.clientX) / rect.width) * 100;
    aplicarAncho(pctDesdeDerecha);
  });

  window.addEventListener('mouseup', () => {
    if (!arrastrando) return;
    arrastrando = false;
    el.resizer.classList.remove('arrastrando');
  });
})();

function mostrarMensajeZip(texto, tipo) {
  el.zipMensaje.textContent = texto;
  el.zipMensaje.className = 'zip-mensaje' + (tipo ? ' ' + tipo : '');
  el.zipMensaje.hidden = false;
}

async function subirUnZip(archivo, url, signal, campo = 'comprobante') {
  const fd = new FormData();
  fd.append(campo, archivo);
  try {
    const res = await fetch(url, { method: 'POST', body: fd, signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return { ok: false, mensaje: data.mensaje || 'No se pudo procesar.' };
    }
    return { ok: true, mensaje: data.mensaje || 'Archivado correctamente.' };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, cancelado: true, mensaje: 'Cancelado.' };
    }
    console.error(err);
    return { ok: false, mensaje: 'Error de conexión.' };
  }
}

function esperarMientrasPausado(control) {
  return new Promise((resolve) => {
    (function check() {
      if (control.cancelado || !control.pausado) return resolve();
      setTimeout(check, 200);
    })();
  });
}

function actualizarOverlayLote({ actual, total, texto }) {
  const pct = total ? Math.round((actual / total) * 100) : 0;
  el.overlayLoteBarra.style.width = pct + '%';
  el.overlayLoteContador.textContent = `${actual} de ${total}`;
  el.overlayLoteTexto.textContent = texto || '';
}

el.btnLotePausar.addEventListener('click', () => {
  const control = state.loteControl;
  if (!control || control.cancelado) return;
  control.pausado = !control.pausado;
  el.btnLotePausar.textContent = control.pausado ? '▶ Reanudar' : '⏸ Pausar';
  el.overlayLote.classList.toggle('pausado', control.pausado);
  el.overlayLoteResultado.textContent = control.pausado ? 'En pausa. El proceso continuara donde va cuando reanudes.' : '';
});

el.btnLoteCancelar.addEventListener('click', () => {
  const control = state.loteControl;
  if (!control) return;
  control.cancelado = true;
  control.pausado = false;
  el.overlayLoteResultado.textContent = 'Cancelando...';
  if (control.abortController) control.abortController.abort();
});

async function procesarLoteZip(archivos, url, campo = 'comprobante') {
  const errores = [];
  let exitosos = 0;
  let procesados = 0;
  const control = { pausado: false, cancelado: false, abortController: null };
  state.loteControl = control;

  el.btnLotePausar.textContent = '⏸ Pausar';
  el.overlayLote.classList.remove('pausado');
  el.overlayLoteResultado.textContent = '';
  el.overlayLote.hidden = false;
  actualizarOverlayLote({ actual: 0, total: archivos.length, texto: 'Iniciando...' });

  try {
    for (let i = 0; i < archivos.length; i++) {
      await esperarMientrasPausado(control);
      if (control.cancelado) break;

      const archivo = archivos[i];
      actualizarOverlayLote({ actual: i, total: archivos.length, texto: `Procesando: ${archivo.name}...` });
      control.abortController = new AbortController();
      const resultado = await subirUnZip(archivo, url, control.abortController.signal, campo);
      control.abortController = null;

      if (resultado.cancelado) break;

      procesados = i + 1;
      if (resultado.ok) {
        exitosos++;
      } else {
        errores.push(`${archivo.name}: ${resultado.mensaje}`);
      }
      actualizarOverlayLote({ actual: procesados, total: archivos.length, texto: '' });
    }
  } finally {
    el.overlayLote.hidden = true;
    state.loteControl = null;
  }

  await cargarFacturas({ mantenerSeleccion: true });

  const cancelado = control.cancelado;
  const prefijo = cancelado ? `Cancelado: ${procesados} de ${archivos.length} procesados antes de parar.` : `Listo: ${exitosos} de ${procesados} documentos procesados correctamente.`;
  if (errores.length === 0) {
    mostrarMensajeZip(prefijo, cancelado ? '' : 'ok');
  } else {
    mostrarMensajeZip(`${prefijo} Con problema: ${errores.join(' · ')}`, 'error');
  }
  setTimeout(() => { el.zipMensaje.hidden = true; }, errores.length ? 15000 : 8000);
}

el.inputZipDoc.addEventListener('change', async (e) => {
  const archivos = Array.from(e.target.files || []);
  e.target.value = '';
  if (!archivos.length) return;
  await procesarLoteZip(archivos, URL_CARGAR_DOCUMENTO);
});

el.inputZipMasivo.addEventListener('change', async (e) => {
  const archivos = Array.from(e.target.files || []);
  e.target.value = '';
  if (!archivos.length) return;
  await procesarLoteZip(archivos, URL_BACKFILL_MASIVO);
});

el.inputInformalIa.addEventListener('change', async (e) => {
  const archivos = Array.from(e.target.files || []);
  e.target.value = '';
  if (!archivos.length) return;
  await procesarLoteZip(archivos, URL_INFORMAL_IA, 'documento');
});

function abrirModalInformal() {
  el.formInformalManual.reset();
  el.informalManualMensaje.textContent = '';
  el.informalManualMensaje.className = 'form-mensaje';
  el.modalInformal.hidden = false;
}
function cerrarModalInformal() {
  el.modalInformal.hidden = true;
}
el.btnInformalManual.addEventListener('click', abrirModalInformal);
el.btnCerrarInformalManual.addEventListener('click', cerrarModalInformal);

el.formInformalManual.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(el.formInformalManual);
  quitarArchivoVacio(fd, el.formInformalManual, 'soporte');
  el.informalManualMensaje.textContent = 'Guardando...';
  el.informalManualMensaje.className = 'form-mensaje';
  try {
    const res = await fetch(URL_INFORMAL_MANUAL, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo guardar.');
    el.informalManualMensaje.textContent = 'Registro guardado correctamente.';
    el.informalManualMensaje.className = 'form-mensaje ok';
    setTimeout(cerrarModalInformal, 1200);
  } catch (err) {
    console.error(err);
    el.informalManualMensaje.textContent = err.message || 'Error de conexión.';
    el.informalManualMensaje.className = 'form-mensaje error';
  }
});

function actualizarPanelDerecho() {
  const hayAlgo = !el.panelDetalle.hidden || !el.barraSeleccion.hidden;
  el.panelDerecho.hidden = !hayAlgo;
  el.resizer.hidden = !hayAlgo;
}

function actualizarBarraSeleccion() {
  const n = state.seleccionadas.size;
  el.barraSeleccion.hidden = n === 0;
  actualizarPanelDerecho();
  if (n === 0) return;
  const total = [...state.seleccionadas].reduce((acc, item) => {
    const f = state.facturas.find((x) => String(x.item) === String(item));
    return acc + (f ? Number(f.saldo) || 0 : 0);
  }, 0);
  el.barraSeleccionTexto.textContent = `${n} factura${n === 1 ? '' : 's'} seleccionada${n === 1 ? '' : 's'} · saldo total ${formatoMoneda(total)}`;
}

el.btnLimpiarSeleccion.addEventListener('click', () => {
  state.seleccionadas.clear();
  render();
});

function abrirModalPagoLote() {
  const seleccionadas = [...state.seleccionadas]
    .map((item) => state.facturas.find((f) => String(f.item) === String(item)))
    .filter(Boolean);
  if (!seleccionadas.length) return;

  el.loteLineas.innerHTML = seleccionadas.map((f) => `
    <div class="lote-linea" data-item="${escapeHtml(String(f.item))}" data-cufe="${escapeHtml(f.cufe || '')}">
      <div class="lote-linea-info">
        <b>#${escapeHtml(String(f.item))} · ${escapeHtml(f.vendedorNombre || 'Sin nombre')}</b>
        <span class="lote-linea-saldo">Fact. ${escapeHtml(f.nroFactura || '')} · Saldo ${formatoMoneda(f.saldo)}</span>
      </div>
      <input type="number" step="0.01" min="0" class="lote-valor" value="${f.saldo}">
    </div>
  `).join('');

  el.formPagoLote.reset();
  el.lotePagoMensaje.textContent = '';
  el.lotePagoMensaje.className = 'form-mensaje';
  el.modalPagoLote.hidden = false;
}
function cerrarModalPagoLote() {
  el.modalPagoLote.hidden = true;
}
el.btnPagarSeleccionadas.addEventListener('click', abrirModalPagoLote);
el.btnCerrarPagoLote.addEventListener('click', cerrarModalPagoLote);

el.formPagoLote.addEventListener('submit', async (e) => {
  e.preventDefault();
  const lineas = [...el.loteLineas.querySelectorAll('.lote-linea')].map((div) => ({
    item: div.dataset.item,
    valor: div.querySelector('.lote-valor').value,
    cufe: div.dataset.cufe || '',
  }));
  const fd = new FormData(el.formPagoLote);
  quitarArchivoVacio(fd, el.formPagoLote, 'comprobante');
  fd.append('lineas', JSON.stringify(lineas));
  el.lotePagoMensaje.textContent = 'Guardando...';
  el.lotePagoMensaje.className = 'form-mensaje';
  try {
    const res = await fetch(URL_APLICAR_PAGO, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo guardar.');
    el.lotePagoMensaje.textContent = 'Pago del lote guardado correctamente.';
    el.lotePagoMensaje.className = 'form-mensaje ok';
    state.seleccionadas.clear();
    await cargarFacturas({ mantenerSeleccion: true });
    setTimeout(cerrarModalPagoLote, 1200);
  } catch (err) {
    console.error(err);
    el.lotePagoMensaje.textContent = err.message || 'Error de conexión.';
    el.lotePagoMensaje.className = 'form-mensaje error';
  }
});

el.btnAcercaHye.addEventListener('click', () => { el.modalAcerca.hidden = false; });
el.btnCerrarAcerca.addEventListener('click', () => { el.modalAcerca.hidden = true; });

async function cargarContabilidad() {
  el.contabResumen.textContent = 'Cargando...';
  el.contabLista.innerHTML = '';
  try {
    const res = await fetch(URL_CONTABILIDAD);
    const data = await res.json();
    state.contabilidad = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    state.contabilidad = [];
    el.contabResumen.textContent = 'No se pudo cargar la contabilización. Intenta de nuevo.';
    return;
  }
  renderContabilidad();
}

function renderContabilidad() {
  const texto = (el.contabBuscar.value || '').toLowerCase().trim();

  // El filtro por selección activa solo aplica mientras no haya una búsqueda manual escrita.
  const usandoFiltroActivo = !texto && !!state.contabFiltroActivoCufe;
  el.contabFiltroActivo.hidden = !usandoFiltroActivo;

  let items;
  if (usandoFiltroActivo) {
    items = state.contabilidad.filter((f) => f.cufe === state.contabFiltroActivoCufe);
  } else if (texto) {
    items = state.contabilidad.filter((f) => `${f.tercero || ''} ${f.nit || ''} ${f.numero || ''} ${f.prefijo || ''} ${f.cufe || ''}`.toLowerCase().includes(texto));
  } else {
    items = state.contabilidad;
  }

  const totalLineas = state.contabilidad.reduce((acc, f) => acc + (f.lineas ? f.lineas.length : 0), 0);
  el.contabResumen.textContent = `${state.contabilidad.length} factura${state.contabilidad.length === 1 ? '' : 's'} contabilizada${state.contabilidad.length === 1 ? '' : 's'} · ${totalLineas} línea${totalLineas === 1 ? '' : 's'}${(texto || usandoFiltroActivo) ? ` · mostrando ${items.length}` : ''}`;

  if (!items.length) {
    let mensajeVacio = 'Todavía no hay facturas contabilizadas. A medida que Pagos y el correo vayan procesando documentos, irán apareciendo aquí.';
    if (usandoFiltroActivo) mensajeVacio = 'La factura seleccionada todavía no está contabilizada. Ábrela y usa "Contabilizar ahora" en su pestaña de Contabilidad.';
    else if (texto) mensajeVacio = 'Ninguna factura contabilizada coincide con la búsqueda.';
    el.contabLista.innerHTML = `<div class="contab-vacio">${mensajeVacio}</div>`;
    el.contabPaginacion.hidden = true;
    return;
  }

  const totalPaginas = Math.max(1, Math.ceil(items.length / CONTAB_POR_PAGINA));
  if (state.contabPagina > totalPaginas) state.contabPagina = totalPaginas;
  if (state.contabPagina < 1) state.contabPagina = 1;
  const inicio = (state.contabPagina - 1) * CONTAB_POR_PAGINA;
  const itemsPagina = items.slice(inicio, inicio + CONTAB_POR_PAGINA);

  el.contabPaginacion.hidden = totalPaginas <= 1;
  el.contabPagTexto.textContent = `Página ${state.contabPagina} de ${totalPaginas}`;
  el.btnContabPagAnterior.disabled = state.contabPagina <= 1;
  el.btnContabPagSiguiente.disabled = state.contabPagina >= totalPaginas;

  el.contabLista.innerHTML = itemsPagina.map((f) => `
    <div class="contab-factura${itemsPagina.length === 1 ? ' abierta' : ''}">
      <div class="contab-factura-head">
        <span class="cf-doc">${escapeHtml(f.prefijo || '')}${escapeHtml(String(f.numero || ''))}</span>
        <span class="cf-tercero">${escapeHtml(f.tercero || 'Sin nombre')} · NIT ${escapeHtml(String(f.nit || ''))}</span>
        <span class="cf-meta">${escapeHtml(f.fecha || '')} · ${escapeHtml(String(f.totalLineas ?? (f.lineas ? f.lineas.length : 0)))} línea${(f.totalLineas ?? (f.lineas ? f.lineas.length : 0)) === 1 ? '' : 's'}${f.estadoCarga ? ` · ${escapeHtml(f.estadoCarga)}` : ''}</span>
        <span class="cf-flecha">›</span>
      </div>
      <div class="contab-lineas-wrap">
        <table class="contab-lineas">
          <thead><tr><th>Código PUC</th><th>Descripción</th><th class="num">Cant.</th><th class="num">Valor unit.</th></tr></thead>
          <tbody>
            ${(f.lineas || []).map((l) => `<tr><td class="codigo">${escapeHtml(l.codigoInventario || '')}</td><td>${escapeHtml(l.descripcion || '')}</td><td class="num">${escapeHtml(String(l.cantidad ?? ''))}</td><td class="num">${formatoMoneda2(l.valorUnitario)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `).join('');

  el.contabLista.querySelectorAll('.contab-factura-head').forEach((head) => {
    head.addEventListener('click', () => head.closest('.contab-factura').classList.toggle('abierta'));
  });
}

function abrirModalContabilidad() {
  el.modalContabilidad.hidden = false;
  el.contabBuscar.value = '';
  state.contabPagina = 1;

  const activa = state.itemActivo != null ? state.facturas.find((f) => String(f.item) === String(state.itemActivo)) : null;
  if (activa && activa.cufe) {
    state.contabFiltroActivoCufe = activa.cufe;
    el.contabFiltroActivoTexto.textContent = `#${activa.item} · ${activa.vendedorNombre || 'Sin nombre'} · Fact. ${activa.nroFactura || ''}`;
  } else {
    state.contabFiltroActivoCufe = null;
  }

  cargarContabilidad();
}
function cerrarModalContabilidad() {
  el.modalContabilidad.hidden = true;
}
el.btnVerContabilidad.addEventListener('click', abrirModalContabilidad);
el.btnCerrarContabilidad.addEventListener('click', cerrarModalContabilidad);
el.contabBuscar.addEventListener('input', () => { state.contabPagina = 1; renderContabilidad(); });
el.btnQuitarFiltroActivo.addEventListener('click', () => {
  state.contabFiltroActivoCufe = null;
  state.contabPagina = 1;
  renderContabilidad();
});
el.btnContabPagAnterior.addEventListener('click', () => { state.contabPagina -= 1; renderContabilidad(); });
el.btnContabPagSiguiente.addEventListener('click', () => { state.contabPagina += 1; renderContabilidad(); });

async function cargarPucCatalogoSiHaceFalta() {
  if (state.pucCatalogo) return state.pucCatalogo;
  try {
    const res = await fetch(URL_PUC_CATALOGO);
    state.pucCatalogo = await res.json();
  } catch (err) {
    console.error(err);
    state.pucCatalogo = [];
  }
  return state.pucCatalogo;
}

function opcionesPuc(seleccionado) {
  const catalogo = state.pucCatalogo || [];
  const opts = ['<option value="">-- Seleccione un código --</option>']
    .concat(catalogo.map((c) => `<option value="${escapeHtml(c.codigo)}" title="${escapeHtml(c.descripcion || '')}" ${String(c.codigo) === String(seleccionado) ? 'selected' : ''}>${escapeHtml(c.codigo)} · ${escapeHtml(c.nombre || '')}</option>`));
  return opts.join('');
}

async function cargarContabilidadFactura(factura) {
  state.contabFacturaCufe = factura.cufe || '';
  el.contabFacturaCargando.hidden = false;
  el.contabFacturaVacia.hidden = true;
  el.contabFacturaLista.hidden = true;
  el.contabilizarAhoraMensaje.textContent = '';
  el.contabilizarAhoraMensaje.className = 'form-mensaje';

  if (!factura.cufe) {
    el.contabFacturaCargando.hidden = true;
    el.contabFacturaVacia.hidden = false;
    el.btnContabilizarAhora.hidden = true;
    return;
  }
  el.btnContabilizarAhora.hidden = false;

  await cargarPucCatalogoSiHaceFalta();

  let data;
  try {
    const res = await fetch(`${URL_CONTABILIDAD_FACTURA}?cufe=${encodeURIComponent(factura.cufe)}`);
    data = await res.json();
  } catch (err) {
    console.error(err);
    el.contabFacturaCargando.textContent = 'No se pudo cargar la contabilización.';
    return;
  }

  // El usuario pudo haber cambiado de factura mientras esta respuesta llegaba.
  if (state.contabFacturaCufe !== factura.cufe) return;

  el.contabFacturaCargando.hidden = true;
  if (!data.encontrado || !data.lineas || !data.lineas.length) {
    el.contabFacturaVacia.hidden = false;
    return;
  }
  el.contabFacturaLista.hidden = false;
  renderContabLineasEditable(data);
}

function renderContabLineasEditable(data) {
  el.contabSelectTodas.innerHTML = opcionesPuc('');
  el.contabLineasBody.innerHTML = (data.lineas || []).map((l) => `
    <tr data-row-number="${escapeHtml(String(l.rowNumber))}">
      <td>${escapeHtml(l.descripcion || '')}</td>
      <td class="num">${escapeHtml(String(l.cantidad ?? ''))}</td>
      <td class="num">${formatoMoneda2(l.valorUnitario)}</td>
      <td><select class="contab-select-codigo" data-row-number="${escapeHtml(String(l.rowNumber))}">${opcionesPuc(l.codigoInventario)}</select></td>
    </tr>
  `).join('');
  el.contabGuardarMensaje.textContent = '';
  el.contabGuardarMensaje.className = 'form-mensaje';
}

el.btnContabilizarAhora.addEventListener('click', async () => {
  const cufe = state.contabFacturaCufe;
  if (!cufe) return;
  el.btnContabilizarAhora.disabled = true;
  el.contabilizarAhoraMensaje.textContent = 'Contabilizando... esto puede tardar 1 o 2 minutos, no cierres esta pestaña.';
  el.contabilizarAhoraMensaje.className = 'form-mensaje';
  try {
    const res = await fetch(URL_CONTABILIZAR_AHORA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cufe }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo contabilizar.');
    el.contabilizarAhoraMensaje.textContent = 'Contabilizada correctamente.';
    el.contabilizarAhoraMensaje.className = 'form-mensaje ok';
    const factura = state.facturas.find((f) => f.cufe === cufe);
    if (factura) {
      factura.contabilizado = true;
      await cargarContabilidadFactura(factura);
      render();
    }
  } catch (err) {
    console.error(err);
    el.contabilizarAhoraMensaje.textContent = err.message || 'Error de conexión.';
    el.contabilizarAhoraMensaje.className = 'form-mensaje error';
  } finally {
    el.btnContabilizarAhora.disabled = false;
  }
});

el.btnAplicarTodasCodigo.addEventListener('click', () => {
  const codigo = el.contabSelectTodas.value;
  if (!codigo) return;
  el.contabLineasBody.querySelectorAll('.contab-select-codigo').forEach((sel) => {
    sel.value = codigo;
    sel.classList.add('cambiado');
  });
});

el.btnGuardarCodigos.addEventListener('click', async () => {
  const cufe = state.contabFacturaCufe;
  if (!cufe) return;
  const lineas = [...el.contabLineasBody.querySelectorAll('.contab-select-codigo')]
    .map((sel) => ({ rowNumber: sel.dataset.rowNumber, codigo: sel.value }))
    .filter((l) => l.codigo);
  if (!lineas.length) {
    el.contabGuardarMensaje.textContent = 'Selecciona al menos un código.';
    el.contabGuardarMensaje.className = 'form-mensaje error';
    return;
  }
  el.contabGuardarMensaje.textContent = 'Guardando...';
  el.contabGuardarMensaje.className = 'form-mensaje';
  try {
    const res = await fetch(URL_CORREGIR_CODIGO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cufe, lineas }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo guardar.');
    el.contabGuardarMensaje.textContent = 'Códigos guardados correctamente.';
    el.contabGuardarMensaje.className = 'form-mensaje ok';
  } catch (err) {
    console.error(err);
    el.contabGuardarMensaje.textContent = err.message || 'Error de conexión.';
    el.contabGuardarMensaje.className = 'form-mensaje error';
  }
});

cargarFacturas();
