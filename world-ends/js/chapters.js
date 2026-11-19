// ============================================================
// WORLD ENDS — THE LAST CANTICLE
// Prologue → Chapter 12 (Chapters 13 → 26 in chapters2.js)
// The dialogue follows the novel edition, in chapter order.
// ============================================================
import { THREE, U, mat, TEX, boxGeo } from "./ps1.js";
import { Character, makeKhethari, portrait, CAST } from "./actors.js";
import { env, buildTitle, buildFacility, buildCrater, buildHangar, buildHighway, buildStreets, buildApartment, buildRoof, buildEcho, SCREENS } from "./scenes.js";
import { breath, rhythm, qte } from "./minigames.js";
import { CH13, CH14, CH15, CH16, CH17, CH18, CH19, CH20, CH21, CH22, CH23, CH24, CH25, CH26 } from "./chapters2.js";
export { buildTitle };

// ---------- line helpers ----------
export const N = (text) => ({ text });
export const R = (who, text) => ({ who, text, radio: true });
export const SYS = (text) => ({ text, sys: true });
export const MIMIC = (who, text) => ({ who, text, mimic: true });

export async function card(G, C) {
  G.ui.setFade(1, "#000");
  await G.guard(G.ui.chapterCard({ act: C.act, num: C.num, title: C.title, sub: C.sub }));
}
// squadmates who follow Kaien on foot, in a loose chain
export function party(G, ids) {
  const W = G.world, P = G.player;
  const list = ids.map((id, i) => {
    const c = new Character(id);
    c.setPos(P.pos.x + (i % 2 ? 0.8 : -0.8), 0, P.pos.z - 1.4 - i * 1.2).face(P.yaw);
    c.onStep = () => {};
    W.add(c.root);
    return c;
  });
  W.every((dt) => {
    list.forEach((c, i) => {
      if (c._walking || c._stay) return;
      const lead = i === 0 ? P.pos : list[i - 1].root.position;
      const p = c.root.position;
      const dx = lead.x - p.x, dz = lead.z - p.z, d = Math.hypot(dx, dz);
      let sp = 0;
      if (d > 1.5) {
        sp = Math.min(4, (d - 1.2) * 2.5);
        p.x += (dx / d) * sp * dt; p.z += (dz / d) * sp * dt;
        const q = { x: p.x, z: p.z }; W.resolve(q, 0.3); p.x = q.x; p.z = q.z;
        c.faceToward(lead.x, lead.z);
      }
      c.update(dt, sp, sp > 2.6);
    });
  });
  return list;
}
// Khethari that just walk somewhere (for cutscenes)
export function crawler(G, kind, x, z, scale = 1) {
  const m = makeKhethari(kind, scale);
  m.root.position.set(x, 0, z);
  G.world.add(m.root);
  m.go = (tx, tz, sp = 4) => { m.target = [tx, tz, sp]; };
  G.world.every((dt) => {
    let s = 0;
    if (m.target) {
      const [tx, tz, sp] = m.target, p = m.root.position;
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      if (d > 0.2) { s = sp; p.x += (dx / d) * Math.min(d, sp * dt); p.z += (dz / d) * Math.min(d, sp * dt); m.root.rotation.y = Math.atan2(dx, dz); }
      else m.target = null;
    }
    m.update(dt, s, m.state || "");
  });
  return m;
}
export function tip(G, text, dur = 4.5) { G.ui.toast(text, dur); }

// ============================================================
// PROLOGUE — THE FIRST FALL
// ============================================================
async function prologue(G, C) {
  await G.load(buildFacility);
  G.player.ch.setVisible(false);
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.1, drone: 0.5, note: 41, verb: 0.6 });
  const sci = [G.actor("scientist", -5, 6, 0.4), G.actor("scientist", 5, 6, -0.4), G.actor("scientist", -3, 9, 0.8), G.actor("soldier", 7, 2, -0.8)];
  await G.cine(async () => {
    G.pan([[0, 3, -12], [0, 3, 12]], [[-6, 2.2, 3], [0, 3, 12]], 14);
    G.fade(0, 2.5);
    await G.say([
      N("No one remembered the first warning because it didn't look like a warning."),
      N("Eighteen years before the Fellstar Ark struck the industrial belt, a silent object plunged into open water off a restricted coastline. No fireball. No news coverage. No viral footage."),
      N("The public story was \"debris.\" The classified report had a different header, stamped in black ink that never faded in Commander Daigo Kurogane's mind: INCIDENT NAME: FIRST FALL."),
    ]);
    G.pan([[8, 5, 4], [0, 3, 12]], [[4, 2, 8], [0, 3, 12]], 10, 45);
    await G.say([
      N("Recovery teams hauled the object into a hangar the size of a cathedral and stared at something that looked less like a machine than a grown fragment. Ribbed alloy. Organic seams."),
      N("Engineers cut it open expecting wiring. They found a lattice. A crystalline organ suspended in the center like a heart, humming without power."),
      ["RESEARCHER", "It's not running current. It's running resonance."],
      N("They called it an Aetherheart because there was no human word for something that behaved like physics and music at the same time."),
    ]);
    // first activation
    G.shot([0, 2, 4], [0, 3, 12], 50);
    G.audio.pulse();
    G.music.duck(0.2);
    await G.tween(2, (k) => (G._heartPower = 0.5 + k * 2));
    G.rig.shake = 0.15;
    sci.slice(0, 3).forEach((s) => (s.pose = "kneel"));
    U.uAdd.value.setRGB(0.15, 0.2, 0.35);
    await G.say([
      N("The first activation didn't explode. It didn't melt steel. It simply sang, and the people in the room reacted like the song had hands."),
      N("Headaches. Nosebleeds. Vertigo. Hallucinations that didn't feel like imagination, but like borrowed memories brushing the inside of the skull."),
      ["TEST SUBJECT", "It's singing."],
    ]);
    U.uAdd.value.setRGB(0, 0, 0);
    G._heartPower = 0.5;
    G.music.unduck();
    await G.say([N("That was when the program stopped being \"research.\" That was when it became Covenant.")]);
    // Daigo and the file
    const daigo = G.actor("daigo", 2, -4, Math.PI);
    sci.forEach((s) => (s.pose = null));
    G.pan([[4, 1.9, -7], [2, 1.6, -4]], [[3, 1.7, -6], [2, 1.6, -4]], 8, 40);
    await G.say([
      N("Daigo had been a soldier long enough to hate secrets. Not because he was noble. Because secrets got people killed."),
      N("The object wasn't a weapon. It was a node. A piece of a system that fought like an orchestra: many bodies, one mind."),
      N("So humanity built a counter-storm. They made portable Aetherhearts. They forged frames strong enough to carry resonance strain. They named the frames Eidolons."),
      N("And then they learned the worst part: Aetherhearts did not accept everyone. Incompatible minds didn't just fail. They burned."),
      N("Daigo kept four pilot stations reserved for years. He wasn't waiting for talent. He was waiting for survivors."),
      N("One case file stayed with him. A civilian contractor. Ringing in silence. Dreams that weren't memories. Headaches that returned in exact cycles, like a clock."),
      N("A senior researcher scribbled one line in the margin: If the Canticle ever returns, some civilians will hear it first."),
    ]);
    await G.fade(1, 1.5);
  });
  await G.lines(["EIGHTEEN YEARS LATER"], { cls: "big", hold: 3 });
  // ---- the hangar, the satellite feed ----
  await G.load(buildHangar, {});
  G.player.place(2, 14, Math.PI / 2);
  G.music.play("base");
  const sh = G.actor("shion", 0, 12, Math.PI / 2), rz = G.actor("raizen", 0.4, 15.6, Math.PI / 2), rj = G.actor("renji", -1.4, 14, Math.PI / 2), dg = G.actor("daigo", 5, 22, Math.PI);
  await G.cine(async () => {
    G.shot([-4, 2.2, 14], [4, 2, 16], 52);
    G.fade(0, 1.5);
    await G.say([
      N("Then a new anomaly entered Earth's atmosphere and did something rocks weren't supposed to do. It corrected its course. Twice."),
      N("In the hangar, beneath reinforced concrete, dormant Aetherhearts hummed awake like sleeping beasts recognizing a predator."),
      ["SHION", "That's not debris."],
      ["RAIZEN", "That's a decision."],
      N("Renji stood still, a wall that had learned to breathe. Kaien lifted his helmet and felt the air tighten around him, the pressure behind his eyes like a familiar hand."),
    ]);
    G.shot([3, 1.8, 18], [5, 1.8, 22], 45);
    await G.say([["DAIGO", "EIDOLON COVENANT. Activation authorized."]]);
    G.audio.boom();
    G.shot([0, 3, 4], [0, 6, 30], 60);
    G.rig.shake = 0.12;
    await G.tween(3, (k) => { G._doorL.position.x = -5 - k * 10; G._doorR.position.x = 5 + k * 10; U.uAdd.value.setRGB(k * 0.35, k * 0.25, k * 0.2); });
    await G.say([N("The doors opened. Smoke rolled in like a second horizon."), N("And in the crater, something arrived that did not belong to Earth.")]);
    await G.fade(1, 1.2, "#000");
    U.uAdd.value.setRGB(0, 0, 0);
  });
  await G.lines(["Soon, it would have a name.", "THE KHETHARI", "And behind them, a whisper rising into a hymn.", "THE CANTICLE"], { hold: 8 });
}

