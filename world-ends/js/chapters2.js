// ============================================================
// WORLD ENDS — Chapters 13 → 26 and the ending.
// ============================================================
import { THREE, U, mat, TEX, boxGeo } from "./ps1.js";
import { Character, makeKhethari, portrait, glowK } from "./actors.js";
import { buildHangar, buildRoof, buildTunnels, buildChoirwell, buildArkOutside, buildArkInside, buildGate } from "./scenes.js";
import { breath, rhythm, qte } from "./minigames.js";
import { N, R, SYS, MIMIC, card, party, crawler, tip } from "./chapters.js";

const briefPos = { daigo: [-13, -6.2, 0], shion: [-11.2, -3.2, -2.2], raizen: [-14.8, -3.2, 2.2], renji: [-15.4, -5.2, 1.4], kyo: [-10.8, -5.2, -1.4], requiem: [-16.5, -1.5, 2.5] };
function gather(G, ids) { const o = {}; for (const id of ids) o[id] = G.actor(id, ...briefPos[id]); G.player.place(-13, -1.6, Math.PI); return o; }

// ============================================================
// 13 — HARMONIC TRAINING
// ============================================================
export async function CH13(G, C) {
  const W = await G.load(buildHangar, {});
  G.player.place(0, -19.6, Math.PI);
  await card(G, C);
  G.music.play("base");
  const rz = G.actor("raizen", -1.6, -23.6, 0), sh = G.actor("shion", 1.6, -23.6, 0), rj = G.actor("renji", 0, -24.6, 0);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([4.4, 2, -17.4], [0, 1, -22.6], 50);
    await G.say([
      N("Training became a language. Not the kind people posted for motivation. The kind built out of repetition until fear had fewer places to hide."),
      N("Kaien made them drill breath cadence first."),
      ["RAIZEN", "We're fighting alien bugs and you want me to inhale like a monk?"],
      ["KAIEN", "You want your Aetherheart to stop spiking? Then breathe."],
    ]);
  });
  await breath(G, { cycles: 3, title: "BREATH CADENCE", sub: "Lead the squad. Hold ✕ on IN and HOLD. Release on OUT." });
  await G.say([["SHION", "He's right. Your output stabilizes when your breathing is even."], ["RAIZEN", "Fine. I'll breathe for science."]]);
  await rhythm(G, { beats: 8, bpm: 84, title: "MAESTRO TIMING", sub: "Hold the squad on your tempo. ✕ on every beat." });
  // Kyo arrives
  await G.cine(async () => {
    const kyo = G.actor("kyo", 0, -6, Math.PI);
    const dg = G.actor("daigo", 3, -8, Math.PI);
    G.shot([3.6, 1.8, -15], [0, 1.5, -10], 45);
    await G.walkTo(kyo, 0, -16.4, 1.6);
    await G.say([
      N("Kyo arrived during the second week of drills, carrying a duffel bag and an attitude. He looked enough like Shion to be mistaken at a distance, but his posture carried a restless edge."),
      ["KYO", "So you're the famous team. You look tired."],
      ["SHION", "You shouldn't be here."],
      ["KYO", "I'm here. That's the point."],
      ["DAIGO", "Compatibility test passed. We need every Prismcraft hand we can get."],
      R("RAIZEN", "More Shion? Great."),
      R("KAIEN", "More precision."),
    ]);
    await G.fade(1, 1);
  });
  // the night the comms glitch
  U.uAmbient.value.multiplyScalar(0.6);
  G.player.place(-12, 8, -Math.PI / 2);
  const aria = G.actor("aria", -14.6, 9, Math.PI / 2);
  const miyu = G.actor("miyu", -16, 14.4, Math.PI); miyu.pose = "sit";
  [rz, sh].forEach((a, i) => a.setPos(-11 + i * 1.6, 0, 10.6).face(-Math.PI / 2));
  G.music.play("eerie");
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-10, 2, 5.6], [-15, 1.6, 9.6], 48);
    await G.say([N("The night before their planned descent, the comm system glitched. Not a typical crackle. Not interference.")]);
    G.audio.staticLevel(0.5);
    await G.say([
      MIMIC("THE SPEAKERS", "Kaien."),
      N("It was Kaien's own voice. Every head in the room snapped toward the speaker."),
      ["RAIZEN", "No. No, that's not—"],
      MIMIC("THE SPEAKERS", "Stand down. Save your team. Give me the child."),
    ]);
    G.audio.staticLevel(0);
    G.audio.thud();
    await G.say([
      N("Kaien reached for the panel and killed the channel. Silence fell heavy."),
      ["SHION", "Hollowbound mimic. It's inside our comm lattice."],
      ["KYO", "They can copy you?"],
      ["KAIEN", "They can copy our voices. Not our choices."],
      ["RAIZEN", "Good. Because I choose violence."],
      ["KAIEN", "Tomorrow we cut their Choirwell. And we keep our minds clean. Anything you hear that isn't verified: ignore it."],
    ]);
    G.music.play("aria");
    G.shot([-12.6, 1.7, 6.6], [-14.6, 1.5, 9], 38);
    await G.say([
      N("Aria had been standing at the communications panel when the copied voice came through. She pulled the affected channel from the squad's routing list."),
      ["ARIA", "I'll keep this circuit isolated until Shion clears it. If it wants your voice, it can have an empty speaker."],
      N("Her hands were steady on the switches. She had seen the same thing he had, and she was already making their next conversation possible."),
    ]);
    G.shot([-13.6, 1.3, 12], [-16, 0.8, 14.4], 40);
    G.music.play("miyu");
    await G.say([
      N("Miyu sat in the corner with her scarf in her hands, small and silent. Kaien approached her slowly."),
      ["KAIEN", "If you feel the singing, wake me. You don't have to handle it alone."],
      N("Outside, the city wind carried a faint hum, like the Canticle was rehearsing."),
    ]);
    await G.fade(1, 1.3);
  });
}

