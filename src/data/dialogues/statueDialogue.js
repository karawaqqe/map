export const DIALOGUE_ACTIONS = {
	close: "close",
	navigateSpindel: "navigateSpindel",
	navigateWorld: "navigateWorld",
	visionThenWorld: "visionThenWorld",
};

const statueStartOptions = [
	{ text: "I seek knowledge.", next: "knowledge" },
	{ text: "I seek the great sword Frostmourne.", next: "frostmourne" },
	{ text: "None of your business.", next: "defiance" },
	{ text: "What even are you?", next: "what_are_you" },
];

export const statueDialogue = {
	start: {
		speaker: "Statue",
		text: `You are not meant to stand within these depths…

Not as flesh.
Not as memory.

Yet here you are.

Tell me then, little wanderer…
What is it you seek?`,
		options: statueStartOptions,
	},
	knowledge: {
		speaker: "Statue",
		text: `Knowledge...
A dangerous hunger.

Most who came before you wished for power,
yet called it wisdom to ease their guilt.

Still...
I may answer.

For a price.`,
		options: [
			{ text: "Tell me of the ancient kingdoms.", next: "price_kingdoms" },
			{ text: "Tell me of the Veil between worlds.", next: "price_veil" },
			{ text: "Tell me of the being beneath the sea.", next: "price_sea" },
			{ text: "Tell me of Frostmourne.", next: "price_frostmourne" },
		],
	},
	price_kingdoms: {
		speaker: "Statue",
		text: `The ancient kingdoms...

Mmm...
That truth will cost you.

The price is a memory you still enjoy carrying.`,
		options: [
			{ text: "Yes.", next: "lore_kingdoms" },
			{ text: "No.", next: "price_refused" },
		],
	},
	price_veil: {
		speaker: "Statue",
		text: `The Veil between worlds...

Mmm...
That truth will cost you.

The price is the comfort of believing your world is alone.`,
		options: [
			{ text: "Yes.", next: "lore_veil" },
			{ text: "No.", next: "price_refused" },
		],
	},
	price_sea: {
		speaker: "Statue",
		text: `The being beneath the sea...

Mmm...
That truth will cost you.

The price is one peaceful dream.`,
		options: [
			{ text: "Yes.", next: "lore_sea" },
			{ text: "No.", next: "price_refused" },
		],
	},
	price_frostmourne: {
		speaker: "Statue",
		text: `Frostmourne...

Mmm...
That truth will cost you.

The price is the last lie you told yourself.`,
		options: [
			{ text: "Yes.", next: "lore_frostmourne" },
			{ text: "No.", next: "price_refused" },
		],
	},
	price_refused: {
		speaker: "Statue",
		text: `As you wish...
Truth remains buried, then.`,
		options: [
			{ text: "Ask something else.", next: "knowledge" },
			{ text: "Leave.", next: "close" },
		],
	},
	lore_kingdoms: {
		speaker: "Statue",
		text: `Indeed.

Before your banners had colors,
five kingdoms fed their crowns to the dark.

Their walls still stand below the roots of the world,
but their names rot in mouths that can no longer speak.`,
		options: [
			{ text: "Ask something else.", next: "knowledge" },
			{ text: "Leave.", next: "close" },
		],
	},
	lore_veil: {
		speaker: "Statue",
		text: `Indeed.

The Veil is not a wall.
It is a wound that learned to close.

Some nights it remembers pain,
and opens again.`,
		options: [
			{ text: "Ask something else.", next: "knowledge" },
			{ text: "Leave.", next: "close" },
		],
	},
	lore_sea: {
		speaker: "Statue",
		text: `Indeed.

Beneath the sea sleeps a thought too old for bone.

It dreams in pressure, hunger, and blue light.
When it wakes, shorelines will become prayers.`,
		options: [
			{ text: "Ask something else.", next: "knowledge" },
			{ text: "Leave.", next: "close" },
		],
	},
	lore_frostmourne: {
		speaker: "Statue",
		text: `Indeed.

Frostmourne is not waiting to be found.
It is listening.

Every hand that reaches for it has already been measured.`,
		options: [
			{ text: "Ask something else.", next: "knowledge" },
			{ text: "Leave.", next: "close" },
		],
	},
	frostmourne: {
		speaker: "Statue",
		text: `Frostmourne...

Even after all this time,
they still whisper its name.

Tell me, child...

Are YOU with HIM?`,
		options: [
			{ text: "Yes. I seek it for my King.", next: "for_king" },
			{ text: "No. I seek it for myself.", next: "for_self" },
		],
	},
	for_king: {
		speaker: "Statue",
		text: `Liar...

Greedy little liar.

You hide your hunger behind the banner of another man.
Pathetic.

Begone.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateWorld,
	},
	for_self: {
		speaker: "Statue",
		text: `Ahh...

Honesty.

Cruel...
but refreshing.

Your intentions are stained with greed,
yet greed has guided many toward greatness.

Perhaps...
I may grant you a chance.

Will you take it?`,
		options: [
			{ text: "Yes.", next: "accept_path" },
			{ text: "No.", next: "refuse_path" },
		],
	},
	accept_path: {
		speaker: "Statue",
		text: `Then listen carefully...

To claim Frostmourne,

you must walk where time rots
and reality bends upon itself.

You will cross forgotten shores,

hear voices that do not belong to the living,
and witness kingdoms long consumed by the abyss.

Many entered that path.

None returned whole.

Still...

May fortune follow you,
little wanderer.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	refuse_path: {
		speaker: "Statue",
		text: `Wise...
or perhaps merely afraid.

No matter.

As you wish...`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
	defiance: {
		speaker: "Statue",
		text: `What poor manners...

And yet...
your defiance reminds me of someone long dead.`,
		options: [],
		action: DIALOGUE_ACTIONS.visionThenWorld,
	},
	what_are_you: {
		speaker: "Statue",
		text: `What am I...?

Something far beyond your understanding.

Something that watched your kind
long before the first kingdom drew breath.

Now leave.`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
	close: {
		speaker: "Statue",
		text: "",
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
};

export const statueRepeatDialogue = {
	...statueDialogue,
	start: {
		...statueDialogue.start,
		text: `You again...
		
		Tell me then, little wanderer…
		What is it you seek?`,
	},
};
