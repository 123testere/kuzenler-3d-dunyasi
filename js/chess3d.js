/* ============================================================================
   GERÇEK KURALLI 3 BOYUTLU KUZENLER SATRANCI (chess3d.js)
   - Tam FIDE taş hareketleri: Piyon (1-2 ileri, çapraz yeme, vezire terfi),
     Kale, Fil, At, Vezir, Şah + Şah Çekme (Check) & Şah Mat (Checkmate) kontrolü
   - Yeşil geçerli hamle noktaları, kırmızı taş yeme vurgusu, Hamle Geri Al (Undo)
   - 2 Kişilik (Umay vs Yusuf) veya Bilgisayara Karşı (Bot) modu
   ============================================================================ */

const INITIAL_BOARD = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const SYMBOLS = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
};

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

export class Chess3DGame {
  constructor(callbacks = {}) {
    this.onSound = callbacks.onSound || (() => {});
    this.onSpeak = callbacks.onSpeak || (() => {});
    this.onReward = callbacks.onReward || (() => {});
    this.onSyncMove = callbacks.onSyncMove || (() => {});
    this.getPlayerId = callbacks.getPlayerId || (() => 'umay');
    this.playMode = 'online'; // 'online' | 'local' | 'bot'
    this.vsBot = false;
    this.board = [];
    this.turn = 'white'; // 'white' = Uppercase (Umay Pembe), 'black' = Lowercase (Yusuf Yeşil)
    this.selected = null;
    this.legalMoves = [];
    this.history = [];
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.gameOver = false;
    this.winnerText = '';
    this.lockHint = '';
    this.reset(false);
  }

  getMyColor() {
    // Umay/Deren/Elif = Pembe Takım (white), Yusuf = Yeşil Takım (black)
    return this.getPlayerId() === 'yusuf' ? 'black' : 'white';
  }

  isWhite(p) { return p && p === p.toUpperCase(); }
  isBlack(p) { return p && p === p.toLowerCase(); }
  colorOf(p) { return !p ? null : (this.isWhite(p) ? 'white' : 'black'); }

  reset(broadcast = true) {
    this.board = INITIAL_BOARD.map(r => [...r]);
    this.turn = 'white';
    this.selected = null;
    this.legalMoves = [];
    this.history = [];
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.gameOver = false;
    this.winnerText = '';
    this.lockHint = '';
    this.render();
    if (broadcast && !this.vsBot && !this._applyingRemote) {
      this.onSyncMove({
        board: this.board,
        turn: this.turn,
        capturedWhite: this.capturedWhite,
        capturedBlack: this.capturedBlack,
        gameOver: this.gameOver,
        winnerText: this.winnerText
      });
    }
    // If playing vsBot as Black (Yusuf), Bot (White) opens automatically!
    if (this.vsBot && this.getMyColor() === 'black') {
      setTimeout(() => {
        if (this.vsBot && !this.gameOver && this.turn === 'white') this.makeBotMove();
      }, 600);
    }
  }

  setMode(mode) {
    if (mode === true) mode = 'bot';
    if (mode === false) mode = 'online';
    this.playMode = mode || 'online';
    this.vsBot = (this.playMode === 'bot');
    const myCol = this.getMyColor();
    this.reset(this.playMode === 'online');
    const b2p = document.getElementById('chess-mode-2p');
    const bLoc = document.getElementById('chess-mode-local');
    const bBot = document.getElementById('chess-mode-bot');
    if (b2p) b2p.classList.toggle('active', this.playMode === 'online');
    if (bLoc) bLoc.classList.toggle('active', this.playMode === 'local');
    if (bBot) bBot.classList.toggle('active', this.playMode === 'bot');
    const msg = this.playMode === 'bot'
      ? `Bota karşı 3 boyutlu satranç başladı! Sen ${myCol === 'white' ? 'Pembe Takımsın' : 'Yeşil Takımsın'}!`
      : (this.playMode === 'local'
        ? 'Aynı cihazda 2 kişilik satranç başladı! Sırayla Pembe ve Yeşil oynayabilir!'
        : 'Online 2 kuzen canlı satranç başladı! Herkes kendi cihazından kendi taşını oynar!');
    this.onSpeak(msg);
  }

