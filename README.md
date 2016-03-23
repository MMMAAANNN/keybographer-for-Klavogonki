# Keybographer for Klavogonki
A userscript to record, analyze and visualize a keybogram (keypress sequence) in a typing competition site klavogonki.ru

## Recording

**Keybogam** is a sequence of keyboard events with timing, recorded since the start of the race.
- Use `.timeStamp` from the respective `KeyboardEvent` for timing.
- The most important keyboard event to be recorded is  `onkeydown`. Sometimes `onkeypress` is useful when needed to differentiate non-printable modifiers from printable keys.
- The `onkeyup` is also needed, but much less important (mostly for additional parameters calculation).
- For each printable keypress (i.e. the keypress that leads to input change), the simulataneous `Shift`, `Alt` and `Ctrl` status must also be watched.
- In addition to keyboard events, with each event the inputfield state must be recorded to show how the keyboard event affects it.
- It is also a good idea to record focus loss events `blur` to make sure we know when the typing is impossible because of some distraction.

## Analysis

The keybogram is analyzed for many parameters.

### Speed

There will be different types of speed measured.

**Resulting speed** or (*net speed*, or *real speed*) equals total actually accepted characters divided by total time spent for the race.

**Clean speed** (also called *gross-asterisk speed* or *brutto-asterisk speed*) equals total actually accepted characters divided by total time spent for typing exactly those characters, i. e. excluding the time spent for making typos and correcting those typos.

**Raw speed** (also called *gross+* or *brutto+*) is the total actually accepted characters plus characters that were deleted plus deletion pseudocharacters (`Backspace` or `Ctrl+Backspace`) divided by total time spent for the race.

**Instant speed** (also called *momentary speed*) is the reciprocal value of the pause between characters or strokes (i. e. momentary speed for 100 ms pause = 60 seconds/100 ms = 600 per minute).

Speed can be calculated as *cpm* (characters per minute) or *spm* (strokes per minute - where stroke is a keypress; for example, one character may require two or more keypresses, i. e. `Shift` + key, or a single keypress may yield multiple characters in case of autorpelacement usage).

### Corrections

For corrections, the following parameters are important:

**Series of corrections** is the total number of continuous usage of a backspace (or backspace with a `Ctrl` modifier, or a similar corrective method) events.

**Corrected characters** is the total characters deleted during corrections.

**Typo loss** is the percentage of time spent for making typos and then corecting them from the total time spent on the race.

**Correction coefficient for series/characters** is the the typo loss divided by series of corrections or corrected characters.

### Arrhythmia

**Arrhythmia** is the measurement of speed vairability throught the race.

### Retention

`Retention` is the time between `onkeydown` and `onkeyup` events for a certain keypress.

### Slow and fast words or keypress combos

The script may provide a list of keypress combos (or character combos) sorted by their speed and a similar product for words (i. e. character combos separated by spaces).

### Distractions

Sometimes typist can be distracted from typing the race, e. g. if an imortant conversation or telephone call occurs. This can potentially be noted by checking for very long pauses and reported accordingly. Also loss of focus may help reporting distractions.

## Visualization

### Parameter visualization

**Tabular view** - a table of some sort that shows the parameters calculated in the analysis stage.

**Diagrams** may be added also for better comprehension.

### Text visualization

The text visualization may reflect:
- corrections;
- momentary speed using colors;
- amount of keypresses required to produce the character using underline or overline (for autoreplacements);
- potentially some kind of visualization of keypress overlaps;
- potentially a replay function that shows keypresses on a virtual keyboard in realtime replay or accelerated/decelerated replay.

## Export
- Export to `.tsf` ([Typing Statistics](http://fil.urikor.net)) format to ensure analysis.
- Export of certain tables to CSV.
- Export to JSON.
- Saving to a cloud.
- Publishing to user's log in Klavogonki (especially attached to the "best result" publication).

## Roadmap

1. Create basic functionality - record keybogram and show net speed, clean speed and typo loss on page. Form an extension that can be added to Google Chrome.
2. Provide export of the recorded keybogram.
3. Visualize text with corrections in it.
4. Add and visualize parameters one by one.
5. Provide virtual keyboard and replay functionality.