// ============================================================
// 14 — MAESTRO EVOLUTION (sparring)
// ============================================================
export async function CH14(G, C) {
  const W = await G.load(buildHangar, {});
  G.player.place(0, -19, Math.PI);
  await card(G, C);
  G.music.play("base");
  const sh = G.actor("shion", 4.4, -18, -Math.PI / 2), ky = G.actor("kyo", 4.6, -20, -Math.PI / 2);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-4, 2, -17], [0, 1.2, -22], 48);
    await G.say([
      N("Kaien sparred Raizen because Raizen needed someone to hit him back. Practice blades, weighted and calibrated to simulate Eidolon timing patterns."),
      ["RAIZEN", "Come on, Maestro. Let's see what you've got."],
      ["KAIEN", "You want to be loud? Be loud with discipline."],
    ]);
  });
  G.music.play("battle");
  let B = G.fight({ allies: [], onLose: () => { B.hp = B.hpMax; B.dead = false; G.player.ch.pose = null; G.ui.toast("RAIZEN: AGAIN.", 2); } });
  const rz = B.spawn("spar", 0, -24);
  rz.immortal = true; rz.floor = 0.45;
  G.objective("SPAR WITH RAIZEN.");
  tip(G, "Guard his rush, then answer. Watch the timing, not the blade.", 5);
  await B.waitFor(() => rz.hp <= rz.max * 0.46);
  B.enemies.forEach((e) => (e.passive = true));
  await G.cine(async () => {
    G.music.play(null, 0.5);
    G.shot([2.4, 1.6, B.P.pos.z + 1.5], [rz.pos.x, 1.4, rz.pos.z], 40);
    await G.say([
      N("For a moment, Raizen had the advantage: speed, aggression, rhythm that tried to force the opponent into panic. Kaien didn't panic. He watched."),
      N("Raizen feinted left, cut right, then drove forward with a shoulder that would have dropped most men. Kaien stepped half an inch and the shoulder missed."),
      ["RAIZEN", "What—"],
      N("Something inside him shifted. Not anger. Not rage. Tempo. The air felt tighter, like the room had decided to follow Kaien's breathing."),
    ]);
    U.uTint.value.setRGB(0.75, 0.85, 1.2);
    G.audio.maestro();
  });
  await qte(G, { text: "ACT ON THE INSTANT BEFORE HIS MOVE", key: "x", window: 1.4 });
  await G.cine(async () => {
    U.uTint.value.setRGB(1, 1, 1);
    G.player.ch.play("slash2");
    G.audio.clang();
    await G.say([
      N("Raizen swung again, fast. Kaien moved faster. Not in body, but in timing. Raizen's blade hit nothing. Kaien's blade tapped Raizen's chest."),
      N("Silence."),
      ["RAIZEN", "Okay. That was... that was not fair."],
      ["SHION", "His Maestro signature tightened. He's compressing reaction windows."],
      ["KYO", "So he's bending reality by a fraction."],
      ["KAIEN", "I didn't mean to do that."],
    ]);
    B.close();
    const aria = G.actor("aria", -4, -14, Math.PI);
    G.music.play("aria");
    await G.walkTo(aria, -1, -18.6, 1.5);
    G.shot([-2.6, 1.5, -16.4], [-0.4, 1.2, -19], 38);
    await G.say([
      N("Aria came through the doorway with a towel. When he reached for it, she saw the tremor in his fingers."),
      ["ARIA", "Still with me?"],
      ["KAIEN", "Yeah. Just give me a second."],
      N("For that brief instant, Kaien had felt the next movement before it happened. Now, with Aria beside him, he could remember it clearly enough to begin understanding what he had done."),
      ["RAIZEN", "Do it again in the field. Preferably at the enemy."],
    ]);
    const dg = G.actor("daigo", 2, -12, Math.PI);
    await G.walkTo(dg, 1.5, -16.8, 1.6);
    G.music.play("eerie");
    await G.say([
      ["DAIGO", "We breach underground in six hours. The spiral tightened overnight. The harvest is accelerating."],
      ["SHION", "They're close to stabilizing the Spire."],
      ["KAIEN", "Then we don't give them time."],
      ["DAIGO", "You understand what they want from you."],
      ["KAIEN", "Let them want. They won't get it."],
      N("Above the base, the city lights flickered once, like something in the grid had been touched. Deep beneath the Ark, the Choirwell began to hum louder."),
    ]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 15 — NIGHT BEFORE DESCENT
// ============================================================
export async function CH15(G, C) {
  let W = await G.load(buildRoof, { stage: 2 });
  G.player.place(2, 8, 0);
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.8, drone: 0.2, note: 41 });
  G.fade(0, 1.4);
  await G.cine(async () => {
    const sh = G.actor("shion", -6, -4.6, 0);
    G.shot([4.6, 1.8, 4.6], [1, 1.6, 9.6], 45);
    await G.say([N("The night before the descent, Kaien couldn't sleep. Below, distant sirens were fewer now. Not because the danger had faded, but because fewer people were left to call for help.")]);
    await G.walkTo(sh, 3.4, 8.4, 1.4);
    sh.face(0);
    await G.say([
      ["SHION", "You're thinking too loudly."],
      ["KAIEN", "Then you can hear me from down the hall."],
      ["SHION", "The Spire stabilizes when you're near. I've been tracking resonance drift."],
      ["KAIEN", "So I'm part of their blueprint."],
      ["SHION", "If it comes to—"],
      ["KAIEN", "Don't say it."],
      ["SHION", "Are you afraid?"],
      ["KAIEN", "Yeah. Fear doesn't get to drive."],
      ["KAIEN", "How's Kyo?"],
      ["SHION", "He's pretending he's fine. Which means he's worse than fine."],
    ]);
    await G.fade(1, 1);
  });
  W = await G.load(buildHangar, { night: true });
  G.music.play("miyu");
  const miyu = G.actor("miyu", -15.8, -20.2, 0); miyu.pose = "sit";
  G.player.place(-13.6, -19.4, -Math.PI / 2);
  G.player.ch.pose = "sit";
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-12.6, 1.5, -17.6], [-15.2, 0.8, -20], 42);
    await G.say([
      ["MIYU", "The humming is quieter."],
      ["KAIEN", "That's good."],
      ["MIYU", "Are you going away?"],
      ["KAIEN", "I'm going to stop the people making it hum."],
      ["MIYU", "I don't want you to go."],
      ["KAIEN", "I know. Listen. You don't have to be brave every second. Just breathe when it hurts."],
      ["MIYU", "Can you... show me?"],
      ["KAIEN", "Okay. In through your nose. Slow. Like you're smelling warm bread. Hold. Then out, like you're cooling soup."],
    ]);
  });
  await breath(G, { cycles: 3, title: "BREATHE WITH MIYU", sub: "Warm bread in (hold ✕). Hold. Cool the soup (release)." });
  await G.cine(async () => {
    await G.say([
      N("Miyu tried. Her shoulders lowered a fraction."),
      ["KAIEN", "Good."],
      ["MIYU", "Do you get scared?"],
      ["KAIEN", "Yes."],
      ["MIYU", "But you still go."],
      ["KAIEN", "Because people need the going."],
      ["MIYU", "I wish it didn't need it."],
      ["KAIEN", "Me too."],
    ]);
    G.player.ch.pose = null;
    const aria = G.actor("aria", -12, -15, Math.PI);
    G.player.place(-12.4, -17.4, 0);
    G.music.play("aria");
    G.shot([-10.4, 1.7, -15.4], [-12.2, 1.5, -16.4], 38);
    await G.say([
      ["ARIA", "Walk me back?"],
      ["KAIEN", "When this is over, what do you want to do first?"],
      ["ARIA", "Have breakfast with you. Somewhere with a window."],
      ["KAIEN", "That's all?"],
      ["ARIA", "For the first morning. You'll let your tea go cold while you tell me everything I already heard on the radio."],
      N("Kaien laughed quietly. It had been days since the sound came easily."),
      ["KAIEN", "I can do that."],
      N("She took his face in her hands and kissed him. When she drew back, the smile had faded."),
      ["ARIA", "I want that morning."],
      ["KAIEN", "So do I."],
    ]);
    await G.fade(1, 1);
    await G.say([N("When he left, he paused outside the door. A faint hum in the air, like a note that didn't belong to the base, vibrated against his teeth."), N("Tomorrow, the Canticle would try to claim him.")]);
  });
}

