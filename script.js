// =========================================================
// This file has two independent parts:
//   1. Ambient background hearts (purely decorative)
//   2. The Yes / No button behavior (the actual "game")
// Feel free to tweak the numbers below to change the feel.
// =========================================================

(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------
  // 0. Photo slot: show the real image once it has actually loaded,
  //    otherwise leave the placeholder showing.
  // ---------------------------------------------------------
  var photoFrame = document.getElementById('photoFrame');
  var photoImg = document.getElementById('photoImg');

  function revealPhoto() { photoFrame.classList.add('has-photo'); }

  if (photoImg.complete && photoImg.naturalWidth > 0) {
    revealPhoto(); // image was already loaded (e.g. from cache) before this ran
  } else {
    photoImg.addEventListener('load', revealPhoto);
  }

  // ---------------------------------------------------------
  // 1. Spawn the floating hearts that rise in the background
  // ---------------------------------------------------------
  var field = document.getElementById('heartField');
  var colors = ['var(--heart-a)', 'var(--heart-b)', 'var(--heart-c)'];
  var heartCount = reduceMotion ? 0 : 9; // set to 0 to turn off entirely

  for (var i = 0; i < heartCount; i++) {
    var heart = document.createElement('div');
    heart.className = 'heart';

    var size = 8 + Math.random() * 14;       // px
    var left = 4 + Math.random() * 92;       // % across the screen
    var duration = 9 + Math.random() * 8;    // seconds to rise
    var delay = -Math.random() * duration;   // negative delay = starts mid-animation

    heart.style.left = left + 'vw';
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    heart.style.background = colors[i % colors.length];
    heart.style.animationDuration = duration + 's';
    heart.style.animationDelay = delay + 's';

    field.appendChild(heart);
  }

  // ---------------------------------------------------------
  // 2. Yes / No button behavior
  // ---------------------------------------------------------
  var yesBtn = document.getElementById('yesBtn');
  var noBtn = document.getElementById('noBtn');
  var noZone = document.getElementById('noZone');
  var noHint = document.getElementById('noHint');
  var stage = document.getElementById('stage');
  var headline = document.getElementById('headline');
  var eyeBrow= document.getElementById('eyebrow');
  var subtext = document.getElementById('subtext');
  var seal = document.getElementById('seal');

  // Captions shown under the No button each time it dodges.
  // Add, remove, or reorder these however you like.
  var hints = [ 
    'try again.🤣',
    'nice try.😂',
    'still no.😒',
    'that button is decorative.😊',
    'yes is right there, though.😋',
    "okay, now you're just chasing it.🤨",
    'this is the last one. (it is not.)',
    'You cant say No 😼',
    'Really?? NO??😣😔'
   , 'admirable persistence.'
  ];

  var dodgeCount = 0;

  // How much the Yes button grows per dodge, and its max size.
  var GROWTH_PER_DODGE = 0.045;
  var MAX_SCALE = 1.32;

  function currentScale() {
    return Math.min(MAX_SCALE, 1 + dodgeCount * GROWTH_PER_DODGE);
  }

  // Moves the No button to a random spot on screen.
  function dodge() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var rect = noBtn.getBoundingClientRect();
    var buttonWidth = rect.width;
    var buttonHeight = rect.height;
    var margin = 24;

    // First time: switch from normal flow to position:fixed at its
    // current spot, so it doesn't jump before the very first move.
    // It also moves out of .no-zone and into <body> directly -- otherwise
    // the now-empty .no-zone still reserves its flex gap inside .actions,
    // which pushes the Yes button off-center.
    if (!noBtn.classList.contains('roaming')) {
      noBtn.style.left = rect.left + 'px';
      noBtn.style.top = rect.top + 'px';
      noBtn.classList.add('roaming');
      document.body.appendChild(noBtn);
      // .no-zone still has whitespace text nodes inside it even once the
      // button is moved out, so CSS ":empty" never matches -- hide it
      // directly instead, so it stops reserving a flex gap in .actions.
      noZone.style.display = 'none';
      void noBtn.offsetWidth; // force layout so the CSS transition kicks in next
    }

    // Keep it away from the very top (where the headline is) and off-screen edges.
    var minTop = h * 0.15;
    var maxTop = h - buttonHeight - margin;
    var minLeft = margin;
    var maxLeft = w - buttonWidth - margin;

    var newTop = minTop + Math.random() * Math.max(1, maxTop - minTop);
    var newLeft = minLeft + Math.random() * Math.max(1, maxLeft - minLeft);

    noBtn.style.top = newTop + 'px';
    noBtn.style.left = newLeft + 'px';

    dodgeCount++;
    yesBtn.style.setProperty('--scale', currentScale().toFixed(3));
    noHint.textContent = hints[Math.min(dodgeCount - 1, hints.length - 1)];
  }

  // Trigger the dodge only on an actual press (mouse click or touch tap).
  // pointerdown alone covers both mouse and touch, so no separate
  // touchstart/pointerenter/focus listeners are needed -- adding them
  // caused a single tap to fire multiple dodges (skipping hints) because
  // touch input emits pointerenter, pointerdown, and touchstart in a row.
  noBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); dodge(); });

  // Keep it on screen if the window is resized while it's roaming.
  window.addEventListener('resize', function () {
    if (noBtn.classList.contains('roaming')) dodge();
  });

  // Spawns a little burst of heart particles from the center of the screen.
  function spawnBurst() {
    var particleCount = reduceMotion ? 0 : 22;
    var centerX = window.innerWidth / 2;
    var centerY = window.innerHeight / 2;

    for (var i = 0; i < particleCount; i++) {
      var particle = document.createElement('div');
      particle.className = 'burst heart';

      var size = 10 + Math.random() * 16;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.style.background = colors[i % colors.length];
      particle.style.opacity = '0.9';
      particle.style.animation = 'none'; // we animate this one with transitions instead

      document.body.appendChild(particle);

      var angle = Math.random() * Math.PI * 2;
      var distance = 120 + Math.random() * 260;
      var dx = Math.cos(angle) * distance;
      var dy = Math.sin(angle) * distance - 40; // slight upward bias
      var rotation = Math.random() * 60 - 30;

      // Wait one frame so the transition below actually animates.
      requestAnimationFrame((function (el, dx, dy, rotation) {
        return function () {
          el.style.transition = 'transform 1.1s cubic-bezier(.16,.8,.3,1), opacity 1.1s ease';
          el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (rotation - 45) + 'deg)';
          el.style.opacity = '0';
        };
      })(particle, dx, dy, rotation));

      setTimeout((function (el) { return function () { el.remove(); }; })(particle), 1300);
    }
  }

  yesBtn.addEventListener('click', function () {
    spawnBurst();
    stage.classList.add('answered');

    // If No was already roaming, it lives directly under <body> now (see
    // dodge()), so it's outside .stage and the CSS rule that hides
    // ".stage.answered .actions" never reaches it. Hide it directly.
    noBtn.style.display = 'none';

    // Customize this response text to whatever you like.
    eyeBrow.innerHTML= "Yayyyyyyyyyyyyyyyyyyyyyyyyyyyyy💗"
    headline.innerHTML = "I Love You Maleka.";
    subtext.textContent ="I know I have repeatedly hurt you and thats not justified just because I was hurt myself. I did not keep my promise. I just wanna say that I really love you and will always keep in mind that we are married and there is just no going back no matter what. I beg you to always believe in the fact the I LOVE YOU SO MUCH cos thats the truth ,everything else was just my stupid self speaking and that's just lies,none of those are what I meant, I am really Sorry My Love....</3";

    var today = new Date();
    var formatted = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    seal.textContent = 'Married on ' + formatted;
    seal.style.display = 'block';
  });
})();
