---
title: Project 4 — BetterRest
description: DatePicker, Stepper и прогноз времени сна с Core ML.
projectSlug: project-04-betterrest
---

# Project 4 — BetterRest

BetterRest рекомендует время отхода ко сну по желаемому времени подъёма, продолжительности сна и количеству кофе. Мы соединим системные controls с обученной моделью Core ML.

<ProjectPrerequisites slug="project-04-betterrest" />

## Рабочий vertical slice

Сначала соберите форму и чистый расчёт. Core ML подключается после того, как этот экран работает.

```swift
import SwiftUI

struct ContentView: View {
    @State private var wakeUp = defaultWakeTime
    @State private var sleepAmount = 8.0
    @State private var coffeeAmount = 1

    static var defaultWakeTime: Date {
        Calendar.current.date(from: DateComponents(hour: 7)) ?? .now
    }

    private var bedtime: Date {
        let coffeePenalty = Double(coffeeAmount - 1) * 10 * 60
        let desiredSleep = sleepAmount * 60 * 60 - coffeePenalty
        return wakeUp.addingTimeInterval(-desiredSleep)
    }

    var body: some View {
        NavigationStack {
            Form {
                DatePicker("Проснуться", selection: $wakeUp, displayedComponents: .hourAndMinute)

                Stepper("Сон: \(sleepAmount.formatted()) ч", value: $sleepAmount, in: 4...12, step: 0.25)

                Stepper("Кофе: \(coffeeAmount)", value: $coffeeAmount, in: 1...20)

                Section("Лечь спать") {
                    Text(bedtime.formatted(date: .omitted, time: .shortened))
                        .font(.title2.bold())
                }
            }
            .navigationTitle("BetterRest")
        }
    }
}

#Preview { ContentView() }
```

Этот расчёт намеренно простой и нужен для проверки data flow. Следующий раздел заменяет формулу прогнозом обученной модели.

## Состояние формы

```swift
@State private var wakeUp = Date.now
@State private var sleepAmount = 8.0
@State private var coffeeAmount = 1
```

`DatePicker` редактирует `Date`, `Stepper` удобно меняет число небольшими шагами. Все controls получают Binding к `@State`.

```swift
DatePicker("Время подъёма", selection: $wakeUp, displayedComponents: .hourAndMinute)
Stepper("Сон: \(sleepAmount.formatted()) часов", value: $sleepAmount, in: 4...12, step: 0.25)
```

## Работа с Date

Для интерфейса храни полный `Date`, а отдельные hour/minute извлекай через `Calendar`. Так код учитывает календарь пользователя, не занимается ручной арифметикой секунд.

```swift
let components = Calendar.current.dateComponents([.hour, .minute], from: wakeUp)
let hour = components.hour ?? 0
let minute = components.minute ?? 0
```

Optional здесь обрабатывается через `??`: разумный fallback делает вход модели определённым.

## Create ML и Core ML

Create ML обучает модель на таблице примеров, а Xcode превращает `.mlmodel` в типизированный Swift API. На экране остаётся обычный throwing initializer и function call.

```swift
let config = MLModelConfiguration()
let model = try SleepCalculator(configuration: config)
let prediction = try model.prediction(wake: wakeSeconds, estimatedSleep: sleepAmount, coffee: Double(coffeeAmount))
```

Ошибки показывай пользователю через alert, а не скрывай пустым `catch`.

<Challenge>
<template #task>Сделай результат обновляемым прямо в форме без отдельной кнопки и добавь понятное сообщение при ошибке модели.</template>
<template #knowledge>Computed properties, `do`/`try`/`catch`, optionals и state.</template>
<template #hint1>Вынеси расчёт в computed property, возвращающую `String`.</template>
<template #hint2>В `catch` верни короткий текст ошибки, пригодный для интерфейса.</template>
<template #solution>

```swift
var bedtime: String {
    do { /* prediction */ return predictedDate.formatted(date: .omitted, time: .shortened) }
    catch { return "Не удалось рассчитать время сна" }
}
```

</template>
</Challenge>

<ProjectRecap slug="project-04-betterrest" />

Следом применим Arrays, Strings и validation в игре [Word Scramble →](/projects/project-05-word-scramble).
