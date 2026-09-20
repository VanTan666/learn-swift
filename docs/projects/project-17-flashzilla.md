---
title: Project 17 — Flashzilla
description: Карточки, gestures, Timer, scene phase и accessibility.
projectSlug: project-17-flashzilla
---

# Project 17 — Flashzilla

Flashzilla показывает карточки для повторения: swipe в одну сторону означает «знаю», в другую — «повторить». Мы управляем gesture state, timer и состоянием приложения.

<ProjectPrerequisites slug="project-17-flashzilla" />

## Стартовая точка

Создай новый **iOS → App** с именем **Flashzilla** и интерфейсом SwiftUI. В сгенерированном `ContentView.swift` оставь минимальное состояние ниже. Сохрани файл `FlashzillaApp.swift`, созданный Xcode; если шаг меняет точку входа, замени существующий файл, не создавай второй `@main`.

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        Text("Начало")
    }
}
```

Сначала прочитай задание шага и попробуй выполнить его. Решение закрыто: открой его для сверки или если застрял. Применяй изменения по порядку — каждый шаг опирается на предыдущий.

### Шаг 1. Одна карточка и ответ

**Цель:** Одна карточка и ответ.

**Попробуй сам:** Создай Card с prompt и answer. Покажи вопрос и кнопку раскрытия ответа.

<details>
<summary>Показать решение шага 1</summary>

**Card.swift** — создай файл и включи его в target приложения.

```swift
import Foundation
struct Card: Identifiable {
    var id = UUID()
    let prompt: String
    let answer: String
}
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private let card = Card(prompt: "2 × 8?", answer: "16")
    @State private var showingAnswer = false
```

В **ContentView.swift** найди этот блок:

```swift
Text("Начало")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
VStack(spacing: 24) {
            Text(card.prompt).font(.title)
            if showingAnswer { Text(card.answer).font(.title2) }
            Button("Показать / скрыть ответ") { showingAnswer.toggle() }
        }
        .padding()
```


</details>

**Ожидаемый результат:** Кнопка показывает и скрывает ответ текущей карточки. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Модель содержит учебные данные, @State — текущий режим отображения. Для доступности используем Button, а не только неозвученное tap-действие.

Кнопка меняет только showingAnswer, а текст ответа остаётся в модели. Это разделяет учебные данные и текущий вид экрана. Попробуй быстро несколько раз раскрыть и скрыть ответ: вопрос не должен изменяться, пока в проекте только одна карточка.

### Шаг 2. Колода и решения

**Цель:** Колода и решения.

**Попробуй сам:** Замени одну карточку массивом. Используй cards.last, добавь «Знаю» и «Повторить». При ошибке верни карточку в начало массива.

<details>
<summary>Показать решение шага 2</summary>

В **ContentView.swift** найди этот блок:

```swift
private let card = Card(prompt: "2 × 8?", answer: "16")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
@State private var cards = [
        Card(prompt: "Столица Франции?", answer: "Париж"),
        Card(prompt: "2 × 8?", answer: "16")
    ]
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    private func answer(wasCorrect: Bool) {
        guard let card = cards.popLast() else { return }
        if !wasCorrect { cards.insert(card, at: 0) }
        showingAnswer = false
    }
```

В **ContentView.swift** найди этот блок:

```swift
            Text(card.prompt).font(.title)
            if showingAnswer { Text(card.answer).font(.title2) }
            Button("Показать / скрыть ответ") { showingAnswer.toggle() }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
            if let card = cards.last {
                VStack(spacing: 16) {
                    Text(card.prompt).font(.title)
                    if showingAnswer { Text(card.answer).font(.title2) }
                    Button("Показать / скрыть ответ") { showingAnswer.toggle() }
                }
                .frame(maxWidth: .infinity, minHeight: 220)
                .padding()
                .background(.indigo.opacity(0.12))
                .clipShape(.rect(cornerRadius: 24))
                HStack {
                    Button("Повторить") { answer(wasCorrect: false) }
                    Spacer()
                    Button("Знаю") { answer(wasCorrect: true) }
                }
            } else { ContentUnavailableView("Готово", systemImage: "checkmark.circle") }