// ============================================================
// 1 — THE METEOR THAT LISTENED
// ============================================================
async function ch1(G, C) {
  await G.load(buildCrater);
  G.player.ch.setVisible(false);
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.4, drone: 0.4, note: 44, traffic: 0.3 });
  const crowd = [];
  for (let i = 0; i < 9; i++) { const c = G.actor("civilian", -12 + i * 3, 18 + (i % 3), 0, { shirt: [[110, 90, 80], [60, 80, 120], [130, 120, 90]][i % 3] }); c.pose = i % 2 ? "conduct" : null; crowd.push(c); }
  const sol = [G.actor("soldier", -4, 20.5, 0), G.actor("soldier", 4, 20.5, 0)];
  const daigo = G.actor("daigo", 0, 15, 0);
  const scout = crawler(G, "scout", 0, 44, 1.4);
  await G.cine(async () => {
    G.pan([[0, 30, -30], [0, 0, 60]], [[0, 8, 4], [0, 2, 44]], 9, 50);
    G.fade(0, 2);
    await G.say([
      N("The crater wasn't a crater. It looked like the earth had been peeled open and something had been pressed into it: ribbed black alloy, organic seams, a ribcage wrapped around a sleeping lung."),
      N("Civilians gathered behind barricades anyway. Phones rose like offerings."),
    ]);
    scout.go(0, 30, 1.5);
    G.shot([3, 1.4, 25], [0, 2, 32], 40);
    await G.wait(2.5);
    await G.say([N("A Khethari crawled out first. Thin, insectile, too deliberate. It paused at the crater's lip and tilted its head as if listening."), ["SOLDIER", "Target—"]]);
    G.shot([2, 1.7, 13], [0, 1.6, 15], 40);
    await G.say([["DAIGO", "Hold fire."]]);
    scout.state = "listen";
    G.shot([3, 1.4, 25], [0, 2, 32], 40);
    await G.say([N("The Khethari turned toward the skyline. Its antennae twitched. For a moment it seemed almost curious."), N("Then the Ark opened wider, and the second wave poured out.")]);
    // the swarm
    G.audio.screech(1); G.audio.screech(0.8);
    G.music.play("battle");
    const sw = [];
    for (let i = 0; i < 14; i++) { const s = crawler(G, "scuttle", (Math.random() - 0.5) * 30, 48 + Math.random() * 10, 1.1); s.go((Math.random() - 0.5) * 50, 10 + Math.random() * 10, 7 + Math.random() * 3); sw.push(s); }
    crowd.forEach((c, i) => { c.pose = null; G.walkTo(c, c.root.position.x + (Math.random() - 0.5) * 12, -20, 3.8); });
    G.pan([[-20, 12, 0], [0, 0, 40]], [[-10, 6, 6], [0, 0, 20]], 6, 60);
    await G.say([N("They moved low and fast. Scuttlewights, snapping limbs and skittering bodies, spilling into streets like spilled ink. Gloomcasters nested into shattered windows and fired needle volleys that punched clean through cars."), N("The swarm didn't chase randomly. It cut off angles. It herded. It moved like a single organism with a single intention.")]);
    G.shot([0, 2, 8], [0, 1.6, 15], 40);
    await G.say([
      ["DAIGO", "How many?"],
      ["LIEUTENANT", "More every minute, sir."],
      N("Daigo stared at the Ark's ribs pulsing faintly, and felt a cold certainty settle in his chest."),
      ["DAIGO", "Activate Covenant."],
      ["LIEUTENANT", "Sir, if we go public with—"],
      ["DAIGO", "If we don't, there won't be a public left."],
    ]);
    await G.fade(1, 1);
  });
}

// ============================================================
// 2 — EIDOLON COVENANT (playable: the hangar, Aria at the ladder)
// ============================================================
async function ch2(G, C) {
  const W = await G.load(buildHangar, {});
  G.player.place(-2, -8, 0);
  await card(G, C);
  G.music.play("base");
  G.audio.ambience({ wind: 0.1, drone: 0.25, note: 49, verb: 0.5 });
  const rz = G.actor("raizen", 9.6, 0, -Math.PI / 2), sh = G.actor("shion", 9.6, -9, -Math.PI / 2), rj = G.actor("renji", 9.6, 9, -Math.PI / 2);
  const dg = G.actor("daigo", 6, -2, Math.PI / 2);
  const aria = G.actor("aria", 10.4, 16.4, -Math.PI / 2 - 0.4);
  // a siren still sounding beyond the doors
  let sT = 0;
  W.every((dt) => { sT -= dt; if (sT <= 0) { sT = 4; G.audio.tone(600, 1.2, "sine", 0.02); G.audio.tone(800, 1.2, "sine", 0.02, 1.2); } });
  G.fade(0, 1.2);
  G.objective("REPORT TO EIDOLON-0.");
  tip(G, "STICK / WASD to walk · hold □ / SHIFT to run · ✕ / SPACE to talk");
  await new Promise((r) => W.trigger({ x0: 2, z0: -6, x1: 10, z1: 4, enter: r }));
  await G.cine(async () => {
    G.shot([3, 1.8, 3], [7, 1.6, -2], 45);
    dg.faceToward(G.player.pos.x, G.player.pos.z);
    await G.say([
      N("The hangar doors opened like a mouth, revealing giants asleep under dim lights. Kaien listened to the Aetherheart hum with a familiarity he didn't like."),
      N("Daigo walked the line of pilots with the grim calm of a man counting lives."),
      ["DAIGO", "You are not heroes. You are a hinge. Don't break."],
      R("RAIZEN", "That's motivational."),
      R("SHION", "He's not wrong."),
    ]);
  });
  G.objective("THE ACCESS LADDER. EIDOLON-0.");
  await G.interactOnce({
    pos: [10.4, 1.5, 16.4], label: "ARIA", verb: "TALK", r: 2,
    use: async () => {
      G.music.play("aria");
      await G.cine(async () => {
        aria.faceToward(G.player.pos.x, G.player.pos.z);
        G.shot([8.2, 1.7, 14.2], [10.2, 1.5, 16.6], 38);
        await G.say([
          N("Aria caught him at the access ladder, a communications headset hanging at her neck. She had left her station long enough to find him."),
          N("She straightened the strap at his shoulder, something she had done before drills often enough that he usually teased her for it. Today he let her take her time."),
          ["ARIA", "There. Now you look like somebody who listened to the briefing."],
          ["KAIEN", "You listened enough for both of us."],
          N("They had been together before Covenant learned what was coming. He knew the sound of her keys in a door, the way she talked through the first half of a film and fell asleep during the second."),
          N("He touched his forehead to hers."),
          ["KAIEN", "I love you."],
          ["ARIA", "I love you too. I'm on communications. I'll be listening."],
        ]);
      });
    },
  });
  G.objective("CLIMB INTO EIDOLON-0.");
  await G.interactOnce({ pos: [11.2, 1, 18], label: "EIDOLON-0", verb: "CLIMB", r: 1.8 });
  // the cockpit
  await G.fade(1, 0.8);
  G.audio.mechBoot();
  document.body.classList.add("cockpit");
  G.music.play(null, 1);
  await G.cine(async () => {
    G.shot([14, 4.6, 19.2], [14, 4.6, 30], 70);
    U.uTint.value.setRGB(0.7, 1, 0.85);
    G.fade(0, 1);
    await G.say([
      N("Kaien sealed his cockpit. The world narrowed to instruments, breath, heartbeat."),
      SYS("AETHERHEART · ONLINE"),
      N("For a moment, it wasn't power. It was language. Kaien felt three cords tug outward, threads of resonance linking to the other cockpits."),
      R("KAIEN", "I can hear you."),
      R("SHION", "Maestro-class. You're linking our Aetherhearts."),
      R("RAIZEN", "So you're the boss?"),
      N("Ally markers snapped into a tighter formation, as if the machine itself trusted his tempo."),
      R("KAIEN", "I'm not the boss. I'm the rhythm. Stay with it."),
      R("DAIGO", "Launch."),
    ]);
    document.body.classList.remove("cockpit");
    U.uTint.value.setRGB(1, 1, 1);
    G.music.play("battle");
    G.shot([0, 3, 10], [0, 6, 30], 62);
    G.rig.shake = 0.1;
    G.audio.boom();
    G.tween(3, (k) => { G._doorL.position.x = -5 - k * 10; G._doorR.position.x = 5 + k * 10; });
    for (const id of ["kaien", "renji", "raizen", "shion"]) { const f = G._frames[id]; if (f) { f.pose = null; G.walkTo(f, f.root.position.x - 8, 40, 5); } }
    await G.wait(3);
    await G.lines(["Outside, the city was on fire.", "And the Covenant stepped into daylight."], { cls: "clear", hold: 5 });
    await G.fade(1, 1);
  });
}

