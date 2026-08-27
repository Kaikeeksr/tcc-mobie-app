import jsPDF from 'jspdf';
import autoTable, { type Table } from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { TurmaReport } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FREQUENCIA_ADEQUADA, FREQUENCIA_ATENCAO } from '@/lib/frequency';

/** O autotable injeta `lastAutoTable` no documento, mas nao declara o tipo. */
type DocWithAutoTable = jsPDF & { lastAutoTable?: Table };

/**
 * Entrega o PDF pronto ao usuario.
 *
 * Na web, `doc.save()` dispara o download do navegador. Dentro do WebView isso
 * falharia em silencio: o save monta uma ancora com `blob:` e clica nela, e o
 * WebView do Android nao tem gerenciador de download nem resolve esse blob.
 * No nativo, entao, gravamos o arquivo e abrimos a folha de compartilhamento.
 */
const deliverPDF = async (doc: jsPDF, fileName: string) => {
  if (!Capacitor.isNativePlatform()) {
    doc.save(fileName);
    return;
  }

  // `datauristring` volta como "data:application/pdf;filename=...;base64,XXXX".
  const base64 = doc.output('datauristring').split(',')[1];
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

export const exportTurmaPDF = async (report: TurmaReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const currentDate = new Date();
  const periodo = `${format(new Date(report.from + 'T12:00:00'), 'dd/MM/yyyy')} a ${format(new Date(report.to + 'T12:00:00'), 'dd/MM/yyyy')}`;
  const formattedDate = format(currentDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // === FAKE LOGO ===
  // Draw a simple logo placeholder (circle with initials)
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.circle(25, 25, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('GC', 25, 28, { align: 'center' });

  // === FAKE HEADER ===
  doc.setTextColor(30, 41, 59); // Dark text
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Gestão de Chamadas', 45, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Muted text
  doc.text('Sistema de Controle de Frequência', 45, 28);
  doc.text('CNPJ: 00.000.000/0001-00 | Tel: (11) 99999-9999', 45, 33);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  // === REPORT TITLE ===
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Mensal de Frequência', pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Período: ${periodo}`, pageWidth / 2, 62, { align: 'center' });

  // === TURMA INFO ===
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Turma: ${report.turmaNome}`, 14, 75);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Total de Chamadas: ${report.totalAulas}`, 14, 82);
  doc.text(`Frequência Média: ${report.frequenciaMedia}%`, 14, 89);
  doc.text(`Total de Alunos: ${report.alunos.length}`, 14, 96);

  // === TABLE ===
  const tableData = report.alunos.map((aluno, index) => [
    (index + 1).toString(),
    aluno.alunoNome,
    aluno.presencas.toString(),
    aluno.faltas.toString(),
    aluno.atrasos.toString(),
    aluno.retiradas.toString(),
    aluno.justificadas.toString(),
    aluno.totalAulas.toString(),
    `${aluno.percentualFrequencia}%`
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['#', 'Nome do Aluno', 'Pres.', 'Faltas', 'Atrasos', 'Retiradas', 'Justif.', 'Total', 'Frequência']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 48 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'center', cellWidth: 16 },
      7: { halign: 'center', cellWidth: 16 },
      8: { halign: 'center', cellWidth: 20 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  // === FOOTER ===
  const finalY = (doc as DocWithAutoTable).lastAutoTable?.finalY ?? 200;
  
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, finalY + 15, pageWidth - 14, finalY + 15);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Relatório gerado em: ${formattedDate}`, 14, finalY + 22);
  doc.text('Sistema de Gestão de Chamadas - Todos os direitos reservados', pageWidth / 2, finalY + 22, { align: 'center' });
  doc.text(`Página 1 de 1`, pageWidth - 14, finalY + 22, { align: 'right' });

  // === LEGEND ===
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Legenda: Frequência ≥ ${FREQUENCIA_ADEQUADA}% = Adequada | ` +
      `${FREQUENCIA_ATENCAO}-${FREQUENCIA_ADEQUADA - 1}% = Atenção | ` +
      `< ${FREQUENCIA_ATENCAO}% = Crítica`,
    14,
    finalY + 30
  );

  // Save file
  const fileName = `relatorio_${report.turmaNome.toLowerCase().replace(/\s+/g, '_')}_${report.from}_a_${report.to}.pdf`;
  await deliverPDF(doc, fileName);
};