```


</details>

**Ожидаемый результат:** «Знаю» удаляет карточку, «Повторить» откладывает её. Пустая колода показывает «Готово». Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Последний элемент — текущая карточка. popLast возвращает Optional, поэтому пустая колода не вызывает падения. После ответа сбрасываем раскрытие, чтобы следующая карточка не показывала ответ заранее.

Мы считаем верхом колоды конец массива: cards.last показывает элемент, popLast удаляет его. При ошибке insert(at: 0) отправляет карточку вниз. Если она последняя, «Повторить» оставит её единственной — это нормальная возможность продолжить обучение, а не зацикливание ошибки.

### Шаг 3. Видимая стопка

**Цель:** Видимая стопка.

**Попробуй сам:** Помести активную карточку в ZStack и добавь подложку со смещением 8 точек, только если в колоде больше одной записи.

<details>
<summary>Показать решение шага 3</summary>

В **ContentView.swift** найди этот блок:

```swift
                VStack(spacing: 16) {
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                ZStack {
                    if cards.count > 1 {
                        RoundedRectangle(cornerRadius: 24).fill(.indigo.opacity(0.08))
                            .offset(y: 8).accessibilityHidden(true)
                    }
                VStack(spacing: 16) {
```

В **ContentView.swift** найди этот блок:

```swift
                .clipShape(.rect(cornerRadius: 24))
                HStack
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                .clipShape(.rect(cornerRadius: 24))
                }
                .frame(height: 260)
                HStack
```


</details>

**Ожидаемый результат:** Под текущей карточкой виден край следующей; у последней карточки подложка исчезает. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** ZStack рисует более поздние элементы поверх ранних. Подложка декоративная и скрыта от accessibility; читатель экрана работает только с активным вопросом.

Подложка не содержит вопроса следующей карточки и не перехватывает действия текущей. Её цель — показать наличие оставшейся колоды, не раскрывая следующий ответ. Когда cards.count становится равным 1, условие удаляет декоративный слой.

### Шаг 4. Свайп с порогом

**Цель:** Свайп с порогом.

**Попробуй сам:** Сохраняй translation жеста. Свайп правее 100 точек означает «Знаю», левее −100 — «Повторить»; короткий возвращает карточку назад.

<details>
<summary>Показать решение шага 4</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @State private var offset = CGSize.zero
```

В **ContentView.swift** найди этот блок:

```swift
        showingAnswer = false
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        showingAnswer = false
        offset = .zero
```

В **ContentView.swift** найди этот блок:

```swift
                .clipShape(.rect(cornerRadius: 24))
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
                .clipShape(.rect(cornerRadius: 24))
                .offset(offset)
                .gesture(DragGesture()
                    .onChanged { offset = $0.translation }
                    .onEnded { value in
                        if abs(value.translation.width) > 100 {
                            answer(wasCorrect: value.translation.width > 0)
                        } else { withAnimation(.spring()) { offset = .zero } }
                    }
                )
```


</details>

**Ожидаемый результат:** Оба направления дают те же результаты, что кнопки. Короткий жест не меняет колоду. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Gesture — дополнительный способ вызвать уже готовую функцию answer. Смещение сбрасывается и после кнопок, и после свайпа, чтобы новая карточка начинала в центре.

Положительная translation.width означает движение вправо, отрицательная — влево. abs проверяет длину жеста независимо от стороны. Сначала сравниваем длину с порогом, затем знак выбирает результат. Кнопки остаются доступными: обучение не должно зависеть только от возможности выполнить жест.

### Шаг 5. Время и жизненный цикл

**Цель:** Время и жизненный цикл.

**Попробуй сам:** Добавь Timer publisher и 60 секунд. Уменьшай время только в active, при непустой колоде; на нуле отключи ответы и покажи сообщение.

<details>
<summary>Показать решение шага 5</summary>

В **ContentView.swift** добавь код сразу после строкой `import SwiftUI`:

```swift
import Combine
```

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Environment(\.scenePhase) private var scenePhase
    @State private var timeRemaining = 60
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
```

В **ContentView.swift** найди этот блок:

```swift
        guard let card = cards.popLast() else { return }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        guard timeRemaining > 0, let card = cards.popLast() else { return }
```

В **ContentView.swift** найди этот блок:

```swift
        VStack(spacing: 24) {
            if let card
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        VStack(spacing: 24) {
            Text(timeRemaining == 0 ? "Время вышло" : "Осталось: \(timeRemaining)")
            if let card
```

В **ContentView.swift** найди этот блок:

```swift
        .padding()
    }
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
        .padding()
        .disabled(timeRemaining == 0)
        .onReceive(timer) { _ in
            if scenePhase == .active && !cards.isEmpty && timeRemaining > 0 {
                timeRemaining -= 1
            }
        }
    }
```


</details>

**Ожидаемый результат:** Время уменьшается во время работы, не расходуется в background и останавливает игру на нуле. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** onReceive получает события publisher. scenePhase отделяет активное обучение от свёрнутого приложения; publisher хранится вне body.

Timer выдаёт событие примерно раз в секунду, onReceive решает, учитывать ли его. В background scenePhase не active, поэтому счётчик сохраняется. Этот таймер измеряет активную тренировку, а не точный реальный дедлайн. Проверь сворачивание на несколько секунд и возврат.

### Шаг 6. Доступное повторение без таймера

**Цель:** Доступное повторение без таймера.

**Попробуй сам:** Добавь переключатель тренировки без ограничения времени и учитывай Reduce Motion для возврата карточки. Переключатель не должен блокироваться на нуле.

<details>
<summary>Показать решение шага 6</summary>

В **ContentView.swift** добавь код перед строкой `var body: some View {`:

```swift
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var timed = true
```

В **ContentView.swift** найди этот блок:

```swift
guard timeRemaining > 0, let card
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
guard (!timed || timeRemaining > 0), let card
```

В **ContentView.swift** найди этот блок:

```swift
withAnimation(.spring())
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
withAnimation(reduceMotion ? nil : .spring())
```

В **ContentView.swift** найди этот блок:

```swift
if scenePhase == .active && !cards.isEmpty && timeRemaining > 0
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
if timed && scenePhase == .active && !cards.isEmpty && timeRemaining > 0
```

В **ContentView.swift** найди этот блок:

```swift
.disabled(timeRemaining == 0)
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
.disabled(timed && timeRemaining == 0)
        .safeAreaInset(edge: .bottom) { Toggle("На время", isOn: $timed).padding() }
```

В **ContentView.swift** найди этот блок:

```swift
Text(timeRemaining == 0 ? "Время вышло" : "Осталось: \(timeRemaining)")
```

Замени его следующим блоком; остальной код файла сохрани:

```swift
Text(!timed ? "Без ограничения времени" : timeRemaining == 0 ? "Время вышло" : "Осталось: \(timeRemaining)")
```


</details>

**Ожидаемый результат:** Без таймера карточки доступны даже после окончания отсчёта; Reduce Motion отключает пружину. Выполни Build, затем Run и проверь это поведение перед продолжением.

**Новые концепции:** Доступность сохраняет альтернативный способ ответа и темп обучения. Условие блокировки и guard в answer должны совпадать, иначе кнопка выглядит рабочей, но ничего не делает.

Переключатель расположен вне блокировки игровых действий, иначе после нуля нельзя было бы перейти в режим без времени. Проверка в answer защищает и кнопки, и свайп: ограничения должны находиться не только в визуальном disabled. Reduce Motion меняет возврат карточки, но не результат жеста.

## Глубже — необязательно

::: details Advanced: точное время и хранение
Этот Timer считает активные тики для учебной тренировки. Для строгого срока используй Clock или deadline и продумай паузы. Редактор карточек и Codable-persistence добавляй после рабочего цикла повторения.
:::

## Самостоятельное изменение

<Challenge>
<template #task>Добавь кнопку новой тренировки: восстанови исходную колоду, 60 секунд и скрытый ответ.</template>
<template #knowledge>Используй состояние и функции, которые уже собрал в этом проекте.</template>
<template #hint1>Вынеси sampleCards в static property, чтобы не дублировать массив.</template>
<template #hint2>Проверь обычный случай и граничные значения; сохрани основной рабочий маршрут.</template>
<template #solution>

```swift
// Действие кнопки, размещённой вне disabled-группы:
cards = Self.sampleCards
timeRemaining = 60
showingAnswer = false
offset = .zero
```

</template>
</Challenge>

## Reference: полный код проекта

Основной маршрут, без самостоятельного challenge. Используй этот блок для сверки уже собранного приложения.

<details>
<summary>Открыть все итоговые файлы проекта</summary>

### ContentView.swift

```swift
import SwiftUI
import Combine


struct ContentView: View {
    @State private var cards = [
        Card(prompt: "Столица Франции?", answer: "Париж"),
        Card(prompt: "2 × 8?", answer: "16")
    ]
    @State private var showingAnswer = false

    private func answer(wasCorrect: Bool) {
        guard (!timed || timeRemaining > 0), let card = cards.popLast() else { return }
        if !wasCorrect { cards.insert(card, at: 0) }
        showingAnswer = false
        offset = .zero
    }

    @State private var offset = CGSize.zero

    @Environment(\.scenePhase) private var scenePhase
    @State private var timeRemaining = 60
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var timed = true

    var body: some View {
        VStack(spacing: 24) {
            Text(!timed ? "Без ограничения времени" : timeRemaining == 0 ? "Время вышло" : "Осталось: \(timeRemaining)")
            if let card = cards.last {
                ZStack {
                    if cards.count > 1 {
                        RoundedRectangle(cornerRadius: 24).fill(.indigo.opacity(0.08))
                            .offset(y: 8).accessibilityHidden(true)
                    }
                VStack(spacing: 16) {
                    Text(card.prompt).font(.title)
                    if showingAnswer { Text(card.answer).font(.title2) }
                    Button("Показать / скрыть ответ") { showingAnswer.toggle() }
                }
                .frame(maxWidth: .infinity, minHeight: 220)
                .padding()
                .background(.indigo.opacity(0.12))
                .clipShape(.rect(cornerRadius: 24))
                .offset(offset)
                .gesture(DragGesture()
                    .onChanged { offset = $0.translation }
                    .onEnded { value in
                        if abs(value.translation.width) > 100 {
                            answer(wasCorrect: value.translation.width > 0)
                        } else { withAnimation(reduceMotion ? nil : .spring()) { offset = .zero } }
                    }
                )
                }
                .frame(height: 260)
                HStack {
                    Button("Повторить") { answer(wasCorrect: false) }
                    Spacer()
                    Button("Знаю") { answer(wasCorrect: true) }
                }
            } else { ContentUnavailableView("Готово", systemImage: "checkmark.circle") }
        }
        .padding()
        .disabled(timed && timeRemaining == 0)
        .safeAreaInset(edge: .bottom) { Toggle("На время", isOn: $timed).padding() }
        .onReceive(timer) { _ in
            if timed && scenePhase == .active && !cards.isEmpty && timeRemaining > 0 {
                timeRemaining -= 1
            }
        }
    }
}
```

### FlashzillaApp.swift

```swift
import SwiftUI

@main
struct FlashzillaApp: App {
    var body: some Scene {
        WindowGroup { ContentView() }
    }
}
```

### Card.swift

```swift
import Foundation
struct Card: Identifiable {
    var id = UUID()
    let prompt: String
    let answer: String
}
```

</details>

<ProjectRecap slug="project-17-flashzilla" />

Следующая тема объяснит правила размещения всех этих View: [Layout and Geometry →](/projects/project-18-layout).
