export const DIALOGUE_ACTIONS = {
	increaseIrritation: "increaseIrritation",
	close: "close",
	navigateSpindel: "navigateSpindel",
	navigateWorld: "navigateWorld",
	visionThenWorld: "visionThenWorld",
};

const UNKNOWN_SPEAKER = "Statue";
const REVEALED_SPEAKER = "Yun'Shul";

const mainOptions = [
	{ text: "I seek knowledge.", next: "knowledge" },
	{ text: "I seek Frostmourne.", next: "frostmourne_intro" },
	{ text: "What are you?", next: "what_are_you" },
	{ text: "None of your business.", next: "defiance" },
	{ text: "I came only to look.", next: "came_to_look" },
	{ text: "You know me?", next: "you_know_me" },
];

const knowledgeOptions = [
	{ text: "[Your question 1]", next: "knowledge_blank_1" },
	{ text: "[Your question 2]", next: "knowledge_blank_2" },
	{ text: "[Your question 3]", next: "knowledge_blank_3" },
	{ text: "[Your question 4]", next: "knowledge_blank_4" },
	{ text: "[Your question 5]", next: "knowledge_blank_5" },
	{ text: "[Your question 6]", next: "knowledge_blank_6" },
	{ text: "[Your question 7]", next: "knowledge_blank_7" },
	{ text: "I changed my mind.", next: "knowledge_changed_mind" },
];

const frostmourneMotiveOptions = [
	{ text: "I seek it for my King.", next: "for_king" },
	{ text: "I seek it for myself.", next: "for_self" },
	{ text: "I seek it to destroy it.", next: "destroy_it" },
	{
		text: "Power belongs to those strong enough to take it.",
		next: "power_belongs",
	},
	{ text: "I seek it to save someone.", next: "save_someone" },
	{ text: "I do not know why I seek it.", next: "unknown_motive" },
	{ text: "I changed my mind.", next: "main_options" },
];

const returnMainOptions = [{ text: "Return to the choices.", next: "main_options" }];
const returnFrostmourneOptions = [
	{ text: "Return to the choices.", next: "frostmourne_intro" },
];
const returnMotiveOptions = [
	{ text: "Return to the choices.", next: "subtle_recognition" },
];
const returnPriceOptions = [
	{ text: "Return to the choices.", next: "price_location" },
];
const returnDestroyOptions = [
	{ text: "Return to the choices.", next: "destroy_it" },
];
const returnPowerOptions = [
	{ text: "Return to the choices.", next: "power_belongs" },
];
const returnDefianceOptions = [
	{ text: "Return to the choices.", next: "defiance" },
];
const returnLookOptions = [
	{ text: "Return to the choices.", next: "came_to_look" },
];
const returnIdentityOptions = [
	{ text: "Return to the choices.", next: "what_are_you" },
];
const returnMemoryOptions = [
	{ text: "Return to the choices.", next: "you_know_me" },
];
const returnMemoryPriceOptions = [
	{ text: "Return to the choices.", next: "help_remember" },
];
const returnRepeatOptions = [
	{ text: "Return to the choices.", next: "repeat_options" },
];

function blankKnowledgeNode() {
	return {
		speaker: UNKNOWN_SPEAKER,
		text: `That question has not been given shape.

Bring me words worth weighing,
and I will name the price.`,
		options: [
			{ text: "Ask something else.", next: "knowledge" },
			{ text: "Return to the choices.", next: "main_options" },
		],
	};
}

