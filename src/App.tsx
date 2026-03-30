import { useEffect, useState } from "react";
import { Player } from "./types";
import { Search, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetch("/api/players/nc-hitters")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any;
    let bValue: any;

    if (key.startsWith('stats.')) {
      const statKey = key.split('.')[1];
      aValue = (a.stats as any)?.[statKey] ?? 0;
      bValue = (b.stats as any)?.[statKey] ?? 0;
      if (typeof aValue === 'string') aValue = parseFloat(aValue);
      if (typeof bValue === 'string') bValue = parseFloat(bValue);
    } else {
      aValue = (a as any)[key];
      bValue = (b as any)[key];
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredPlayers = sortedPlayers.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.birthCity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-8 font-sans">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-[#141414] font-mono italic">Scouting North Carolina talent...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-8 font-sans">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">Error loading stats</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      <header className="border-b border-[#141414] p-6 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-4">
            NC Born<br />Hitters
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest opacity-60">
            <span>MLB Stats API Integration</span>
            <span className="w-1 h-1 bg-[#141414] rounded-full" />
            <span>{players.length} Players Found</span>
          </div>
        </div>
        
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input 
            type="text"
            placeholder="Search by name or city..."
            className="w-full bg-transparent border border-[#141414] py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:bg-white transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="p-0 overflow-x-auto">
        <div className="min-w-[1400px]">
          {/* Table Header */}
          <div className="grid grid-cols-[300px_150px_repeat(12,1fr)_150px] border-b border-[#141414] bg-[#141414] text-[#E4E3E0] py-3 px-6 text-[10px] font-mono uppercase tracking-wider sticky top-0 z-10">
            <div className="cursor-pointer flex items-center gap-2" onClick={() => handleSort('fullName')}>
              Player {sortConfig?.key === 'fullName' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="cursor-pointer flex items-center gap-2" onClick={() => handleSort('birthCity')}>
              Birth City {sortConfig?.key === 'birthCity' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.avg')}>
              AVG {sortConfig?.key === 'stats.avg' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.obp')}>
              OBP {sortConfig?.key === 'stats.obp' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.slg')}>
              SLG {sortConfig?.key === 'stats.slg' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.ops')}>
              OPS {sortConfig?.key === 'stats.ops' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.hits')}>
              H {sortConfig?.key === 'stats.hits' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.doubles')}>
              2B {sortConfig?.key === 'stats.doubles' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.triples')}>
              3B {sortConfig?.key === 'stats.triples' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.homeRuns')}>
              HR {sortConfig?.key === 'stats.homeRuns' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.rbi')}>
              RBI {sortConfig?.key === 'stats.rbi' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.baseOnBalls')}>
              BB {sortConfig?.key === 'stats.baseOnBalls' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.strikeOuts')}>
              SO {sortConfig?.key === 'stats.strikeOuts' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right cursor-pointer flex items-center justify-end gap-2" onClick={() => handleSort('stats.stolenBases')}>
              SB {sortConfig?.key === 'stats.stolenBases' && (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
            </div>
            <div className="text-right">Position</div>
          </div>

          {/* Player Rows */}
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player) => (
              <motion.div 
                key={player.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-[300px_150px_repeat(12,1fr)_150px] border-b border-[#141414] hover:bg-white transition-colors group"
              >
                <div className="p-6 flex flex-col justify-center">
                  <span className="text-xl font-bold tracking-tight uppercase group-hover:underline underline-offset-4">
                    {player.fullName}
                  </span>
                  <span className="text-[10px] font-mono opacity-50 uppercase mt-1">
                    ID: {player.id}
                  </span>
                </div>

                <div className="p-6 flex items-center gap-2 text-sm">
                  <MapPin size={14} className="opacity-40" />
                  <span>{player.birthCity}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg font-bold">.{player.stats?.avg.split('.')[1] || '000'}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">.{player.stats?.obp.split('.')[1] || '000'}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">.{player.stats?.slg.split('.')[1] || '000'}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.ops || '.000'}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.hits || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.doubles || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.triples || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.homeRuns || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.rbi || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.baseOnBalls || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.strikeOuts || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="font-mono text-lg">{player.stats?.stolenBases || 0}</span>
                </div>

                <div className="p-6 text-right flex flex-col justify-center">
                  <span className="text-xs font-mono uppercase tracking-wider px-2 py-1 border border-[#141414] inline-block ml-auto">
                    {player.primaryPosition}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="p-24 text-center">
            <p className="text-2xl font-bold uppercase tracking-tighter opacity-20 italic">No players match your search</p>
          </div>
        )}
      </main>

      <footer className="p-12 border-t border-[#141414] flex flex-col lg:flex-row justify-between gap-8 items-center opacity-40 text-[10px] font-mono uppercase tracking-[0.2em]">
        <div className="flex items-center gap-8">
          <span>Data provided by MLB Stats API</span>
          <span>Updated Daily</span>
        </div>
        <div>
          <span>&copy; 2026 NC Baseball Analytics</span>
        </div>
      </footer>
    </div>
  );
}