// ============================================================
// 16 — THE BROTHERS
// ============================================================
export async function CH16(G, C) {
  await G.load(buildHangar, {});
  await card(G, C);
  G.music.play("base");
  const kyo = G.actor("kyo", -0.6, 2.7, Math.PI), sh = G.actor("shion", -0.6, -2.7, 0);
  kyo.pose = "sit"; sh.pose = "sit";
  G.player.place(3, 0, -Math.PI / 2);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([2.6, 1.8, -5.6], [-0.6, 1, 0], 45);
    await G.say([
      N("Kyo didn't enter the war like a recruit. He entered like someone returning to a fight he'd been avoiding."),
      ["KYO", "You're too calm."],
      ["SHION", "You're too loud."],
      ["KYO", "That's our whole childhood in two sentences."],
      ["SHION", "Why did you really come?"],
      N("Kyo slid a folded paper across the table. A list of names. Missing persons. One name was underlined twice."),
      ["SHION", "Who is this?"],
      ["KYO", "Someone who mattered."],
      ["SHION", "You didn't tell me."],
      ["KYO", "Because you'd tell me not to come."],
      ["SHION", "And you'd come anyway."],
      ["KYO", "Exactly."],
    ]);
    await G.walkTo(G.player.ch, 1, 0, 1.2);
    await G.say([
      ["KAIEN", "We go underground at dawn. You don't need to prove anything to us."],
      ["KYO", "Everyone keeps calling you Maestro. Do you feel like one?"],
      ["KAIEN", "I feel like a person trying not to break."],
      ["KYO", "Good. People break. Gods lie."],
    ]);
    const rz = G.actor("raizen", 6, 3, -Math.PI / 2);
    await G.walkTo(rz, 1.6, 2.4, 2.4);
    await G.say([
      ["RAIZEN", "So the twin's joining the party. We're going to need name tags."],
      ["KYO", "You talk like you fight."],
      ["RAIZEN", "Hard and fast."],
      ["KYO", "I can work with that."],
    ]);
    const dg = G.actor("daigo", 6, -4, -Math.PI / 2);
    await G.walkTo(dg, 3.4, -2.6, 1.5);
    G.music.play("eerie");
    await G.say([
      ["DAIGO", "Briefing in five minutes. And understand this: underground, comms will distort. The Canticle will try to wear your voice."],
      ["RAIZEN", "Let it try."],
      ["DAIGO", "If you hear Kaien ordering you to abandon the team, it's not Kaien."],
      N("The enemy was already practicing theft. And tomorrow, they would descend into its throat."),
    ]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 17 — THE CHOIRWELL
// ============================================================
export async function CH17(G, C) {
  let W = await G.load(buildTunnels);
  await card(G, C);
  G.music.play("eerie");
  G.audio.ambience({ wind: 0.05, drone: 0.5, note: 38, water: 0.5, verb: 0.8 });
  const squad = party(G, ["renji", "raizen", "shion", "kyo"]);
  G.fade(0, 1.4);
  await G.say([
    N("The underground entrance smelled like damp concrete and old rust. Their lights cut narrow cones through darkness. The city's surface noise faded until only breathing remained."),
    R("KAIEN", "Keep cadence. Short steps. No sprinting unless I say."),
    R("RAIZEN", "You're ruining my style."),
    R("KAIEN", "I'm keeping you alive."),
  ]);
  G.objective("KEEP CADENCE. DON'T SPRINT.");
  // running makes noise, and the walls answer
  let noise = 0, fights = 0;
  W.every((dt) => {
    if (!G.canMove() || G.battle) return;
    if (G.player.speed > 2.6) { noise += dt; if (noise > 1.2) { noise = -4; G.ui.whisper("\"Short steps.\" The walls hum louder.", 2.5); G._veinK = 1.2; if (++fights === 2) spawnNoise(); } }
    G._veinK = Math.max(0.4, (G._veinK || 0.4) - dt * 0.2);
  });
  const spawnNoise = async () => {
    const B = G.fight({ allies: ["renji", "raizen", "shion", "kyo"] });
    squad.forEach((s) => (s.root.visible = false));
    const z = G.player.pos.z;
    B.wave([["scuttle", 0, z + 10], ["scuttle", 1, z + 13], ["scuttle", -1, z - 8]]);
    await B.cleared();
    B.close();
    squad.forEach((s, i) => { s.root.visible = true; s.setPos(G.player.pos.x, 0, G.player.pos.z - 1.4 - i * 1.2); });
  };
  await new Promise((r) => W.trigger({ x0: -3, z0: 24, x1: 3, z1: 27, enter: r }));
  await G.cine(async () => {
    const sh = squad[2];
    sh._stay = true;
    sh.setPos(1.8, 0, 26).face(Math.PI / 2);
    sh.pose = "conduct";
    G.shot([-1, 1.7, 23.6], [2.2, 1.5, 26.6], 40);
    await G.say([
      N("They moved through utility tunnels that pulsed faintly, like the walls had learned to hum. Miyu's words came back to Kaien: the walls hummed back."),
      ["SHION", "It's a carrier. They're using the city itself as a conductor."],
      ["RENJI", "Like veins."],
    ]);
    sh.pose = null; sh._stay = false;
  });
  await new Promise((r) => W.trigger({ x0: -3, z0: 76, x1: 3, z1: 82, enter: r }));
  await G.fade(1, 1.2, "#e0c0ff");
  // the cavern
  W = await G.load(buildChoirwell, { mech: true, start: [0, -36, 0] });
  G.music.play(null);
  G.audio.ambience({ wind: 0, drone: 0.8, note: 36, verb: 0.9 });
  const warden = makeKhethari("warden", 2.2);
  warden.root.position.set(0, 0, -14);
  warden.root.rotation.y = Math.PI;
  W.add(warden.root);
  W.every((dt) => warden.update(dt, 0, G._wardenState || ""));
  G.fade(0, 2);
  await G.cine(async () => {
    G.pan([[0, 4, -44], [0, 6, 0]], [[0, 16, -36], [0, 10, 0]], 9, 60);
    G.music.play("eerie");
    await G.say([
      N("They turned a corner and the air changed. Warm. Alive."),
      N("The tunnel opened into a cavern that should not have existed under that part of the city. Light pooled in soft, sickly gradients from structures that looked grown rather than built."),
      N("And then they saw the rings. Hundreds of civilians sat in concentric circles, eyes half-open, mouths barely moving. A low hum rose from them, not quite song, not quite breath."),
      R("KYO", "..."),
      R("RAIZEN", "They're... using people."),
      R("SHION", "Choirwell. Feeding the Lumen Spire."),
    ]);
    G.shot([6, 4, -34], [0, 6, -14], 45);
    G._wardenState = "listen";
    await G.say([N("A shape moved near the center. A Cantor Warden. Larger than the Seraphs they'd fought: horned, plated, antennae flaring like a crown of knives."), N("Its head tilted. It listened.")]);
    G.audio.pulse(); G.audio.screech(0.5);
    G.rig.shake = 0.4;
    U.uAdd.value.setRGB(0.3, 0.05, 0.2);
    await G.say([N("Then it screamed. The scream hit like a psychic hammer. Kaien's vision tunneled.")]);
    U.uAdd.value.setRGB(0, 0, 0);
    G.music.play("boss");
    G.music.duck(0.3);
    await G.say([
      MIMIC("A CALM VOICE", "Welcome, Maestro."),
      N("The voice wasn't in the air. It was in his bones."),
      MIMIC("A CALM VOICE", "You've been singing so bravely. I wanted to hear you up close."),
      R("KAIEN", "Show yourself."),
      MIMIC("A CALM VOICE", "Soon. First... prove your tempo holds under pressure."),
      N("The Cantor Warden stepped forward. The cavern erupted into war."),
    ]);
    G.music.unduck();
    await G.fade(1, 0.6);
  });
}

// ============================================================
// 18 — REQUIEM (boss: the Cantor Warden)
// ============================================================
export async function CH18(G, C) {
  const W = await G.load(buildChoirwell, { mech: true, start: [0, -34, 0] });
  await card(G, C);
  G.music.play("boss");
  G.audio.ambience({ drone: 0.6, note: 36, verb: 0.8 });
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion", "kyo"], resonance: 80 });
  const wd = B.spawn("warden", 0, -16);
  wd.immortal = true; wd.floor = 0.25;
  B.wave([["scuttle", -10, -20], ["scuttle", 10, -20]]);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([12, 5, -30], [0, 6, -16], 50);
    await G.say([
      N("The Cantor Warden moved like a verdict. It didn't rush. It advanced with the confidence of something that had never needed haste."),
      R("KAIEN", "Renji, anchor! Raizen, pin the left flank! Shion, cut antennae. Kyo, braid with him!"),
    ]);
  });
  G.objective("SEVER THE WARDEN'S ANTENNAE.");
  tip(G, "△ SHION · SEVER, then KYO right after to BRAID and cut two at once. Blades barely scratch it while it's crowned.", 8);
  await B.waitFor(() => wd.nodes.filter((n) => !n.alive).length >= 2 || wd.hp < wd.max * 0.55);
  // Requiem drops in
  B.enemies.forEach((e) => (e.passive = true));
  await G.cine(async () => {
    G._choirSway = 0.2;
    G.shot([0, 3, -30], [0, 4, -18], 45);
    await G.say([N("They severed one. The Warden's scream wobbled. Civilians in the rings coughed, some collapsing forward like they'd been released from a grip for a second."), R("KAIEN", "Keep cutting!")]);
    const rq = B.addAlly("requiem", 8, -22);
    rq.ch.root.position.y = 30;
    G.shot([16, 6, -26], [8, 4, -22], 45);
    G.audio.whoosh();
    await G.tween(0.7, (k) => (rq.ch.root.position.y = 30 * (1 - k)));
    rq.ch.root.position.y = 0;
    G.audio.stomp();
    rq.ch.play("slash3");
    await G.say([
      N("Then a figure dropped from the upper ledge. A woman: tall, fast, black bodysuit and silver belt, curved sword that caught the cavern light like a sliver of moon."),
      ["REQUIEM", "You're late."],
      R("RAIZEN", "Who are you?"),
      ["REQUIEM", "Requiem."],
      R("SHION", "That's not a name."),
      ["REQUIEM", "It's what the Khethari called me after I stopped begging."],
      R("KAIEN", "You've fought them before."),
      ["REQUIEM", "Yes. And the one conducting them is why my squad is gone."],
      MIMIC("THE CALM VOICE", "Reika. You survived. How disappointing."),
      ["REQUIEM", "Vael."],
      R("KAIEN", "Vael."),
      ["REQUIEM", "Gatewright. Canticle Architect. He builds control structures out of minds. He left me alive to deliver a message: that your Maestro would crawl to him eventually."],
      R("KAIEN", "Then we crawl with knives."),
    ]);
    G._choirSway = 1;
  });
  B.enemies.forEach((e) => (e.passive = false));
  B.res = 100;
  G.objective("EXPOSE THE CORE. REQUIEM STRIKES THE NODE.");
  tip(G, "When every antenna is cut, the core is EXPOSED: order REQUIEM · CURVED BLADE", 7);
  await B.waitFor(() => wd.exposed);
  wd.immortal = false;
  await B.waitFor(() => !wd.alive);
  await G.cine(async () => {
    B.enemies.forEach((e) => (e.passive = true));
    G.shot([10, 4, -30], [0, 6, -16], 48);
    await G.say([N("Requiem drove her blade into the exposed node. The Warden convulsed. Its scream broke."), N("And for one heartbeat, the Choirwell's hum stuttered.")]);
    G._choirSway = 0;
    (G._captives || []).forEach((h) => (h.rotation.x = -0.4));
    G.shot([20, 3, 8], [0, 2, 0], 50);
    G.music.play("miyu");
    await G.say([N("Kaien looked at the captive rings. Faces lifted. Eyes focused."), N("The war had found its pressure point."), MIMIC("THE CALM VOICE", "Good. Now you understand the rules.")]);
    await G.fade(1, 1.6);
  });
}