// ============================================================
// 3 — FIRST RHYTHM (Eidolon battle: the southern highway)
// ============================================================
async function ch3(G, C) {
  const W = await G.load(buildHighway, { mech: true });
  await card(G, C);
  G.music.play("battle");
  G.audio.ambience({ wind: 0.4, drone: 0.2, traffic: 0.2, note: 46 });
  G.fade(0, 1);
  await G.cine(async () => {
    G.pan([[30, 30, -80], [0, 0, 0]], [[8, 8, -55], [0, 3, -30]], 6, 60);
    await G.say([
      N("They hit the southern highway where refugees jammed lanes with cars, shopping carts and panic. Scuttlewights crawled over hoods. Needle volleys rained from Gloomcasters perched on rooftops like living turrets."),
      R("RAIZEN", "Move! Get behind us!"),
      ["A MAN", "They're everywhere!"],
      N("Kaien's Maestro resonance flared. Shield cycles synchronized, reload timings aligned, reaction latency shaved down like sharpened steel."),
      R("KAIEN", "Stay together. They break anything isolated."),
    ]);
  });
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion"] });
  B.civ([[-8, -20], [-10, -60], [-12, -100], [-12, -150]], 8);
  B.wave([["scuttle", -6, 0], ["scuttle", 6, 4], ["scuttle", 0, 10], ["scuttle", -14, 14], ["scuttle", 12, 18]]);
  G.objective("CLEAR THE LANE. PROTECT THE EVACUATION.");
  tip(G, "✕ ATTACK (tap for a combo) · □ GUARD (tap just before a hit to PARRY) · ○ DODGE", 6);
  await B.cleared();
  // the rooftop nests
  const roofs = G._roofs.filter((r) => r.z > 0 && r.z < 60).slice(0, 3);
  roofs.forEach((r) => B.spawn("caster", r.x, r.z, { y: r.y }));
  B.wave([["scuttle", -10, 30], ["scuttle", 10, 34], ["scuttle", 0, 40]]);
  await G.cine(async () => {
    G.shot([0, 8, 0], [roofs[0].x, roofs[0].y, roofs[0].z], 50);
    await G.say([R("SHION", "Three casters on the right."), R("KAIEN", "Shion, cut them.")]);
  });
  G.objective("THE GLOOMCASTERS ARE OUT OF REACH. ORDER SHION.");
  tip(G, "Press △ to open SQUAD COMMAND · SHION · PRISMCRAFT severs rooftop nests", 7);
  B.res = Math.max(B.res, 60);
  await B.cleared();
  // the Colossus
  const col = B.spawn("colossus", 0, 60);
  await G.cine(async () => {
    G.pan([[14, 5, 30], [0, 4, 60]], [[10, 4, 40], [0, 4, 56]], 4, 50);
    G.audio.stomp(); G.rig.shake = 0.2;
    await G.say([
      N("A Carapax Colossus. Thick armor plates, horned crown, heavy enough to turn tanks into toys."),
      R("RENJI", "I'll hold the lane."),
      N("It slammed into him. Renji didn't move."),
      R("RAIZEN", "Now that is rude."),
    ]);
  });
  G.objective("BREAK THE COLOSSUS.");
  tip(G, "Its armour shrugs off blades. RAIZEN · GRAVESEAL pins it · RENJI · ANCHOR draws it off you", 7);
  B.res = 100;
  await B.waitFor(() => !col.alive || col.hp < col.max * 0.45);
  if (col.alive) {
    await G.cine(async () => {
      col.stun = 6;
      const bus = G._bus;
      G.shot([20, 8, col.pos.z - 18], [col.pos.x, 3, col.pos.z], 55);
      await G.say([N("Raizen laced Graveseal lines through the air, seized the crushed shell of a bus..."), R("RAIZEN", "Try walking through that!")]);
      G.audio.grave();
      bus.position.set(col.pos.x, 20, col.pos.z);
      await G.tween(0.6, (k) => (bus.position.y = 20 - k * 18.3));
      G.audio.boom(); G.rig.shake = 0.4;
      B.damage(col, 9999, true);
      await G.wait(1);
    });
  }
  await B.cleared();
  // the horned elite and its command
  const el = B.spawn("elite", 0, 50, { passive: true });
  B.wave([["scuttle", -14, 44, { passive: true }], ["scuttle", 14, 44, { passive: true }], ["scuttle", -6, 56, { passive: true }], ["scuttle", 6, 58, { passive: true }]]);
  await G.cine(async () => {
    G.shot([0, 5, 30], [0, 6, 50], 45);
    await G.say([N("The swarm scattered, then reformed. A horned elite rose from the pack, taller, rigid, crowned with resonance antennae. Its throat opened.")]);
    G.audio.pulse(); B.ring(el.pos, 0xff5070, 30, 1.6, true);
    G.rig.shake = 0.3; U.uAdd.value.setRGB(0.25, 0, 0.05);
    await G.say([N("The scream wasn't sound. It was pressure. Kaien felt it behind his eyes like a hand squeezing his brain.")]);
    U.uAdd.value.setRGB(0, 0, 0);
    await G.say([
      N("Every Khethari moved at once. Smarter, coordinated. Feints and crossfires, herd patterns tightening like a noose."),
      R("SHION", "That's command."),
      R("RAIZEN", "From who?"),
      R("KAIEN", "The Canticle."),
      N("And somewhere beyond the battlefield, something listened back. Not with rage. With interest."),
    ]);
    await G.fade(1, 1.5);
  });
}

