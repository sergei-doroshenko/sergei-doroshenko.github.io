---
title: 'I Reprogrammed My App With a Sentence (No Deploy Required)'
description: 'How a kettlebell tracker accidentally grew a DSL, an interpreter, and an LLM compiler — and what that thousand-fold price drop means for old patterns.'
date: 2026-07-19
tags: [llm, dsl, patterns, react]
draft: false
---


Last week I typed this into my workout tracker:

> "Replace the bench press with a dumbbell press and dips."

A few seconds later, the Saturday gym screen showed dumbbell presses. New sets, new rep targets, new rest timers. I didn't rebuild the app. I didn't deploy anything. I didn't even open the code. The app that greeted me was, in a meaningful sense, a different app than the one from a minute before — and the "programming language" I used was a sentence I could have texted to a friend.

There's a pattern hiding in this trick, and I think it's worth naming. But it will make more sense if I tell you how I stumbled into it, because I never designed it. It assembled itself out of a series of utterly mundane feature requests.

## The boring origin story

I practice kettlebell sport. My competitive goal is the 10-minute snatch: one kettlebell, ten minutes, exactly one hand switch. Training for it is a strange discipline — half strength, half meditation on pacing — and it comes with very specific tracking needs: interval timers with hand-switch signals, per-arm rep counts (my right side fatigues earlier, and I log the asymmetry every session), planned versus actual reps, and a weekly rotation of four training methods.

No off-the-shelf fitness app handles this. They're all built for "3 sets of 10" gym logic, not "4 minutes right arm, full rest, 4 minutes left arm, tell me the minute my right side starts to fade."

