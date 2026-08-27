import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarRange,
  PartyPopper,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { calendarApi } from '@/services/api';
import { CalendarDay, DayType } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const Calendario = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ tipo: 'FERIADO' as DayType, descricao: '' });

  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);
  const [isApplyingRange, setIsApplyingRange] = useState(false);
  const [rangeForm, setRangeForm] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
    tipo: 'FERIADO' as DayType,
    descricao: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      // Uma folga na janela: cobre virada de mês exibida no grid (dias do mês anterior/seguinte).
      const from = format(subMonths(monthStart, 1), 'yyyy-MM-dd');
      const to = format(addMonths(monthEnd, 1), 'yyyy-MM-dd');
      setCalendarDays(await calendarApi.list(from, to));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar calendário');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  useEffect(() => {
    void load();
  }, [load]);

  const holidays = calendarDays.filter(d => d.tipo === 'FERIADO');

  const getOverride = (date: Date): CalendarDay | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarDays.find(d => d.date === dateStr);
  };

  /**
   * Fim de semana é não letivo por padrão (sem precisar de um registro). Um
   * override explícito (LETIVO ou FERIADO) sempre vence o padrão.
   */
  const getEffectiveType = (date: Date, override: CalendarDay | undefined): DayType => {
    if (override) return override.tipo;
    const day = date.getDay();
    return day === 0 || day === 6 ? 'FERIADO' : 'LETIVO';
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const override = getOverride(date);
    setFormData({
      tipo: getEffectiveType(date, override),
      descricao: override?.descricao || '',
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // Sempre grava um override explícito: como o fim de semana já é não
      // letivo por padrão, "Letivo" também precisa ser um registro (não só a
      // ausência de um), senão não haveria como abrir uma exceção num sábado.
      await calendarApi.set(dateStr, formData.tipo, formData.tipo === 'FERIADO' ? formData.descricao : undefined);
      toast.success(formData.tipo === 'FERIADO' ? 'Feriado salvo com sucesso!' : 'Dia marcado como letivo');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar');
    } finally {
      setIsDialogOpen(false);
      setSelectedDate(null);
    }
  };

  const handleApplyRange = async () => {
    const start = new Date(rangeForm.from + 'T12:00:00');
    const end = new Date(rangeForm.to + 'T12:00:00');

    if (start > end) {
      toast.error('A data inicial precisa ser anterior (ou igual) à data final');
      return;
    }

    const datesInRange = eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));

    setIsApplyingRange(true);
    try {
      await Promise.all(
        datesInRange.map(date =>
          calendarApi.set(date, rangeForm.tipo, rangeForm.tipo === 'FERIADO' ? rangeForm.descricao : undefined)
        )
      );
      toast.success(
        `${datesInRange.length} dia(s) marcado(s) como ${rangeForm.tipo === 'FERIADO' ? 'feriado' : 'letivo'}`
      );
      await load();
      setIsRangeDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao aplicar o período');
    } finally {
      setIsApplyingRange(false);
    }
  };

  const weekDaysMobile = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const weekDaysDesktop = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="hidden lg:block text-2xl lg:text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground text-sm">Gerencie feriados e dias letivos</p>
        </div>
        <Button onClick={() => setIsRangeDialogOpen(true)} variant="outline" className="w-full sm:w-auto">
          <CalendarRange className="w-4 h-4 mr-2" />
          Marcar Período
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 p-3 sm:p-6">
            <CardTitle className="text-base sm:text-xl capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 sm:h-9 sm:w-9">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-7 mb-1 sm:mb-2">
              {weekDaysMobile.map((day, i) => (
                <div key={i} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-1 sm:py-2 sm:hidden">
                  {day}
                </div>
              ))}
              {weekDaysDesktop.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2 hidden sm:block">
                  {day}
                </div>
              ))}
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground py-8 text-sm">Carregando...</p>
            ) : (
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {Array.from({ length: startDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {days.map((day) => {
                  const override = getOverride(day);
                  const isExplicitHoliday = override?.tipo === 'FERIADO';
                  const isCurrentDay = isToday(day);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  // Fim de semana sem override é não letivo por padrão, mas com cor própria
                  // (amarelo) — diferente do feriado explícito (vermelho).
                  const isWeekendDefault = isWeekend && !override;

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all",
                        "border border-transparent hover:border-primary/20",
                        isCurrentDay && "ring-2 ring-primary ring-offset-1 sm:ring-offset-2",
                        isExplicitHoliday && "bg-holiday-light text-holiday border-holiday/30",
                        !isExplicitHoliday && isWeekendDefault && "bg-warning-light text-warning border-warning/30",
                        !isExplicitHoliday && !isWeekendDefault && "hover:bg-muted"
                      )}
                    >
                      <span>{format(day, 'd')}</span>
                      {isExplicitHoliday && <PartyPopper className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-holiday-light border border-holiday/30" />
                <span className="text-muted-foreground">Feriado</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-warning-light border border-warning/30" />
                <span className="text-muted-foreground">Fim de semana (não letivo)</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded ring-2 ring-primary ring-offset-1" />
                <span className="text-muted-foreground">Hoje</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5" />
              Feriados
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Feriados cadastrados neste período</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            {holidays.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum feriado cadastrado</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {holidays
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((holiday) => (
                    <div key={holiday.date} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-holiday-light/50 gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-xs sm:text-sm">
                          {format(new Date(holiday.date + 'T12:00:00'), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {holiday.descricao || 'Feriado'}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-holiday border-holiday text-xs flex-shrink-0">
                        <PartyPopper className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Feriado</span>
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogTitle>
            <DialogDescription>Defina o tipo de dia e descrição</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Dia</Label>
              <Select value={formData.tipo} onValueChange={(value: DayType) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LETIVO">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Dia Letivo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="FERIADO">
                    <div className="flex items-center gap-2">
                      <PartyPopper className="w-4 h-4 text-holiday" />
                      <span>Feriado / Não Letivo</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.tipo === 'FERIADO' && (
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Input
                  id="descricao"
                  placeholder="Ex: Carnaval, Natal, etc."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
            )}

            {formData.tipo === 'FERIADO' && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-light text-sm">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground text-xs sm:text-sm">
                  Em dias marcados como feriado, a chamada não estará disponível.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRangeDialogOpen} onOpenChange={setIsRangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar período</DialogTitle>
            <DialogDescription>
              Aplica o mesmo tipo de dia para todas as datas do intervalo (ex.: recesso, férias).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="range-from">De</Label>
                <Input
                  id="range-from"
                  type="date"
                  value={rangeForm.from}
                  onChange={(e) => setRangeForm({ ...rangeForm, from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="range-to">Até</Label>
                <Input
                  id="range-to"
                  type="date"
                  value={rangeForm.to}
                  onChange={(e) => setRangeForm({ ...rangeForm, to: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Dia</Label>
              <Select value={rangeForm.tipo} onValueChange={(value: DayType) => setRangeForm({ ...rangeForm, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LETIVO">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>Dia Letivo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="FERIADO">
                    <div className="flex items-center gap-2">
                      <PartyPopper className="w-4 h-4 text-holiday" />
                      <span>Feriado / Não Letivo</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {rangeForm.tipo === 'FERIADO' && (
              <div className="space-y-2">
                <Label htmlFor="range-descricao">Descrição (opcional)</Label>
                <Input
                  id="range-descricao"
                  placeholder="Ex: Férias de julho, Recesso escolar..."
                  value={rangeForm.descricao}
                  onChange={(e) => setRangeForm({ ...rangeForm, descricao: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning-light text-sm">
              <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground text-xs sm:text-sm">
                Isso substitui o tipo de todos os dias entre as duas datas, incluindo fins de semana.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRangeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyRange} disabled={isApplyingRange}>
              {isApplyingRange ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendario;