// ============================================================
// 19 — EIDOLONS OF THE NEW RITE
// ============================================================
export async function CH19(G, C) {
  const W = await G.load(buildHangar, { frames: ["kaien", "renji", "raizen", "shion", "kyo"] });
  G.player.place(4, 6, Math.PI / 2);
  await card(G, C);
  G.music.play("base");
  const rz = G.actor("raizen", 9.4, 0, -Math.PI / 2), ky = G.actor("kyo", 9.4, -2, -Math.PI / 2), sh = G.actor("shion", 9.4, -9, -Math.PI / 2);
  const rq = G.actor("requiem", -3, 12, Math.PI / 2); rq.pose = "sit";
  const aria = G.actor("aria", -15.4, 9, Math.PI / 2);
  const dg = G.actor("daigo", -13, -6.2, 0);
  G.fade(0, 1);
  await G.cine(async () => {
    G.pan([[6, 2, -10], [14, 6, 0]], [[6, 3, 10], [14, 6, 10]], 6, 55);
    await G.say([
      N("They didn't have time to celebrate a stutter. The Warden's fall only proved the Choirwell could be disrupted. If anything, it provoked the Canticle."),
      N("Daigo authorized the release of prototype Eidolons from a sealed bay: frames reinforced with resonance dampers, better shielding against mimic and pressure spikes."),
      ["RAIZEN", "Upgraded coffin."],
      ["KYO", "At least it's new."],
      ["SHION", "The dampers will help, but the Canticle adapts."],
    ]);
  });
  G.objective("ARIA IS TESTING THE AUXILIARY RELAY.");
  W.interact({ pos: [-3, 1, 12], label: "REQUIEM", verb: "TALK", r: 2, use: async () => G.say([N("She sharpens her curved blade on a stone and doesn't look up."), ["REQUIEM", "It will adapt faster now that you've touched the Choirwell."]]) });
  await G.interactOnce({
    pos: [-15, 1.4, 9], label: "ARIA", verb: "TALK", r: 2.2,
    use: async () => G.cine(async () => {
      G.music.play("aria");
      aria.faceToward(G.player.pos.x, G.player.pos.z);
      G.shot([-12.4, 1.8, 6.6], [-15, 1.5, 9], 40);
      await G.say([
        N("At the adjoining console, Aria was testing the auxiliary relay with Shion. Separated from the compromised comm lattice, routed through the shielded field equipment assigned to the assault."),
        ["KAIEN", "Can you hear me?"],
        R("ARIA", "Unfortunately."),
        N("He heard the smile before he saw it."),
        ["KAIEN", "You could have said something nice."],
        ["ARIA", "Get through the mission and I'll say it in person. If the main channel goes down, use this one. I'll be at the other end."],
      ]);
    }),
  });
  await G.cine(async () => {
    G.music.play("eerie");
    G.player.place(-13, -1.6, Math.PI);
    const sh2 = G.actor("shion", ...briefPos.shion), rz2 = G.actor("raizen", ...briefPos.raizen), rj = G.actor("renji", ...briefPos.renji), rq2 = G.actor("requiem", ...briefPos.requiem);
    G.shot([-9.4, 3, -9], [-14, 1.2, -3], 50);
    await G.say([
      ["DAIGO", "Dawn assault on the Ark. We breach the lower ribcage, reach the Gate chamber, and sever Spire supports."],
      ["SHION", "If we cut these, the Choirwell loses sync and captives should decouple."],
      ["REQUIEM", "Should."],
      ["RAIZEN", "I love 'should.' It's my favorite word in war."],
      ["KAIEN", "We keep our objectives clean. Cut supports. Free captives. Kill Gatewright if we can."],
      ["RENJI", "If we can't?"],
      ["KAIEN", "Then we do the first two and live long enough to try again."],
    ]);
    await G.fade(1, 1);
    G.music.play("miyu");
    const miyu = G.actor("miyu", -15.8, -20, 0); miyu.pose = "lie";
    G.player.place(-13.6, -19, -Math.PI / 2);
    U.uAmbient.value.multiplyScalar(0.5);
    G.shot([-12.6, 1.6, -17.6], [-15.4, 0.6, -20], 42);
    G.fade(0, 1);
    await G.say([
      N("That night, disappearances spiked. Whole streets went dark. Miyu woke with a sound that wasn't quite a scream."),
      ["MIYU", "It's calling. It's calling you."],
      ["KAIEN", "Let it call. Tomorrow, we answer with silence."],
      N("Outside, the city grid flickered like a nervous system being touched. Under the Ark, the Lumen Spire brightened."),
    ]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 20 — ASSAULT ON THE FELLSTAR ARK
// ============================================================
export async function CH20(G, C) {
  let W = await G.load(buildArkOutside, { mech: true });
  await card(G, C);
  G.audio.ambience({ wind: 0.5, drone: 0.4, note: 41 });
  G.fade(0, 1.2);
  await G.cine(async () => {
    G.pan([[-30, 20, -60], [0, 10, 60]], [[-10, 8, -48], [0, 6, 40]], 6, 55);
    await G.say([
      N("Dawn looked wrong. The sun rose behind smoke, bleeding orange through ash like the sky had been bruised."),
      R("KAIEN", "Tempo on me. No hero runs."),
      R("RAIZEN", "So no fun."),
      R("KAIEN", "Fun later."),
    ]);
  });
  G.music.play("battle");
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion", "kyo", "requiem"], resonance: 70 });
  B.wave([["scuttle", -10, 0], ["scuttle", 10, 4], ["scuttle", 0, 10], ["scuttle", -16, 14], ["scuttle", 16, 16], ["elite", 0, 24]]);
  G.objective("BREACH THE LOWER RIBCAGE.");
  await B.cleared();
  B.wave([["colossus", 0, 36], ["scuttle", -12, 30], ["scuttle", 12, 30], ["caster", -30, 50, { y: 14 }], ["caster", 30, 50, { y: 14 }]]);
  tip(G, "Mix your techniques. The Ark learns the ones you repeat.", 5);
  await B.cleared();
  await G.cine(async () => {
    G.shot([0, 6, 40], [0, 6, 76], 50);
    await G.say([N("Renji broke the first heavy unit with a shoulder charge that cracked plates. Requiem moved like a blade thrown by fate."), N("They breached.")]);
    await G.fade(1, 0.8);
  });
  W = await G.load(buildArkInside, { mech: true });
  G.music.play("eerie");
  G.audio.ambience({ wind: 0, drone: 0.7, note: 38, verb: 0.9 });
  const squad = ["renji", "raizen", "shion", "kyo"].map((id, i) => { const f = new Character(frameOf(id)); f.setPos((i % 2 ? 4 : -4), 0, -4 - i * 4); W.add(f.root); return f; });
  W.every((dt) => squad.forEach((f, i) => { const lead = G.player.pos; const p = f.root.position; const tx = lead.x + (i % 2 ? 5 : -5), tz = lead.z - 5 - Math.floor(i / 2) * 6; const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz); const sp = d > 1 ? Math.min(9, d) : 0; if (sp) { p.x += (dx / d) * sp * dt; p.z += (dz / d) * sp * dt; f.faceToward(tx, tz + 4); } f.update(dt, sp / 2.5, sp > 6); }));
  G.fade(0, 1);
  await G.say([
    N("Inside, the Ark was not metal. It was living architecture. Corridors pulsed faintly. The walls were warm. The air tasted like copper and something sweet, like a flower trying to disguise poison."),
    R("KYO", "It's breathing."),
    R("SHION", "It's simulating a home."),
  ]);
  G.objective("MOVE DEEPER.");
  await new Promise((r) => W.trigger({ x0: -11, z0: 40, x1: 11, z1: 44, enter: r }));
  await G.cine(async () => {
    G.audio.staticLevel(0.4);
    await G.say([N("Comms distorted. A voice slid in. Kaien's voice."), MIMIC("KAIEN?", "Turn back."), R("KAIEN", "Ignore. Keep moving.")]);
    G.audio.staticLevel(0);
  });
  await new Promise((r) => W.trigger({ x0: -11, z0: 80, x1: 11, z1: 84, enter: r }));
  await G.cine(async () => {
    await G.say([
      R("DAIGO", "We're losing power districts. The Spire is touching the infrastructure."),
      R("SHION", "It's binding Earth's grid to its resonance lattice."),
      R("RAIZEN", "So it's turning our city into part of their machine."),
      R("REQUIEM", "That's what Gatewrights do. They don't conquer with claws. They rewrite the environment until you're fighting inside their rules."),
      R("KAIEN", "Then we break the rulebook."),
    ]);
  });
  await new Promise((r) => W.trigger({ x0: -11, z0: 120, x1: 11, z1: 130, enter: r }));
  await G.cine(async () => {
    G.shot([0, 6, 110], [0, 12, 132], 60);
    G.music.play(null, 2);
    await G.say([N("Ahead, the corridor opened into cathedral space. Light rose."), N("And the Canticle swelled like a choir taking breath.")]);
    await G.fade(1, 1.6, "#ffe8ff");
  });
}
function frameOf(id) { return { mech: true, ...{ renji: { plate: [96, 100, 104], trim: [60, 160, 90], core: 0x60ff90, broad: 1.25 }, raizen: { plate: [110, 40, 40], trim: [150, 90, 220], core: 0xb060ff }, shion: { plate: [190, 196, 206], trim: [80, 200, 230], core: 0x80f0ff }, kyo: { plate: [60, 60, 70], trim: [220, 140, 50], core: 0xffb050 } }[id], weapon: "katana" }; }

// ============================================================
// 21 — VAEL NOCTYR
// ============================================================
async function gateVael(G) {
  const v = G.actor("vael", 0, 8, Math.PI);
  return v;
}
export async function CH21(G, C) {
  const W = await G.load(buildGate, { mech: true, start: [0, -26, 0] });
  await card(G, C);
  G.audio.ambience({ drone: 0.7, note: 36, verb: 1 });
  const vael = await gateVael(G);
  G.fade(0, 2);
  await G.cine(async () => {
    G.music.play("eerie");
    G.pan([[0, 30, -40], [0, 20, 18]], [[0, 6, -30], [0, 10, 18]], 8, 60);
    await G.say([N("The Gate chamber was cathedral-wide. The Lumen Spire rose half-formed in the center, a pillar of fractured light and grown lattice. Around it, rings of captives hummed, eyes glazed, mouths moving in unison.")]);
    G.pan([[3, 1.6, 2], [0, 1.7, 8]], [[1.4, 1.8, 4.6], [0, 1.7, 8]], 5, 32);
    await G.say([
      N("And beyond the Spire, a man stood as if he belonged there. Tall. Slender. White hair falling like snow. Blue eyes that looked too calm to be human."),
      N("He wore black like a uniform and carried a curved blade that looked ceremonial rather than necessary. He smiled at Kaien like they were meeting at a party."),
      ["VAEL", "Maestro."],
      R("KAIEN", "Vael."),
      ["VAEL", "You learned my name."],
      R("RAIZEN", "You're about to learn my fist."),
      ["VAEL", "Such bright noise."],
      R("REQUIEM", "You left me alive."),
      ["VAEL", "I left you functional. There's a difference."],
      R("KAIEN", "End this. Release them."),
      ["VAEL", "Release?"],
      N("He took a slow step, hands behind his back, as if giving a lecture."),
      ["VAEL", "You call this cruelty. I call it structure. You humans worship freedom and then drown in it. You fight each other for scraps. You call that living."],
      R("SHION", "You're turning people into wires."),
      ["VAEL", "A circuit. A choir. A society with one tempo. Efficient. Enduring."],
      R("KAIEN", "Slavery."),
      ["VAEL", "Words."],
    ]);
    vael.pose = "conduct";
    G.audio.pulse(); G.rig.shake = 0.3;
    G.shot([10, 4, -10], [0, 14, 18], 55);
    await G.say([
      N("He lifted his hand. The Canticle surged. The captives' mouths opened wider. The Spire brightened. Kaien's Aetherheart throbbed in his frame like it wanted to answer."),
      ["VAEL", "You can feel it. Your Maestro signature is the missing keystone. The Spire wants you."],
      R("RAIZEN", "Back off."),
      ["VAEL", "Show me how far humanity will go to survive."],
      N("The vents opened. A wave of Khethari poured in."),
      R("KAIEN", "Tempo, now!"),
    ]);
    vael.pose = null;
  });
  G.music.play("boss");
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion", "kyo", "requiem"], resonance: 80 });
  B.wave([["scuttle", -16, -6], ["scuttle", 16, -6], ["scuttle", -10, 2], ["scuttle", 10, 2], ["seraph", 0, 0], ["scuttle", 0, -10]]);
  G.objective("HOLD THE LINE AGAINST THE WAVE.");
  await B.cleared();
  B.close();
  await G.fade(1, 0.8);
}

// ============================================================
// 22 — THE MORAL TRAP
// ============================================================
export async function CH22(G, C) {
  const W = await G.load(buildGate, { mech: true, start: [0, -26, 0] });
  await card(G, C);
  G.audio.ambience({ drone: 0.7, note: 36, verb: 1 });
  const vael = await gateVael(G);
  G.fade(0, 1);
  await G.say([N("They fought like a machine made of people. Vael didn't rush them. He watched, like a scientist watching an animal solve a maze."), ["VAEL", "Beautiful. Your rhythm is improving."], R("RAIZEN", "Shut up.")]);
  G.music.play("boss");
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion", "kyo", "requiem"], resonance: 70 });
  // Vael tunes the squad out of phase every so often
  let tuneT = 10;
  W.every((dt) => { if (!G.canMove() || B.closed) return; tuneT -= dt; if (tuneT <= 0) { tuneT = 12; vael.play("cast"); B.ring(vael.root.position, 0x3aa8ff, 30, 1.2, true); B.vaelTune(); G.ui.whisper("\"He's tuning us.\"", 2); } });
  B.wave([["scuttle", -14, -4], ["scuttle", 14, -4], ["elite", -8, 4], ["scuttle", 0, -12], ["colossus", 10, 6]]);
  G.objective("CUT THROUGH. DON'T GIVE HIM CLEAN DATA.");
  await B.cleared();
  B.wave([["seraph", 0, 2], ["scuttle", -12, -2], ["scuttle", 12, -2], ["scuttle", 0, -14]]);
  await B.cleared();
  B.close();
  await G.cine(async () => {
    G.music.play("eerie");
    G.shot([2, 1.7, 3.4], [0, 1.7, 8], 34);
    await G.say([
      R("RENJI", "Still standing."),
      R("KYO", "They're syncing faster."),
      R("REQUIEM", "He's feeding off your adaptation. Stop giving him clean data!"),
      R("KAIEN", "We don't have sloppy options."),
      ["VAEL", "Correct."],
      N("Then he delivered the trap like a gift."),
      ["VAEL", "Break the Spire violently, and the Choirwell collapses. Their minds will burn out."],
      R("SHION", "You're using them as shields."),
      ["VAEL", "I'm using your morals as shackles."],
      R("RAIZEN", "You're going to die."),
      ["VAEL", "Choose, Maestro. Win... or stay human."],
    ]);
    G.shot([16, 3, 6], [0, 2, 18], 50);
    await G.say([N("Kaien stared at the humming rings. He felt their fear. He felt their borrowed song."), N("And he understood the war had moved from steel to soul.")]);
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 23 — RECEIVER SPIKE (play as Aria at the shelter)
// ============================================================
export async function CH23(G, C) {
  let W = await G.load(buildHangar, { night: true });
  G.setAvatar("aria");
  G.player.place(-13, -17, Math.PI);
  await card(G, C);
  const miyu = G.actor("miyu", -15.8, -20, 0); miyu.pose = "lie";
  const dg = G.actor("daigo", -12, -21.6, -Math.PI / 2);
  G.music.play("miyu");
  U.uTint.value.setRGB(1.1, 0.85, 0.85);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-11.6, 1.8, -16.6], [-15.4, 0.6, -20], 45);
    G.audio.alarm();
    await G.say([
      N("The pain hit Miyu first. Not in the chamber. In the base, miles away, through channels that should have been protected."),
      R("DAIGO", "Miyu's down. Receiver spike. She's screaming."),
      R("KAIEN", "Keep her breathing. Slow cadence. Don't let her spiral."),
      R("DAIGO", "We're trying. It's like something is pulling her mind toward the Ark."),
    ]);
  });
  G.objective("STAY WITH MIYU.");
  await G.interactOnce({
    pos: [-15.6, 0.6, -19.6], label: "MIYU", verb: "KNEEL", r: 2.2,
    use: async () => {
      G.player.ch.pose = "kneel";
      await G.say([R("ARIA", "I'm with her. She can still hear us."), N("Aria stayed close, repeating the slow cadence Kaien had taught the child.")]);
      await breath(G, { cycles: 3, title: "IN. HOLD. OUT.", sub: "Breathe with Miyu. Hold ✕ in, keep holding, release out." });
    },
  });
  await G.fade(1, 0.8);
  W = await G.load(buildGate, { mech: true, start: [0, -22, 0] });
  U.uTint.value.setRGB(1, 1, 1);
  const vael = await gateVael(G);
  const rq = G.actor("requiem", 6, -16, 0, { scale: 2.1 });
  G.music.play("boss");
  G.music.duck(0.4);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([2, 1.7, 3.4], [0, 1.7, 8], 34);
    await G.say([
      N("Vael smiled as if hearing a joke."),
      ["VAEL", "Ah. The child."],
      R("REQUIEM", "Don't."),
      ["VAEL", "You don't understand what she is."],
      R("SHION", "She has Echo-Sight. A receiver."),
      ["VAEL", "Yes. A delicate antenna. Exposure. A First Fall residue incident. A human nervous system brushed by the Canticle's shadow years before the Ark arrived."],
      R("REQUIEM", "You seeded this."),
      ["VAEL", "The universe seeds itself. I merely... harvest."],
      R("KAIEN", "If you touch her, you die."),
      ["VAEL", "Threats are music from frightened men."],
    ]);
    vael.pose = "conduct";
    G.audio.alarm();
    G.ui.sysText("AETHERHEART SPIKE");
    await G.say([
      R("SHION", "He's pulling on your Maestro signature through her. He's trying to link you to the Spire."),
      R("KYO", "He's using the child as a bridge."),
      R("RAIZEN", "That's it. I'm done playing nice."),
      R("KAIEN", "We end the Spire clean. We don't panic."),
      ["VAEL", "Panic is the truth of freedom."],
      R("KAIEN", "Then watch what discipline does to your song."),
    ]);
    G.music.unduck();
    await G.fade(1, 1.4);
  });
}

