/* =========================================================
   STARFIELD BACKGROUND
========================================================= */
(function () {
      'use strict';
      var canvas = document.getElementById('starfield');
      var ctx    = canvas.getContext('2d');
      var W, H, stars = [], nebulae = [], shoots = [];

      function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
      }

      function mkStars() {
            stars = [];
            var n = Math.min(Math.floor(W * H / 1600), 520);
            for (var i = 0; i < n; i++) {
                  stars.push({
                        x:     Math.random() * W,
                        y:     Math.random() * H,
                        r:     Math.random() * 1.6 + 0.2,
                        speed: Math.random() * 0.18 + 0.02,
                        alpha: Math.random() * 0.7 + 0.3,
                        da:    (Math.random() * 0.007 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
                        hue:   200 + Math.random() * 60
                  });
            }
            var nc = ['hsla(240,80%,55%,0.042)', 'hsla(280,70%,50%,0.036)',
                      'hsla(200,90%,50%,0.042)', 'hsla(320,60%,45%,0.030)',
                      'hsla(260,75%,48%,0.038)'];
            nebulae = [];
            for (var j = 0; j < 5; j++) {
                  nebulae.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        r: 200 + Math.random() * 420,
                        c: nc[j % nc.length]
                  });
            }
      }

      function launchShoot() {
            shoots.push({
                  x:     Math.random() * W * 0.75,
                  y:     Math.random() * H * 0.40,
                  len:   85 + Math.random() * 160,
                  spd:   11 + Math.random() * 14,
                  alpha: 1,
                  ang:   0.18 + Math.random() * 0.12
            });
      }

      function draw() {
            ctx.clearRect(0, 0, W, H);

            /* deep-space gradient background */
            var g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0,
                                              W * 0.5, H * 0.35, Math.max(W, H) * 0.85);
            g.addColorStop(0,   '#0c0820');
            g.addColorStop(0.5, '#050a12');
            g.addColorStop(1,   '#000005');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);

            /* nebulae */
            nebulae.forEach(function (n) {
                  var ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
                  ng.addColorStop(0, n.c);
                  ng.addColorStop(1, 'transparent');
                  ctx.fillStyle = ng;
                  ctx.fillRect(0, 0, W, H);
            });

            /* stars */
            stars.forEach(function (s) {
                  s.alpha += s.da;
                  if (s.alpha > 1)   { s.alpha = 1;   s.da = -Math.abs(s.da); }
                  if (s.alpha < 0.1) { s.alpha = 0.1; s.da =  Math.abs(s.da); }
                  s.y += s.speed;
                  if (s.y > H) { s.y = -2; s.x = Math.random() * W; }
                  ctx.save();
                  ctx.globalAlpha = s.alpha;
                  ctx.fillStyle   = 'hsl(' + s.hue + ',80%,88%)';
                  ctx.shadowColor = 'hsl(' + s.hue + ',90%,90%)';
                  ctx.shadowBlur  = s.r * 3;
                  ctx.beginPath();
                  ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
            });

            /* shooting stars */
            shoots = shoots.filter(function (ss) {
                  ss.x    += Math.cos(ss.ang) * ss.spd;
                  ss.y    += Math.sin(ss.ang) * ss.spd;
                  ss.alpha -= 0.024;
                  if (ss.alpha <= 0) return false;
                  ctx.save();
                  ctx.globalAlpha = ss.alpha;
                  var sg = ctx.createLinearGradient(
                        ss.x, ss.y,
                        ss.x - Math.cos(ss.ang) * ss.len,
                        ss.y - Math.sin(ss.ang) * ss.len);
                  sg.addColorStop(0, 'rgba(255,255,255,0.9)');
                  sg.addColorStop(1, 'rgba(255,255,255,0)');
                  ctx.strokeStyle = sg;
                  ctx.lineWidth   = 1.5;
                  ctx.beginPath();
                  ctx.moveTo(ss.x, ss.y);
                  ctx.lineTo(ss.x - Math.cos(ss.ang) * ss.len,
                             ss.y - Math.sin(ss.ang) * ss.len);
                  ctx.stroke();
                  ctx.restore();
                  return true;
            });

            requestAnimationFrame(draw);
      }

      window.addEventListener('resize', function () { resize(); mkStars(); });
      resize();
      mkStars();
      draw();
      setInterval(launchShoot, 3400);
}());

/* =========================================================
   3D BOARD ROTATION
========================================================= */
var g_rotY    = 0;
var g_wrapper = document.getElementById('boardWrapper');

function applyTransform(animate) {
      if (animate) {
            g_wrapper.classList.remove('dragging');
      } else {
            g_wrapper.classList.add('dragging');
      }
      g_wrapper.style.transform = 'rotateX(8deg) rotateY(' + g_rotY + 'deg)';
}

