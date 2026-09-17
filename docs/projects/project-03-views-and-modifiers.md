---
title: Project 3 — Views and Modifiers
description: Как устроены View, composition и custom modifiers.
projectSlug: project-03-views-and-modifiers
---

# Project 3 — Views and Modifiers

Это технический проект без одного большого приложения. Мы разберём правила, которые уже использовали в WeSplit и Guess the Flag, и научимся собирать небольшие View в понятные компоненты.

<ProjectPrerequisites slug="project-03-views-and-modifiers" />

## Рабочий vertical slice

```swift
import SwiftUI

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(configuration.isPressed ? .indigo.opacity(0.7) : .indigo)
            .foregroundStyle(.white)
            .clipShape(.rect(cornerRadius: 12))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

struct StatCard: View {
    let title: String
    let value: Int

    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .foregroundStyle(.secondary)
            Text(value, format: .number)
                .font(.largeTitle.bold())
        }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(.thinMaterial)
            .clipShape(.rect(cornerRadius: 16))
    }
}

struct ContentView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 20) {
            StatCard(title: "Нажатий", value: count)

            Button("Увеличить") { count += 1 }
                .buttonStyle(PrimaryButtonStyle())
        }
        .padding()
    }
}

#Preview { ContentView() }
```

Здесь `StatCard` отвечает за composition, а `ButtonStyle` — за поведение и pressed state кнопки. Это две разные задачи, поэтому их не стоит смешивать в одном modifier.

## Почему View — struct

SwiftUI View описывает желаемый интерфейс, а не хранит живой экран. Небольшой value type легко создать заново, сравнить и объединить с другими View.

```swift
struct CapsuleText: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.largeTitle)
            .padding()
            .foregroundStyle(.white)
            .background(.blue)
            .clipShape(.capsule)
    }
}
```

Знакомые `struct`, property и protocol соответствие образуют новый reusable View.

## Modifiers создают новые значения

`Text("Hello").padding()` не меняет исходный `Text`. Modifier возвращает новый View, который оборачивает предыдущий. Поэтому порядок важен: фон до `padding` и фон после `padding` покрывают разную область.

```swift
Text("Hello")
    .background(.red)
    .padding()

Text("Hello")
    .padding()
    .background(.red)
```

## Composition вместо наследования

Большой `body` дели на computed properties и отдельные structs. Для настройки передавай данные через initializer — тот самый memberwise initializer из Day 10.

```swift
struct Title: View {
    let text: String
    var body: some View { Text(text).font(.headline) }
}
```

## Custom `ViewModifier`

```swift
struct ProminentTitle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.largeTitle.bold())
            .foregroundStyle(.blue)
    }
}

extension View {
    func prominentTitle() -> some View {
        modifier(ProminentTitle())
    }
}
```

Здесь protocol и extension из Day 13 превращаются в SwiftUI API с естественным синтаксисом.

::: details Глубже: generic containers и `@ViewBuilder`
Позже generic-параметр вида `Card<Content: View>` позволит карточке принимать произвольное содержимое, а `@ViewBuilder` — собирать несколько View из closure. До Day 18 этот синтаксис можно не разбирать: для текущей задачи конкретный `StatCard` проще, яснее и полностью достаточен.
:::

<Challenge>
<template #task>Создай modifier для крупной синей кнопки с белым текстом, padding и capsule shape. Примени его к двум разным `Button`.</template>
<template #knowledge>Structs, protocols, extensions и порядок modifiers.</template>
<template #hint1>Создай `struct PrimaryButton: ViewModifier`.</template>
<template #hint2>Добавь extension `View` с method `primaryButton()`.</template>
<template #solution>

```swift
struct PrimaryButton: ViewModifier {
    func body(content: Content) -> some View {
        content.padding().frame(maxWidth: .infinity)
            .foregroundStyle(.white).background(.blue).clipShape(.capsule)
    }
}
```

</template>
</Challenge>

<ProjectRecap slug="project-03-views-and-modifiers" />

Теперь базовый набор SwiftUI собран. Закрепи его в [Milestone Projects 1–3 →](/projects/milestone-01-03).