// ============================================================
// 4 — COUNTER-SONG
// ============================================================
async function ch4(G, C) {
  const W = await G.load(buildHangar, { night: true });
  G.player.place(-12, -1, -Math.PI / 2);
  await card(G, C);
  G.music.play("base");
  G.audio.ambience({ wind: 0.1, drone: 0.3, note: 46 });
  const sh = G.actor("shion", -18.4, 2.2, -Math.PI / 2), rz = G.actor("raizen", -16.6, 3.6, -Math.PI / 2 - 0.6), dg = G.actor("daigo", -13, -6.2, 0);
  G.fade(0, 1);
  G.objective("SHION IS ANALYZING THE BATTLE RECORDINGS.");
  await G.interactOnce({
    pos: [-18, 1.5, 2.2], label: "SHION", verb: "TALK", r: 2.4,
    use: async () => G.cine(async () => {
      G.shot([-15, 2, -0.5], [-19, 2, 2.5], 48);
      await G.say([
        N("Shion turned the battlefield recordings into a lattice of converging frequencies. The screen looked like a storm of lines that kept snapping toward one repeating pattern."),
        ["SHION", "It's not sound. It's resonance. A control network. If I broadcast a counter-harmony, we can desync their coordination."],
        ["RAIZEN", "And if you're wrong?"],
        ["SHION", "Then my brain cooks first."],
        ["DAIGO", "How long?"],
        ["SHION", "Two hours tuning. Then we run it live."],
        ["KAIEN", "We'll be fighting while you tune."],
        ["SHION", "Yes."],
        ["DAIGO", "If this fails, we don't get a second attempt."],
        ["KAIEN", "Then it doesn't fail."],
      ]);
    }),
  });
  await G.fade(1, 0.8);
  document.body.classList.add("cockpit");
  await G.cine(async () => {
    G.shot([14, 4.6, 19.2], [14, 4.6, 30], 70);
    U.uTint.value.setRGB(0.6, 0.8, 1);
    G.music.play("aria");
    G.fade(0, 1);
    await G.say([
      N("Later, alone in his cockpit, Kaien listened to the Aetherheart's hum. It wasn't just power. It was a language, and the enemy spoke it fluently."),
      R("KAIEN", "Rest while you can."),
      R("RAIZEN", "Cute."),
      R("SHION", "Kaien... when I run the counter-harmony, it may attract attention."),
      R("KAIEN", "Good."),
      N("Kaien said what he didn't want to say out loud, because saying it made it real."),
      R("KAIEN", "I want it looking at us. Not at civilians."),
    ]);
    await G.fade(1, 1.2);
    U.uTint.value.setRGB(1, 1, 1);
    document.body.classList.remove("cockpit");
  });
}

// ============================================================
// 5 — THE FIRST INTERRUPTION
// ============================================================
async function ch5(G, C) {
  const W = await G.load(buildHighway, { mech: true, dawn: true });
  await card(G, C);
  G.audio.ambience({ wind: 0.4, drone: 0.2, note: 46 });
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion"], resonance: 70 });
  const sw = B.wave([["scuttle", -8, 10], ["scuttle", 8, 14], ["scuttle", 0, 20], ["scuttle", -14, 24], ["scuttle", 14, 26], ["scuttle", 4, 30]]);
  G._roofs.filter((r) => r.z > 10 && r.z < 50).slice(0, 2).forEach((r) => B.spawn("caster", r.x, r.z, { y: r.y }));
  sw.forEach((e) => (e.passive = true));
  G.fade(0, 1.5);
  await G.cine(async () => {
    G.pan([[0, 12, -30], [0, 2, 20]], [[0, 6, -20], [0, 2, 20]], 6, 55);
    await G.say([N("Dawn came in ash-colored light."), N("Shion's counter-harmony broadcast began as a low ripple through allied Aetherhearts. Too subtle to hear, impossible not to feel.")]);
    G.audio.maestro();
    B.ring(G.player.pos, 0x80f0ff, 60, 2);
    await G.say([N("For half a second, every Scuttlewight froze. Then the swarm lost its rhythm."), N("Gloomcasters misfired into their own ranks. Scuttlewights collided in tangles.")]);
    sw.forEach((e) => (e.passive = false));
  });
  G.music.play("battle");
  B.desync = 30;
  G.objective("THE SWARM HAS LOST ITS RHYTHM. PRESS THE ADVANTAGE.");
  await B.cleared();
  const ser = B.spawn("seraph", 0, 44);
  await G.cine(async () => {
    G.shot([10, 5, 26], [0, 5, 44], 45);
    await G.say([N("A Glaive Seraph charged alone without cover, as if suddenly unsure where its allies were.")]);
  });
  G.objective("BRING DOWN THE GLAIVE SERAPH.");
  tip(G, "When it pulses red, STRIKE IT (or MAESTRO LINK) to break its command", 7);
  B.res = Math.max(B.res, 75);
  await B.waitFor(() => !ser.alive || ser.hp < ser.max * 0.4);
  await G.cine(async () => {
    ser.stun = 20;
    G.shot([12, 6, ser.pos.z - 16], [ser.pos.x, 5, ser.pos.z], 50);
    await G.say([R("KAIEN", "Now!")]);
    const rj = B.ally("renji"), rz = B.ally("raizen"), sh = B.ally("shion");
    rj.pos.set(ser.pos.x - 4, 0, ser.pos.z - 4); rj.ch.play("slash3"); G.audio.anchor();
    await G.say([N("Renji pinned it.")]);
    B.beam(rz.pos, ser.pos, 0xb060ff, 1); G.audio.grave();
    await G.say([N("Raizen tore plates free with Graveseal.")]);
    B.beam(sh.pos, ser.pos.clone().setY(8), 0x80f0ff, 1); G.audio.prism();
    await G.say([N("Shion split the exposed node with Prismcraft precision.")]);
    B.damage(ser, 9999, true);
    await G.wait(1.2);
    await G.say([
      N("The Seraph fell."),
      R("RAIZEN", "We did it!"),
      R("SHION", "Something's pushing back. This isn't just a network. There's a will behind it."),
      N("Kaien felt it too. A cold amusement leaning closer, like someone inspecting a specimen."),
      MIMIC("A THOUGHT NOT HIS OWN", "Good. Keep singing."),
      N("The enemy wasn't surprised. The enemy was learning."),
    ]);
    await G.fade(1, 1.5);
  });
}

// ============================================================
// 6 — QUIET IS NOT PEACE
// ============================================================
async function briefing(G, cast) {
  // everyone around the briefing table
  const pos = { daigo: [-13, -6.2, 0], shion: [-11.2, -3.2, -2.2], raizen: [-14.8, -3.2, 2.2], renji: [-15.4, -5.2, 1.4], kyo: [-10.8, -5.2, -1.4], requiem: [-16.5, -1.5, 2.5] };
  const out = {};
  for (const id of cast) out[id] = G.actor(id, ...pos[id]);
  G.player.place(-13, -1.6, Math.PI);
  return out;
}
async function ch6(G, C) {
  let W = await G.load(buildHangar, {});
  await card(G, C);
  G.music.play("base");
  const cast = await briefing(G, ["daigo", "shion", "raizen"]);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-9.4, 3, -9], [-14, 1.4, -3], 50);
    await G.say([
      N("News drones filmed Eidolons standing amid smoke like guardians carved from steel. The city called them heroes. Daigo called them exhausted."),
      ["DAIGO", "Disappearances. Whole blocks. No blood. No bodies."],
      ["RAIZEN", "So they're not just killing. They're collecting."],
    ]);
    G.shot([-15, 2, -2], [-19.9, 3.4, -4], 45);
    await G.say([
      N("Shion traced a spiral on the map: missing zones tightening toward the industrial belt."),
      ["SHION", "They're feeding a structure. Choirwell networks. A Lumen Spire."],
      ["RAIZEN", "In English?"],
      ["KAIEN", "A tower. A system."],
      ["SHION", "A Gate built out of minds. The Canticle needs a permanent amplifier."],
      ["KAIEN", "Then we don't just fight the swarm. We cut the song's throat."],
      ["DAIGO", "We find where the spiral ends."],
    ]);
    await G.fade(1, 1);
  });
  W = await G.load(buildStreets);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.6, drone: 0.3, note: 44 });
  G.fade(0, 1.5);
  await G.say([N("After the briefing, Kaien walked patrol routes he didn't remember choosing, through streets that smelled like burned plastic and old fear.")]);
  G.objective("WALK THE PATROL ROUTE.");
  W.interact({ pos: [-9, 1, 20], label: "ABANDONED GROCERY BAG", verb: "LOOK", r: 2, use: async () => G.say([N("Oranges rolled into the gutter. A receipt dated last Tuesday.")]) });
  W.interact({ pos: [9, 1, 42], label: "KITCHEN RADIO", verb: "LISTEN", r: 2, use: async () => { G.audio.noise(1.5, 2000, 0.6, 0.12); await G.say([N("A kitchen radio set on a doorstep, still playing to an empty chair. Under the static, something hums in a key no song uses.")]); } });
  // crying, louder near the market
  let cT = 0;
  W.every((dt) => { cT -= dt; if (cT <= 0) { cT = 2.6; const d = Math.hypot(G.player.pos.x - 10, G.player.pos.z - 86); if (d < 40) G.audio.tone(520 + Math.random() * 40, 0.5, "sine", Math.max(0.004, 0.04 - d * 0.001)); } });
  await new Promise((r) => W.trigger({ x0: -15, z0: 66, x1: 15, z1: 90, enter: r }));
  await G.cine(async () => {
    G.shot([4, 2, 66], [10, 1, 84], 45);
    await G.say([N("He heard crying behind a collapsed market."), N("And the war gained a face.")]);
    await G.fade(1, 1.2);
  });
}

