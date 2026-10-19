(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const modal = $("#gameModal"), modalTitle = $("#modalTitle"), modalEyebrow = $("#modalEyebrow"), modalBody = $("#modalBody"), toast = $("#toast");
  let points = 0, solved = [], activeCleanup = null, toastTimer;

  try {
    const saved = JSON.parse(localStorage.getItem("enigmax-progress") || "{}");
    points = Number.isFinite(saved.points) ? saved.points : 0;
    solved = Array.isArray(saved.solved) ? saved.solved : [];
  } catch (_) {}

  function saveProgress() {
    try { localStorage.setItem("enigmax-progress", JSON.stringify({points, solved})); } catch (_) {}
    $("#solvedCount").textContent = solved.length;
    $("#pointsCount").textContent = points;
    $("#rankLabel").textContent = points >= 300 ? "Master" : points >= 150 ? "Expert" : points >= 50 ? "Detective" : "Rookie";
  }
  function notify(message) {
    toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function openModal(title, eyebrow = "ENIGMAX EXPERIENCE") {
    if (activeCleanup) { activeCleanup(); activeCleanup = null; }
    modalTitle.textContent = title; modalEyebrow.textContent = eyebrow; modalBody.replaceChildren();
    modal.hidden = false; document.body.style.overflow = "hidden"; $("#closeModal").focus();
  }
  function closeModal() {
    if (activeCleanup) { activeCleanup(); activeCleanup = null; }
    modal.hidden = true; document.body.style.overflow = "";
  }
  function el(tag, text, className) {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (className) n.className = className;
    return n;
  }
  function p(text) { modalBody.append(el("p", text)); }
  function btn(text, callback, className = "option-btn") {
    const n = el("button", text, className); n.type = "button"; n.addEventListener("click", callback); modalBody.append(n); return n;
  }
  function reward(id, amount = 20) {
    if (solved.includes(id)) { notify("You have already completed this challenge."); return false; }
    solved.push(id); points += amount; saveProgress(); notify(`Completed! +${amount} XP`); return true;
  }

  function lockedRoom() {
    openModal("The Locked Room", "CASE 001 · DETECTIVE");
    p("At 9 PM, a rare blue diamond disappeared from a locked exhibition room. The electronic log shows no entry between 8:30 and 9:15 PM.");
    p("Which clue would you investigate first?");
    [
      ["A. The window is open", "The outer ledge has undisturbed dust. The window may be a distraction, but more evidence is needed."],
      ["B. The display case is intact", "The diamond may have been removed with a key or by someone who knew the case. This is a useful lead."],
      ["C. The wall clock is five minutes slow", "This could affect witness timelines. Compare the clock with the electronic access log."]
    ].forEach(([label, feedback]) => btn(label, () => {
      modalBody.replaceChildren(); p(feedback); p("A clue is not proof. What is the most reasonable next step?");
      btn("Compare access records with the timeline", () => {
        modalBody.replaceChildren();
        p("Good investigative reasoning! Compare the records and seek corroborating evidence before drawing a conclusion.");
        if (reward("locked-room", 50)) p("Case investigation completed. +50 XP");
        else p("You have already earned this case's reward.");
        btn("Finish", closeModal, "primary-btn");
      });
      btn("Accuse someone immediately", () => notify("There is not enough evidence to accuse anyone."));
      btn("Review another clue", lockedRoom);
    }));
  }

  function missingHour() {
    openModal("The Missing Hour", "CASE 002 · LOGIC");
    p("A museum tour began at 2 PM. A visitor's ticket was scanned at 2:40 PM, but the visitor says they left at 2:20 PM.");
    p("Which conclusion is justified?");
    btn("The visitor definitely lied", () => notify("Not proven. First establish what the scan records."));
    btn("Verify the scan and compare other evidence", () => {
      modalBody.replaceChildren(); p("Correct! A scan might record entry, exit or another event. Establish what it means before judging the statement.");
      if (reward("missing-hour", 50)) p("+50 XP earned!");
      btn("Finish", closeModal, "primary-btn");
    });
    btn("The guide definitely lied", () => notify("The current evidence does not establish that."));
  }

  function sequenceGame() {
    openModal("Pattern Breaker", "MIND CHALLENGE");
    p("Find the next number in the sequence:");
    const seq = el("div", "2  ·  6  ·  12  ·  20  ·  ?");
    seq.style.cssText = "font-size:24px;font-weight:800;text-align:center;padding:20px;color:#35e2d0";
    modalBody.append(seq); p("Choose your answer.");
    [24, 28, 30, 32].forEach(answer => btn(String(answer), () => {
      if (answer !== 30) { notify("Not quite. Look at the differences between consecutive numbers."); return; }
      modalBody.replaceChildren(); p("Correct! The pattern is n × (n + 1): 1×2, 2×3, 3×4, 4×5, 5×6.");
      if (reward("sequence", 20)) p("+20 XP earned!");
      btn("Play again", sequenceGame); btn("Close", closeModal);
    }));
  }

  function memoryGame() {
    openModal("Memory Vault", "MEMORY CHALLENGE");
    const symbols = ["◆", "●", "▲", "★", "■", "✦"];
    const target = symbols[Math.floor(Math.random() * symbols.length)];
    p("Memorise this symbol. It will disappear shortly.");
    const display = el("div", target);
    display.style.cssText = "font-size:58px;text-align:center;padding:24px;color:#35e2d0";
    modalBody.append(display);
    const timerText = el("p", "Remember the symbol...");
    timerText.style.textAlign = "center"; modalBody.append(timerText);
    const timer = setTimeout(() => {
      display.textContent = "?"; p("Which symbol did you see?");
      symbols.forEach(symbol => btn(symbol, () => {
        if (symbol !== target) { notify("Incorrect. Try another round!"); return; }
        modalBody.replaceChildren(); p("Excellent memory!");
        if (reward("memory", 20)) p("+20 XP earned!");
        btn("Play again", memoryGame); btn("Close", closeModal);
      }));
    }, 2500);
    activeCleanup = () => clearTimeout(timer);
  }

  function riddleGame() {
    openModal("Riddle Lab", "BRAIN TEASER");
    p("I have cities but no houses, forests but no trees, and rivers but no water. What am I?");
    btn("A painting", () => notify("Think of something used for navigation."));
    btn("A map", () => {
      modalBody.replaceChildren(); p("Correct! A map can represent all of those places.");
      if (reward("riddle", 20)) p("+20 XP earned!");
      btn("Finish", closeModal, "primary-btn");
    });
    btn("A book", () => notify("Not quite. Think of a geographical representation."));
  }

  function storyGame() {
    openModal("The Midnight Signal", "STORYVERSE · CHAPTER 01");
    p("At midnight, an old radio in an abandoned observatory starts transmitting a message that appears to describe tomorrow's weather.");
    p("What will you do?");
    btn("Investigate the radio", () => {
      modalBody.replaceChildren();
      p("You find a maintenance log beside the radio. It contains tomorrow's date and a sequence of unexplained numbers.");
      p("Your next move?");
      btn("Decode the numbers", () => {
        modalBody.replaceChildren();
        p("The numbers match timestamps in an old astronomy notebook. The signal may be a scheduled transmission. The mystery continues...");
        if (reward("story-radio", 25)) p("+25 XP earned!");
        btn("Finish chapter", closeModal, "primary-btn");
      });
      btn("Leave a note for the next visitor", () => {
        modalBody.replaceChildren(); p("You leave your findings in the notebook. Perhaps someone will continue your investigation.");
        if (reward("story-note", 10)) p("+10 XP earned!");
        btn("Finish chapter", closeModal, "primary-btn");
      });
    });
    btn("Look outside first", () => {
      modalBody.replaceChildren();
      p("The sky is clear, but a distant light flashes twice from the ridge. The source remains unknown.");
      if (reward("story-light", 10)) p("+10 XP earned!");
      btn("Finish chapter", closeModal, "primary-btn");
    });
  }

  $("#menuBtn").addEventListener("click", () => {
    const nav = $("#navigation"), open = nav.classList.toggle("open");
    $("#menuBtn").setAttribute("aria-expanded", String(open));
  });
  $("#navigation").addEventListener("click", event => {
    if (event.target.closest("a")) {
      $("#navigation").classList.remove("open");
      $("#menuBtn").setAttribute("aria-expanded", "false");
    }
  });
  document.querySelectorAll("[data-case]").forEach(node => node.addEventListener("click", () => {
    node.dataset.case === "locked-room" ? lockedRoom() : missingHour();
  }));
  document.querySelectorAll("[data-game]").forEach(node => node.addEventListener("click", () => {
    ({sequence: sequenceGame, memory: memoryGame, riddle: riddleGame})[node.dataset.game]?.();
  }));
  document.querySelectorAll("[data-story]").forEach(node => node.addEventListener("click", storyGame));
  $("#closeModal").addEventListener("click", closeModal);
  modal.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
  $("#year").textContent = new Date().getFullYear();
  saveProgress();

  // Progressive Web App: cache core files for offline reopening on supported browsers.
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }
})();
