# Форматирование в Telegram + grammY

Краткая шпаргалка по синтаксису форматирования сообщений в Telegram Bot API
и по тому, как делать это удобно и безопасно через grammY.

---

## 1. Telegram Bot API — два режима

У бота есть `parse_mode` со значениями `MarkdownV2`, `HTML` и `Markdown` (легаси).
Альтернатива `parse_mode` — передавать массив `entities` вручную (см. раздел 4).

> Главное правило: **либо** `parse_mode`, **либо** `entities` — смешивать в одном
> сообщении не стоит, парсер Telegram будет вмешиваться и ломать разметку.

---

## 2. MarkdownV2 (рекомендуемый текстовый режим)

```
*жирный*
_курсив_
__подчёркнутый__
~зачёркнутый~
||спойлер||
`inline код`
```код-блок```
```python
код-блок с подсветкой языка
```
[ссылка](https://example.com)
[упоминание](tg://user?id=123456789)
![👍](tg://emoji?id=5368324170671202286)
>цитата (блок)
>цитата на
>несколько строк
**>раскрываемая
>цитата (expandable)||
```

Нюансы:
- Цитата (`>`) ставится в начале строки. Многострочная цитата — `>` на каждой строке.
- Раскрываемая (expandable) цитата: блок начинается с `**>` и закрывается `||`
  в конце последней строки.
- Вложенность: `code`/`pre` нельзя комбинировать с другими стилями;
  `bold/italic/underline/strikethrough/spoiler` можно вкладывать друг в друга;
  `blockquote` и `expandable_blockquote` **нельзя вкладывать** ни во что и друг в друга.
- Кастомные эмодзи (`tg://emoji?id=...`) доступны не всем ботам: исторически —
  только ботам, купившим доп. username на Fragment; alt-текст (`👍`) должен быть
  реальным эмодзи — он показывается как фолбэк там, где кастомный эмодзи не виден.
- `tg://user?id=...` (упоминание без username) работает **только внутри**
  inline-ссылки или кнопки inline-клавиатуры, и только если пользователь
  досягаем боту (писал в ЛС / не закрыл приватностью). В голом тексте — не сработает.

### Экранирование (самая частая причина ошибок)

В MarkdownV2 вне сущностей экранируются обратным слешем символы:

```
_ * [ ] ( ) ~ ` > # + - = | { } . !
```

Если их не экранировать — Telegram вернёт `Bad Request: can't parse entities`.