// ============================================================
// 7 — THE GIRL IN THE ALLEY
// ============================================================
async function ch7(G, C) {
  let W = await G.load(buildStreets);
  G.player.place(6, 70, 0);
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.5, drone: 0.2, note: 44 });
  const miyu = G.actor("miyu", 10.2, 86, Math.PI);
  miyu.pose = "kneel";
  G.fade(0, 1);
  G.objective("THE CRYING IS COMING FROM THE ALLEY.");
  await G.interactOnce({
    pos: [10.2, 0.6, 85.6], label: "A SMALL SHAPE IN THE CORNER", verb: "KNEEL", r: 2,
    use: async () => G.cine(async () => {
      G.music.play("miyu");
      G.player.ch.pose = "kneel";
      G.shot([8.6, 1.1, 83.4], [10.2, 0.7, 86], 40);
      await G.say([
        N("The alleyway was shadowed and cramped, piled with trash and broken wood. A small shape huddled in the corner, shaking."),
        N("Kaien lowered himself slowly, making sure his shadow didn't swallow her."),
        ["KAIEN", "Hey. You're okay. I'm not going to hurt you."],
        N("The girl lifted her head. Dirt streaked her cheeks. Her eyes were too big for her face."),
        ["MIYU", "I'm Miyu. I got separated from my mom."],
        ["KAIEN", "I'm Kaien. You're not alone anymore."],
        ["MIYU", "They were... singing."],
        ["KAIEN", "The Khethari?"],
        ["MIYU", "And the walls... hummed back."],
        N("He didn't ask why a child had words like that. He picked her up carefully, like she was something that could fracture if he held too tight."),
      ]);
      G.player.ch.pose = null;
      await G.fade(1, 1);
    }),
  });
  W = await G.load(buildHangar, { night: true, start: [0, 26, Math.PI] });
  const dg = G.actor("daigo", 0, 23, 0);
  const miyu2 = G.actor("miyu", 0.8, 26.4, Math.PI);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([3, 1.8, 22], [0.4, 1.3, 25], 45);
    await G.say([
      ["DAIGO", "We are not a shelter."],
      ["KAIEN", "Then act like what you claim to protect."],
      N("Daigo looked at the child. For a moment, the commander's face did something rare. It softened, just enough to prove he still had a human heart."),
      ["DAIGO", "One week. Then relocation."],
      ["KAIEN", "One week."],
    ]);
    await G.fade(1, 1);
    miyu2.setPos(-15.8, 0, -20.2).face(0); miyu2.pose = "sit";
    G.player.place(-14.4, -19.4, -Math.PI / 2);
    G.player.ch.pose = "sit";
    G.shot([-12.6, 1.6, -17.6], [-15, 0.8, -20], 42);
    G.fade(0, 1);
    await G.say([
      N("That night, Miyu sat on Kaien's bunk clutching a torn scarf."),
      ["MIYU", "Are you a soldier?"],
      ["KAIEN", "I'm... trying."],
      ["MIYU", "Will they come here?"],
      ["KAIEN", "Not if I can help it."],
      ["MIYU", "You promise?"],
      ["KAIEN", "I promise I'll try."],
      N("It was the kind of promise a child trusted because it didn't pretend the world was fair."),
    ]);
    const aria = G.actor("aria", -14, -14, Math.PI);
    G.music.play("aria");
    await G.walkTo(aria, -15, -18.8, 1.2);
    aria.pose = "kneel";
    await G.say([
      N("Later, Aria brought a blanket and a cup of water from the shelter desk. She crouched beside the bunk and asked Miyu where she wanted them. Miyu pointed without letting go of her scarf."),
    ]);
    await G.fade(1, 1);
    G.player.ch.pose = null; aria.pose = null;
    G.player.place(-12, -14, -Math.PI / 2);
    aria.setPos(-13, 0, -14).face(Math.PI / 2);
    G.shot([-10.4, 1.7, -12.4], [-12.5, 1.5, -14], 38);
    G.fade(0, 1);
    await G.say([
      N("When the child finally fell asleep, Kaien found Aria waiting outside."),
      ["ARIA", "There are families still being registered. I'll check every list."],
      N("He had been holding himself rigid since the alley. When she put her arms around him, his shoulders lowered."),
      ["KAIEN", "Thank you."],
      N("She stayed until someone called her back to the desk."),
    ]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 8 — ECHO-SIGHT (play as Miyu inside her vision)
// ============================================================
async function ch8(G, C) {
  let W = await G.load(buildHangar, { night: true });
  await card(G, C);
  G.music.play("miyu");
  const miyu = G.actor("miyu", -15.8, -20, 0);
  miyu.pose = "lie";
  G.player.place(-13.4, -18.6, -Math.PI / 2);
  G.fade(0, 1.4);
  await G.cine(async () => {
    G.shot([-13, 1.8, -17], [-15.6, 0.5, -20], 42);
    await G.say([
      N("A week passed. No trace of Miyu's mother. Then Miyu woke in the night, sweating, eyes unfocused."),
      ["KAIEN", "Miyu?"],
      ["MIYU", "They're louder near the river."],
      ["KAIEN", "A dream?"],
      ["MIYU", "Not a dream. Like... I was there."],
    ]);
    G.audio.pulse();
    await G.fade(1, 0.8, "#e8e0ff");
  });
  // the vision
  W = await G.load(buildEcho, { avatar: "miyu" });
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.2, drone: 0.6, note: 52, water: 0.6, verb: 0.9 });
  G.audio.setMuffle(true);
  G.fade(0, 1.6);
  G.objective("ECHO-SIGHT: FOLLOW THE VOICES.");
  const voices = ["...stay inside, it's not safe...", "...have you seen my daughter...", "...the walls are humming...", "...it's singing, it's singing...", "...Miyu..."];
  for (let i = 0; i < voices.length; i++) {
    const z = 10 + i * 11, x = (i % 2 ? 3 : -3);
    const orb = W.glow(x, 1.2, z, 1.2, 0xb0a0ff);
    W.every((dt, t) => orb.scale.setScalar(1 + Math.sin(t * 5 + i) * 0.2));
    await new Promise((r) => W.trigger({ x: x, z: z, r: 2.2, enter: r }));
    orb.visible = false;
    G.audio.chime();
    G.ui.whisper(voices[i], 3);
  }
  // the man
  const vael = G.actor("vael", 0, 64, Math.PI);
  await new Promise((r) => W.trigger({ x0: -8, z0: 56, x1: 8, z1: 70, enter: r }));
  await G.cine(async () => {
    G.shot([0.6, 1.6, 59], [0, 1.7, 64], 30);
    await G.say([N("A man. Cold. Bright. Smiling.")]);
    G.audio.sting?.();
    await G.say([MIMIC("THE MAN", "Maestro.")]);
    await G.fade(1, 0.2, "#ffffff");
  });
  // the lab
  W = await G.load(buildHangar, { night: true });
  G.audio.setMuffle(false);
  G.music.play("miyu");
  const sh = G.actor("shion", -18.4, 2, -Math.PI / 2), rz = G.actor("raizen", -15.6, 4, -Math.PI / 2 - 0.4);
  const m2 = G.actor("miyu", -17.6, 0.6, Math.PI / 2);
  G.player.place(-16, 0.8, Math.PI / 2);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-14, 2.2, -2.6], [-18, 1.4, 1.2], 46);
    await G.say([
      N("In the lab, Shion scanned her neural patterns. His face tightened the way it did when he saw something he didn't want to be true."),
      ["SHION", "Echo-Sight. She's receiving Canticle resonance."],
      ["RAIZEN", "So they can find her."],
      ["KAIEN", "Not if we stop them first."],
      ["MIYU", "There's a man. Cold. Bright. Smiling."],
      ["KAIEN", "What did he say?"],
      ["MIYU", "He said... 'Maestro.' Like he knew you."],
      ["SHION", "Then the enemy isn't just invading. It's targeting."],
      ["RAIZEN", "Targeting you."],
      ["KAIEN", "You're safe here."],
      N("And somewhere far away, the Canticle hummed like it found that statement amusing."),
    ]);
    await G.fade(1, 1.2);
  });
}

