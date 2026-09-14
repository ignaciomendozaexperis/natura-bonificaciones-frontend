import { useState } from 'react';
import {
  PlusCircle,
  Upload,
  Code2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

/* ------------------------------------------------------------------ */
/* Catalogos del modelo                                               */
/* ------------------------------------------------------------------ */

const PAISES = ['Chile', 'Argentina'];
const MODALIDADES = ['Único', 'Seriado'];
const TIPOS_DESCUENTO = ['Porcentaje', 'Monto Fijo'];
const OPCIONES_SI_NO = ['No', 'Sí'];
const APLICA_A = [
  'Todo el catálogo',
  'Categoría o landing',
  'SKUs específicos',
  'Condición de costo',
];
const GRUPOS_CLIENTES = [
  'Clientes nuevos',
  'Clientes recurrentes',
  'Consultoras activas',
  'Programa fidelidad',
];

const FORM_INICIAL = {
  // 1. Origen
  solicitante: '',
  pais: PAISES[0],
  modalidad: MODALIDADES[0],
  codigo: '',
  // 2. Beneficio
  tipoDescuento: TIPOS_DESCUENTO[0],
  valor: '',
  tieneTope: 'No',
  topeMaximo: '',
  tieneMinimo: 'No',
  montoMinimo: '',
  // 3. Alcance
  aplicaA: APLICA_A[0],
  targetDetalle: '',
  categoriaExcluir: '',
  // 4. Vigencia y clientes
  fechaInicio: '',
  fechaFin: '',
  grupoExiste: 'No',
  grupoClientes: GRUPOS_CLIENTES[0],
  listaEmails: '',
};

/* ------------------------------------------------------------------ */
/* Helpers de formato                                                 */
/* ------------------------------------------------------------------ */

// Quita tildes/diacriticos para que el payload de salida sea ASCII-safe
const stripAccents = (str) =>
  String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const formatMonto = (monto) => `$${Number(monto).toLocaleString('es-CL')}`;

// El dato se guarda crudo (numero). Los simbolos son solo de presentacion.
const formatValorDisplay = (tipoDescuento, valor) =>
  tipoDescuento === 'Porcentaje' ? `${valor}%` : formatMonto(valor);

const formatTopeDisplay = (topeMaximo) =>
  topeMaximo === null ? 'Sin tope' : formatMonto(topeMaximo);

// Payload para la API: numeros sin simbolos y textos sin tildes
const limpiarValor = (valor) => {
  if (typeof valor === 'string') return stripAccents(valor);
  if (Array.isArray(valor)) return valor.map(limpiarValor);
  return valor;
};

const toApiCoupon = (cupon) =>
  Object.fromEntries(
    Object.entries(cupon).map(([clave, valor]) => [clave, limpiarValor(valor)]),
  );

const nextCouponId = (count) => `CUP-${String(count + 1).padStart(3, '0')}`;

const parseEmails = (texto) =>
  String(texto || '')
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

/* ------------------------------------------------------------------ */
/* Datos de prueba (ficticios)                                        */
/* ------------------------------------------------------------------ */

const MOCK_COUPONS = [
  {
    id: 'CUP-001',
    solicitante: 'Camila Duarte',
    pais: 'Chile',
    modalidad: 'Seriado',
    codigo: 'VERANO2026',
    tipoDescuento: 'Porcentaje',
    valor: 20,
    tieneTope: true,
    topeMaximo: 15000,
    tieneMinimo: true,
    montoMinimo: 30000,
    aplicaA: 'Categoría o landing',
    targetDetalle: 'Landing Verano',
    categoriaExcluir: 'Set de regalo',
    fechaInicio: '2026-01-05',
    fechaFin: '2026-02-28',
    grupoExiste: true,
    grupoClientes: 'Clientes recurrentes',
    listaEmails: [],
    estado: 'Activo',
  },
  {
    id: 'CUP-002',
    solicitante: 'Rodrigo Nuñez',
    pais: 'Argentina',
    modalidad: 'Único',
    codigo: 'BIENVENIDA10',
    tipoDescuento: 'Monto Fijo',
    valor: 10000,
    tieneTope: false,
    topeMaximo: null,
    tieneMinimo: false,
    montoMinimo: null,
    aplicaA: 'Todo el catálogo',
    targetDetalle: null,
    categoriaExcluir: null,
    fechaInicio: '2026-03-01',
    fechaFin: '2026-03-31',
    grupoExiste: false,
    grupoClientes: null,
    listaEmails: ['prueba.uno@ejemplo.com', 'prueba.dos@ejemplo.com'],
    estado: 'Activo',
  },
];

/* ------------------------------------------------------------------ */
/* Subcomponentes de formulario                                       */
/* ------------------------------------------------------------------ */

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

function Seccion({ numero, titulo, children }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
      <legend className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
          {numero}
        </span>
        {titulo}
      </legend>
      {children}
    </fieldset>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectCampo({ label, value, onChange, options }) {
  return (
    <Campo label={label}>
      <select value={value} onChange={onChange} className={INPUT_CLASS}>
        {options.map((opcion) => (
          <option key={opcion}>{opcion}</option>
        ))}
      </select>
    </Campo>
  );
}

/* ------------------------------------------------------------------ */
/* Componente principal                                               */
/* ------------------------------------------------------------------ */

export default function PromotionsManager() {
  const [mode, setMode] = useState('individual');
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [form, setForm] = useState(FORM_INICIAL);
  const [formError, setFormError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [jsonOpen, setJsonOpen] = useState(false);

  const setCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const mostrarTope = form.tieneTope === 'Sí';
  const mostrarMinimo = form.tieneMinimo === 'Sí';
  const mostrarTarget = form.aplicaA !== 'Todo el catálogo';
  const usaGrupoExistente = form.grupoExiste === 'Sí';

  /* ---------------- Carga individual ---------------- */

  function handleIndividualSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const codigo = form.codigo.trim().toUpperCase();
    if (coupons.some((c) => c.codigo.toUpperCase() === codigo)) {
      setFormError(`El código ${codigo} ya está registrado.`);
      return;
    }
    if (form.fechaFin && form.fechaInicio && form.fechaFin < form.fechaInicio) {
      setFormError('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    const nuevoCupon = {
      id: nextCouponId(coupons.length),
      solicitante: form.solicitante.trim(),
      pais: form.pais,
      modalidad: form.modalidad,
      codigo,
      tipoDescuento: form.tipoDescuento,
      valor: Number(form.valor),
      tieneTope: mostrarTope,
      topeMaximo:
        mostrarTope && form.topeMaximo ? Number(form.topeMaximo) : null,
      tieneMinimo: mostrarMinimo,
      montoMinimo:
        mostrarMinimo && form.montoMinimo ? Number(form.montoMinimo) : null,
      aplicaA: form.aplicaA,
      targetDetalle: mostrarTarget ? form.targetDetalle.trim() : null,
      categoriaExcluir: form.categoriaExcluir.trim() || null,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      grupoExiste: usaGrupoExistente,
      grupoClientes: usaGrupoExistente ? form.grupoClientes : null,
      listaEmails: usaGrupoExistente ? [] : parseEmails(form.listaEmails),
      estado: 'Activo',
    };

    setCoupons((prev) => [nuevoCupon, ...prev]);
    setForm(FORM_INICIAL);
  }

  /* ---------------- Carga colectiva ---------------- */

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onerror = () => {
      setUploadResult({
        ok: false,
        texto: 'No se pudo leer el archivo. Intenta nuevamente.',
        detalles: [],
      });
    };

    reader.onload = (evt) => {
      try {
        // cellDates deja las fechas como Date en vez de seriales de Excel
        const wb = XLSX.read(evt.target.result, {
          type: 'array',
          cellDates: true,
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: null });

        if (!data || data.length === 0) {
          setUploadResult({
            ok: false,
            texto: 'El archivo está vacío o no tiene filas válidas.',
            detalles: [],
          });
          return;
        }

        // Normaliza cabeceras: sin tildes, sin espacios, minusculas
        const cleanStr = (str) =>
          String(str ?? '')
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        const parseNumero = (raw) =>
          parseFloat(String(raw).replace(/[^0-9.-]/g, ''));

        // Devuelve la clave de la primera cabecera candidata con contenido util.
        // `predicado` permite exigir, por ejemplo, que la celda sea numerica.
        const buscarClave = (row, candidatas, predicado) => {
          const keys = Object.keys(row);
          for (const candidata of candidatas) {
            const candClean = cleanStr(candidata);
            for (const key of keys) {
              const keyClean = cleanStr(key);
              const matchea =
                keyClean === candClean ||
                keyClean.includes(candClean) ||
                candClean.includes(keyClean);
              if (!matchea) continue;

              const raw = row[key];
              if (raw === null || raw === undefined) continue;
              if (!(raw instanceof Date) && String(raw).trim() === '') continue;
              if (predicado && !predicado(raw)) continue;

              return key;
            }
          }
          return null;
        };

        const getTexto = (row, candidatas) => {
          const key = buscarClave(row, candidatas);
          return key ? String(row[key]).trim() : null;
        };

        // Solo celdas numericas: evita confundir "Tipo Descuento" (texto)
        // con la columna del valor del descuento.
        const getNumero = (row, candidatas) => {
          const key = buscarClave(
            row,
            candidatas,
            (raw) => !isNaN(parseNumero(raw)),
          );
          return key ? parseNumero(row[key]) : null;
        };

        // SheetJS alinea las fechas a medianoche UTC, pero la conversion del
        // serial de Excel puede desviarse unos segundos (ej: 23:59:59 del dia
        // anterior). Se redondea al dia mas cercano antes de formatear.
        const MS_POR_DIA = 86400000;
        const getFecha = (row, candidatas) => {
          const key = buscarClave(row, candidatas);
          if (!key) return '';

          const valor = row[key];
          const fecha = valor instanceof Date ? valor : new Date(valor);
          if (isNaN(fecha.getTime())) return '';

          const redondeada = new Date(
            Math.round(fecha.getTime() / MS_POR_DIA) * MS_POR_DIA,
          );
          return redondeada.toISOString().slice(0, 10);
        };

        const esMontoFijo = (tipo) =>
          cleanStr(tipo).includes('monto') || cleanStr(tipo).includes('fijo');

        // Textos que no representan un codigo real de cupon
        const PLACEHOLDERS = [
          'na',
          'n',
          'sincodigo',
          'sincupon',
          'ninguno',
          'null',
        ];
        const esCodigoValido = (codigo) => {
          const limpio = cleanStr(codigo);
          return limpio.length > 0 && !PLACEHOLDERS.includes(limpio);
        };

        const parseValor = (row, tipo) => {
          const montoFijo = esMontoFijo(tipo);
          let numero = getNumero(row, [
            'porcentajedescuento',
            'valor',
            'descuento',
            'monto',
            'montofijo',
          ]);

          // Monto fijo sin columna propia: el tope ES el monto del descuento
          if (numero === null && montoFijo) {
            numero = getNumero(row, ['topemaximo', 'tope', 'monto']);
          }
          if (numero === null) return 0;

          // Excel guarda los porcentajes como fraccion: 0.15 -> 15
          if (!montoFijo && numero > 0 && numero <= 1) {
            return Math.round(numero * 100);
          }
          return numero;
        };

        // Se dedupica dentro del updater para no leer un `coupons` desactualizado
        setCoupons((prev) => {
          const existentes = new Set(prev.map((c) => c.codigo.toUpperCase()));
          const nuevos = [];
          const rechazos = [];

          data.forEach((row, indice) => {
            // +2: la fila 1 del Excel es la cabecera y sheet_to_json es 0-based
            const fila = indice + 2;

            // 1. Las promociones automaticas no llevan cupon: se omiten
            if (cleanStr(getTexto(row, ['mecanica'])) === 'promocion') return;

            // 2. Solo filas con un codigo de cupon real
            const codigo = getTexto(row, [
              'codigocupon',
              'codigo',
              'cupon',
              'code',
            ]);
            if (!codigo || !esCodigoValido(codigo)) return;

            // 3. Sin duplicados (ni contra la tabla ni dentro del mismo archivo)
            const codigoUpper = codigo.toUpperCase();
            if (existentes.has(codigoUpper)) return;

            // 4. Solicitante y pais son obligatorios: si faltan se rechaza la
            // fila en vez de asumir un valor por defecto que podria ser erroneo
            const solicitante = getTexto(row, [
              'solicitante',
              'responsable',
              'area',
            ]);
            if (!solicitante) {
              rechazos.push(`Fila ${fila} (${codigoUpper}): falta el solicitante.`);
              return;
            }

            const paisArchivo = getTexto(row, ['pais', 'country']);
            const pais = PAISES.find(
              (p) => cleanStr(p) === cleanStr(paisArchivo),
            );
            if (!pais) {
              rechazos.push(
                paisArchivo
                  ? `Fila ${fila} (${codigoUpper}): país "${paisArchivo}" no reconocido.`
                  : `Fila ${fila} (${codigoUpper}): falta el país.`,
              );
              return;
            }

            existentes.add(codigoUpper);

            const tipo =
              getTexto(row, ['tipodescuento', 'tipo', 'mecanica']) ||
              'Porcentaje';
            const topeMaximo = getNumero(row, ['topemaximo', 'tope']);
            const montoMinimo = getNumero(row, [
              'montominimo',
              'minimo',
              'compraminima',
            ]);
            const modalidadArchivo = getTexto(row, ['modalidad']);

            nuevos.push({
              id: nextCouponId(prev.length + nuevos.length),
              solicitante,
              pais,
              modalidad:
                cleanStr(modalidadArchivo) === 'seriado' ? 'Seriado' : 'Único',
              codigo: codigoUpper,
              tipoDescuento: esMontoFijo(tipo) ? 'Monto Fijo' : 'Porcentaje',
              valor: parseValor(row, tipo),
              tieneTope: topeMaximo !== null,
              topeMaximo,
              tieneMinimo: montoMinimo !== null,
              montoMinimo,
              aplicaA: getTexto(row, ['aplicaa', 'alcance']) || APLICA_A[0],
              targetDetalle: getTexto(row, [
                'targetdetalle',
                'target',
                'categoria',
                'sku',
              ]),
              categoriaExcluir: getTexto(row, ['categoriaexcluir', 'excluir']),
              fechaInicio: getFecha(row, ['fechainicio', 'inicio', 'desde']),
              fechaFin: getFecha(row, ['fechafin', 'fin', 'hasta']),
              grupoExiste: false,
              grupoClientes: null,
              listaEmails: [],
              estado: 'Activo',
            });
          });

          setUploadResult({
            ok: nuevos.length > 0 && rechazos.length === 0,
            texto:
              nuevos.length > 0
                ? `Se importaron ${nuevos.length} cupones.`
                : 'No se importó ningún cupón.',
            detalles: rechazos,
          });

          return nuevos.length > 0 ? [...nuevos, ...prev] : prev;
        });
      } catch (err) {
        console.error('Error al procesar archivo:', err);
        setUploadResult({
          ok: false,
          texto: 'Error al leer el archivo. Asegúrate de que sea .xlsx, .xls o .csv',
          detalles: [],
        });
      }
    };

    reader.readAsArrayBuffer(file);

    // Permite volver a cargar el mismo archivo si el usuario reintenta
    e.target.value = '';
  }

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Gestor de Cupones
        </h1>
        <p className="text-sm text-slate-500">
          Carga individual y masiva de cupones de descuento.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setMode('individual')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'individual'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PlusCircle size={16} /> Carga Individual (18 Campos)
        </button>
        <button
          onClick={() => setMode('colectivo')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'colectivo'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Upload size={16} /> Carga Colectiva (Excel/CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-1">
          {mode === 'individual' ? (
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <Seccion numero="1" titulo="Origen">
                <Campo label="Solicitante">
                  <input
                    required
                    value={form.solicitante}
                    onChange={setCampo('solicitante')}
                    placeholder="Ej: Camila Duarte"
                    className={INPUT_CLASS}
                  />
                </Campo>
                <SelectCampo
                  label="País"
                  value={form.pais}
                  onChange={setCampo('pais')}
                  options={PAISES}
                />
                <SelectCampo
                  label="Modalidad"
                  value={form.modalidad}
                  onChange={setCampo('modalidad')}
                  options={MODALIDADES}
                />
                <Campo label="Código del cupón">
                  <input
                    required
                    value={form.codigo}
                    onChange={setCampo('codigo')}
                    placeholder="Ej: BDAY2026"
                    className={`${INPUT_CLASS} font-mono uppercase`}
                  />
                </Campo>
              </Seccion>

              <Seccion numero="2" titulo="Beneficio">
                <SelectCampo
                  label="Tipo de descuento"
                  value={form.tipoDescuento}
                  onChange={setCampo('tipoDescuento')}
                  options={TIPOS_DESCUENTO}
                />
                <Campo
                  label={
                    form.tipoDescuento === 'Porcentaje'
                      ? 'Valor (%)'
                      : 'Valor ($)'
                  }
                >
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.valor}
                    onChange={setCampo('valor')}
                    placeholder={
                      form.tipoDescuento === 'Porcentaje' ? 'Ej: 15' : 'Ej: 5000'
                    }
                    className={INPUT_CLASS}
                  />
                </Campo>
                <SelectCampo
                  label="¿Tiene tope máximo?"
                  value={form.tieneTope}
                  onChange={setCampo('tieneTope')}
                  options={OPCIONES_SI_NO}
                />
                {mostrarTope && (
                  <Campo label="Tope máximo ($)">
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.topeMaximo}
                      onChange={setCampo('topeMaximo')}
                      placeholder="Ej: 15000"
                      className={INPUT_CLASS}
                    />
                  </Campo>
                )}
                <SelectCampo
                  label="¿Tiene monto mínimo de compra?"
                  value={form.tieneMinimo}
                  onChange={setCampo('tieneMinimo')}
                  options={OPCIONES_SI_NO}
                />
                {mostrarMinimo && (
                  <Campo label="Monto mínimo ($)">
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.montoMinimo}
                      onChange={setCampo('montoMinimo')}
                      placeholder="Ej: 30000"
                      className={INPUT_CLASS}
                    />
                  </Campo>
                )}
              </Seccion>

              <Seccion numero="3" titulo="Alcance">
                <SelectCampo
                  label="Aplica a"
                  value={form.aplicaA}
                  onChange={setCampo('aplicaA')}
                  options={APLICA_A}
                />
                {mostrarTarget && (
                  <Campo label={`Detalle de ${form.aplicaA.toLowerCase()}`}>
                    <input
                      required
                      value={form.targetDetalle}
                      onChange={setCampo('targetDetalle')}
                      placeholder="Ej: Landing Verano / SKU-1234"
                      className={INPUT_CLASS}
                    />
                  </Campo>
                )}
                <Campo label="Categoría a excluir (opcional)">
                  <input
                    value={form.categoriaExcluir}
                    onChange={setCampo('categoriaExcluir')}
                    placeholder="Ej: Set de regalo"
                    className={INPUT_CLASS}
                  />
                </Campo>
              </Seccion>

              <Seccion numero="4" titulo="Vigencia y clientes">
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Fecha inicio">
                    <input
                      required
                      type="date"
                      value={form.fechaInicio}
                      onChange={setCampo('fechaInicio')}
                      className={INPUT_CLASS}
                    />
                  </Campo>
                  <Campo label="Fecha fin">
                    <input
                      required
                      type="date"
                      value={form.fechaFin}
                      onChange={setCampo('fechaFin')}
                      className={INPUT_CLASS}
                    />
                  </Campo>
                </div>
                <SelectCampo
                  label="¿El grupo de clientes ya existe?"
                  value={form.grupoExiste}
                  onChange={setCampo('grupoExiste')}
                  options={OPCIONES_SI_NO}
                />
                {usaGrupoExistente ? (
                  <SelectCampo
                    label="Grupo de clientes"
                    value={form.grupoClientes}
                    onChange={setCampo('grupoClientes')}
                    options={GRUPOS_CLIENTES}
                  />
                ) : (
                  <Campo label="Lista de correos">
                    <textarea
                      rows={3}
                      value={form.listaEmails}
                      onChange={setCampo('listaEmails')}
                      placeholder="Separa los correos por coma o salto de línea"
                      className={INPUT_CLASS}
                    />
                  </Campo>
                )}
              </Seccion>

              {formError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  <AlertCircle size={16} className="mt-px shrink-0" />
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Guardar cupón
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">
                Carga masiva de archivo
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50">
                <FileSpreadsheet className="mb-2 text-indigo-600" size={32} />
                <p className="text-xs font-medium text-slate-700">
                  Selecciona tu Excel (.xlsx) o CSV
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Haz clic aquí para examinar archivos
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
                Se omiten las promociones automáticas sin código y los cupones
                ya registrados. Cada fila debe indicar su solicitante y su país
                (Chile o Argentina); si falta alguno, la fila se rechaza.
              </p>
              {uploadResult && (
                <div
                  className={`rounded-lg p-3 text-xs ${
                    uploadResult.ok
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <p className="flex items-start gap-2 font-medium">
                    {uploadResult.ok ? (
                      <CheckCircle2 size={16} className="mt-px shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="mt-px shrink-0" />
                    )}
                    {uploadResult.texto}
                  </p>
                  {uploadResult.detalles.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-8">
                      {uploadResult.detalles.slice(0, 8).map((detalle) => (
                        <li key={detalle}>{detalle}</li>
                      ))}
                      {uploadResult.detalles.length > 8 && (
                        <li>
                          y {uploadResult.detalles.length - 8} fila(s) más con
                          problemas.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              Cupones registrados ({coupons.length})
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Solicitante / País</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Tope máximo</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                      {c.codigo}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900">{c.solicitante}</p>
                      <p className="text-xs text-slate-400">{c.pais}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.tipoDescuento}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatValorDisplay(c.tipoDescuento, c.valor)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatTopeDisplay(c.topeMaximo)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <button
              onClick={() => setJsonOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <Code2 size={16} className="text-indigo-600" />
                Visor JSON de salida
              </span>
              {jsonOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {jsonOpen && (
              <pre className="overflow-x-auto border-t border-slate-200 bg-slate-900 px-4 py-4 text-xs text-emerald-300">
                {JSON.stringify(coupons.map(toApiCoupon), null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
