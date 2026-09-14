import { useState } from 'react';
import {
  PlusCircle,
  Upload,
  Code2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const MOCK_COUPONS = [
  {
    id: 'CUP-001',
    codigo: 'VERANO2026',
    tipo: 'Porcentaje',
    valor: '20%',
    limite: 500,
    estado: 'Activo',
  },
  {
    id: 'CUP-002',
    codigo: 'BIENVENIDA10',
    tipo: 'Monto Fijo',
    valor: '$10.000',
    limite: 100,
    estado: 'Activo',
  },
];

export default function PromotionsManager() {
  const [mode, setMode] = useState('individual');
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const [form, setForm] = useState({
    codigo: '',
    tipo: 'Porcentaje',
    valor: '',
    limite: '',
  });

  // Carga Individual Manual
  function handleIndividualSubmit(e) {
    e.preventDefault();
    if (!form.codigo) return;
    const newCoupon = {
      id: `CUP-00${coupons.length + 1}`,
      codigo: form.codigo.toUpperCase(),
      tipo: form.tipo,
      valor: form.tipo === 'Porcentaje' ? `${form.valor}%` : `$${form.valor}`,
      limite: form.limite || 'Sin límite',
      estado: 'Activo',
    };
    setCoupons([newCoupon, ...coupons]);
    setForm({ codigo: '', tipo: 'Porcentaje', valor: '', limite: '' });
  }

  // Lector de Archivos con Búsqueda Inteligente de Cabeceras
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setUploadMessage('El archivo está vacío o no tiene filas válidas.');
          return;
        }

        const cleanStr = (str) =>
          String(str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();

        // Búsqueda flexible que admite coincidencia parcial en cabeceras largas
        const getVal = (row, candidateKeys) => {
          const keys = Object.keys(row);
          for (const cand of candidateKeys) {
            const candClean = cleanStr(cand);
            const foundKey = keys.find((k) => {
              const keyClean = cleanStr(k);
              return (
                keyClean === candClean ||
                keyClean.includes(candClean) ||
                candClean.includes(keyClean)
              );
            });
            if (
              foundKey &&
              row[foundKey] !== undefined &&
              row[foundKey] !== null &&
              String(row[foundKey]).trim() !== ''
            ) {
              return String(row[foundKey]).trim();
            }
          }
          return null;
        };

        const formatValor = (rawValor, tipoStr, row) => {
          let val = rawValor;
          const isMontoFijo =
            cleanStr(tipoStr).includes('monto') ||
            cleanStr(tipoStr).includes('fijo');

          // Si es Monto Fijo y no vino valor de descuento, busca en el campo de Tope Máximo
          if (!val && isMontoFijo) {
            val = getVal(row, ['topemaximo', 'tope', 'monto']);
          }

          if (!val) return isMontoFijo ? '$0' : '0%';

          const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));

          if (isMontoFijo) {
            if (!isNaN(num)) return `$${num.toLocaleString('es-CL')}`;
            return String(val).startsWith('$') ? val : `$${val}`;
          } else {
            if (!isNaN(num)) {
              if (num > 0 && num <= 1) return `${Math.round(num * 100)}%`;
              return `${num}%`;
            }
            return String(val).includes('%') ? val : `${val}%`;
          }
        };

        const nuevosCupones = [];

        data.forEach((row) => {
          // 1. Filtrar filas cuya mecánica sea "Promoción" (sin cupón)
          const mecanica = getVal(row, ['mecanica']) || '';
          if (cleanStr(mecanica) === 'promocion') return;

          // 2. Extraer Código de Cupón de forma estricta
          const codigo = getVal(row, [
            'codigocupon',
            'codigo',
            'cupon',
            'code',
          ]);
          if (!codigo) return;

          const codigoClean = codigo.toUpperCase();
          const yaEnTabla = coupons.some(
            (c) => c.codigo.toUpperCase() === codigoClean
          );
          const yaEnNuevos = nuevosCupones.some(
            (c) => c.codigo.toUpperCase() === codigoClean
          );

          if (!yaEnTabla && !yaEnNuevos) {
            const tipo =
              getVal(row, ['tipodescuento', 'tipo', 'mecanica']) ||
              'Porcentaje';
            const rawValor = getVal(row, [
              'porcentajedescuento',
              'valor',
              'descuento',
              'monto',
              'montofijo',
            ]);

            nuevosCupones.push({
              id: `CUP-${coupons.length + nuevosCupones.length + 1}`,
              codigo: codigoClean,
              tipo: cleanStr(tipo).includes('monto')
                ? 'Monto Fijo'
                : 'Porcentaje',
              valor: formatValor(rawValor, tipo, row),
              limite:
                getVal(row, ['topemaximo', 'tope', 'limite', 'limiteuso']) ||
                'Sin límite',
              estado: 'Activo',
            });
          }
        });

        if (nuevosCupones.length === 0) {
          setUploadMessage(
            'No se agregaron cupones nuevos (las promociones sin código fueron ignoradas).'
          );
        } else {
          setCoupons((prev) => [...nuevosCupones, ...prev]);
          setUploadMessage(
            `¡Éxito! Se importaron ${nuevosCupones.length} cupones reales correctamente.`
          );
        }
      } catch (err) {
        console.error('Error al procesar archivo:', err);
        setUploadMessage(
          'Error al leer el archivo. Asegúrate de que sea .xlsx, .xls o .csv'
        );
      }
    };
    reader.readAsBinaryString(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Módulo de Carga de Cupones
        </h1>
        <p className="text-sm text-slate-500">
          Gestión de cupones de descuento individuales y masivos.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setMode('individual');
            setUploadMessage(null);
          }}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === 'individual'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PlusCircle size={16} /> Carga Individual
        </button>
        <button
          onClick={() => {
            setMode('colectivo');
            setUploadMessage(null);
          }}
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
              <p className="text-sm font-semibold text-slate-700">
                Nuevo Cupón Individual
              </p>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Código del Cupón
                </label>
                <input
                  required
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  placeholder="Ej: BDAY2026"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Tipo de Descuento
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option>Porcentaje</option>
                  <option>Monto Fijo</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Valor
                </label>
                <input
                  required
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder={
                    form.tipo === 'Porcentaje' ? 'Ej: 15 (%)' : 'Ej: 5000 ($)'
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Guardar Cupón
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">
                Carga Masiva de Archivo
              </p>
              <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50">
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
              {uploadMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
                  <CheckCircle2 size={16} />
                  {uploadMessage}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              Cupones Registrados ({coupons.length})
            </p>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Límite Uso</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                      {c.codigo}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.tipo}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {c.valor}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.limite}</td>
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
                <Code2 size={16} className="text-indigo-600" /> Visor JSON
                resultante para API
              </span>
              {jsonOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {jsonOpen && (
              <pre className="overflow-x-auto border-t border-slate-200 bg-slate-900 px-4 py-4 text-xs text-emerald-300">
                {JSON.stringify(coupons, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