// ============================================================
// 9 — THE DOOR THAT SHOULDN'T OPEN
// ============================================================
async function ch9(G, C) {
  const W = await G.load(buildApartment);
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.3, drone: 0.4, note: 41, verb: 0.4 });
  const squad = party(G, ["raizen", "shion", "renji"]);
  const daigo = G.actor("daigo", 0, -0.2, 0); daigo.root.visible = false;
  const mom = G.actor("mother", -3.6, 42.4, Math.PI * 0.8);
  mom.pose = "kneel";
  G.fade(0, 1.2);
  await G.say([N("The address was half a building and half a bruise. River wind carried ash and old smoke.")]);
  G.objective("SEARCH THE BUILDING.");
  W.interact({ pos: [-1.6, 1.2, 16], label: "SCRATCHES IN THE PLASTER", verb: "LOOK", r: 1.6, use: async () => G.say([N("Long parallel gouges at waist height. Something passed here many times.")]) });
  await new Promise((r) => W.trigger({ x0: -5, z0: 34.5, x1: 5, z1: 44, enter: r }));
  let ambush;
  await G.cine(async () => {
    G.music.play(null, 2);
    G.shot([2.4, 1.7, 36], [-3.4, 0.9, 42.2], 42);
    await G.say([
      N("The air inside was stale, like fear had been breathing there for days. A figure sat in the corner. Human. Thin. Alive."),
      N("When she lifted her head, her eyes looked past Kaien for a second, unfocused, like she was listening to something no one else could hear."),
      ["KAIEN", "We're not here to hurt you."],
      ["THE WOMAN", "They... they kept coming back."],
      ["RAIZEN", "Why didn't they kill you?"],
      ["THE WOMAN", "Because they wanted... They wanted me to stay alive long enough to..."],
    ]);
    // Miyu at the door
    const miyu = G.actor("miyu", 0, 33.4, 0);
    G.shot([0.8, 1.2, 37.4], [0, 0.8, 33.4], 40);
    G.music.play("miyu");
    await G.say([N("A small footstep behind Kaien. Miyu slipped past Daigo's grip and froze at the doorway. Then her scarf fell from her hands."), ["MIYU", "M—"]]);
    mom.pose = null;
    G.shot([2.4, 1.7, 36], [-3.4, 1.2, 42.2], 42);
    await G.say([["THE WOMAN", "Miyu...?"], N("And the room changed. Not because the war stopped. Because the war became personal.")]);
    await G.walkTo(miyu, -3, 41.6, 3);
    mom.pose = "kneel"; miyu.pose = "hold";
    await G.say([
      N("Miyu ran. The woman caught her, arms wrapping around her like she was afraid she would dissolve if she loosened her grip."),
      ["SHION", "We need to move them."],
      ["MIYU'S MOTHER", "Please. Don't let them take her."],
      ["KAIEN", "I won't."],
    ]);
    G.rig.shake = 0.2; G.audio.thud();
    await G.say([N("Then the walls shook. Comms filled with a whisper that mimicked Daigo's voice perfectly."), MIMIC("DAIGO?", "Kaien... stand down."), ["KAIEN", "Ignore anything that isn't me or Daigo. It's in our comms."]]);
    G.audio.glass();
    ambush = miyu;
  });
  // the ambush
  G.music.play("battle");
  squad.forEach((s) => s.root.removeFromParent());
  const B = G.fight({ allies: ["renji", "raizen", "shion"] });
  B.wave([["scuttle", 3, 43], ["scuttle", -1, 43.4], ["scuttle", 0, 20], ["scuttle", 1, 26], ["scuttle", -1, 30]]);
  G.objective("THE WINDOWS BURST. PROTECT THEM.");
  await B.waitFor(() => B.alive().length <= 1);
  await G.cine(async () => {
    B.enemies.forEach((e) => (e.passive = true));
    const ser = makeKhethari("seraph", 0.8);
    ser.root.position.set(0, 0, 31); W.add(ser.root);
    W.every((dt) => ser.update(dt, 0, "listen"));
    G.music.play("boss");
    G.shot([1.4, 1.5, 38], [0, 1.8, 32], 50);
    await G.say([N("A Glaive Seraph stepped through the doorway like a verdict.")]);
    mom.pose = null;
    G.shot([2.4, 1.7, 36], [-3.4, 1.2, 42.2], 40);
    await G.say([["MIYU'S MOTHER", "Go."], ["MIYU", "No—"], ["MIYU'S MOTHER", "Take her."]]);
    ambush.root.visible = false;
    G.player.ch.pose = "hold";
    await G.walkTo(mom, 0, 34.6, 1.6);
    mom.pose = "arms";
    G.shot([0, 1.4, 38], [0, 1.6, 33], 40);
    await G.say([N("The woman shoved Miyu toward him and stepped forward into the Seraph's path, arms wide, shaking but unmovable."), ["MIYU'S MOTHER", "RUN."]]);
  });
  B.close();
  // the run
  G.player.place(0, 40, Math.PI);
  G.player.ch.pose = "hold";
  G.objective("RUN.");
  G.ui.whisper("RUN", 1.5);
  W.every(() => { if (G.player.pos.z > 34.2 && G.player.pos.z < 36) { /* the doorway: she holds it */ } });
  // the corridor exit
  await new Promise((r) => W.trigger({ x0: -2, z0: 0, x1: 2, z1: 8, enter: r }));
  G.player.ch.pose = null;
  await G.cine(async () => {
    G.music.play("miyu");
    const m = G.actor("miyu", 0.6, 4, 0); m.pose = "hold";
    G.player.ch.pose = "kneel";
    G.shot([1.6, 1.1, 1.6], [0.2, 0.9, 4], 42);
    await G.say([
      N("Kaien ran. Behind him, the sound stopped."),
      N("In the hallway, Miyu screamed until her voice broke. Kaien held her while she sobbed, and his own eyes burned. Not from smoke."),
      ["KAIEN", "She... saved you."],
      ["MIYU", "Why?"],
      ["KAIEN", "Because she loved you."],
      N("And somewhere deep inside the Canticle, something listened to that grief like it was data."),
    ]);
    await G.fade(1, 2);
  });
  G.state.stats.saved++;
}

// ============================================================
// 10 — GUARDIANSHIP
// ============================================================
async function ch10(G, C) {
  const W = await G.load(buildHangar, { night: true });
  await card(G, C);
  G.music.play("miyu");
  const dg = G.actor("daigo", -13, -6.2, 0);
  const miyu = G.actor("miyu", -15.8, -20, 0); miyu.pose = "lie";
  G.player.place(-13, -2, Math.PI);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-10, 2.2, -1], [-13, 1, -4], 45);
    await G.say([
      N("Paperwork felt obscene next to death."),
      ["DAIGO", "Temporary guardianship."],
      ["KAIEN", "Temporary is what people say when they're scared to promise."],
      ["DAIGO", "Kaien... we're at war."],
      N("Kaien looked at Miyu asleep on a cot, her scarf clenched like it was the only thing keeping her anchored to Earth."),
      ["KAIEN", "Then I'll be her peace anyway."],
    ]);
    await G.walkTo(dg, -6, -12, 1.4);
    dg.root.visible = false;
    const aria = G.actor("aria", -14.6, -18.6, Math.PI);
    G.player.place(-13.4, -17.4, Math.PI);
    G.music.play("aria");
    G.shot([-11.6, 1.7, -15.4], [-14.2, 1.3, -18.6], 40);
    await G.say([
      ["ARIA", "We should talk about what she needs. Food. Somewhere safe to sleep. Somebody here when you're sent out."],
      ["KAIEN", "I know. I keep thinking of everything I can't give her."],
      ["ARIA", "Then let me help with what we can. You and I are allowed to want a life after this. She should get to have one too."],
      N("He reached for her hand beneath the edge of the cot. For a moment they sat together, looking at the sleeping child."),
    ]);
    const sh = G.actor("shion", -12, -12, Math.PI);
    await G.walkTo(sh, -12.6, -15.6, 1.4);
    await G.say([["SHION", "You haven't eaten."], ["KAIEN", "Neither have the dead."], ["SHION", "That's not how you honor them."]]);
    const rz = G.actor("raizen", -11, -12, Math.PI);
    await G.walkTo(rz, -11.6, -15.8, 2.4);
    await G.say([
      ["RAIZEN", "Have you seen Renji? I can't find him."],
      N("Renji had gone quiet in a way that scared people who knew what quiet meant."),
      ["KAIEN", "We find him. Now."],
      N("As Kaien walked out, he glanced back at Miyu one last time. In the faintest hum in the air, he felt the Canticle again. Patient. Amused. Waiting."),
    ]);
  });
  G.objective("FIND RENJI. THE ROOF.");
  W.door(-19.4, 22, Math.PI / 2, { sign: "ROOF ACCESS", tint: "#3a3a3e", solid: false });
  await G.interactOnce({ pos: [-18.8, 1, 22], label: "ROOF ACCESS", verb: "CLIMB", r: 1.8 });
  await G.fade(1, 0.8);
}

