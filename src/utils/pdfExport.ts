import jsPDF from 'jspdf';
import autoTable, { type Table } from 'jspdf-autotable';

/** O autotable injeta `lastAutoTable` no documento, mas nao declara o tipo. */
type DocWithAutoTable = jsPDF & { lastAutoTable?: Table };
import { TurmaReport } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FREQUENCIA_ADEQUADA, FREQUENCIA_ATENCAO } from '@/lib/frequency';

export const exportTurmaPDF = (report: TurmaReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Get current month/year for monthly report
  const currentDate = new Date();
  const monthYear = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
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
  const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
  doc.text(capitalizedMonth, pageWidth / 2, 62, { align: 'center' });

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
    aluno.totalAulas.toString(),
    `${aluno.percentualFrequencia}%`
  ]);

  autoTable(doc, {
    startY: 105,
    head: [['#', 'Nome do Aluno', 'Presenças', 'Faltas', 'Total Aulas', 'Frequência']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 60 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 25 },
      5: { halign: 'center', cellWidth: 25 }
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
  const fileName = `relatorio_${report.turmaNome.toLowerCase().replace(/\s+/g, '_')}_${format(currentDate, 'MM_yyyy')}.pdf`;
  doc.save(fileName);
};
