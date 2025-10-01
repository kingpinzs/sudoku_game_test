/* Sudoku Generator – Unique solutions + Human-Technique Difficulty Gate
 * No dependencies. Works in browser and Node (UMD).
 * API:
 *   const { generatePuzzle } = require('./sudoku-gen.js')
 *   const { givens, solution } = generatePuzzle({
 *     seed: Date.now(),
 *     target: 'medium',            // 'easy' | 'medium' | 'hard' | {minClues,maxClues,techniques?}
 *     symmetry: 'none'             // 'none' | 'rotate' | 'mirror'
 *   })
 */

(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else Object.assign(root, factory());
})(typeof self !== 'undefined' ? self : this, function(){

  // ---------------- RNG ----------------
  function mulberry32(seed) {
    let t = (seed >>> 0) || 1;
    return function() {
      t |= 0; t = (t + 0x6D2B79F5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------- Helpers ----------------
  const N = 9, DIGS = [1,2,3,4,5,6,7,8,9];

  const clone = g => g.map(r => r.slice());
  const to81 = g => { let s=''; for (let r=0;r<N;r++) for (let c=0;c<N;c++) s += g[r][c]||0; return s; };
  const from81 = s => {
    const g = Array.from({length:N},()=>Array(N).fill(0));
    for (let i=0;i<81;i++){ const ch=s[i]; g[(i/9)|0][i%9] = (ch==='.'||ch==='0'||ch===undefined)?0:(+ch); }
    return g;
  };
  function shuffle(a, rnd){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  const boxStart = x => Math.floor(x/3)*3;

  function isValidGrid(g){
    for (let i=0;i<N;i++){
      const rs=new Set(), cs=new Set();
      for (let j=0;j<N;j++){
        const rv=g[i][j], cv=g[j][i];
        if (rv){ if (rs.has(rv)) return false; rs.add(rv); }
        if (cv){ if (cs.has(cv)) return false; cs.add(cv); }
      }
    }
    for (let br=0;br<3;br++) for (let bc=0;bc<3;bc++){
      const seen=new Set();
      for (let r=br*3;r<br*3+3;r++) for (let c=bc*3;c<bc*3+3;c++){
        const v=g[r][c]; if (!v) continue; if (seen.has(v)) return false; seen.add(v);
      }
    }
    return true;
  }
  function isComplete(g){ for (let r=0;r<N;r++) for (let c=0;c<N;c++) if (!g[r][c]) return false; return true; }

  function candidatesFor(g){
    const cand = Array.from({length:N},()=>Array.from({length:N},()=> new Set()));
    for (let r=0;r<N;r++) {
      const rowVals = new Set();
      for (let c=0;c<N;c++) if (g[r][c]) rowVals.add(g[r][c]);
      
      for (let c=0;c<N;c++){
        if (g[r][c]) continue;
        
        // Start with all digits
        const candidates = new Set([1,2,3,4,5,6,7,8,9]);
        
        // Remove row conflicts
        for (const v of rowVals) candidates.delete(v);
        
        // Remove column conflicts
        for (let i=0;i<N;i++) if (g[i][c]) candidates.delete(g[i][c]);
        
        // Remove box conflicts
        const rs=boxStart(r), cs=boxStart(c);
        for (let i=rs;i<rs+3;i++) {
          for (let j=cs;j<cs+3;j++) {
            if (g[i][j]) candidates.delete(g[i][j]);
          }
        }
        
        cand[r][c] = candidates;
      }
    }
    return cand;
  }

  // ---------------- Backtracking Solver (for uniqueness) ----------------
  function countSolutions(grid, limit=2){
    if (!isValidGrid(grid)) return { count: 0, oneSolution: null };
    let count=0, first=null;
    
    // Cache candidates to avoid recomputation
    let candidateCache = null;

    function getCandidates(g) {
      if (!candidateCache) candidateCache = candidatesFor(g);
      return candidateCache;
    }

    function pickCell(g){
      let best=null, bestSize=10;
      const cand=getCandidates(g);
      for (let r=0;r<N;r++) for (let c=0;c<N;c++){
        if (g[r][c]) continue;
        const sz=cand[r][c].size;
        if (sz===0) return {r,c,cand:new Set()}; // dead end
        if (sz<bestSize){ bestSize=sz; best={r,c,cand:cand[r][c]}; if (sz===1) return best; }
      }
      return best; // null if full
    }
    
    // Optimized validation that only checks the placed cell
    function isValidPlacement(g, r, c, v) {
      // Check row
      for (let i = 0; i < N; i++) {
        if (i !== c && g[r][i] === v) return false;
      }
      // Check column  
      for (let i = 0; i < N; i++) {
        if (i !== r && g[i][c] === v) return false;
      }
      // Check box
      const rs = boxStart(r), cs = boxStart(c);
      for (let i = rs; i < rs + 3; i++) {
        for (let j = cs; j < cs + 3; j++) {
          if ((i !== r || j !== c) && g[i][j] === v) return false;
        }
      }
      return true;
    }
    
    function dfs(g){
      if (count>=limit) return;
      let full=true; 
      for (let r=0;r<N && full;r++) {
        for (let c=0;c<N;c++) {
          if (!g[r][c]) { full=false; break; }
        }
      }
      if (full){ count++; if(!first) first=clone(g); return; }
      
      const pick=pickCell(g);
      if (!pick || pick.cand.size===0) return;
      const {r,c,cand}=pick;
      
      for (const v of cand){
        if (isValidPlacement(g, r, c, v)) {
          g[r][c]=v;
          candidateCache = null; // Invalidate cache
          dfs(g);
          g[r][c]=0;
          candidateCache = null; // Invalidate cache
          if (count>=limit) return;
        }
      }
    }
    const work=clone(grid);
    dfs(work);
    return { count, oneSolution:first };
  }

  // ---------------- Solved Grid Generator ----------------
  function generateSolved(rnd){
    const g=Array.from({length:N},()=>Array(N).fill(0));
    
    // Use a more efficient approach: fill in order with constraint propagation
    function isValid(r, c, v) {
      // Check row
      for (let i = 0; i < N; i++) {
        if (g[r][i] === v) return false;
      }
      // Check column
      for (let i = 0; i < N; i++) {
        if (g[i][c] === v) return false;
      }
      // Check box
      const rs = boxStart(r), cs = boxStart(c);
      for (let i = rs; i < rs + 3; i++) {
        for (let j = cs; j < cs + 3; j++) {
          if (g[i][j] === v) return false;
        }
      }
      return true;
    }
    
    // Fill box by box for better constraint satisfaction
    function fillBox(boxRow, boxCol) {
      const digits = shuffle(DIGS.slice(), rnd);
      let idx = 0;
      for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
        for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
          g[r][c] = digits[idx++];
        }
      }
    }
    
    // Fill diagonal boxes first (no constraints between them)
    fillBox(0, 0);
    fillBox(1, 1);
    fillBox(2, 2);
    
    // Fill remaining cells with backtracking
    function fillRemaining(r, c) {
      if (r === N) return true;
      if (c === N) return fillRemaining(r + 1, 0);
      if (g[r][c] !== 0) return fillRemaining(r, c + 1);
      
      const digits = shuffle(DIGS.slice(), rnd);
      for (const v of digits) {
        if (isValid(r, c, v)) {
          g[r][c] = v;
          if (fillRemaining(r, c + 1)) return true;
          g[r][c] = 0;
        }
      }
      return false;
    }
    
    fillRemaining(0, 0);
    return g;
  }

  // ---------------- Human Techniques Engine (placements + eliminations) ----------------
  // Techniques implemented:
  //   - Naked Single (NS)
  //   - Hidden Single (HS) in row/col/box
  //   - Naked Pair (NP) in row/col/box -> eliminations
  //   - Hidden Pair (HP) in row/col/box -> placements if pair occupies exactly two cells
  //   - Pointing/Claiming (PC): box-line interactions -> eliminations
  //
  // The solver loops applying allowed techniques until stuck; returns { solved:boolean }.

  function humanSolve(givens, allowed){
    const g = clone(givens);
    if (!isValidGrid(g)) return { solved:false, progress:false };

    let changed = true;
    let anyProgress = false;

    function place(r,c,v){ g[r][c]=v; anyProgress = true; }

    function findNakedSingle(cand){
      for (let r=0;r<N;r++) for (let c=0;c<N;c++){
        if (!g[r][c] && cand[r][c].size===1){
          return {r,c,v:[...cand[r][c]][0]};
        }
      }
      return null;
    }

    function findHiddenSingle(cand){
      // row
      for (let r=0;r<N;r++){
        for (let v=1; v<=9; v++){
          let cells=[];
          for (let c=0;c<N;c++) if (!g[r][c] && cand[r][c].has(v)) cells.push({r,c});
          if (cells.length===1) return {r:cells[0].r, c:cells[0].c, v};
        }
      }
      // col
      for (let c=0;c<N;c++){
        for (let v=1; v<=9; v++){
          let cells=[];
          for (let r=0;r<N;r++) if (!g[r][c] && cand[r][c].has(v)) cells.push({r,c});
          if (cells.length===1) return {r:cells[0].r, c:cells[0].c, v};
        }
      }
      // box
      for (let br=0;br<3;br++) for (let bc=0;bc<3;bc++){
        for (let v=1; v<=9; v++){
          let cells=[];
          for (let r=br*3;r<br*3+3;r++) for (let c=bc*3;c<bc*3+3;c++){
            if (!g[r][c] && cand[r][c].has(v)) cells.push({r,c});
          }
          if (cells.length===1) return {r:cells[0].r, c:cells[0].c, v};
        }
      }
      return null;
    }

    function elimNakedPairs(cand){
      let did=false;
      // rows
      for (let r=0;r<N;r++){
        const cells=[]; for (let c=0;c<N;c++) if (!g[r][c]) cells.push({r,c,set:cand[r][c]});
        for (let i=0;i<cells.length;i++) for (let j=i+1;j<cells.length;j++){
          const A=cells[i], B=cells[j];
          if (A.set.size===2 && B.set.size===2){
            const a=[...A.set], b=[...B.set];
            if (a[0]===b[0] && a[1]===b[1]){
              for (let c2=0;c2<N;c2++){
                if (c2===A.c || c2===B.c || g[r][c2]) continue;
                const S=cand[r][c2];
                if (S.delete(a[0])|S.delete(a[1])) did=true;
              }
            }
          }
        }
      }
      // cols
      for (let c=0;c<N;c++){
        const cells=[]; for (let r=0;r<N;r++) if (!g[r][c]) cells.push({r,c,set:cand[r][c]});
        for (let i=0;i<cells.length;i++) for (let j=i+1;j<cells.length;j++){
          const A=cells[i], B=cells[j];
          if (A.set.size===2 && B.set.size===2){
            const a=[...A.set], b=[...B.set];
            if (a[0]===b[0] && a[1]===b[1]){
              for (let r2=0;r2<N;r2++){
                if (r2===A.r || r2===B.r || g[r2][c]) continue;
                const S=cand[r2][c];
                if (S.delete(a[0])|S.delete(a[1])) did=true;
              }
            }
          }
        }
      }
      // boxes
      for (let br=0;br<3;br++) for (let bc=0;bc<3;bc++){
        const cells=[];
        for (let r=br*3;r<br*3+3;r++) for (let c=bc*3;c<bc*3+3;c++) if (!g[r][c]) cells.push({r,c,set:cand[r][c]});
        for (let i=0;i<cells.length;i++) for (let j=i+1;j<cells.length;j++){
          const A=cells[i], B=cells[j];
          if (A.set.size===2 && B.set.size===2){
            const a=[...A.set], b=[...B.set];
            if (a[0]===b[0] && a[1]===b[1]){
              for (let r=br*3;r<br*3+3;r++) for (let c=bc*3;c<bc*3+3;c++){
                if ((r===A.r && c===A.c) || (r===B.r && c===B.c) || g[r][c]) continue;
                const S=cand[r][c];
                if (S.delete(a[0])|S.delete(a[1])) did=true;
              }
            }
          }
        }
      }
      return did;
    }

    function placeHiddenPairs(cand){
      // If a digit can only be in two cells in a unit *and* those two cells share exactly two digits → lock them (other candidates removed).
      // We convert eliminations into progress; placements emerge later via singles.
      let did=false;
      function unitHiddenPairs(cells){
        const positions = Array.from({length:10},()=>[]);
        cells.forEach(({r,c})=>{
          for (let v=1; v<=9; v++) if (cand[r][c].has(v)) positions[v].push({r,c});
        });
        for (let v=1; v<=9; v++){
          if (positions[v].length===2){
            const [A,B]=positions[v];
            const setA=cand[A.r][A.c], setB=cand[B.r][B.c];
            // find second value that matches exactly in both cells
            for (let w=1; w<=9; w++){
              if (w===v) continue;
              if (setA.has(w) && setB.has(w)){
                // lock {v,w} in A,B
                const lock=new Set([v,w]);
                const beforeA=setA.size, beforeB=setB.size;
                for (const t of [...setA]) if (!lock.has(t)) setA.delete(t);
                for (const t of [...setB]) if (!lock.has(t)) setB.delete(t);
                if (setA.size!==beforeA || setB.size!==beforeB) did=true;
              }
            }
          }
        }
      }
      // rows
      for (let r=0;r<N;r++) unitHiddenPairs(Array.from({length:N},(_,c)=>({r,c})).filter(({c})=>!g[r][c]));
      // cols
      for (let c=0;c<N;c++) unitHiddenPairs(Array.from({length:N},(_,r)=>({r,c})).filter(({r})=>!g[r][c]));
      // boxes
      for (let br=0;br<3;br++) for (let bc=0;bc<3;bc++){
        const cells=[]; for (let r=br*3;r<br*3+3;r++) for (let c=bc*3;c<bc*3+3;c++) if (!g[r][c]) cells.push({r,c});
        unitHiddenPairs(cells);
      }
      return did;
    }

    function pointingClaiming(cand){
      // Pointing: if in a box, all candidates for v lie in one row (or col), eliminate v from that row (or col) outside the box.
      // Claiming: if in a row (or col), all candidates for v lie in one box, eliminate v from the rest of that box.
      let did=false;
      // Pointing from box -> line
      for (let br=0;br<3;br++) for (let bc=0;bc<3;bc++){
        for (let v=1; v<=9; v++){
          let rows=new Set(), cols=new Set(), cells=[];
          for (let r=br*3;r<br*3+3;r++) for (let c=bc*3;c<bc*3+3;c++){
            if (!g[r][c] && cand[r][c].has(v)){ rows.add(r); cols.add(c); cells.push({r,c}); }
          }
          if (cells.length>=2){
            if (rows.size===1){
              const rr = [...rows][0];
              for (let c=0;c<N;c++){
                if (c>=bc*3 && c<bc*3+3) continue;
                if (!g[rr][c] && cand[rr][c].delete(v)) did=true;
              }
            }
            if (cols.size===1){
              const cc = [...cols][0];
              for (let r=0;r<N;r++){
                if (r>=br*3 && r<br*3+3) continue;
                if (!g[r][cc] && cand[r][cc].delete(v)) did=true;
              }
            }
          }
        }
      }
      // Claiming from line -> box
      for (let r=0;r<N;r++){
        for (let v=1; v<=9; v++){
          const cells=[]; for (let c=0;c<N;c++) if (!g[r][c] && cand[r][c].has(v)) cells.push(c);
          if (cells.length>=2){
            const b0=cells.map(c=>Math.floor(c/3)).reduce((a,b)=> (a===b)?a:-1);
            if (b0!==-1){
              const bc=b0, br=Math.floor(r/3);
              for (let rr=br*3; rr<br*3+3; rr++) for (let cc=bc*3; cc<bc*3+3; cc++){
                if (rr===r) continue;
                if (!g[rr][cc] && cand[rr][cc].delete(v)) did=true;
              }
            }
          }
        }
      }
      for (let c=0;c<N;c++){
        for (let v=1; v<=9; v++){
          const cells=[]; for (let r=0;r<N;r++) if (!g[r][c] && cand[r][c].has(v)) cells.push(r);
          if (cells.length>=2){
            const b0=cells.map(r=>Math.floor(r/3)).reduce((a,b)=> (a===b)?a:-1);
            if (b0!==-1){
              const br=b0, bc=Math.floor(c/3);
              for (let rr=br*3; rr<br*3+3; rr++) for (let cc=bc*3; cc<bc*3+3; cc++){
                if (cc===c) continue;
                if (!g[rr][cc] && cand[rr][cc].delete(v)) did=true;
              }
            }
          }
        }
      }
      return did;
    }

    while (changed){
      changed = false;
      let cand = candidatesFor(g);

      // 1) Placements: NS / HS
      if (allowed.NS){
        const m = findNakedSingle(cand);
        if (m){ place(m.r,m.c,m.v); changed=true; continue; }
      }
      if (allowed.HS){
        const m = findHiddenSingle(cand);
        if (m){ place(m.r,m.c,m.v); changed=true; continue; }
      }

      // 2) Eliminations that may unlock more singles
      let didElim = false;
      if (allowed.NP) didElim = elimNakedPairs(cand) || didElim;
      if (allowed.HP) didElim = placeHiddenPairs(cand) || didElim;
      if (allowed.PC) didElim = pointingClaiming(cand) || didElim;

      if (didElim){
        changed = true;
        // Loop will recompute candidates and try singles again.
      }
    }

    return { solved: isComplete(g) && isValidGrid(g), progress: anyProgress };
  }

  function techniquesForTarget(target){
    if (typeof target === 'object' && target && target.techniques) return target.techniques;
    if (target === 'easy')   return { NS:true, HS:true, NP:false, HP:false, PC:false };
    if (target === 'hard')   return { NS:true, HS:true, NP:true,  HP:true,  PC:true  };
    // default medium
    return { NS:true, HS:true, NP:true,  HP:true,  PC:true };
  }

  // ---------------- Symmetry pairing ----------------
  function symmetryMate(sym){
    return function(i){
      const r=(i/9)|0, c=i%9;
      if (sym==='rotate') return (8-r)*9 + (8-c);
      if (sym==='mirror') return r*9 + (8-c);
      return i;
    };
  }

  // ---------------- Carve with Uniqueness + Human Difficulty Gate ----------------
  function carveUniqueHuman(solved, rnd, opts){
    const t = opts.target || 'medium';
    const sym = opts.symmetry || 'none';
    const tech = techniquesForTarget(t);

    // clue counts per target (coarse)
    let minClues, maxClues;
    if (typeof t === 'object' && t){
      minClues = Math.max(17, t.minClues|0 || 28);
      maxClues = Math.min(81, t.maxClues|0 || 40);
    } else if (t === 'easy'){ minClues=36; maxClues=46; }
    else if (t === 'hard'){ minClues=24; maxClues=32; }
    else { minClues=30; maxClues=38; }

    const puzzle = clone(solved);
    const order = shuffle([...Array(81).keys()], rnd);
    const mate = symmetryMate(sym);

    function clueCount(){
      let n=0; for (let i=0;i<81;i++){ const r=(i/9)|0,c=i%9; if (puzzle[r][c]) n++; } return n;
    }
    
    // Batch processing to reduce checks
    let removalsWithoutCheck = 0;
    const maxRemovalsWithoutCheck = 5; // Allow some removals before expensive checks

    for (const i of order){
      const j = mate(i);
      const r=(i/9)|0, c=i%9, jr=(j/9)|0, jc=j%9;
      if (!puzzle[r][c]) continue;

      const keep1=puzzle[r][c], keep2=puzzle[jr][jc];
      puzzle[r][c]=0; if (j!==i) puzzle[jr][jc]=0;

      const currentClues = clueCount();
      if (currentClues < minClues){
        puzzle[r][c]=keep1; if (j!==i) puzzle[jr][jc]=keep2; continue;
      }

      // For easier difficulties, skip some expensive checks early in the process
      let needsFullCheck = true;
      if ((t === 'easy' || t === 'medium') && currentClues > minClues + 10) {
        needsFullCheck = false;
        removalsWithoutCheck++;
        if (removalsWithoutCheck >= maxRemovalsWithoutCheck) {
          needsFullCheck = true;
          removalsWithoutCheck = 0;
        }
      }

      if (needsFullCheck) {
        // 1) Uniqueness gate
        const uniq = countSolutions(puzzle, 2);
        if (uniq.count !== 1){
          puzzle[r][c]=keep1; if (j!==i) puzzle[jr][jc]=keep2; continue;
        }

        // 2) Human difficulty gate: must be solvable by allowed techniques from current givens
        const okHuman = humanSolve(puzzle, tech).solved;
        if (!okHuman){
          // too hard for the chosen tier → revert this removal
          puzzle[r][c]=keep1; if (j!==i) puzzle[jr][jc]=keep2; continue;
        }
      }

      // accepted removal; keep going; stop early when within clue band
      if (currentClues <= maxClues) break;
    }

    // Safety: ensure final is unique + solvable by human tier
    if (countSolutions(puzzle, 2).count !== 1 || !humanSolve(puzzle, tech).solved){
      // add a random solution digit back until it is
      const empties=[]; for (let i=0;i<81;i++){ const r=(i/9)|0,c=i%9; if (!puzzle[r][c]) empties.push(i); }
      shuffle(empties, rnd);
      for (const idx of empties){
        const rr=(idx/9)|0, cc=idx%9;
        puzzle[rr][cc] = solved[rr][cc];
        if (countSolutions(puzzle, 2).count === 1 && humanSolve(puzzle, tech).solved) break;
      }
    }

    return puzzle;
  }

  // ---------------- Public API ----------------
  function generatePuzzle(opts={}){
    const seed = (opts.seed==null) ? Math.floor(Math.random()*2**31) : Number(opts.seed)|0;
    const rnd = mulberry32(seed);

    // 1) solution grid
    let solved = generateSolved(rnd);

    // Random digit relabel to diversify
    const relabel = shuffle(DIGS.slice(), rnd);
    solved = solved.map(row => row.map(v => relabel[v-1]));

    // 2) carve with uniqueness + human gate
    const givensGrid = carveUniqueHuman(solved, rnd, {
      target: opts.target || 'medium',
      symmetry: opts.symmetry || 'none'
    });

    // 3) return exactly what you need
    return {
      givens: to81(givensGrid),
      solution: to81(solved)
    };
  }

  return { generatePuzzle, from81, to81 };
});