document.getElementById('rotateLeft').addEventListener('click', function () {
      g_rotY -= 22;
      applyTransform(true);
});

document.getElementById('rotateRight').addEventListener('click', function () {
      g_rotY += 22;
      applyTransform(true);
});

/* Mouse & touch drag to spin the board */
(function () {
      var dragging  = false;
      var startX    = 0;
      var startRot  = 0;
      var dragMoved = false;

      g_wrapper.addEventListener('mousedown', function (e) {
            dragging  = true;
            startX    = e.clientX;
            startRot  = g_rotY;
            dragMoved = false;
      });

      window.addEventListener('mousemove', function (e) {
            if (!dragging) return;
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 5) dragMoved = true;
            g_rotY = startRot + dx * 0.28;
            applyTransform(false);
      });

      window.addEventListener('mouseup', function () {
            dragging = false;
            g_wrapper.classList.remove('dragging');
      });

      g_wrapper.addEventListener('touchstart', function (e) {
            dragging  = true;
            startX    = e.touches[0].clientX;
            startRot  = g_rotY;
            dragMoved = false;
      }, { passive: true });

      window.addEventListener('touchmove', function (e) {
            if (!dragging) return;
            var dx = e.touches[0].clientX - startX;
            if (Math.abs(dx) > 5) dragMoved = true;
            g_rotY = startRot + dx * 0.28;
            applyTransform(false);
      }, { passive: true });

      window.addEventListener('touchend', function () {
            dragging = false;
            g_wrapper.classList.remove('dragging');
      });

      /* Expose dragMoved for the click guard in the game */
      window.g_dragMoved = function () { return dragMoved; };
      window.g_clearDrag = function () { dragMoved = false; };
}());

/* =========================================================
   PARTICLE FX
========================================================= */
function spawnParticles(cx, cy, color, count) {
      var pfx = document.getElementById('pfx');
      for (var i = 0; i < count; i++) {
            var el   = document.createElement('div');
            el.className = 'px';
            var sz   = 5 + Math.random() * 10;
            var ang  = Math.random() * Math.PI * 2;
            var dist = 110 + Math.random() * 290;
            var dur  = (0.8 + Math.random() * 0.85).toFixed(2) + 's';
            el.style.cssText = [
                  'left:'       + cx + 'px',
                  'top:'        + cy + 'px',
                  'width:'      + sz + 'px',
                  'height:'     + sz + 'px',
                  'background:' + color,
                  'box-shadow:0 0 ' + sz + 'px ' + color,
                  '--dx:'  + (Math.cos(ang) * dist).toFixed(1) + 'px',
                  '--dy:'  + (Math.sin(ang) * dist - 80).toFixed(1) + 'px',
                  '--dur:' + dur
            ].join(';');
            pfx.appendChild(el);
            (function (node, ms) {
                  setTimeout(function () {
                        if (node.parentNode) node.parentNode.removeChild(node);
                  }, ms);
            }(el, parseFloat(dur) * 1000 + 120));
      }
}

