---
title: Project 6 — Animations
description: Неявные, явные и gesture-driven анимации SwiftUI.
projectSlug: project-06-animations
---

# Project 6 — Animations

SwiftUI анимирует переход между двумя состояниями. Важно сначала правильно описать начальное и конечное состояние, а уже затем выбрать кривую и длительность.

<ProjectPrerequisites slug="project-06-animations" />

## Рабочий vertical slice

```swift
import SwiftUI

struct ContentView: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var enabled = false
    @State private var drag = CGSize.zero

    var body: some View {
        VStack(spacing: 40) {
            RoundedRectangle(cornerRadius: 24)
                .fill(enabled ? .orange : .indigo)
                .frame(width: 180, height: 180)
                .overlay { Text("Перетащи").foregroundStyle(.white) }
                .offset(drag)
                .rotationEffect(reduceMotion ? .zero : .degrees(drag.width / 8))
                .gesture(
                    DragGesture()
                        .onChanged { drag = $0.translation }
                        .onEnded { _ in
                            withAnimation(reduceMotion ? nil : .spring()) {
                                drag = .zero
                            }
                        }
                )

            Button("Сменить цвет") {
                withAnimation(.easeInOut) { enabled.toggle() }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

#Preview { ContentView() }
```

Сначала проверьте изменение цвета и возврат карточки после drag. Затем отключите Reduce Motion в Preview/Simulator и сравните поведение.

## Неявная animation

```swift
Button("Tap me") { animationAmount += 1 }
    .scaleEffect(animationAmount)
    .animation(.spring(duration: 1, bounce: 0.9), value: animationAmount)
```

Modifier следит только за указанным `value`. Когда оно меняется, различие между старым и новым UI интерполируется во времени.

## Явная `withAnimation`

```swift
withAnimation {
    isShowingRed.toggle()
}
```

Так удобнее объединять несколько изменений состояния одной анимацией. Closure сообщает, какие изменения относятся к переходу.

## Gesture и offset

```swift
@State private var dragAmount = CGSize.zero

.offset(dragAmount)
.gesture(
    DragGesture()
        .onChanged { dragAmount = $0.translation }
        .onEnded { _ in
            withAnimation(.spring) { dragAmount = .zero }
        }
)
```

Closure из Day 9 здесь получает данные жеста. SwiftUI добавляет `DragGesture` и обновляемое смещение.

## Transitions

Transition описывает появление и удаление View, а animation — изменение уже существующего View. Для transition условие должно действительно добавить или убрать элемент из hierarchy.

<Challenge>
<template #task>Покажи карточку по кнопке, а затем разреши смахнуть её в сторону и вернуть пружиной, если жест слишком короткий.</template>
<template #knowledge>State, conditions, closures, gestures, transitions.</template>
<template #hint1>Используй `if isVisible` вместе с `.transition(.scale.combined(with: .opacity))`.</template>
<template #hint2>В `onEnded` сравни `abs(translation.width)` с порогом.</template>
<template #solution>

```swift
if abs(value.translation.width) > 150 {
    withAnimation { isVisible = false }
} else {
    withAnimation(.spring) { dragAmount = .zero }
}
```

</template>
</Challenge>

<ProjectRecap slug="project-06-animations" />

Закрепи вторую группу в [Milestone Projects 4–6 →](/projects/milestone-04-06).