So I did what programmers do: I built [my own](https://github.com/sergei-doroshenko/kb-tracker). Or rather, I had a long conversation with Claude, and a React prototype grew inside the chat — a guided workout screen, chained set timers with audio cues, a journal. The usual story in 2026; nothing to blog about yet.

## Three requests that accidentally built a language

The interesting part happened across three unremarkable feature requests.

**Request one: "We should make components for each exercise type."** Some of my exercises are timed and one-armed (the snatch), some are rep-based and one-armed (Turkish get-ups), some are bilateral (barbell squats), one is cardio (swimming). So the exercises became data, and the components became generic:

```js
// An exercise is a small declarative spec:
{
  n: "Snatch · method 3 (intervals)",  // name
  kg: 20,                              // kettlebell weight (null for gym)
  uni: true,                           // one-armed → log left/right separately
  planned: "5×1 min, 12–14 rpm",       // human-readable plan
  pr: "12–14",                         // planned reps per set
  t: { m: "m3", work: 60, rest: 30, sets: 5 }  // timed: method, seconds, sets
}
```

A dispatcher looks at the spec and picks the right component. A `t` field means "timed one-armed" and the method code (`m3` = one-arm intervals) tells a generator how to unroll the sets in the right order: five sets right arm with short rests, a long rest, five sets left. An `s` field means plain rep-based sets. A `c` means cardio. That's the whole type system.

At this point I had done nothing novel. This is data-driven UI, as old as game engines.

**Request two: "I want a monthly plan view — and could I import a plan from a markdown document?"** My training plan lives in a markdown file that Claude and I write together each cycle. Retyping it into data structures felt absurd. But parsing free-form markdown with regexes felt worse.

The obvious 2026 answer: don't parse — ask a model. The app got an import box and a prompt that *documents the spec*. Not the app's code — just the data language:

```
You are a data generator for a kettlebell training app.
Read the training plan document and return ONLY valid JSON:
{"weeks": {"<id>": {"label", "mon": {...}, "fri": {...}, "ladder": [...]}},
 "ex": {"<id>": {"mon": [EXERCISE, ...], "fri": [...]}}}

An EXERCISE is {"n", "kg", "uni", "planned", "pr"} plus EXACTLY ONE of:
  "t": {"m": "m3|m2|m4|m1|fri", "work": sec, "rest": sec, "sets": n}
      — timed kettlebell work; m3 = one-arm intervals,
        m2 = hand switch without rest, m4 = long sets, m1 = test run
  "s": {"sets": n, "rest": sec} — plain sets without a timer
  "c": true — cardio
...
```

Paste the markdown, get JSON, merge it into the app's data, re-render. The whole feature took an evening, most of which was writing the prompt — which, I realized later, was really *writing the reference manual for a language*.

**Request three: "Can I edit just one day? Not the whole plan?"** This was the request that closed the loop. The prompt got one more rule: *you receive the current plan and a change request; return only what changes.* Ask to swap an exercise on Saturday, and the model returns a patch:

```json
{ "gym": [
  { "n": "Barbell squat", "uni": false, "s": {"sets": 4, "rest": 180}, "pr": "6" },
  { "n": "Dumbbell press + dips", "uni": false, "s": {"sets": 3, "rest": 180}, "pr": "8" },
  ...
]}
```

The app deep-merges the patch — per week, per day — and stores a full snapshot so patches accumulate correctly. And that's the moment from the opening line: a sentence in, a changed application out.

## What actually happened here

Let me name the parts, because separately they're all familiar.

The exercise spec is a **DSL** — a tiny external domain-specific language for describing workouts. The component family that renders it is an **Interpreter** (yes, the Gang of Four one, 1994). The dispatch-by-type is **Strategy**. The overall shape — "the server ships JSON describing the screen, the client renders it" — is **Server-Driven UI**, which Airbnb, Shopify and Lyft have run in production for years to change mobile UIs without app-store releases. In my case the "server" is localStorage, but the idea is identical: the interface is data, and data doesn't need a deploy.

The one genuinely new ingredient is the top layer: **the LLM as the compiler from natural language into the DSL.**

Before, there was always a gap between "what the user can say" and "what the data format requires," and that gap was filled by either a programmer or a form-builder UI with four hundred dropdowns. The LLM removes the gap — *if you document your language well enough*. The prompt is the compiler's spec. My user-facing "plan editor" is a textarea.

That reframes what a prompt is. It's not a magic incantation to coax behavior out of a model. It's documentation, in the most literal software-engineering sense: here is the grammar, here are the semantics of each field, here are the invariants (return only what changes; never emit prose outside the JSON). When I later added a `gym` key to the format, the feature wasn't done until the prompt was updated — exactly like updating docs and a parser together. The prompt *is* part of the codebase now, and it has the same synchronization obligations as any interface definition.

So: did I invent something? Honestly, no. Interpreter is thirty years old, data-driven design is older, Fowler wrote the book on DSLs in 2010, Server-Driven UI is battle-tested. What's new is the **economics**. Building this vertical used to require a team: design the DSL, write the parser, build an editor UI, write user documentation, train users. I got the whole stack — language, interpreter, compiler, and a natural-language front end — in an evening of conversation, as a side effect of wanting to swap a bench press. That's not a new paradigm. It's a thousand-fold price drop on an old one, and price drops of that size tend to change what people build.

## The keyless trick

One detail worth stealing. Calling an LLM API from a static, serverless app means putting an API key in the browser — fine for a personal tool, unacceptable for anything shared. My favorite fix came from a suggestion that sounded almost too simple: *export the prompt instead.*

The app has a "Prompt" button. It assembles the full prompt — spec documentation + current plan JSON + your change request — copies it to the clipboard and downloads it as a text file. You paste it into any chat with any capable model, copy the JSON from the reply, paste it back into the app. The import path already accepts raw JSON directly.

No key, no proxy, no backend. The human is the transport layer. It's slower by twenty seconds and, as a bonus, you get to *see* the model's reasoning before applying the patch — which is more review than most CI pipelines get.

## The honest limitations

A few things this pattern does not give you, learned the mildly annoying way:

**The data format becomes a public API.** The moment users can export and re-import plans, your spec has backward-compatibility obligations. Renaming `t` or changing what `rest` means now requires a migration story, exactly like a database schema.

**Types still live in code.** Users can compose anything expressible in the language; they cannot extend the language. When I wanted a new exercise *type* (static holds with a per-side timer), that was code, a component, and a prompt update — a deploy. The boundary is crisp: vocabulary changes are data, grammar changes are code.

**The compiler is probabilistic.** The model occasionally returns almost-JSON, or invents a field. You need defensive parsing, validation before merge, and a graceful "couldn't parse that, try rephrasing" path. Treat model output like user input, because it is.

**State can bite you.** Importing a plan mid-workout, while the UI holds local state shaped like the old plan, is a great way to find undefined behavior. Mutations of the "program" want to happen between "executions."

## The recipe

If you want to try this on your own app, the pattern distills to five steps:

1. **Find the part of your app users keep asking to customize**, and express it as a small declarative spec. Smaller than you think. Resist the urge to make it Turing-complete.
2. **Write interpreter components** that render the spec. Dispatch by type; keep each type dumb.
3. **Document the spec in a prompt** as if writing a reference manual for a slightly literal-minded colleague. Include the invariants, not just the shape.
4. **Accept partial patches**, deep-merge them, and persist full snapshots — patches compose, snapshots survive restarts.
5. **Offer a keyless path**: export the prompt, let the user run it anywhere, accept raw JSON back.

Your users get a programmable app that speaks their language. You get to keep your deploy pipeline for the changes that deserve it.

As for me — the tracker now knows that this Monday is method 3, twenty kilograms, five one-minute sets per arm at 12–14 reps per minute. If I want it to know something different next month, I'll tell it. In a sentence.

---

*The tracker is a single-file React app (~1,500 lines at the time of writing) born as a Claude artifact and later moved to Vite + S3 — [source on GitHub](https://github.com/sergei-doroshenko/kb-tracker), [live app](https://d12weanrdyhou9.cloudfront.net/index.html). The training plan, the app, and this post were all built in the same ongoing conversation — which feels like part of the point.*
