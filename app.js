const API_BASE = 'https://n8n-kt6h.n8n.nexuscbs.com/webhook';
const URL_LISTAR = `${API_BASE}/hye-facturas`;
const URL_APLICAR_PAGO = `${API_BASE}/hye-aplicar-pago`;
const URL_CARGAR_DOCUMENTO = `${API_BASE}/hye-cargar-documento`;
const URL_EDITAR_FACTURA = `${API_BASE}/hye-editar-factura`;

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const state = { facturas: [], filtroTexto: '', filtroEstado: 'todas', filtroMes: 'todos', filtroCredito: false, filtroMetodo: 'todos', itemActivo: null, ordenarPor: 'item', ordenDireccion: -1 };

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
  btnRefrescar: document.getElementById('btn-refrescar'),
  inputZipDoc: document.getElementById('input-zip-doc'),
  zipMensaje: document.getElementById('zip-mensaje'),

  detalleVacio: document.getElementById('detalle-vacio'),
  panelDetalle: document.getElementById('panel-detalle'),
  detProveedor: document.getElementById('det-proveedor'),
  detMeta: document.getElementById('det-meta'),
  detBadgeEstado: document.getElementById('det-badge-estado'),
  detBadgeCredito: document.getElementById('det-badge-credito'),
  detBase: document.getElementById('det-base'),
  detIva: document.getElementById('det-iva'),
  detRetenciones: document.getElementById('det-retenciones'),
  detTotal: document.getElementById('det-total'),
  detConcepto: document.getElementById('det-concepto'),
  detPagoAplicado: document.getElementById('det-pago-aplicado'),
  detPagoForma: document.getElementById('det-pago-forma'),
  detPagoIca: document.getElementById('det-pago-ica'),
  detPagoRetencion: document.getElementById('det-pago-retencion'),
  detPagoValor: document.getElementById('det-pago-valor'),
  linkComprobante: document.getElementById('link-comprobante'),
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
  const metodos = [...new Set(state.facturas.map((f) => f.seleccionFormaPago).filter(Boolean))].sort();
  const actual = el.filtroMetodo.value;
  el.filtroMetodo.innerHTML = '<option value="todos">Método de pago</option>' +
    '<option value="__pendiente">Pendientes de pago</option>' +
    metodos.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
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

function render() {
  const items = facturasFiltradas();
  el.tablaBody.innerHTML = '';
  const hayItems = items.length !== 0;
  el.estadoVacio.hidden = hayItems;
  el.tabla.hidden = !hayItems;
  actualizarFlechasOrden();

  const totalMonto = items.reduce((acc, f) => acc + (Number(f.total) || 0), 0);
  const pagadas = items.filter((f) => f.pagado).length;
  el.resumenBar.innerHTML = `${items.length} factura${items.length === 1 ? '' : 's'} · <b>${formatoMoneda(totalMonto)}</b> · ${pagadas} pagadas / ${items.length - pagadas} pendientes`;

  for (const f of items) {
    const tr = document.createElement('tr');
    tr.className = 'item-factura ' + claseMetodo(f.seleccionFormaPago) + (f.esCredito ? ' credito' : '') + (String(f.item) === String(state.itemActivo) ? ' activo' : '');
    tr.innerHTML = `
      <td>#${escapeHtml(String(f.item || '?'))}</td>
      <td>${escapeHtml(f.fechaEmision || '')}</td>
      <td class="wrap"><span class="item-proveedor">${escapeHtml(f.vendedorNombre || 'Sin nombre')}</span><br><span class="item-nit">NIT ${escapeHtml(String(f.vendedorNit || ''))} · ${escapeHtml(f.nroFactura || '')}</span></td>
      <td class="wrap">${escapeHtml(f.concepto || f.servicioOCompra || '')}</td>
      <td class="num">${formatoMoneda(f.base)}</td>
      <td class="num">${formatoMoneda(f.iva)}</td>
      <td class="num">${formatoMoneda(f.total)}</td>
      <td class="col-adjunto" title="${f.drivePdf ? 'Documento archivado' : 'Sin documento archivado'}">
        <span class="icono-adjunto${f.drivePdf ? ' tiene' : ''}">📎</span>
      </td>
      <td>${f.esCredito ? '<span class="badge-credito">Crédito</span>' : '<span class="badge-contado">Contado</span>'}</td>
      <td><span class="badge-metodo${f.seleccionFormaPago ? '' : ' vacio'}">${escapeHtml(f.seleccionFormaPago || 'Pendiente')}</span></td>
      <td><span class="badge ${f.pagado ? 'pagado' : 'pendiente'}">${f.pagado ? 'Pagada' : 'Pendiente'}</span></td>
      <td><button type="button" class="btn-pagar ${f.pagado ? 'ver' : ''}" data-item="${escapeHtml(String(f.item))}">${f.pagado ? 'Ver pago' : 'Pagar'}</button></td>`;
    tr.addEventListener('click', () => mostrarDetalle(f, { forzarTab: true, tabInicial: 'detalle' }));
    tr.querySelector('.btn-pagar').addEventListener('click', (e) => {
      e.stopPropagation();
      mostrarDetalle(f, { forzarTab: true, tabInicial: f.pagado ? 'detalle' : 'pago' });
    });
    el.tablaBody.appendChild(tr);
  }
}

