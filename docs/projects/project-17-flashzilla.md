---
title: Project 17 — Flashzilla
description: Карточки, gestures, Timer, scene phase и accessibility.
projectSlug: project-17-flashzilla
---

# Project 17 — Flashzilla

Flashzilla показывает карточки для повторения: swipe в одну сторону означает «знаю», в другую — «повторить». Мы управляем gesture state, timer и состоянием приложения.

<ProjectPrerequisites slug="project-17-flashzilla" />

## Рабочий vertical slice

```swift
import SwiftUI

struct Card: Identifiable {
    let id = UUID()
    let prompt: String
    let answer: String
}

struct ContentView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var cards = [
        Card(prompt: "Столица Франции?", answer: "Париж"),
        Card(prompt: "2 × 8?", answer: "16")
    ]
    @State private var showingAnswer = false

    var body: some View {
        VStack(spacing: 24) {
            if let card = cards.last {
                VStack(spacing: 16) {
                    Text(card.prompt).font(.title.bold())
                    if showingAnswer { Text(card.answer).font(.title2) }
                }
                .frame(maxWidth: .infinity, minHeight: 260)
                .padding()
                .background(.white)
                .foregroundStyle(.black)
                .clipShape(.rect(cornerRadius: 24))
                .shadow(radius: 8)
                .onTapGesture { showingAnswer.toggle() }

                HStack {
                    Button("Повторить") { answer(wasCorrect: false) }
                    Spacer()
                    Button("Знаю") { answer(wasCorrect: true) }
                }
                .buttonStyle(.borderedProminent)
            } else {
                ContentUnavailableView("Готово", systemImage: "checkmark.circle")
            }
        }
        .padding()
        .animation(reduceMotion ? nil : .spring(), value: cards.count)
    }

    private func answer(wasCorrect: Bool) {
        guard let card = cards.popLast() else { return }
        if !wasCorrect { cards.insert(card, at: 0) }
        showingAnswer = false
    }
}

#Preview { ContentView() }
```

Сначала проверьте обе явные кнопки и окончание набора. Gesture и timer добавляются позже и не должны становиться единственным способом ответа.

## DragGesture превращается в решение

```swift
@State private var offset = CGSize.zero

.offset(x: offset.width * 5, y: 0)
.rotationEffect(.degrees(offset.width / 5))
.gesture(
    DragGesture()
        .onChanged { offset = $0.translation }
        .onEnded { value in
            if abs(value.translation.width) > 100 { removeCard() }
            else { withAnimation { offset = .zero } }
        }
)
```

Closure получает translation, condition сравнивает её с порогом, а state управляет transform. Большая часть механики — уже знакомый Swift.

## Stack карточек

`ZStack` рисует последнюю карточку поверх предыдущих. Передавай индекс для небольшого offset, а удаляй элемент только после завершения animation.

## Timer и lifecycle

`Timer.publish` создаёт последовательность событий. `onReceive` уменьшает оставшееся время, но timer нужно останавливать, когда приложение неактивно или accessibility environment требует другой flow.

Publisher принадлежит View subscription, поэтому не создавайте новый экземпляр при каждом вычислении `body`. Сам score не должен зависеть от wall clock, чтобы его можно было тестировать отдельно.

::: details Advanced: Clock вместо Timer
Альтернатива — owned `Task` с `ContinuousClock`: храните task, отменяйте при restart или уходе экрана и проверяйте cancellation. Для первого решения `Timer.publish` остаётся достаточным.
:::

```swift
@Environment(\.scenePhase) private var scenePhase

.onChange(of: scenePhase) {
    isActive = scenePhase == .active
}
```

## Accessibility alternative

Swipe не должен быть единственным способом ответа. Добавь явные кнопки «Знаю» и «Повторить», labels и понятный порядок focus.

При `accessibilityReduceMotion == true` уберите rotation и дальний вылет карточки: короткое fade или мгновенная смена сохраняют смысл без лишнего движения.

<Challenge>
<template #task>Добавь редактирование набора карточек, сохранение, повтор ошибочных ответов и паузу timer при уходе приложения в background.</template>
<template #knowledge>Arrays, Codable, gestures, Timer, scene phase и accessibility.</template>
<template #hint1>Ошибочную карточку можно вставить в начало или конец Array в зависимости от выбранной стратегии повторения.</template>
<template #hint2>Не пересоздавай publisher на каждом update; управляй Bool, разрешающим уменьшать счётчик.</template>
<template #solution>

```swift
if isWrong { cards.insert(card, at: 0) }
if isActive && timeRemaining > 0 { timeRemaining -= 1 }
```

</template>
</Challenge>

<ProjectRecap slug="project-17-flashzilla" />

Следующая тема объяснит правила размещения всех этих View: [Layout and Geometry →](/projects/project-18-layout).
