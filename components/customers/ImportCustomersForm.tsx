'use client';

import { useState, useRef } from 'react';
import { Upload, Download, Loader2, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
}

export function ImportCustomersForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const headers = [
      ['nombre', 'cif', 'direccion', 'codigoPostal', 'ciudad', 'provincia', 'pais', 'telefono', 'email', 'notas'],
    ];
    const example = [
      ['Empresa Ejemplo S.L.', 'B12345678', 'Calle Mayor 1', '35001', 'Las Palmas', 'Las Palmas', 'España', '928000000', 'info@ejemplo.com', ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, 'plantilla_clientes.xlsx');
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/import/customers', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al importar');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-2">Instrucciones</h2>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li>El archivo debe ser formato <strong>.xlsx</strong> o <strong>.xls</strong></li>
          <li>La primera fila debe contener los encabezados de columna</li>
          <li>Los campos obligatorios son: <strong>nombre, cif, direccion, codigoPostal, ciudad, provincia</strong></li>
          <li>Si ya existe un cliente con el mismo CIF/NIF, sus datos serán actualizados</li>
          <li>Descarga la plantilla para ver el formato esperado</li>
        </ul>
        <div className="mt-4">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar plantilla Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Seleccionar archivo</h2>
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#1d4f91] transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          {file ? (
            <div>
              <p className="text-sm font-medium text-slate-700">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500">Haz clic para seleccionar un archivo Excel</p>
              <p className="text-xs text-slate-400 mt-1">.xlsx, .xls</p>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setResult(null);
            setError('');
          }}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Importación completada</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm">
                <div className="text-center p-2 bg-white rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-700">{result.created}</p>
                  <p className="text-xs text-slate-500">Creados</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
                  <p className="text-xs text-slate-500">Actualizados</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                  <p className="text-xs text-slate-500">Errores</p>
                </div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-semibold text-red-700 mb-2">Filas con error:</p>
                <ul className="space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i} className="text-xs text-red-600">• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0f2747] text-white rounded-xl text-sm hover:bg-[#1d4f91] transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? 'Importando...' : 'Importar clientes'}
          </button>
        </div>
      </div>
    </div>
  );
}