function mostrarDetalle(factura, { forzarTab, tabInicial = 'detalle' }) {
  state.itemActivo = factura.item;
  render();

  el.detalleVacio.hidden = true;
  el.panelDetalle.hidden = false;
  el.resizer.hidden = false;

  el.detProveedor.textContent = factura.vendedorNombre || 'Proveedor sin nombre';
  el.detMeta.textContent = `Item #${factura.item || '?'} · NIT ${factura.vendedorNit || ''} · Fact. ${factura.nroFactura || ''} · ${factura.fechaEmision || ''}`;
  el.detBadgeEstado.textContent = factura.pagado ? 'Pagada' : 'Pendiente';
  el.detBadgeEstado.className = 'badge ' + (factura.pagado ? 'pagado' : 'pendiente');
  el.detBadgeCredito.hidden = !factura.esCredito;

  el.detBase.textContent = formatoMoneda(factura.base);
  el.detIva.textContent = formatoMoneda(factura.iva);
  el.detRetenciones.textContent = formatoMoneda(factura.retenciones);
  el.detTotal.textContent = formatoMoneda(factura.total);
  el.detConcepto.textContent = factura.concepto || factura.servicioOCompra || '';

  if (factura.pagado) {
    el.detPagoAplicado.hidden = false;
    el.detPagoForma.textContent = factura.seleccionFormaPago || '—';
    el.detPagoIca.textContent = factura.tarifaIcaAplicada || '—';
    el.detPagoRetencion.textContent = [factura.retencionFuenteTipo, factura.tarifaRetencionAplicada].filter(Boolean).join(' · ') || '—';
    el.detPagoValor.textContent = formatoMoneda(factura.valorPagado);
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

  if (forzarTab) activarTab(tabInicial);
}

function activarTab(nombre) {
  el.tabBtns.forEach((b) => b.classList.toggle('active', b.dataset.tab === nombre));
  el.tabDetalle.classList.toggle('active', nombre === 'detalle');
  el.tabPago.classList.toggle('active', nombre === 'pago');
  el.tabDocumento.classList.toggle('active', nombre === 'documento');
  el.tabEditar.classList.toggle('active', nombre === 'editar');
}

async function enviarPago(e) {
  e.preventDefault();
  if (!state.itemActivo) return;
  const factura = state.facturas.find((f) => String(f.item) === String(state.itemActivo));
  if (!factura) return;
  const fd = new FormData(el.formPago);
  fd.append('item', factura.item);
  fd.append('cufe', factura.cufe || '');
  fd.append('anio', factura.anioEmision || '');
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
    el.panelDetalle.style.flexBasis = clamped + '%';
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

async function subirUnZip(archivo) {
  const fd = new FormData();
  fd.append('comprobante', archivo);
  try {
    const res = await fetch(URL_CARGAR_DOCUMENTO, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      return { ok: false, mensaje: data.mensaje || 'No se pudo procesar.' };
    }
    return { ok: true, mensaje: data.mensaje || 'Archivado correctamente.' };
  } catch (err) {
    console.error(err);
    return { ok: false, mensaje: 'Error de conexión.' };
  }
}

el.inputZipDoc.addEventListener('change', async (e) => {
  const archivos = Array.from(e.target.files || []);
  if (!archivos.length) return;

  const errores = [];
  let exitosos = 0;

  for (let i = 0; i < archivos.length; i++) {
    const archivo = archivos[i];
    mostrarMensajeZip(`Procesando ${i + 1} de ${archivos.length}: ${archivo.name}...`, '');
    const resultado = await subirUnZip(archivo);
    if (resultado.ok) {
      exitosos++;
    } else {
      errores.push(`${archivo.name}: ${resultado.mensaje}`);
    }
  }

  e.target.value = '';
  await cargarFacturas({ mantenerSeleccion: true });

  if (errores.length === 0) {
    mostrarMensajeZip(`Listo: ${exitosos} de ${archivos.length} documentos archivados correctamente.`, 'ok');
  } else {
    mostrarMensajeZip(`${exitosos} de ${archivos.length} archivados. Con problema: ${errores.join(' · ')}`, 'error');
  }
  setTimeout(() => { el.zipMensaje.hidden = true; }, errores.length ? 15000 : 8000);
});

cargarFacturas();