export const statueDialogue = {
	start: {
		speaker: UNKNOWN_SPEAKER,
		text: `You are not meant to stand within these depths...

Not as flesh.
Not as memory.
Not as warmth.

Yet here you are.

Again.

The snow has turned you around,
time has misplaced your steps,
and still you crawl forward.

Tell me then, little wanderer...

What is it you seek?`,
		options: mainOptions,
	},
	main_options: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then speak.`,
		options: mainOptions,
	},
	knowledge: {
		speaker: UNKNOWN_SPEAKER,
		text: `Knowledge...

A dangerous hunger.

Most who came before you wished for power,
yet called it wisdom to make the taste less bitter.

Still...

A child who asks may yet be wiser
than a king who already believes he knows.

I may answer.

For a price.`,
		options: knowledgeOptions,
	},
	knowledge_blank_1: blankKnowledgeNode(1),
	knowledge_blank_2: blankKnowledgeNode(2),
	knowledge_blank_3: blankKnowledgeNode(3),
	knowledge_blank_4: blankKnowledgeNode(4),
	knowledge_blank_5: blankKnowledgeNode(5),
	knowledge_blank_6: blankKnowledgeNode(6),
	knowledge_blank_7: blankKnowledgeNode(7),
	knowledge_changed_mind: {
		speaker: UNKNOWN_SPEAKER,
		text: `A rare mercy.

Not every hunger must be fed.`,
		options: returnMainOptions,
	},
	frostmourne_intro: {
		speaker: UNKNOWN_SPEAKER,
		text: `Frostmourne...

There it is.

The honest sickness beneath so many noble tongues.

Even after all this time,
they still whisper its name
as if a blade can love the hand that holds it.

Before the road opens,
before the blade hears your name,
you will learn whether your voice
can stand without climbing higher than it is.

Pride is permitted, little wanderer.
Strength is permitted.
Ambition is permitted.

But false height is not.

Speak carefully.
The storm listens less to words
than to the place from which they are spoken.`,
		options: [
			{
				text: "I understand. This is your domain, and I am only passing through.",
				next: "subtle_recognition",
			},
			{
				text: "I bow to no god.",
				next: "irritate_bow_to_no_god",
				action: DIALOGUE_ACTIONS.increaseIrritation,
			},
			{
				text: "I respect your power, but I will not lower my head.",
				next: "irritate_keep_head",
				action: DIALOGUE_ACTIONS.increaseIrritation,
			},
			{
				text: "Enough. Tell me of the blade.",
				next: "irritate_demand_blade",
				action: DIALOGUE_ACTIONS.increaseIrritation,
			},
			{ text: "I changed my mind.", next: "main_options" },
		],
	},
	subtle_recognition: {
		speaker: UNKNOWN_SPEAKER,
		text: `Good.

Not submission.
Recognition.

A proud child may still walk,
so long as he understands
whose shadow covers the road.

Now speak truthfully.

Do you seek it for another?

Or do you seek it for yourself?`,
		options: frostmourneMotiveOptions,
	},
	irritate_bow_to_no_god: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then stand where you are.

A child refusing to kneel
has not become taller.

He has only made his neck easier to measure.`,
		options: returnFrostmourneOptions,
	},
	irritate_keep_head: {
		speaker: UNKNOWN_SPEAKER,
		text: `A proud answer.
Not yet a wise one.

You heard the mountain speak
and answered by measuring your posture.

Keep your head, then.
The road will keep itself.`,
		options: returnFrostmourneOptions,
	},
	irritate_demand_blade: {
		speaker: UNKNOWN_SPEAKER,
		text: `No.

Impatience is not authority.
Noise is not courage.
Demand is not worth.

Return when your mouth remembers
when silence is wiser than demand.`,
		options: returnFrostmourneOptions,
	},
	for_king: {
		speaker: UNKNOWN_SPEAKER,
		text: `Liar.

Greedy little liar.

You hide your hunger
behind another man's crown.

Do you think the snow cannot hear
what trembles beneath your words?

Kings are useful masks.
Flags are useful cloth.
Duty is a useful leash.

But you did not come this far
for loyalty.

Begone.

Let the world have you back
before the cold teaches you honesty.`,
		options: returnMotiveOptions,
	},
	for_self: {
		speaker: UNKNOWN_SPEAKER,
		text: `Ahh...

Honesty.

Cruel.
Ugly.
Refreshing.

Your hunger stands naked,
and though it is small,
it does not crawl behind excuses.

I can respect that,
little wanderer.

Not admire.

Respect.

There is a difference.`,
		options: [
			{ text: "Then let me pass.", next: "passage" },
			{ text: "Tell me where it is.", next: "price_location" },
			{ text: "I will prove I am worthy.", next: "prove_worthy" },
			{ text: "Respect is enough.", next: "respect_enough" },
			{ text: "I changed my mind.", next: "refuse_path" },
		],
	},
	passage: {
		speaker: UNKNOWN_SPEAKER,
		text: `Passage is not given.

It is survived.

The blade was not left in a kingdom.
It was not buried beneath a battlefield.
It was not sealed in any temple your maps remember.

Frostmourne waits in the land.

A place beyond direction.
A wound above the world.
A frozen realm suspended over the Void.

You do not know it.

Good.

Those who think they know the land
usually die correcting themselves.

Walk where the snow turns back time.
Follow the castle that refuses to grow closer.
And when the road returns you to your own footprints...

do not assume you have failed.

That is only the storm noticing you.

Go now, little wanderer.

Seek your blade.
Let the storm decide what remains of you.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	price_location: {
		speaker: UNKNOWN_SPEAKER,
		text: `No.

Not for free.

Not for gold.
Not for blood spilled by hands you do not value.

The path to Frostmourne is worth more to you
than you are willing to admit.

So the price must be honest.

Give me...

The memory of the person whose forgiveness
you still desire.

Will you pay?`,
		options: [
			{ text: "Yes.", next: "price_location_paid" },
			{ text: "No.", next: "price_location_refused" },
			{ text: "I changed my mind.", next: "for_self" },
		],
	},
	price_location_paid: {
		speaker: UNKNOWN_SPEAKER,
		text: `So there is a wound beneath the crown.

Good.

The memory is taken.
The guilt remains,
but its face becomes unclear.

Seek the castle that appears only
when you stop chasing it.

Cross the bridge you have already crossed twice.

When the snow falls upward,
do not follow the road.

Follow the bells beneath the ice.

There,
the first lock waits.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	price_location_refused: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then your desire is cheaper
than your grief.

How disappointing.`,
		options: returnPriceOptions,
	},
	prove_worthy: {
		speaker: UNKNOWN_SPEAKER,
		text: `Worthy?

A loud word.

Children love loud words.

Very well.

The land will not ask you to be good.
It will not ask you to be noble.
It will not ask you to be pure.

It will ask only this:

When the storm removes your lies,
what remains standing?`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	respect_enough: {
		speaker: UNKNOWN_SPEAKER,
		text: `For now.

A small thing can survive
by not asking to be larger than it is.

Return when your hunger grows teeth.`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
	refuse_path: {
		speaker: UNKNOWN_SPEAKER,
		text: `Wise...

or perhaps merely afraid.

No matter.

Fear has saved more lives
than courage ever admitted.`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
	destroy_it: {
		speaker: UNKNOWN_SPEAKER,
		text: `Destroy it?

How clean that sounds.

How heroic.

How often heroes use destruction
to avoid understanding what they fear.

Tell me, little flame...

Do you wish to destroy Frostmourne
because it is evil?

Or because you fear what you would become
if it answered you?`,
		options: [
			{ text: "It should not exist.", next: "destroy_should_not_exist" },
			{ text: "No one should hold that power.", next: "destroy_no_one" },
			{ text: "I fear what I would do with it.", next: "destroy_fear_self" },
			{
				text: "Enough questions. Help me or do not.",
				next: "destroy_impatient",
				action: DIALOGUE_ACTIONS.increaseIrritation,
			},
			{ text: "I changed my mind.", next: "subtle_recognition" },
		],
	},
	destroy_should_not_exist: {
		speaker: UNKNOWN_SPEAKER,
		text: `Neither should many things.

The storm.
The Void.
Gods.
You.

Existence is not permission.
It is only fact.

If you seek the blade to erase it,
understand this:

some things cannot be destroyed
without first becoming intimate with them.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	destroy_no_one: {
		speaker: UNKNOWN_SPEAKER,
		text: `No one?

A noble answer.
A childish answer.

Power does not vanish
because the frightened declare it forbidden.

It waits.

If you will not hold it,
someone less afraid will.

Go then.
Learn whether your restraint is strength...
or merely fear wearing clean clothes.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	destroy_fear_self: {
		speaker: UNKNOWN_SPEAKER,
		text: `There.

A rare thing.

A mortal standing near power
and admitting the shape of his own shadow.

I will not call you wise.

But you are less foolish
than most who came before you.

The path may open.

But fear alone will not save you.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	destroy_impatient: {
		speaker: UNKNOWN_SPEAKER,
		text: `Still impatient.

Still loud.

Still warm.

Very well.

I will help you as the storm helps a corpse:
by carrying you somewhere useful.`,
		options: returnDestroyOptions,
	},
	power_belongs: {
		speaker: UNKNOWN_SPEAKER,
		text: `Hah.

A small king's sentence.

Yet not entirely false.

Power does belong to those strong enough to take it.

But keeping it...
bearing it...
surviving what it makes of you...

That is where children become corpses.

Speak carefully now.

Is this strength you carry?

Or hunger wearing armor?`,
		options: [
			{ text: "Hunger is strength.", next: "hunger_strength" },
			{ text: "Strength is control.", next: "strength_control" },
			{ text: "I will become whatever I must.", next: "become_whatever" },
			{
				text: "You talk too much for a statue.",
				next: "talk_too_much",
				action: DIALOGUE_ACTIONS.increaseIrritation,
			},
			{ text: "I changed my mind.", next: "subtle_recognition" },
		],
	},
	hunger_strength: {
		speaker: UNKNOWN_SPEAKER,
		text: `Sometimes.

Until it eats the hand that feeds it.

Go then.

Let the cold taste you.

If you are more than hunger,
you may return.

If not...

The parasites will find little difference
between you and the others.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	strength_control: {
		speaker: UNKNOWN_SPEAKER,
		text: `Better.

Not good.

Better.

A beast hungers.
A king commands.
A god waits.

Remember that order,
little wanderer.

It may spare you once.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	become_whatever: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then pray there is something left
when necessity finishes carving you.

Go.

The storm enjoys unfinished creatures.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	talk_too_much: {
		speaker: UNKNOWN_SPEAKER,
		text: `And you breathe too loudly
for something so temporary.

One warning, child.

Do not mistake patience
for permission.`,
		options: returnPowerOptions,
	},
	save_someone: {
		speaker: UNKNOWN_SPEAKER,
		text: `To save someone...

The oldest disguise power ever wore.

Perhaps you speak truth.
Perhaps you do not.

It matters less than you think.

Many who reach for forbidden things
carry a beloved name in one hand
and a throne in the other.

Which hand is yours?`,
		options: [
			{ text: "I only want to save them.", next: "save_only" },
			{ text: "If power comes with it, I will use it.", next: "save_power" },
			{ text: "I do not know anymore.", next: "save_unknown" },
			{ text: "I changed my mind.", next: "subtle_recognition" },
		],
	},
	save_only: {
		speaker: UNKNOWN_SPEAKER,
		text: `Only.

Such a dangerous little word.

Very well.

Take your noble grief into the storm.
Let the cold peel it open.

If there is love beneath it,
you may survive.

If there is only possession,
the blade will know before you do.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	save_power: {
		speaker: UNKNOWN_SPEAKER,
		text: `Honest enough.

Ugly enough.

Useful enough.

Go then.

But understand this:

Frostmourne does not simply grant power.
It reveals what power was waiting
to become inside you.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	save_unknown: {
		speaker: UNKNOWN_SPEAKER,
		text: `Good.

Certainty is often the first lie
power teaches its children.

Walk uncertain,
little wanderer.

It may keep you human
for a little longer.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	unknown_motive: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then you are closer to truth
than the ones who arrived with speeches.

Not knowing is not weakness.

Remaining blind by choice is.

Walk carefully, little wanderer.

The land is cruelest to those
who lie to themselves.`,
		options: [],
		action: DIALOGUE_ACTIONS.navigateSpindel,
	},
	what_are_you: {
		speaker: UNKNOWN_SPEAKER,
		text: `What am I?

A question shaped like a cup
held beneath an ocean.

I am not the stone you see.
I am not the eyes that trouble you.
I am not the mouth that speaks.

I am a sealed piece
of the one who watched before your histories began.

A fragment of Yun'Shul.

The Silent God.
The Witness Before Time.
The hand that made the land
and left it cold.

Does that answer comfort you,
little wanderer?`,
		options: [
			{ text: "No.", next: "reveal_no_comfort" },
			{ text: "It makes me want to know more.", next: "reveal_more" },
			{ text: "You are only a statue.", next: "reveal_only_statue" },
			{
				text: "A god trapped in stone is still trapped.",
				next: "reveal_trapped",
			},
			{ text: "I changed my mind.", next: "main_options" },
		],
	},
	reveal_no_comfort: {
		speaker: REVEALED_SPEAKER,
		text: `Good.

Comfort makes poor armor here.`,
		options: returnIdentityOptions,
	},
	reveal_more: {
		speaker: REVEALED_SPEAKER,
		text: `Curiosity.

A prettier word for hunger.

Ask, then.

But remember:

I do not feed children for free.`,
		options: [{ text: "Ask.", next: "knowledge" }],
	},
	reveal_only_statue: {
		speaker: REVEALED_SPEAKER,
		text: `And you are only warmth
waiting to leave meat.

Shall we continue naming surfaces?`,
		options: returnIdentityOptions,
	},
	reveal_trapped: {
		speaker: REVEALED_SPEAKER,
		text: `Careful.

There is pride,
and then there is a fly
declaring the window defeated
because it has touched the glass.

I am not trapped.

I am placed.

There is a difference
your lifespan may be too short to appreciate.`,
		options: returnIdentityOptions,
	},
	defiance: {
		speaker: UNKNOWN_SPEAKER,
		text: `What poor manners...

And yet...

Your defiance reminds me
of someone long dead.

Or perhaps not dead.

Perhaps only misplaced.

Tell me, child...

Do you often spit at doors
before asking them to open?`,
		options: [
			{ text: "I do not ask doors. I break them.", next: "break_doors" },
			{ text: "I owe you nothing.", next: "owe_nothing" },
			{ text: "I was testing you.", next: "testing_you" },
			{ text: "Fine. I will speak properly.", next: "speak_properly" },
			{ text: "I changed my mind.", next: "main_options" },
		],
	},
	break_doors: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then break.

The statue does not move.

The storm outside becomes silent.

You wished to be treated
as something more than a child.

Very well.`,
		options: [],
		action: DIALOGUE_ACTIONS.visionThenWorld,
	},
	owe_nothing: {
		speaker: UNKNOWN_SPEAKER,
		text: `Correct.

And I owe you less.

Leave with your nothing,
little wanderer.`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
	testing_you: {
		speaker: UNKNOWN_SPEAKER,
		text: `No.

You were hiding fear
behind a poor performance.

Do better.`,
		options: returnDefianceOptions,
	},
	speak_properly: {
		speaker: UNKNOWN_SPEAKER,
		text: `There.

Not humility.

But discipline.

It will do.`,
		options: returnDefianceOptions,
	},
	came_to_look: {
		speaker: UNKNOWN_SPEAKER,
		text: `To look...

Mortals do love pretending
their eyes do not take.

You look at ruins
and call it study.

You look at corpses
and call it warning.

You look at gods
and call it courage.

Very well.

Look.

But understand this:

Some things look back.`,
		options: [
			{ text: "Then look at me.", next: "look_at_me" },
			{ text: "I have seen worse.", next: "seen_worse" },
			{ text: "I will leave.", next: "will_leave" },
			{ text: "What do you see?", next: "what_do_you_see" },
			{ text: "I changed my mind.", next: "main_options" },
		],
	},
	look_at_me: {
		speaker: UNKNOWN_SPEAKER,
		text: `I am.

That is why your hands feel colder
than they did a moment ago.`,
		options: returnLookOptions,
	},
	seen_worse: {
		speaker: UNKNOWN_SPEAKER,
		text: `No.

You have seen louder.

There is a difference.`,
		options: returnLookOptions,
	},
	will_leave: {
		speaker: UNKNOWN_SPEAKER,
		text: `Many do.

Few arrive where they meant to go.`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
	what_do_you_see: {
		speaker: UNKNOWN_SPEAKER,
		text: `A spark.

A wound.

A lie you like wearing.

A question you fear asking.

And beneath all of it...

Something still undecided.

How rare.
How fragile.
How temporary.`,
		options: returnLookOptions,
	},
	you_know_me: {
		speaker: UNKNOWN_SPEAKER,
		text: `I know every step
the land allowed you to keep.

I know the ones it took.

I know the version of you
that reached this place before
and died with a question frozen in its mouth.

You do not remember.

That is not the same
as it never happening.`,
		options: [
			{ text: "How many times have I been here?", next: "how_many_times" },
			{ text: "What happened to me?", next: "what_happened" },
			{ text: "You are lying.", next: "you_are_lying" },
			{ text: "Then help me remember.", next: "help_remember" },
			{ text: "I changed my mind.", next: "main_options" },
		],
	},
	how_many_times: {
		speaker: UNKNOWN_SPEAKER,
		text: `Numbers are for things
that remain in order.

You have been here once.

You have been here many times.

You have not arrived yet.

All are true enough.`,
		options: returnMemoryOptions,
	},
	what_happened: {
		speaker: UNKNOWN_SPEAKER,
		text: `You walked.

You doubted.

You bled.

You asked a question
whose price frightened you.

Then the storm returned you
to the mercy of ignorance.`,
		options: returnMemoryOptions,
	},
	you_are_lying: {
		speaker: UNKNOWN_SPEAKER,
		text: `Perhaps.

But your bones believed me
before your mouth refused.`,
		options: returnMemoryOptions,
	},
	help_remember: {
		speaker: UNKNOWN_SPEAKER,
		text: `Memory is expensive.

Forgotten pain most of all.

For this,
I ask...

The memory of one face
you still hope to see again.

Will you pay?`,
		options: [
			{ text: "Yes.", next: "remember_paid" },
			{ text: "No.", next: "remember_refused" },
			{ text: "I changed my mind.", next: "you_know_me" },
		],
	},
	remember_paid: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then let the face go white.

The face is forgotten.
The feeling remains.

You came before.
You asked before.
You refused before.

The storm returned you
because you were not ready to lose
what the answer required.

Now you stand here again.

Not wiser.

Only less protected.`,
		options: returnMemoryPriceOptions,
	},
	remember_refused: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then remain mercifully incomplete.`,
		options: returnMemoryPriceOptions,
	},
	close: {
		speaker: UNKNOWN_SPEAKER,
		text: "",
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
};

export const statueRepeatDialogue = {
	...statueDialogue,
	start: {
		speaker: UNKNOWN_SPEAKER,
		text: `You again...

Still walking.
Still freezing.
Still mistaking movement for progress.

Tell me, little wanderer...

Have you come to ask,
to bargain,
or to pretend you have learned?`,
		options: [
			{ text: "I have questions.", next: "repeat_questions" },
			{ text: "I seek Frostmourne.", next: "frostmourne_intro" },
			{ text: "I remember you.", next: "repeat_remember" },
			{ text: "You know me?", next: "you_know_me" },
			{ text: "None of your business.", next: "defiance" },
			{ text: "Say nothing.", next: "repeat_silence" },
			{ text: "I am leaving.", next: "repeat_leave" },
		],
	},
	repeat_options: {
		speaker: UNKNOWN_SPEAKER,
		text: `Then choose.`,
		options: [
			{ text: "I have questions.", next: "repeat_questions" },
			{ text: "I seek Frostmourne.", next: "frostmourne_intro" },
			{ text: "I remember you.", next: "repeat_remember" },
			{ text: "You know me?", next: "you_know_me" },
			{ text: "None of your business.", next: "defiance" },
			{ text: "Say nothing.", next: "repeat_silence" },
			{ text: "I am leaving.", next: "repeat_leave" },
		],
	},
	repeat_questions: {
		speaker: UNKNOWN_SPEAKER,
		text: `Of course.

Questions breed quickly
in minds that cannot bear silence.

Ask.

But remember the price.`,
		options: [{ text: "Ask.", next: "knowledge" }],
	},
	repeat_remember: {
		speaker: UNKNOWN_SPEAKER,
		text: `Do you?

Or do you remember remembering?

There is a difference.

But either is better
than arriving empty.`,
		options: returnRepeatOptions,
	},
	repeat_silence: {
		speaker: UNKNOWN_SPEAKER,
		text: `Silence.

At last,
a language your kind rarely ruins.

Very well.

Stand there a moment longer.

Let the storm decide
whether you are worth moving.`,
		options: returnRepeatOptions,
	},
	repeat_leave: {
		speaker: UNKNOWN_SPEAKER,
		text: `Leaving...

A word mortals use
when they still believe direction obeys them.

Go then.

We will see where you arrive.`,
		options: [],
		action: DIALOGUE_ACTIONS.close,
	},
};