// ============================================================
// 24 — THE CHOICE
// ============================================================
export async function CH24(G, C) {
  await G.load(buildGate, { mech: true, start: [-30, -20, 0.6] });
  await card(G, C);
  G.music.play("eerie");
  const pillar = G.world.box(-27, 0, -15, 6, 30, 6, mat({ map: TEX.cloth([30, 24, 36], "arkbone"), color: 0xb0a0c0 }));
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([-36, 6, -26], [-30, 4, -20], 50);
    await G.say([
      N("They regrouped behind a fractured pillar of Ark-bone while Khethari waves reformed."),
      R("SHION", "There's a way. Invert Maestro into feedback. Collapse the Canticle locally. It'll desync everything and shatter the Spire's control lattice."),
      R("KAIEN", "Cost?"),
      R("SHION", "You."),
      N("Silence."),
      R("RENJI", "No."),
      R("REQUIEM", "Yes."),
      R("RAIZEN", "You don't get to volunteer him."),
      R("REQUIEM", "I don't get to bring back the people he's already taken. But I can stop him from taking more."),
      R("KYO", "Kaien... you can't."),
      R("KAIEN", "I'm not deciding alone. I'm deciding with everyone who never got a choice."),
      R("RAIZEN", "Don't do the noble thing. Do the living thing."),
      R("KAIEN", "The living thing is keeping Miyu alive."),
      R("SHION", "Then we do it precisely. You can't just explode resonance. You pull it into yourself, then flip it. Like taking a storm into your lungs and exhaling it backward."),
      R("KAIEN", "Then teach me the breath."),
      MIMIC("VAEL", "A beautiful debate. I adore human hesitation. It tastes like prayer. Choose quickly. Your Eidolon is already cracking."),
      R("KAIEN", "Daigo. How's Miyu?"),
      R("DAIGO", "She's breathing. She keeps saying your name."),
      R("KAIEN", "Tell her to breathe with you. In. Hold. Out."),
    ]);
    G.music.play("aria");
    G.shot([-31, 4.8, -18], [-30, 4.8, -14], 60);
    document.body.classList.add("cockpit");
    await G.say([
      N("The auxiliary indicator lit a moment later."),
      R("ARIA", "Daigo is assembling an evacuation team at the breach. I'm going with them when the way is clear."),
      R("KAIEN", "Aria."),
      R("ARIA", "I'm here."),
      R("KAIEN", "I want you to know that I want to come home."),
      N("There was a pause long enough for him to hear her take a breath."),
      R("ARIA", "Then keep talking to me. As long as you can."),
    ]);
    document.body.classList.remove("cockpit");
    G.shot([-36, 6, -26], [-30, 4, -20], 50);
    await G.say([
      R("KAIEN", "We execute the plan. We free the captives. We end Vael."),
      R("RAIZEN", "If you die, I'm going to haunt you."),
      R("KAIEN", "Get in line."),
      N("Then Kaien stepped out from cover. And the Canticle leaned forward, eager."),
    ]);
    await G.fade(1, 1.2);
  });
}