  undo() {
    if (this.history.length === 0) return;
    const myCol = this.getMyColor();
    // In vsBot mode, undo 2 plies so it returns to player's turn
    const steps = (this.vsBot && this.turn === myCol && this.history.length >= 2) ? 2 : 1;
    let prev = null;
    for (let i = 0; i < steps; i++) {
      prev = this.history.pop();
    }
    if (!prev) return;
    this.board = prev.board;
    this.turn = prev.turn;
    this.capturedWhite = prev.capturedWhite;
    this.capturedBlack = prev.capturedBlack;
    this.selected = null;
    this.legalMoves = [];
    this.gameOver = false;
    this.lockHint = '';
    this.onSound('pop');
    this.render();
  }

  getPseudoMoves(board, r, c) {
    const p = board[r][c];
    if (!p) return [];
    const col = this.colorOf(p);
    const type = p.toLowerCase();
    const moves = [];
    const inBounds = (nr, nc) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

    const addSlide = (dirs) => {
      for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        while (inBounds(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ r: nr, c: nc });
          } else {
            if (this.colorOf(target) !== col) moves.push({ r: nr, c: nc, capture: true });
            break;
          }
          nr += dr; nc += dc;
        }
      }
    };

    if (type === 'p') {
      const dir = col === 'white' ? -1 : 1;
      const startRow = col === 'white' ? 6 : 1;
      if (inBounds(r + dir, c) && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + 2 * dir][c]) {
          moves.push({ r: r + 2 * dir, c });
        }
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (inBounds(nr, nc) && board[nr][nc] && this.colorOf(board[nr][nc]) !== col) {
          moves.push({ r: nr, c: nc, capture: true });
        }
      }
    } else if (type === 'r') {
      addSlide([[1,0],[-1,0],[0,1],[0,-1]]);
    } else if (type === 'b') {
      addSlide([[1,1],[1,-1],[-1,1],[-1,-1]]);
    } else if (type === 'q') {
      addSlide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]);
    } else if (type === 'n') {
      const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      for (const [dr, dc] of jumps) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc)) {
          const t = board[nr][nc];
          if (!t || this.colorOf(t) !== col) moves.push({ r: nr, c: nc, capture: !!t });
        }
      }
    } else if (type === 'k') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (inBounds(nr, nc)) {
            const t = board[nr][nc];
            if (!t || this.colorOf(t) !== col) moves.push({ r: nr, c: nc, capture: !!t });
          }
        }
      }
    }
    return moves;
  }

  isKingInCheck(board, color) {
    let kr = -1, kc = -1;
    const kingChar = color === 'white' ? 'K' : 'k';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === kingChar) { kr = r; kc = c; break; }
      }
    }
    if (kr === -1) return true;
    const enemy = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.colorOf(board[r][c]) === enemy) {
          const pm = this.getPseudoMoves(board, r, c);
          if (pm.some(m => m.r === kr && m.c === kc)) return true;
        }
      }
    }
    return false;
  }

  getLegalMoves(r, c) {
    const p = this.board[r][c];
    if (!p) return [];
    const col = this.colorOf(p);
    const pseudo = this.getPseudoMoves(this.board, r, c);
    return pseudo.filter(m => {
      const sim = this.board.map(row => [...row]);
      sim[m.r][m.c] = sim[r][c];
      sim[r][c] = null;
      return !this.isKingInCheck(sim, col);
    });
  }

  hasAnyLegalMove(color) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.colorOf(this.board[r][c]) === color && this.getLegalMoves(r, c).length > 0) {
          return true;
        }
      }
    }
    return false;
  }

  handleCellClick(r, c) {
    if (this.gameOver) return;
    const isLocalPass = (this.playMode === 'local');
    const myCol = isLocalPass ? this.turn : this.getMyColor();

    // STRICT TURN LOCK in 'online' and 'bot' modes (In 'local' pass-and-play mode, both sides play in turn on same screen!)
    if (!isLocalPass && this.turn !== myCol) {
      const waitWho = this.vsBot ? 'Bot' : (this.turn === 'white' ? 'Umay (Pembe)' : 'Yusuf (Yeşil)');
      this.lockHint = `⏳ Sıra ${waitWho}'ta! Lütfen sıranı bekle! (Aynı cihazdaysanız "📱 Aynı Cihaz 2P" seçin!)`;
      this.onSound('moo');
      this.onSpeak(`Şu an sıra ${waitWho} tarafında! Kendi sıranı bekle!`);
      this.render();
      return;
    }

    const clicked = this.board[r][c];
    const clickedCol = this.colorOf(clicked);

    // Execute legal move if selected
    if (this.selected) {
      const targetMove = this.legalMoves.find(m => m.r === r && m.c === c);
      if (targetMove) {
        this.lockHint = '';
        this.executeMove(this.selected.r, this.selected.c, r, c);
        return;
      }
    }

    // STRICT PIECE OWNERSHIP LOCK: Cannot select opponent's pieces!
    if (clicked && clickedCol !== myCol) {
      const ownerName = clickedCol === 'white' ? 'Umay\'ın (Pembe)' : (this.vsBot ? 'Botun' : 'Yusuf\'un (Yeşil)');
      this.lockHint = `🔒 Bu ${ownerName} taşı! Sadece kendi taşlarını oynatabilirsin!`;
      this.onSound('moo');
      this.render();
      return;
    }

    // Select own piece
    if (clicked && clickedCol === myCol) {
      this.lockHint = '';
      this.selected = { r, c };
      this.legalMoves = this.getLegalMoves(r, c);
      this.onSound('pop');
      this.render();
    } else {
      this.selected = null;
      this.legalMoves = [];
      this.render();
    }
  }

  executeMove(fr, fc, tr, tc) {
    // Save undo state
    this.history.push({
      board: this.board.map(row => [...row]),
      turn: this.turn,
      capturedWhite: [...this.capturedWhite],
      capturedBlack: [...this.capturedBlack]
    });

    const moving = this.board[fr][fc];
    const captured = this.board[tr][tc];
    if (captured) {
      if (this.isWhite(captured)) this.capturedWhite.push(SYMBOLS[captured]);
      else this.capturedBlack.push(SYMBOLS[captured]);
    }

    this.board[tr][tc] = moving;
    this.board[fr][fc] = null;

    // Pawn promotion
    if (moving === 'P' && tr === 0) { this.board[tr][tc] = 'Q'; this.onSpeak('Piyon Vezir oldu!'); }
    if (moving === 'p' && tr === 7) { this.board[tr][tc] = 'q'; this.onSpeak('Piyon Vezir oldu!'); }

    this.selected = null;
    this.legalMoves = [];
    this.turn = this.turn === 'white' ? 'black' : 'white';

    const inCheck = this.isKingInCheck(this.board, this.turn);
    const hasMove = this.hasAnyLegalMove(this.turn);
    const kingCaptured = (captured === 'k' || captured === 'K');

    if (kingCaptured || !hasMove) {
      this.gameOver = true;
      this.onSound('win');
      if (kingCaptured || inCheck) {
        const winner = this.turn === 'white' ? 'YEŞİL TAKIM (YUSUF)' : 'PEMBE TAKIM (UMAY)';
        this.winnerText = `🏆 TEBRİKLER! ${winner} KAZANDI! 🎉`;
        this.onSpeak(`Şah Mat! Tebrikler! ${winner} 3 boyutlu satrancı kazandı!`);
        this.onReward(6);
      } else {
        this.winnerText = '🤝 PAT! OYUN BERABERE BİTTİ!';
        this.onSpeak('Pat! Oyun berabere bitti!');
      }
    } else if (inCheck) {
      this.onSound('win');
      this.onSpeak('Şah çekildi! Şahını koru!');
    } else if (captured) {
      this.onSound('win');
      this.onReward(1);
    } else {
      this.onSound('pop');
    }

    this.render();
    if (!this._applyingRemote && this.playMode === 'online') {
      this.onSyncMove({
        board: this.board,
        turn: this.turn,
        capturedWhite: this.capturedWhite,
        capturedBlack: this.capturedBlack,
        gameOver: this.gameOver,
        winnerText: this.winnerText
      });
    }

    const botCol = this.getMyColor() === 'white' ? 'black' : 'white';
    if (!this.gameOver && this.vsBot && this.turn === botCol) {
      setTimeout(() => this.makeBotMove(), 550);
    }
  }

  applyRemoteState(remote) {
    if (!remote || !remote.board || this.playMode !== 'online') return;
    this._applyingRemote = true;
    this.board = remote.board;
    this.turn = remote.turn;
    this.capturedWhite = remote.capturedWhite || [];
    this.capturedBlack = remote.capturedBlack || [];
    this.gameOver = !!remote.gameOver;
    this.winnerText = remote.winnerText || '';
    this.selected = null;
    this.legalMoves = [];
    this.lockHint = '';
    this.onSound('pop');
    this.render();
    this._applyingRemote = false;
  }

  makeBotMove() {
    const botCol = this.getMyColor() === 'white' ? 'black' : 'white';
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (this.colorOf(this.board[r][c]) === botCol) {
          const lm = this.getLegalMoves(r, c);
          lm.forEach(m => {
            const target = this.board[m.r][m.c];
            const score = target ? (PIECE_VALUES[target.toLowerCase()] * 10) : Math.random() * 2;
            allMoves.push({ fr: r, fc: c, tr: m.r, tc: m.c, score });
          });
        }
      }
    }
    if (allMoves.length === 0) return;
    allMoves.sort((a, b) => b.score - a.score);
    const best = allMoves[0];
    this.executeMove(best.fr, best.fc, best.tr, best.tc);
  }

  render() {
    const grid = document.getElementById('chess-board-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const turnEl = document.getElementById('chess-turn-text');
    const capEl = document.getElementById('chess-captured-text');
    const inCheck = this.isKingInCheck(this.board, this.turn);
    const myCol = this.playMode === 'local' ? this.turn : this.getMyColor();
    const isMyTurn = (this.turn === myCol);

    if (turnEl) {
      if (this.gameOver) {
        turnEl.textContent = this.winnerText || '🏆 KAZANDI!';
      } else if (this.lockHint) {
        turnEl.textContent = this.lockHint;
      } else {
        const who = this.turn === 'white'
          ? (this.vsBot && myCol === 'black' ? 'Bot (Pembe) ♔' : 'Pembe Takım (Umay) ♔')
          : (this.vsBot && myCol === 'white' ? 'Bot (Yeşil) ♚' : 'Yeşil Takım (Yusuf) ♚');
        turnEl.textContent = isMyTurn
          ? `✅ Sıra SENDE! (${who})${inCheck ? ' — ⚠️ ŞAH!' : ''}`
          : `⏳ Sıra ${who} — Bekle!${inCheck ? ' — ⚠️ ŞAH!' : ''}`;
      }
      turnEl.style.background = this.gameOver ? '#fef08a' : (this.lockHint ? '#fee2e2' : (isMyTurn ? '#dcfce7' : '#f1f5f9'));
      turnEl.style.color = this.gameOver ? '#b45309' : (this.lockHint ? '#b91c1c' : (isMyTurn ? '#166534' : '#475569'));
    }
    const banner = document.getElementById('chess-winner-banner');
    if (banner) {
      if (this.gameOver && this.winnerText) {
        banner.textContent = this.winnerText;
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }
    if (capEl) {
      capEl.textContent = `Alınanlar — Pembe: ${this.capturedBlack.join('') || '—'} | Yeşil: ${this.capturedWhite.join('') || '—'}`;
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        const isLight = (r + c) % 2 === 0;
        const isSel = this.selected && this.selected.r === r && this.selected.c === c;
        const legal = this.legalMoves.find(m => m.r === r && m.c === c);

        const cell = document.createElement('div');
        cell.style.width = '50px';
        cell.style.height = '50px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.cursor = 'pointer';
        cell.style.position = 'relative';
        cell.style.background = isSel
          ? '#fde047'
          : (legal && legal.capture)
            ? '#fca5a5'
            : (isLight ? '#fef3c7' : '#b45309');
        cell.style.boxShadow = isSel ? 'inset 0 0 0 4px #ef4444' : 'none';

        if (legal && !legal.capture) {
          const dot = document.createElement('div');
          dot.style.width = '18px';
          dot.style.height = '18px';
          dot.style.borderRadius = '50%';
          dot.style.background = 'rgba(34, 197, 94, 0.85)';
          dot.style.border = '3px solid #fff';
          dot.style.boxShadow = '0 2px 6px rgba(0,0,0,0.25)';
          cell.appendChild(dot);
        }

        if (piece) {
          const isW = this.isWhite(piece);
          const token = document.createElement('div');
          token.textContent = SYMBOLS[piece];
          token.style.fontSize = '32px';
          token.style.lineHeight = '1';
          token.style.width = '40px';
          token.style.height = '40px';
          token.style.borderRadius = '50%';
          token.style.display = 'flex';
          token.style.alignItems = 'center';
          token.style.justifyContent = 'center';
          token.style.background = isW ? 'linear-gradient(145deg,#fff1f2,#f472b6)' : 'linear-gradient(145deg,#ecfdf5,#10b981)';
          token.style.color = isW ? '#831843' : '#064e3b';
          token.style.border = '3px solid #ffffff';
          token.style.boxShadow = '0 6px 0 rgba(0,0,0,0.35), 0 9px 12px rgba(0,0,0,0.25)';
          token.style.transform = 'translateY(-4px)';
          cell.appendChild(token);
        }

        cell.onclick = () => this.handleCellClick(r, c);
        grid.appendChild(cell);
      }
    }
  }
}
