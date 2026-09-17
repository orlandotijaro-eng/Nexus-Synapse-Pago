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

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const METODOS_PAGO = ['Crédito', 'Efectivo', 'Banco Av Villas', 'Banco Davivienda', 'TD Av Villas', 'NEQUI_LE'];
const METODO_LABELS = { NEQUI_LE: 'Nequi (L.E)' };
function labelMetodo(m) { return METODO_LABELS[m] || m; }

const state = { facturas: [], filtroTexto: '', filtroEstado: 'todas', filtroMes: 'todos', filtroCredito: false, filtroMetodo: 'todos', filtroTipoDocumento: 'todos', itemActivo: null, ordenarPor: 'item', ordenDireccion: -1, seleccionadas: new Set() };

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
  formEditar: document.getElementById('form-editar'),
  editCufe: document.getElementById('edit-cufe'),
  editarMensaje: document.getElementById('editar-mensaje'),

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
    return va.localeCompare(vb) * dir;
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
  el.detTotal.textContent = formatoMoneda(factura.total);
  el.detConcepto.textContent = factura.concepto || factura.servicioOCompra || '';
  if (el.detSaldo) {
    el.detSaldo.textContent = formatoMoneda(factura.saldo);
    el.detAbonado.textContent = formatoMoneda(factura.abonado) + (factura.cantidadAbonos ? ` (${factura.cantidadAbonos} abono${factura.cantidadAbonos === 1 ? '' : 's'})` : '');
  }

  if (factura.abonado > 0) {
    el.detPagoAplicado.hidden = false;
    el.detPagoForma.textContent = factura.seleccionFormaPago ? labelMetodo(factura.seleccionFormaPago) : '—';
    el.detPagoIca.textContent = factura.tarifaIcaAplicada || '—';
    el.detPagoRetencion.textContent = [factura.retencionFuenteTipo, factura.tarifaRetencionAplicada].filter(Boolean).join(' · ') || '—';
    el.detPagoValor.textContent = formatoMoneda(factura.abonado);
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
  el.formPago.elements.valorPagado.value = factura.saldo || 0;
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

  if (forzarTab) activarTab(tabInicial);
}

async function cargarAbonosFactura(item) {
  el.detAbonosWrap.hidden = true;
  el.detAbonosLista.innerHTML = '';
  try {
    const res = await fetch(`${URL_LISTAR_ABONOS}?item=${encodeURIComponent(item)}`);
    if (!res.ok) return;
    const abonos = await res.json();
    if (!Array.isArray(abonos) || !abonos.length) return;
    el.detAbonosWrap.hidden = false;
    el.detAbonosLista.innerHTML = abonos.map((a) => `
      <div class="abono-fila ${a.anulado ? 'anulado' : ''}" data-id="${escapeHtml(String(a.idAbono))}">
        <div class="abono-info">
          <b>${formatoMoneda(a.valorAbonado)} · ${escapeHtml(labelMetodo(a.formaDePago) || 'Sin forma de pago')}</b>
          <span>${escapeHtml(a.fecha || '')}${a.anulado ? ' · ANULADO' : ''}</span>
        </div>
        <div class="abono-acciones">
          ${a.driveLinkComprobante ? `<a href="${a.driveLinkComprobante}" target="_blank" rel="noopener" class="btn btn-secundario">Ver soporte</a>` : ''}
          ${!a.anulado ? `<button type="button" class="btn btn-peligro btn-anular-abono" data-id="${escapeHtml(String(a.idAbono))}">Anular</button>` : ''}
        </div>
      </div>
    `).join('');
    el.detAbonosLista.querySelectorAll('.btn-anular-abono').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Anular este abono? El saldo de la factura vuelve a subir.')) return;
        btn.disabled = true;
        try {
          const res = await fetch(URL_ANULAR_ABONO, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idAbono: btn.dataset.id }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo anular.');
          await cargarFacturas({ mantenerSeleccion: true });
          await cargarAbonosFactura(item);
        } catch (err) {
          console.error(err);
          alert(err.message || 'Error de conexión.');
          btn.disabled = false;
        }
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
  fd.append('lineas', JSON.stringify([{ item: factura.item, valor: valorPagado, cufe: factura.cufe || '' }]));
  el.btnGuardarPago.disabled = true;
  el.formMensaje.textContent = 'Guardando...';
  el.formMensaje.className = 'form-mensaje';
  try {
    const res = await fetch(URL_APLICAR_PAGO, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    el.formMensaje.textContent = 'Pago aplicado correctamente.';
    el.formMensaje.className = 'form-mensaje ok';
    await cargarFacturas({ mantenerSeleccion: true });
  } catch (err) {
    console.error(err);
    el.formMensaje.textContent = 'No se pudo guardar el pago. Intenta de nuevo.';
    el.formMensaje.className = 'form-mensaje error';
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
      state.ordenDireccion = campo === 'item' ? -1 : 1;
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

cargarFacturas();