Точные правила экранирования в MarkdownV2:
- Любой символ с кодом 1–126 можно экранировать `\` в любом месте — тогда он
  считается обычным символом. (В отличие от легаси-`Markdown`, здесь экранировать
  внутри сущностей **можно**.)
- Внутри `code`/`pre` экранируются только `` ` `` и `\`.
- Внутри `(...)` у ссылки и кастом-эмодзи экранируются только `)` и `\`.
- При неоднозначности `__` всегда жадно трактуется как `underline`. Для
  «курсив+подчёркнутый» используют пустую жирную сущность-разделитель:
  `___курсив подчёркнутый_**__`.

> ⚠️ Не путай с легаси-режимом `Markdown` (v1): там экранировать внутри сущности
> нельзя — нужно закрыть и открыть заново (`_snake_\__case_`). В MarkdownV2 это
> правило **не действует**. Режим `Markdown` устарел, для нового кода используй
> MarkdownV2 или HTML.

---

## 3. HTML (часто удобнее: меньше боли с экранированием)

```html
<b>жирный</b>            <strong>жирный</strong>
<i>курсив</i>            <em>курсив</em>
<u>подчёркнутый</u>      <ins>подчёркнутый</ins>
<s>зачёркнутый</s>       <strike>...</strike>  <del>...</del>
<span class="tg-spoiler">спойлер</span>   <tg-spoiler>спойлер</tg-spoiler>
<a href="https://example.com">ссылка</a>
<a href="tg://user?id=123456789">упоминание</a>
<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>
<tg-time unix="1647531900" format="wDT">22:45 завтра</tg-time>
<code>inline код</code>
<pre>код-блок</pre>
<pre><code class="language-python">код с подсветкой</code></pre>
<blockquote>цитата</blockquote>
<blockquote expandable>раскрываемая цитата</blockquote>
```

В HTML-режиме экранируются только `<`, `>`, `&` (как `&lt;` `&gt;` `&amp;`)
и только вне тегов. Поддерживаются именно перечисленные теги — произвольный
HTML нельзя.

---

## 4. Вручную через entities (без parse_mode)

Каждая сущность — объект с `type`, `offset`, `length` (+ доп. поля).

```json
{
  "text": "bold and a link",
  "entities": [
    { "type": "bold", "offset": 0, "length": 4 },
    { "type": "text_link", "offset": 11, "length": 4, "url": "https://example.com" },
    { "type": "expandable_blockquote", "offset": 0, "length": 15 }
  ]
}
```

⚠️ **Ловушка:** `offset` и `length` считаются в **UTF-16 code units**, а не в
символах. Эмодзи и символы вне BMP занимают 2 единицы. Поэтому ручные entities
почти всегда лучше строить генератором (см. grammY ниже), а не руками.

Типы сущностей: `bold`, `italic`, `underline`, `strikethrough`, `spoiler`,
`code`, `pre`, `text_link`, `text_mention`, `custom_emoji`, `blockquote`,
`expandable_blockquote`.

---

## 5. grammY — три подхода

### 5a. Просто parse_mode

```ts
import { Bot } from "grammy";

const bot = new Bot("");

bot.command("demo", async (ctx) => {
  await ctx.reply("<b>жирный</b> и <i>курсив</i>", { parse_mode: "HTML" });
});
```

Дефолтный `parse_mode` на весь бот — через плагин parse-mode (трансформер):

```ts
import { parseMode } from "@grammyjs/parse-mode";
bot.api.config.use(parseMode("HTML")); // теперь не нужно указывать каждый раз
```

### 5b. Плагин @grammyjs/parse-mode — `fmt` (рекомендую)

`fmt` — tagged template: сам считает offset/length в UTF-16 и отдаёт
`{ text, entities }`. Ничего экранировать не нужно, разметка не сломается.

```ts
import { Bot } from "grammy";
import {
  fmt, bold, italic, underline, strikethrough, spoiler,
  code, pre, link, mentionUser, customEmoji,
  blockquote, expandableBlockquote,
  hydrateReply,
} from "@grammyjs/parse-mode";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import type { Context } from "grammy";

const bot = new Bot<ParseModeFlavor<Context>>("");
bot.use(hydrateReply); // добавляет ctx.replyFmt

bot.command("demo", async (ctx) => {
  const msg = fmt`${bold("Жирный")}, ${italic("курсив")}, ${link("ссылка", "https://example.com")}

${expandableBlockquote("Очень длинная цитата, которую можно свернуть. Идеально для каналов и длинных пояснений.")}`;

  // Вариант 1: с hydrateReply
  await ctx.replyFmt(msg);

  // Вариант 2: без hydrateReply — fmt отдаёт text + entities
  await ctx.reply(msg.text, { entities: msg.entities });
});
```

Доступные хелперы (есть короткие алиасы):

| Функция | Алиас | Назначение |
|---|---|---|
| `bold` | `b` | жирный |
| `italic` | `i` | курсив |
| `underline` | `u` | подчёркнутый |
| `strikethrough` | `s` | зачёркнутый |
| `spoiler` | — | спойлер |
| `code` | — | inline код |
| `pre` | — | блок кода (есть аргумент языка) |
| `link` | `a` | ссылка |
| `mentionUser` | — | упоминание по id |
| `customEmoji` | `emoji` | кастомный эмодзи |
| `blockquote` | — | цитата |
| `expandableBlockquote` | — | раскрываемая цитата |
| `time` | — | date_time-сущность |
| `linkMessage` | — | ссылка на сообщение |

Хелперы вкладываются: `fmt`${bold(italic("жирный курсив"))}`` — с учётом
ограничений Telegram (code/pre не комбинируются с остальным).

### 5c. FormattedString (через цепочку методов)

Удобно, когда строишь сообщение программно:

```ts
import { FormattedString } from "@grammyjs/parse-mode";