// ============================================================
// 25 — THE EIDOLON BREAKS
// ============================================================
export async function CH25(G, C) {
  let W = await G.load(buildGate, { mech: true, start: [0, -24, 0] });
  await card(G, C);
  const vael = await gateVael(G);
  vael.pose = "conduct";
  G.fade(0, 1);
  G.music.play("boss");
  await G.say([N("Vael didn't kill Kaien. He tried to claim him."), SYS("SYSTEM: AETHERHEART FRACTURE RISK."), R("KAIEN", "Renji, front! Raizen, left corridor! Shion, cut nodes! Requiem, on me!")]);
  const B = G.fight({ mech: true, allies: ["renji", "raizen", "shion", "kyo", "requiem"], resonance: 80 });
  B.wave([["seraph", -8, 0], ["scuttle", 8, -4], ["scuttle", -14, -10], ["elite", 10, 4]]);
  G.objective("HOLD.");
  let t = 0;
  W.every((dt) => { if (G.canMove()) t += dt; });
  await B.waitFor(() => t > 40 || B.alive().length === 0 || B.hp < B.hpMax * 0.35);
  B.enemies.forEach((e) => (e.passive = true));
  // the spike
  await G.cine(async () => {
    G.shot([8, 3, G.player.pos.z - 10], [G.player.pos.x, 4, G.player.pos.z], 50);
    await G.say([N("For a moment, they held. Then Vael lifted his hand and the Spire drove a resonance spike straight through Kaien's core housing.")]);
    B.beam(new THREE.Vector3(0, 10, 18), G.player.pos.clone(), 0xffffff, 1);
    G.audio.glass(); G.audio.boom();
    G.rig.shake = 0.6;
    U.uAdd.value.setRGB(0.6, 0.6, 0.7);
    await G.wait(0.15);
    U.uAdd.value.setRGB(0.25, 0, 0);
    G.ui.sysText("SYSTEM: CORE BREACH. LIMB FAILURE. PILOT COMPARTMENT COMPROMISED.", 3);
    await G.say([N("The sound was not a sound. It was the feeling of glass breaking inside the bones."), R("RAIZEN", "Eject!"), N("Kaien tried. The mechanism jammed.")]);
    G.player.ch.pose = "down";
    G.audio.thud();
    await G.say([N("EIDOLON-0 convulsed like a dying titan and slammed to the floor. The world inverted.")]);
    U.uAdd.value.setRGB(0, 0, 0);
    await G.fade(1, 0.3, "#000");
    G.music.play(null, 0.3);
  });
  B.close();
  // ---- on foot, in the wreckage ----
  W = await G.load(buildGate, { mech: false, start: [0, -20, 0] });
  const wreck = new Character({ mech: true, plate: [64, 74, 104], trim: [180, 40, 46], core: 0x222222, weapon: "katana" });
  wreck.setPos(-3, 0, -22).face(0.6); wreck.pose = "lie"; W.add(wreck.root); W.every((dt) => wreck.update(dt, 0));
  const rjF = new Character(frameOf("renji")); rjF.setPos(2.5, 0, -12).face(Math.PI); rjF.pose = "kneel"; W.add(rjF.root); W.every((dt) => rjF.update(dt, 0));
  const ser = makeKhethari("seraph", 1); ser.root.position.set(0.6, 0, -14.6); ser.root.rotation.y = Math.PI; W.add(ser.root);
  let serState = "walk"; W.every((dt) => ser.update(dt, 0, serState));
  const v2 = G.actor("vael", 2, -10, Math.PI);
  G.player.ch.pose = "down";
  G.audio.ambience({ wind: 0, drone: 0.8, note: 33, verb: 1 });
  G.fade(0, 1.4);
  await G.cine(async () => {
    G.shot([1.8, 0.9, -21.4], [0, 0.8, -19.4], 40);
    await G.say([N("Kaien hit stone hard, air leaving his lungs in a violent gasp. He tasted blood. His katana lay a few feet away.")]);
    G.shot([-2.4, 1.1, -21], [0.6, 2, -14.6], 48);
    await G.say([N("A Glaive Seraph approached, slow and confident. Vael walked behind it with hands clasped, as if strolling through a museum."), ["VAEL", "Instrument breaks. Human begs."]]);
    G.player.ch.pose = "kneel";
    await G.say([["KAIEN", "Beg? No."]]);
    serState = "windup";
    G.audio.clang(); G.rig.shake = 0.2;
    await G.say([N("Renji forced his damaged frame down onto one knee, catching the Seraph's blade before it could reach Kaien. Metal ground against metal."), R("RENJI", "Move!")]);
    serState = "listen";
    await G.say([N("Kaien tried to rise. Pain drove him back against the wreckage. The Aetherheart was silent. He reached for the rhythm that had carried the team and found only the noise in his own head.")]);
    // Aria
    G.music.play("aria");
    G.audio.chime();
    await G.say([N("A light blinked on the cracked screen of his wrist unit. The auxiliary relay had passed Shion's check.")]);
    const pic = (() => { const c = document.createElement("canvas"); c.width = 64; c.height = 64; const img = new Image(); img.onload = () => c.getContext("2d").drawImage(img, 0, 0); img.src = portrait("ARIA"); return c; })();
    await G.item({ title: "AUXILIARY RELAY · VERIFIED", canvas: pic, text: "Aria's image flickers across the small screen. She is standing beside the evacuation convoy, one hand pressed to her headset.", sub: "✕" });
    await G.say([
      R("ARIA", "Kaien. Look at me if you can."),
      ["KAIEN", "I'm trying."],
      R("ARIA", "I know. I've always believed in you."),
      N("His fingers stopped scrabbling against the stone."),
      R("ARIA", "Even before all of this, I knew the man I loved. I still do."),
      N("He could see that she was frightened. He wanted to reach across the distance and take her hand."),
      R("ARIA", "I want that morning with you. I love you. Come back to me."),
      N("Kaien drew a slow breath. He remembered her waiting beside the training mat while his hands shook. He remembered the instant he had sensed Raizen's next movement. That instant was still there."),
      N("Beneath the pain, he felt Renji holding the blade. Raizen closing on the flank. Shion and Kyo searching for another opening. Their rhythms reached him directly, as clearly as Aria's voice."),
    ]);
    // the awakening
    G.player.ch.root.traverse((o) => { if (o.isMesh && o.material.uniforms) o.material.uniforms.uEmissive.value = 0.35; });
    W.light(0, 1, -20, 0x80d0ff, 8);
    G.audio.maestro();
    await G.say([N("Fine lines of light appeared along his wrists. The wreckage around him trembled. Far above, the Spire's pulse faltered for a beat."), ["KAIEN", "I hear you."]]);
    rjF.pose = "down"; G.audio.thud();
    serState = "windup";
    G.shot([2.4, 1.4, -21], [0.6, 2.2, -15], 45);
    await G.say([N("Renji's damaged knee actuator gave way. The Seraph tore its weapon free. The Seraph lunged.")]);
  });
  await qte(G, { text: "RAISE TWO FINGERS", key: "x", window: 1.0 });
  await G.cine(async () => {
    G.player.ch.pose = "conduct";
    G.music.play("finale");
    serState = "stun";
    await G.tween(0.25, (k) => { ser.root.rotation.x = -k * 1.5; ser.root.position.y = -k * 0.5; });
    G.audio.boom(); G.rig.shake = 0.5;
    await G.say([
      N("Kaien lifted two fingers like a conductor. The Seraph froze mid-strike and slammed into the floor as if the air had become a fist."),
      N("Silence."),
      R("RAIZEN", "That wasn't the Aetherheart."),
      R("SHION", "He's doing it without the core."),
      N("On Aria's monitor, the destroyed Aetherheart still registered dead. The Maestro trace beside it climbed. She pressed her free hand over her mouth. Kaien was getting to his feet."),
    ]);
    G.player.ch.pose = null;
    G.player.place(0, -19, 0);
    G.shot([1.6, 1.6, -15.6], [0, 1.6, -19], 36);
    await G.say([
      N("He thought of the window she had asked for, the cold tea, the morning they still wanted. He closed his hand around the katana and faced the chamber."),
      ["VAEL", "Yes. Maestro without a cage. Show me."],
      N("Kaien stood. Not fast. Not dramatic. Relentless."),
      ["KAIEN", "You built a hymn out of stolen mouths. I'm going to make you choke on it."],
      ["VAEL", "Cages don't make you strong. They prove you're afraid."],
      ["KAIEN", "Good. Then be afraid."],
    ]);
    ser.root.visible = false; v2.root.visible = false;
  });
  // final fight on foot
  const F = G.fight({ allies: ["raizen", "requiem"], resonance: 100 });
  F.hpMax = 160; F.hp = 160;
  const boss = F.spawn("vael", 2, -8);
  boss.immortal = true; boss.floor = 0.38;
  F.wave([["scuttle", -6, -6], ["scuttle", 6, -4], ["scuttle", 0, 0]]);
  G.objective("VAEL NOCTYR.");
  tip(G, "You move like a short-lived storm now. Strike during his pulse to break the Canticle's correction.", 6);
  await F.waitFor(() => boss.hp <= boss.max * 0.39 + 1);
  F.enemies.forEach((e) => (e.passive = true));
  await G.cine(async () => {
    G.shot([2.4, 1.6, F.P.pos.z - 1], [boss.pos.x, 1.7, boss.pos.z], 38);
    G.music.duck(0.3);
    U.uAdd.value.setRGB(0.2, 0, 0.1);
    G.rig.shake = 0.3;
    await G.say([
      ["VAEL", "Kneel."],
      N("Kaien staggered, blood running from nose and mouth."),
      ["VAEL", "Join the Spire. Become the keystone. You will save more lives that way."],
      ["KAIEN", "You think compassion is weakness. That's why you'll lose."],
      ["VAEL", "Break the Spire and you kill them. Choose, Maestro."],
      N("Kaien looked at the rings of captives. Then he looked back at Vael."),
      ["KAIEN", "You're right."],
      ["KAIEN", "I choose."],
      N("And Kaien inhaled, drawing the Canticle's pressure into himself like a storm pulled into lungs."),
    ]);
    U.uAdd.value.setRGB(0, 0, 0);
    G.music.unduck();
  });
  F.close();
}

