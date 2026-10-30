import ExcelJS from 'exceljs';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { TurmaReport } from '@/types';
import { studentApi } from '@/services/api';
import { getFrequencyLabel } from '@/lib/frequency';

/** Ver comentário equivalente em pdfExport.ts: WebView não resolve blob: nem tem download manager. */
const deliverXLSX = async (buffer: ArrayBuffer, fileName: string) => {
  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const base64 = arrayBufferToBase64(buffer);
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: base64,
    directory: Directory.Cache,
  });

  await Share.share({
    title: 'Relatório de frequência',
    text: fileName,
    url: uri,
  });
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const exportTurmaXLSX = async (report: TurmaReport, transportadorNome?: string) => {
  const students = await studentApi.list();
  const serieByAlunoId = new Map(students.map((s) => [s.id, s.serie ?? '']));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = transportadorNome || 'Sistema de Controle de Frequência';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(report.turmaNome.slice(0, 31));

  sheet.columns = [
    { header: 'Aluno', key: 'aluno', width: 32 },
    { header: 'Série', key: 'serie', width: 10 },
    { header: 'Presenças', key: 'presencas', width: 12 },
    { header: 'Faltas', key: 'faltas', width: 10 },
    { header: 'Atrasos', key: 'atrasos', width: 10 },
    { header: 'Justificadas', key: 'justificadas', width: 14 },
    { header: 'Retiradas pelo responsável', key: 'retiradas', width: 24 },
    { header: '% de Frequência', key: 'percentual', width: 16 },
    { header: 'Faixa', key: 'faixa', width: 12 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const aluno of report.alunos) {
    sheet.addRow({
      aluno: aluno.alunoNome,
      serie: serieByAlunoId.get(aluno.alunoId) ?? '',
      presencas: aluno.presencas,
      faltas: aluno.faltas,
      atrasos: aluno.atrasos,
      justificadas: aluno.justificadas,
      retiradas: aluno.retiradas,
      percentual: aluno.percentualFrequencia / 100,
      faixa: getFrequencyLabel(aluno.percentualFrequencia),
    });
  }

  sheet.getColumn('percentual').numFmt = '0%';

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `relatorio_${report.turmaNome.toLowerCase().replace(/\s+/g, '_')}_${report.from}_a_${report.to}.xlsx`;
  await deliverXLSX(buffer as ArrayBuffer, fileName);
};