const msg = FormattedString
  .bold("Заголовок")
  .plain("\n\n")
  .expandableBlockquote("Скрытый длинный текст…");

await ctx.reply(msg.text, { entities: msg.entities });
```

Методы: `bold`, `italic`, `underline`, `strikethrough`, `spoiler`, `code`,
`pre`, `link`, `linkMessage`, `mentionUser`, `blockquote`,
`expandableBlockquote`, `plain` (обычный текст). Есть и статические версии
(`FormattedString.bold(...)`) для начала цепочки.

---

## 6. Почему fmt лучше ручного parse_mode

- **Не нужно экранировать** спецсимволы MarkdownV2 — частый источник 400-ошибок.
- **Не сломает сообщение** при «битой» разметке: parse_mode при синтаксической
  ошибке (незакрытый тег, неэкранированный символ) отклоняет всё сообщение
  целиком, а fmt просто собирает корректные entities.
- **Правильные UTF-16 offset'ы** считаются за тебя — критично, если в тексте
  есть эмодзи.

---

## Шпаргалка-итог

| Хочу | MarkdownV2 | HTML | grammY fmt |
|---|---|---|---|
| жирный | `*x*` | `<b>x</b>` | `bold("x")` |
| курсив | `_x_` | `<i>x</i>` | `italic("x")` |
| код | `` `x` `` | `<code>x</code>` | `code("x")` |
| спойлер | `\|\|x\|\|` | `<tg-spoiler>x</tg-spoiler>` | `spoiler("x")` |
| цитата | `>x` | `<blockquote>x</blockquote>` | `blockquote("x")` |
| цитата (свор.) | `**>x\|\|` | `<blockquote expandable>x</blockquote>` | `expandableBlockquote("x")` |
| ссылка | `[t](url)` | `<a href="url">t</a>` | `link("t","url")` |

---

## 7. На заметку: Rich Messages (Bot API 10.1, июнь 2026)

Это **отдельная** от описанного выше система. В дополнение к классическому
форматированию текста Telegram добавил «Rich Messages» — структурированные
сообщения (заголовки, таблицы, списки, разделители, блоки кода и т.д.) и
потоковую отправку AI-ответов с форматированием на лету. Работает через
отдельные методы `sendRichMessage` / `sendRichMessageDraft` и классы
`RichText*` / `RichBlock*`, а не через `parse_mode`/`entities`.

Всё, что в этой шпаргалке (MarkdownV2, HTML, entities, grammY `fmt`),
по-прежнему актуально для обычных `sendMessage`. Rich Messages — это
дополнительный инструмент для сложной вёрстки/стриминга; это отдельная система,
не через `parse_mode`/`entities`.

Поддержка в grammY: доступно с **grammy 1.44.0** (типы `@grammyjs/types` 3.28.0,
где появились `sendRichMessage` / `sendRichMessageDraft` и классы
`RichText*` / `RichBlock*`). В версиях ≤ 1.43.0 этих типов ещё нет. Метод
вызывается как `bot.api.sendRichMessage(...)` / `ctx.api.sendRichMessage(...)` —
grammY автогенерирует все методы Bot API из типов, отдельный плагин не нужен.
Структуру `rich_message` пока собираешь объектом по типам (специальных
контекст-шорткатов и билдеров под `RichBlock*` в ядре может ещё не быть).