/* =========================================================
   CONNECT FOUR GAME
========================================================= */
(function () {
      'use strict';

      /* --- State --- */
      var playerOne  = 'Player 1';
      var playerTwo  = 'Player 2';
      var currentP   = 1;           /* 1 or 2 */
      var gameActive = false;
      var scores     = { 1: 0, 2: 0 };
      var board      = [];          /* board[row][col] = 0|1|2 */
      var ROWS = 6, COLS = 7;

      function emptyBoard() {
            board = [];
            for (var r = 0; r < ROWS; r++) {
                  board[r] = [];
                  for (var c = 0; c < COLS; c++) board[r][c] = 0;
            }
      }

      /* --- DOM helpers --- */
      var $rows;

      function queryBoard() {
            $rows = $('#connectFourBoard tbody tr');
      }

      function btn(r, c) {
            return $rows.eq(r).find('td').eq(c).find('button');
      }

      /* --- Game start / reset --- */
      function startGame() {
            emptyBoard();
            queryBoard();
            $('#connectFourBoard button').removeClass('p1 p2 winner col-hi');
            $('#connectFourBoard').removeClass('game-over');
            $('#winOverlay, #tieOverlay').addClass('hidden');

            playerOne = (window.prompt('Player 1 name (Dark chips)') || 'Player 1').trim() || 'Player 1';
            playerTwo = (window.prompt('Player 2 name (Red chips)')  || 'Player 2').trim() || 'Player 2';

            currentP   = 1;
            gameActive = true;

            $('#p1name').text(playerOne);
            $('#p2name').text(playerTwo);
            $('#p1score').text(scores[1]);
            $('#p2score').text(scores[2]);
            updateHUD();
      }

      /* --- HUD --- */
      function updateHUD() {
            var name  = currentP === 1 ? playerOne : playerTwo;
            var color = currentP === 1 ? '#aaccff' : '#ff7090';
            $('#turnDisplay')
                  .text(name + "\u2019s turn")
                  .css({ color: color, textShadow: '0 0 9px ' + color });
            $('#p1card').removeClass('active active-p2').toggleClass('active',    currentP === 1);
            $('#p2card').removeClass('active active-p2').toggleClass('active-p2', currentP === 2);
      }

      /* --- Column logic --- */
      function lowestEmpty(col) {
            for (var r = ROWS - 1; r >= 0; r--) {
                  if (board[r][col] === 0) return r;
            }
            return -1; /* column full */
      }

      /* --- Win detection --- */
      function cell(r, c) {
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return -1;
            return board[r][c];
      }

      function checkFour(r, c, dr, dc) {
            var v = cell(r, c);
            if (!v) return null;
            for (var i = 1; i < 4; i++) {
                  if (cell(r + dr * i, c + dc * i) !== v) return null;
            }
            return [
                  [r,          c         ],
                  [r + dr,     c + dc    ],
                  [r + dr * 2, c + dc * 2],
                  [r + dr * 3, c + dc * 3]
            ];
      }

      function findWin() {
            var dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
            for (var r = 0; r < ROWS; r++) {
                  for (var c = 0; c < COLS; c++) {
                        for (var d = 0; d < dirs.length; d++) {
                              var res = checkFour(r, c, dirs[d][0], dirs[d][1]);
                              if (res) return res;
                        }
                  }
            }
            return null;
      }

      function isFull() {
            for (var c = 0; c < COLS; c++) {
                  if (board[0][c] === 0) return false;
            }
            return true;
      }

      /* --- Handle a move --- */
      function handleClick(col) {
            if (!gameActive) return;
            var row = lowestEmpty(col);
            if (row < 0) return; /* full column */

            board[row][col] = currentP;
            btn(row, col).addClass(currentP === 1 ? 'p1' : 'p2');

            var win = findWin();
            if (win) {
                  gameActive = false;
                  win.forEach(function (pos) {
                        btn(pos[0], pos[1]).addClass('winner');
                  });
                  $('#connectFourBoard').addClass('game-over');

                  scores[currentP]++;
                  $('#p' + currentP + 'score').text(scores[currentP]);

                  var cx = window.innerWidth  / 2;
                  var cy = window.innerHeight / 2;
                  var chipColor = currentP === 1 ? '#cccccc' : '#ed2d49';
                  spawnParticles(cx, cy, chipColor, 55);
                  spawnParticles(cx, cy, '#ffdd00', 38);
                  spawnParticles(cx, cy, '#ffffff',  22);

                  var winner = currentP === 1 ? playerOne : playerTwo;
                  setTimeout(function () {
                        $('#winPlayerName').text(winner + ' wins!');
                        $('#winOverlay').removeClass('hidden');
                  }, 900);

            } else if (isFull()) {
                  gameActive = false;
                  $('#connectFourBoard').addClass('game-over');
                  setTimeout(function () {
                        $('#tieOverlay').removeClass('hidden');
                  }, 500);

            } else {
                  currentP = currentP === 1 ? 2 : 1;
                  updateHUD();
            }
      }

      /* --- Wire up events (once) --- */
      $(document).ready(function () {
            queryBoard();

            /* Chip drop on button click (guard against drag) */
            $('#connectFourBoard').on('click', 'button', function () {
                  if (window.g_dragMoved && window.g_dragMoved()) {
                        if (window.g_clearDrag) window.g_clearDrag();
                        return;
                  }
                  handleClick($(this).closest('td').index());
            });

            /* Column hover highlight */
            $('#connectFourBoard').on('mouseenter', 'td', function () {
                  if (!gameActive) return;
                  var col = $(this).index();
                  $rows.each(function () {
                        $(this).find('td').eq(col).find('button:not(.p1):not(.p2)').addClass('col-hi');
                  });
            }).on('mouseleave', 'td', function () {
                  $('#connectFourBoard button').removeClass('col-hi');
            });

            /* Buttons */
            $('#reloadGame').on('click', startGame);
            $('#winReload').on('click', function () {
                  $('#winOverlay').addClass('hidden');
                  startGame();
            });
            $('#tieReload').on('click', function () {
                  $('#tieOverlay').addClass('hidden');
                  startGame();
            });

            startGame();
      });

}());