// ============================================================
// 26 — LEGACY SIGIL
// ============================================================
export async function CH26(G, C) {
  const W = await G.load(buildGate, { mech: false, start: [0, -10, 0] });
  await card(G, C);
  const vael = G.actor("vael", 0, -6.6, Math.PI);
  const rz = G.actor("raizen", -2.4, -12, 0.4), rq = G.actor("requiem", 2.6, -11, -0.4), sh = G.actor("shion", -4, -14, 0.5), ky = G.actor("kyo", -5, -13, 0.6), rj = G.actor("renji", 4, -14, -0.5);
  const scutt = [crawler(G, "scuttle", -6, -2), crawler(G, "scuttle", 6, -3), crawler(G, "scuttle", 3, 2)];
  G.player.ch.root.traverse((o) => { if (o.isMesh && o.material.uniforms) o.material.uniforms.uEmissive.value = 0.3; });
  G.music.play(null);
  G.fade(0, 1);
  await G.cine(async () => {
    G.shot([1.4, 1.6, -11.6], [0, 1.6, -10], 34);
    await G.say([N("Kaien's breath held. For one heartbeat, the chamber went still.")]);
  });
  await breath(G, { cycles: 1, title: "INVERSION", sub: "Draw the storm in (hold ✕). Hold it. Then exhale it backward (release).", inT: 3, holdT: 2.4, outT: 3 });
  await G.cine(async () => {
    G.music.play("finale");
    G.audio.boom();
    U.uAdd.value.setRGB(0.5, 0.55, 0.7);
    await G.wait(0.15);
    U.uAdd.value.setRGB(0, 0, 0);
    G.rig.shake = 0.5;
    scutt.forEach((s) => (s.root.rotation.z = 1.3));
    await G.say([
      N("Then he exhaled. Not outward. Inward. Maestro became inversion. Synchronization flipped into collision."),
      N("The Canticle folded on itself like a choir forced to sing two keys at once. Khethari convulsed as coordination died. The captives' hum broke into coughing, choking, breath returning."),
    ]);
    G._choirSway = 0;
    (G._captives || []).forEach((h) => (h.rotation.x = -0.4));
    G.shot([1.6, 1.7, -8.4], [0, 1.7, -6.6], 30);
    await G.say([["VAEL", "No."]]);
    G.audio.glass();
    G.shot([0, 4, -20], [0, 20, 18], 60);
    await G.tween(1.2, (k) => G._spire.root.scale.set(1 + k * 0.4, 1 - k * 0.2, 1 + k * 0.4));
    await G.say([N("The Lumen Spire cracked, light splintering. Kaien moved through the collapsing rhythm with the last of his strength, katana in hand. He didn't shout. He didn't posture.")]);
    G.shot([1.6, 1.7, -8.4], [0, 1.7, -6.6], 34);
    await G.say([N("Vael tried to raise his hand, tried to summon the Canticle back.")]);
  });
  await qte(G, { text: "CUT THE MOTION", key: "x", window: 0.9 });
  await G.cine(async () => {
    G.player.ch.play("slash2"); G.audio.slash(true);
    vael.play("hit");
    await G.say([N("Kaien's blade cut the motion. Vael staggered. Kaien stepped closer, voice low."), ["KAIEN", "We rebuild without you."]]);
    G.player.ch.play("slash3"); G.audio.slash(true); G.audio.boom();
    G.flash("#ffffff", 0.1);
    vael.pose = "lie";
    G.audio.glass();
    G._spire.root.visible = false;
    G.music.play(null, 1);
    await G.say([N("One final strike. Vael Noctyr fell."), N("The Spire shattered fully. Silence dropped. Real silence."), N("Kaien stood one breath longer... then the cost collected.")]);
    // the ending
    G.player.ch.pose = "down";
    await G.walkTo(rz, -0.8, -9.6, 3);
    rz.pose = "kneel";
    G.music.play("ending");
    G.shot([2.6, 1.3, -11.6], [0, 0.6, -10], 40);
    await G.say([
      N("His knees buckled. Raizen caught him, hands shaking."),
      ["RAIZEN", "No. No, stay up."],
      N("Shion stumbled forward, wrecked. Renji dropped beside them, silent tears on his face like he didn't know how they got there. Requiem stood guard, blade lowered, watching shadows like she expected the world to betray them one more time."),
    ]);
    G.player.ch.pose = "lie";
    G.player.place(0, -10, Math.PI / 2);
    const aria = G.actor("aria", 0, -24, 0);
    const dg = G.actor("daigo", 1.6, -26, 0);
    const miyu = G.actor("miyu", 2.2, -25.4, 0);
    await G.say([N("With the Canticle's local control broken, the waiting evacuation team came through the breach. Aria ran past the first rescuers toward the fallen frame.")]);
    await G.walkTo(aria, 0.6, -10.6, 4);
    aria.pose = "kneel";
    G.shot([1.8, 1.0, -11.8], [0.2, 0.4, -10.2], 36);
    await G.say([
      N("Daigo arrived carrying Miyu. Aria dropped beside Kaien and helped Raizen support his shoulders. His eyes found her as soon as she spoke."),
      ["ARIA", "I'm here."],
      ["KAIEN", "You came."],
      ["ARIA", "Of course I came. We need help here."],
    ]);
    await G.walkTo(dg, 1.6, -13, 2); await G.walkTo(miyu, -0.8, -10.8, 3);
    miyu.pose = "kneel";
    G.music.play("miyu");
    await G.say([
      N("Miyu wriggled free and ran. She slid to her knees beside Kaien and grabbed his hand with both of hers."),
      ["MIYU", "Please stay."],
      ["KAIEN", "Hey. I'm here."],
      ["MIYU", "Don't go."],
      ["KAIEN", "I know."],
    ]);
    // the Heartshard
    const shard = W.mesh(new THREE.OctahedronGeometry(0.16, 0), mat({ color: 0x80d0ff, unlit: true }), 3, 0.3, -12);
    const halo = W.glow(3, 0.3, -12, 0.9, 0x80d0ff);
    G.shot([3.6, 1, -13.6], [3, 0.3, -12], 36);
    await G.say([
      N("Shion's gaze snapped to the wreckage nearby. A glowing fragment of Kaien's destroyed core, an Aetherheart Heartshard, still humming."),
      ["SHION", "Kaien... if you imprint Maestro into her, it finishes you."],
      ["KAIEN", "I know."],
      N("Aria had heard Shion's warning. She gripped Kaien's sleeve."),
      ["ARIA", "Kaien, please."],
      ["KAIEN", "I love you."],
      N("Her eyes filled. She leaned her forehead against his for a moment, holding him as carefully as she could."),
      ["ARIA", "I love you too. I'm staying right here."],
    ]);
    await G.tween(1.6, (k) => { shard.position.set(3 - k * 2.6, 0.3 + k * 0.6, -12 + k * 1.9); halo.position.copy(shard.position); });
    G.shot([1.4, 1.1, -11.8], [0, 0.6, -10.3], 34);
    await G.say([
      N("He raised his trembling hand and the Heartshard slid across the floor, hovering above his palm, vibrating like a living note."),
      ["MIYU", "What is that?"],
      ["KAIEN", "An anchor. A piece of my Eidolon's heart. It can hold a rhythm... so the Canticle can't steal it."],
      ["KAIEN", "Miyu. I can stop. If you don't want it."],
      ["MIYU", "I don't want you to go."],
      ["KAIEN", "I know. Breathe with me."],
    ]);
    G.music.play("ending");
  });
  await breath(G, { cycles: 1, title: "BREATHE WITH ME", sub: "One last breath together. Hold ✕, then let go.", inT: 3, holdT: 1.6, outT: 3.4 });
  await G.cine(async () => {
    G.audio.chime();
    G.shot([0.4, 0.9, -12], [-0.8, 0.6, -10.8], 30);
    await G.say([
      N("Kaien inhaled once, slow and controlled, like calling the last note of a song. A thin ring of light traced around Miyu's wrist, then sank beneath her skin, leaving a faint mark: a spiral crossed by one straight line."),
      ["SHION", "A Legacy Sigil..."],
      N("Miyu gasped. Surprise more than pain. Like she'd heard silence for the first time."),
      ["KAIEN", "This doesn't make you me. It means you won't be alone."],
      ["MIYU", "Then... what do I do?"],
      ["KAIEN", "One step when you can."],
      ["KAIEN", "Keep her safe. Let her grow."],
      ["RAIZEN", "I will."],
      N("Renji nodded, unable to speak. Requiem bowed her head once, warrior to warrior."),
      ["KAIEN", "If you dream, and you hear the quiet... you'll know I'm not angry."],
      ["MIYU", "Okay."],
      ["KAIEN", "Good."],
      N("He exhaled. His hand loosened in Miyu's."),
      N("Aria kept her palm against his cheek. For a moment she waited for him to turn toward it. Then she bent over him, her breathing breaking. Raizen put an arm around her shoulders. Beside them, Miyu held Kaien's hand with both of hers."),
      N("And the Maestro went still, leaving behind not a destiny, but an anchor."),
    ]);
    G.shot([0, 30, -10], [0, 0, -10], 60);
    await G.say([N("Miyu's wrist sigil pulsed once, warm as a heartbeat.")]);
    await G.fade(1, 3);
  });
  await G.lines(["Far away, in the broken remnants of the Canticle, something listened.", "Weak. Scattered. Aware.", "Not strong enough to return."], { hold: 9 });
  await G.lines(["Not yet."], { cls: "big", hold: 4 });
  await credits(G);
}

async function credits(G) {
  G.music.play("title", 3);
  const roll = [
    ["WORLD ENDS", "THE LAST CANTICLE"],
    ["Adapted from WORLD ENDS", "by Rufki Vila"],
    ["KAIEN", "ARIA · RENJI · RAIZEN", "SHION · KYO · DAIGO KUROGANE"],
    ["MIYU", "REQUIEM", "VAEL NOCTYR"],
    ["For everyone who never got a choice."],
  ];
  for (const r of roll) await G.lines(r, { cls: r.length === 2 && r[0] === "WORLD ENDS" ? "big" : "", hold: 5 });
  await G.lines(["THE END"], { cls: "big", hold: 4 });
}