// ============================================================
// 11 — THE ROOF EDGE
// ============================================================
async function ch11(G, C) {
  const W = await G.load(buildRoof, {});
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.9, drone: 0.2, note: 41 });
  const rj = G.actor("renji", 2, 9.1, 0);
  rj.setWeapon("katana");
  const squad = party(G, ["raizen", "shion"]);
  G.fade(0, 1.4);
  await G.say([N("The stairs were cold concrete. The last hatch opened onto wind and ash. The city below looked smaller from up there, like a model someone had forgotten to finish painting.")]);
  G.objective("REACH RENJI.");
  await new Promise((r) => W.trigger({ x: 2, z: 9, r: 4.5, enter: r }));
  await G.cine(async () => {
    G.music.play("miyu");
    G.shot([4.6, 1.6, 5], [2, 1.6, 9], 42);
    await G.say([
      N("Renji stood at the edge with a katana in his hand. Not raised. Not threatening. Just present, like an anchor."),
      ["RAIZEN", "Renji."],
      N("No response."),
      ["KAIEN", "Talk to me."],
      ["RENJI", "There's nothing to say."],
      ["SHION", "You're dissociating."],
      ["RAIZEN", "Don't turn him into a diagnosis."],
      ["SHION", "It's not a diagnosis. It's what's happening."],
      ["RENJI", "Don't comfort me. It's insulting."],
    ]);
    // the player chooses Kaien's next words; the wrong ones are held back
    let c;
    while ((c = await G.choose("", ["\"Then don't ask for comfort. Ask for a reason to stay.\"", "\"Step back from the edge. That's an order.\""])) !== 0) await G.say([N("Kaien held the order back. Orders were what Renji had followed into the apartment.")]);
    await G.say([
      ["KAIEN", "Then don't ask for comfort. Ask for a reason to stay."],
      ["RENJI", "I stayed."],
      ["KAIEN", "Your body stayed. You didn't."],
      ["RENJI", "She died because we were too slow."],
      ["RAIZEN", "That's not fair."],
      ["RENJI", "Fair is a story people tell children."],
      ["KAIEN", "You think stepping off this roof punishes the enemy?"],
      ["RENJI", "No."],
      ["KAIEN", "Then what does it do?"],
      N("Silence."),
      ["RENJI", "It ends the sound."],
      N("Kaien understood. Not the city's sound. The internal sound: the loop of the last scream, the last order, the last moment you could have done something different."),
      ["KAIEN", "It won't end it. It just moves it into us."],
      ["RENJI", "I don't know what fixes this."],
      ["KAIEN", "Neither do I. But I know what doesn't fix it. Leaving."],
      ["RENJI", "I'm tired."],
    ]);
    while ((c = await G.choose("", ["\"Just come down. Please.\"", "\"Then don't be strong alone. Be tired with us.\""])) !== 1) await G.say([N("The words came out too small for the wind. Kaien tried again.")]);
    await G.say([
      ["KAIEN", "Then don't be strong alone. Be tired with us."],
      ["RAIZEN", "We need you."],
      N("Renji stared at them like he was trying to decide if being needed was a burden or a lifeline. Finally, he stepped back from the ledge."),
      N("Kaien didn't touch him. He simply stood there until Renji's breathing matched theirs."),
    ]);
    await G.walkTo(rj, 0, 6, 1);
    G.shot([-4, 1.7, -2], [-6, 1.5, -4.6], 40);
    G.player.place(-5.4, -3, Math.PI);
    await G.say([
      ["RENJI", "When the Seraph screamed... I heard a face in it."],
      ["KAIEN", "A face?"],
      ["RENJI", "White hair. Blue eyes. Smiling like he knew the ending."],
      ["SHION", "The Canticle has an author."],
      N("And Kaien realized the enemy wasn't only invading. It was watching."),
    ]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 12 — SPIRAL MAP
// ============================================================
async function ch12(G, C) {
  await G.load(buildHangar, {});
  await card(G, C);
  G.music.play("base");
  await briefing(G, ["daigo", "shion", "raizen", "renji"]);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-15, 2, -1.6], [-19.9, 3.4, -4], 45);
    await G.say([
      N("Daigo called them into the briefing room before sunrise. The map showed the city in grays and reds, missing zones marked as dark spirals converging toward the industrial belt."),
      ["DAIGO", "It's a harvest pattern. Not random raids. Not panic. Procedure."],
      ["RAIZEN", "For what?"],
      ["SHION", "A Choirwell. A Lumen Spire. A permanent amplifier."],
      ["DAIGO", "And the longer it runs, the more their coordination improves."],
      ["KAIEN", "Where does it end?"],
      ["DAIGO", "Under the Ark. Underground access points through the storm drains and utility tunnels."],
      ["DAIGO", "We have a second problem."],
    ]);
    const miyu = G.actor("miyu", -9, -0.4, -Math.PI / 2);
    G.music.play("miyu");
    G.shot([-12, 1.4, -2], [-9, 1, -0.4], 40);
    await G.say([
      N("Miyu stood at the side door, small and pale, eyes unfocused like she'd been pulled from sleep without waking fully."),
      ["KAIEN", "Miyu?"],
      ["MIYU", "It hurts."],
      ["KAIEN", "Breathe. Slow."],
      ["MIYU", "I saw the tower. It's not finished. It's hungry."],
      ["SHION", "What else?"],
      ["MIYU", "He was there again. He said... he said your Maestro is a key."],
      ["SHION", "And his name?"],
      ["MIYU", "Vael."],
      ["RAIZEN", "Vael what?"],
      ["MIYU", "Just... Vael. Like that's enough."],
      ["DAIGO", "Gatewright. A builder. A conductor. The one shaping the Canticle into a weapon."],
      ["MIYU", "He smiled when I heard him."],
      ["KAIEN", "Because he wanted you to hear."],
      ["SHION", "If the spiral ends under the Ark, we cut the Choirwell. Disrupt the Spire's feed."],
      ["RAIZEN", "Then we go underground."],
      ["RENJI", "We end the author."],
      ["DAIGO", "And we keep the child out of their hands."],
      ["KAIEN", "We move before dawn."],
      N("The Canticle hummed faintly in the base walls, like it approved of the schedule."),
    ]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// Registry
// ============================================================
const ch = (id, act, num, title, sub, tip, run) => ({ id, act, num, title, sub, tip, run: (G) => run(G, CHAPTERS.find((c) => c.id === id)) });
export const CHAPTERS = [
  ch("p", "PROLOGUE", "PROLOGUE", "THE FIRST FALL", "EIGHTEEN YEARS BEFORE THE ARK", "Aetherhearts do not accept everyone. Covenant waited eighteen years for survivors.", prologue),
  ch("c1", "ACT I · THE CITY HEARS IT", "CHAPTER 1", "THE METEOR THAT LISTENED", "THE INDUSTRIAL BELT", "The swarm does not chase randomly. It herds.", ch1),
  ch("c2", "ACT I · THE CITY HEARS IT", "CHAPTER 2", "EIDOLON COVENANT", "COVENANT HANGAR", "Talk to people at base. Some scenes only happen if you go looking.", ch2),
  ch("c3", "ACT I · THE CITY HEARS IT", "CHAPTER 3", "FIRST RHYTHM", "THE SOUTHERN HIGHWAY", "Tap □ just before a hit lands to PARRY. Parries refill resonance.", ch3),
  ch("c4", "ACT I · THE CITY HEARS IT", "CHAPTER 4", "COUNTER-SONG", "COVENANT HANGAR · NIGHT", "Squad techniques cost resonance and build strain. Stay in formation to cool down.", ch4),
  ch("c5", "ACT I · THE CITY HEARS IT", "CHAPTER 5", "THE FIRST INTERRUPTION", "THE SOUTHERN HIGHWAY · DAWN", "A red pulse means a command is coming. Strike during it to break the swarm's rhythm.", ch5),
  ch("c6", "ACT I · THE CITY HEARS IT", "CHAPTER 6", "QUIET IS NOT PEACE", "THE BURNED DISTRICT", "Listen. The city is singing with stolen voices.", ch6),
  ch("c7", "ACT II · THE GIRL WHO HEARS BACK", "CHAPTER 7", "THE GIRL IN THE ALLEY", "BEHIND THE MARKET", "Miyu's scarf is the only thing she brought with her.", ch7),
  ch("c8", "ACT II · THE GIRL WHO HEARS BACK", "CHAPTER 8", "ECHO-SIGHT", "A VISION OF THE RIVER", "In Echo-Sight, follow the remembered voices.", ch8),
  ch("c9", "ACT II · THE GIRL WHO HEARS BACK", "CHAPTER 9", "THE DOOR THAT SHOULDN'T OPEN", "THE RIVER DISTRICT", "If you hear an order that isn't verified, it isn't real.", ch9),
  ch("c10", "ACT II · THE GIRL WHO HEARS BACK", "CHAPTER 10", "GUARDIANSHIP", "COVENANT HANGAR", "\"Temporary is what people say when they're scared to promise.\"", ch10),
  ch("c11", "ACT II · THE GIRL WHO HEARS BACK", "CHAPTER 11", "THE ROOF EDGE", "COVENANT ROOF", "\"Then don't be strong alone. Be tired with us.\"", ch11),
  ch("c12", "ACT III · THE SPIRAL CLOSES", "CHAPTER 12", "SPIRAL MAP", "BRIEFING ROOM", "The missing districts form a spiral. It ends under the Ark.", ch12),
  ch("c13", "ACT III · THE SPIRAL CLOSES", "CHAPTER 13", "HARMONIC TRAINING", "TRAINING FLOOR", "Breathe in through the nose. Hold. Out, like cooling soup.", CH13),
  ch("c14", "ACT III · THE SPIRAL CLOSES", "CHAPTER 14", "MAESTRO EVOLUTION", "TRAINING FLOOR", "Maestro acts on the instant before intention becomes motion.", CH14),
  ch("c15", "ACT III · THE SPIRAL CLOSES", "CHAPTER 15", "NIGHT BEFORE DESCENT", "COVENANT ROOF · NIGHT", "\"I want that morning.\"", CH15),
  ch("c16", "ACT III · THE SPIRAL CLOSES", "CHAPTER 16", "THE BROTHERS", "THE CANTEEN", "\"People break. Gods lie.\"", CH16),
  ch("c17", "ACT IV · THE CHOIRWELL", "CHAPTER 17", "THE CHOIRWELL", "UNDER THE CITY", "Keep cadence. Short steps. Running makes noise.", CH17),
  ch("c18", "ACT IV · THE CHOIRWELL", "CHAPTER 18", "REQUIEM", "THE CHOIRWELL", "Only Prismcraft can sever the Warden's antennae. Braid Shion and Kyo to cut two.", CH18),
  ch("c19", "ACT IV · THE CHOIRWELL", "CHAPTER 19", "EIDOLONS OF THE NEW RITE", "THE SEALED BAY", "If the main channel goes down, the auxiliary relay will reach you.", CH19),
  ch("c20", "ACT V · THE FELLSTAR ARK", "CHAPTER 20", "ASSAULT ON THE FELLSTAR ARK", "THE LOWER RIBCAGE · DAWN", "Repeating the same technique on a boss teaches it to counter. Change the attacker.", CH20),
  ch("c21", "ACT V · THE FELLSTAR ARK", "CHAPTER 21", "VAEL NOCTYR", "THE GATE CHAMBER", "\"You call this cruelty. I call it structure.\"", CH21),
  ch("c22", "ACT V · THE FELLSTAR ARK", "CHAPTER 22", "THE MORAL TRAP", "THE GATE CHAMBER", "He is watching your rhythm. Don't give him clean data.", CH22),
  ch("c23", "ACT V · THE FELLSTAR ARK", "CHAPTER 23", "RECEIVER SPIKE", "THE SHELTER / THE GATE", "In. Hold. Out.", CH23),
  ch("c24", "THE FINAL OPERATION", "CHAPTER 24", "THE CHOICE", "BEHIND THE ARK-BONE PILLAR", "\"Then teach me the breath.\"", CH24),
  ch("c25", "THE FINAL OPERATION", "CHAPTER 25", "THE EIDOLON BREAKS", "THE GATE CHAMBER", "\"I've always believed in you.\"", CH25),
  ch("c26", "THE FINAL OPERATION", "CHAPTER 26", "LEGACY SIGIL", "THE GATE CHAMBER", "One step when you can.", CH26),
];

// ============================================================
// Archive (title menu)
// ============================================================
const pc = (who) => () => { const src = portrait(who); const c = document.createElement("canvas"); c.width = 64; c.height = 64; const img = new Image(); img.onload = () => c.getContext("2d").drawImage(img, 0, 0); img.src = src; return c; };
export const ARCHIVE = [
  { name: "KAIEN · MAESTRO", pic: pc("KAIEN"), text: "Pilot of EIDOLON-0. His Maestro ability links the squad's Aetherhearts into one rhythm. Asymmetric pilot jacket, a long katana sheath. Becomes Miyu's guardian." },
  { name: "ARIA · COMMUNICATIONS", pic: pc("ARIA"), text: "Covenant communications officer and Kaien's partner. Keeps the evacuation channels running and builds the verified auxiliary relay with Shion." },
  { name: "RENJI · ANCHOR", pic: pc("RENJI"), text: "The defensive anchor. Broadest armor in the squad. Carries the guilt of the failed rescue." },
  { name: "RAIZEN · GRAVESEAL", pic: pc("RAIZEN"), text: "Outspoken fighter. Gravity bracers make his gestures readable. Pins a dangerous limb, shifts cover, drops buses on things." },
  { name: "SHION · PRISMCRAFT", pic: pc("SHION"), text: "Analyst and Prismcraft specialist. Builds the counter-harmony. Identifies signal nodes and severs them precisely." },
  { name: "KYO · PRISMCRAFT", pic: pc("KYO"), text: "Shion's twin. Joins with a personal stake in the disappearances. Creates a second attack angle." },
  { name: "DAIGO KUROGANE", pic: pc("DAIGO"), text: "Covenant commander. Knows the history of First Fall. Kept four pilot stations empty for years, waiting for survivors." },
  { name: "MIYU · ECHO-SIGHT", pic: pc("MIYU"), text: "The child who hears the Canticle. Her scarf is immediately recognizable. The emotional center of the story." },
  { name: "REQUIEM", pic: pc("REQUIEM"), text: "A battlefield alias. Black bodysuit, silver belt, curved sword. Vael knows her real name: Reika." },
  { name: "VAEL NOCTYR · GATEWRIGHT", pic: pc("VAEL"), text: "White hair, blue eyes, unsettling composure. The Canticle Architect, who builds control structures out of minds." },
  { name: "AETHERHEART", text: "A crystalline organ that runs resonance instead of current. Recovered from First Fall. Incompatible minds burn." },
  { name: "EIDOLON", text: "Frames strong enough to carry resonance strain, built around portable Aetherhearts. EIDOLON-0 is Kaien's." },
  { name: "THE CANTICLE", text: "The Khethari control network. It fights like an orchestra: many bodies, one mind. It can wear your voice." },
  { name: "SCUTTLEWIGHT", text: "Low, fast, many-limbed. Spills into streets like ink. Herds rather than chases." },
  { name: "GLOOMCASTER", text: "Nests in high windows and fires needle volleys. Out of blade reach: order Prismcraft." },
  { name: "GLAIVE SERAPH", text: "A bladed elite that strikes like a verdict. Broadcasts command pulses. Break them." },
  { name: "CARAPAX COLOSSUS", text: "Thick armor plates and a horned crown. Blades glance off unless it is pinned." },
  { name: "CANTOR WARDEN", text: "Guardian of the Choirwell, crowned with antennae. Its scream is a psychic hammer." },
];
