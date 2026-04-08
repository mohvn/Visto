import { Clock, Eye, Tv } from "lucide-react";

interface ProfileStatsProps {
  totalMinutes: number;
  episodesWatched: number;
  showsTracked: number;
}

function formatTime(totalMinutes: number) {
  const totalHours = Math.floor(totalMinutes / 60);
  const months = Math.floor(totalHours / (24 * 30));
  const days = Math.floor((totalHours % (24 * 30)) / 24);
  const hours = totalHours % 24;
  return { months, days, hours };
}

function TvTimeBig({
  months,
  days,
  hours,
}: {
  months: number;
  days: number;
  hours: number;
}) {
  return (
    <div className="flex items-baseline gap-3 sm:gap-4">
      {months > 0 && (
        <span className="font-mono font-bold text-primary leading-none text-3xl sm:text-4xl">
          {months}
          <span className="ml-1 text-xs sm:text-sm font-semibold tracking-widest text-muted-foreground">
            M
          </span>
        </span>
      )}
      <span className="font-mono font-bold text-primary leading-none text-3xl sm:text-4xl">
        {days}
        <span className="ml-1 text-xs sm:text-sm font-semibold tracking-widest text-muted-foreground">
          D
        </span>
      </span>
      <span className="font-mono font-bold text-primary leading-none text-3xl sm:text-4xl">
        {hours}
        <span className="ml-1 text-xs sm:text-sm font-semibold tracking-widest text-muted-foreground">
          H
        </span>
      </span>
    </div>
  );
}

export function ProfileStats({
  totalMinutes,
  episodesWatched,
  showsTracked,
}: ProfileStatsProps) {
  const time = formatTime(totalMinutes);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {/* TV Time */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-5 col-span-2 sm:col-span-1">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tempo de TV
            </span>
          </div>
          <TvTimeBig months={time.months} days={time.days} hours={time.hours} />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            meses · dias · horas
          </p>
        </div>
      </div>

      {/* Episodes */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-5">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Episódios
            </span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold font-mono text-primary leading-none">
            {episodesWatched.toLocaleString("pt-BR")}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            assistidos
          </p>
        </div>
      </div>

      {/* Shows */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-4 sm:p-5">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Tv className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Séries
            </span>
          </div>
          <p className="text-2xl sm:text-4xl font-bold font-mono text-primary leading-none">
            {showsTracked}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            rastreadas
          </p>
        </div>
      </div>
    </div>
  );
}
