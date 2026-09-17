---
title: Project 15 — Accessibility
description: VoiceOver, labels, traits, Dynamic Type и reduce motion.
projectSlug: project-15-accessibility
---

# Project 15 — Accessibility

Доступность — не декоративная доработка в конце. SwiftUI даёт хорошие системные значения по умолчанию, но custom controls и визуальные игры требуют осознанного описания смысла.

<ProjectPrerequisites slug="project-15-accessibility" />

## Рабочий vertical slice

```swift
import SwiftUI

struct ContentView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var rating = 3

    var body: some View {
        VStack(spacing: 24) {
            Text("Оценка курса")
                .font(.largeTitle.bold())

            HStack {
                ForEach(1...5, id: \.self) { value in
                    Image(systemName: value <= rating ? "star.fill" : "star")
                        .foregroundStyle(value <= rating ? .yellow : .secondary)
                }
            }
            .font(.largeTitle)
            .accessibilityElement()
            .accessibilityLabel("Оценка")
            .accessibilityValue("\(rating) из 5")
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: rating = min(5, rating + 1)
                case .decrement: rating = max(1, rating - 1)
                default: break
                }
            }

            Stepper("Оценка: \(rating)", value: $rating, in: 1...5)
                .labelsHidden()
        }
        .padding()
        .animation(reduceMotion ? nil : .easeInOut, value: rating)
    }
}

#Preview { ContentView() }
```

Пройдите экран VoiceOver без взгляда на него. Затем увеличьте Dynamic Type и включите Reduce Motion: смысл и управление должны сохраниться.

## Label, value и hint

`accessibilityLabel` называет control, `accessibilityValue` сообщает текущее состояние, а `accessibilityHint` объясняет результат действия, если он не очевиден.

```swift
Button {
    choose(country)
} label: {
    Image(country.image)
        .resizable()
        .scaledToFit()
}
.accessibilityLabel("Флаг: \(country.name)")
```

`Image(decorative:)` полностью скрывает изображение от accessibility tree, поэтому его нельзя использовать для содержательного флага. Кнопка уже получает trait `.isButton`; добавлять его изображению вручную не нужно. Декоративные изображения скрывай, а смысловые называй. Иногда лучше объединить children в один понятный элемент.

## Adjustable action

Custom rating должен поддерживать swipe up/down VoiceOver так же, как системный Slider.

```swift
.accessibilityAdjustableAction { direction in
    switch direction {
    case .increment: rating = min(rating + 1, 5)
    case .decrement: rating = max(rating - 1, 1)
    default: break
    }
}
```

## Не полагайся только на цвет

Состояние должно отличаться текстом, формой или значком. Учитывай Dynamic Type, Reduce Motion и Differentiate Without Color через environment values.

## Как проверять

Запусти VoiceOver на simulator/device и пройди весь flow без взгляда на экран. Затем проверь максимальный Dynamic Type, Voice Control, Increase Contrast, Differentiate Without Color, Reduce Motion и Reduce Transparency. Accessibility Inspector полезен, но не заменяет реальное управление.

<Challenge>
<template #task>Проверь WeSplit и Guess the Flag: исправь порядок озвучивания, дубли, неясные labels и элементы, зависящие только от цвета.</template>
<template #knowledge>View composition, modifiers, closures и accessibility APIs.</template>
<template #hint1>Сначала выпиши, что пользователь должен услышать на каждом экране.</template>
<template #hint2>Используй `.accessibilityElement(children: .combine)` только когда объединённая фраза действительно понятнее.</template>
<template #solution>У этого задания нет единственного code listing: решение считается готовым после полного VoiceOver flow и исправления найденных проблем.</template>
</Challenge>

<ProjectRecap slug="project-15-accessibility" />

Следующий проект соединит shared state, QR и notifications: [Hot Prospects →](/projects/project-16-hot-prospects).
